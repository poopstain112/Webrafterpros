import { useState, useEffect, useCallback } from 'react';
import { sendChatMessage, uploadImages, generateWebsite, getChatMessages } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';
import { Message, UploadedImage, WebsiteStructure } from '../types';

export function useChat(initialWebsiteId: number = 1) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [websiteStructure, setWebsiteStructure] = useState<WebsiteStructure | null>(null);
  const [isGeneratingWebsite, setIsGeneratingWebsite] = useState(false);
  const { toast } = useToast();

  // Fetch initial messages when component mounts
  // Function to fetch messages that can be called on-demand for pull-to-refresh
  const fetchMessages = useCallback(async () => {
    try {
      console.log("Fetching messages for website ID:", initialWebsiteId);
      const fetchedMessages = await getChatMessages(initialWebsiteId);
      console.log("Fetched messages:", fetchedMessages);
      
      if (fetchedMessages.length === 0) {
        // Add initial message if no messages exist - first business question
        console.log("No messages found, using initial question");
        setMessages([
          {
            role: 'assistant',
            content: "What's the name of your business?",
          },
        ]);
      } else {
        console.log("Using fetched messages");
        setMessages(fetchedMessages);
      }
      return fetchedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to initial question if there's an error
      console.log("Error occurred, using initial question");
      setMessages([
        {
          role: 'assistant',
          content: "What's the name of your business?",
        },
      ]);
      
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
      return [];
    }
  }, [initialWebsiteId, toast]);

  // Fetch initial messages when component mounts
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle sending a new message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content || (typeof content === 'string' && !content.trim())) return;

      // Optimistically add user message to UI
      const userMessage: Message = {
        role: 'user',
        content,
        images: uploadedImages.length > 0 ? [...uploadedImages] : undefined,
      };

      // Add loading state for assistant
      const loadingMessage: Message = {
        role: 'assistant',
        content: 'Generating response...',
        isLoading: true,
      };

      // Just add the user message, not both
      setMessages(prev => [...prev, userMessage, loadingMessage]);
      setIsLoading(true);

      try {
        // Send message to API including uploaded images
        const response = await sendChatMessage(initialWebsiteId, content, 'user', uploadedImages);

        // Check if we received a user message in the response (null means it was a website generation notification)
        // For website generation messages, the backend will only return the AI message
        if (!response.userMessage) {
          // This is a website generation notification, only add the AI message
          setMessages(prev => {
            // Remove the loading message and the last user message (which was added optimistically)
            const withoutLoadingAndLastUser = prev.filter((m, i, arr) => 
              !m.isLoading && !(i === arr.length - 2 && m.role === 'user')
            );
            // Add the AI response
            return [...withoutLoadingAndLastUser, response.aiMessage];
          });
        } else {
          // Regular message flow - replace loading message with AI response
          setMessages(prev => {
            // Remove the loading message
            const withoutLoading = prev.filter(m => !m.isLoading);
            // Add the AI response
            return [...withoutLoading, response.aiMessage];
          });
        }

        // Clear uploaded images after sending
        setUploadedImages([]);
      } catch (error) {
        console.error('Error sending message:', error);
        // Remove loading message and show error
        setMessages(prev => prev.filter(m => !m.isLoading));
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [initialWebsiteId, uploadedImages, toast]
  );

  // Handle image uploads with better error handling
  const handleImageUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return [];

      // Validate file sizes before uploading to prevent server rejection
      const maxFileSize = 10 * 1024 * 1024; // 10MB (less than server's 15MB limit)
      const oversizedFiles = files.filter(file => file.size > maxFileSize);
      
      if (oversizedFiles.length > 0) {
        const errorMsg = `${oversizedFiles.length} file(s) exceed the 10MB size limit`;
        console.error(errorMsg, oversizedFiles.map(f => `${f.name}: ${(f.size / (1024 * 1024)).toFixed(1)}MB`));
        
        toast({
          title: 'Files too large',
          description: `${errorMsg}. Please resize your images before uploading.`,
          variant: 'destructive',
        });
        
        // Return early if any files are too large
        if (oversizedFiles.length === files.length) {
          throw new Error("All files exceed size limit");
        }
        
        // Continue with only valid files
        const validFiles = files.filter(file => file.size <= maxFileSize);
        console.log(`Proceeding with ${validFiles.length} valid files out of ${files.length} total`);
        return handleImageUpload(validFiles);
      }
      
      try {
        // Display loading toast
        toast({
          title: 'Uploading images',
          description: `Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`,
        });
        
        // Upload images to server
        const imageList = await uploadImages(initialWebsiteId, files);
        console.log('Server returned images:', imageList);
        
        if (!imageList || imageList.length === 0) {
          throw new Error("Server returned empty image list");
        }
        
        // Process images with proper timestamps and URLs
        const processedImages = imageList.map(img => ({
          ...img,
          url: `${img.url}?t=${Date.now()}`
        }));
        
        // Update state with new images
        setUploadedImages(prev => {
          // Create a map of existing image IDs to prevent duplicates
          const existingIds = new Set(prev.map(img => img.id));
          
          // Filter out any duplicates from the new images
          const uniqueNewImages = processedImages.filter(img => !existingIds.has(img.id));
          
          return [...prev, ...uniqueNewImages];
        });
        
        // Show success message
        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${imageList.length} image${imageList.length > 1 ? 's' : ''}`,
        });
        
        // Return the processed images for any additional handling
        return processedImages;
      } catch (error) {
        console.error('Error uploading images:', error);
        
        // More specific error message based on the error
        let errorMessage = 'Failed to upload images. Please try again.';
        
        if (error.response && error.response.status === 413) {
          errorMessage = 'Images are too large. Please resize them before uploading.';
        } else if (error.response && error.response.status === 500) {
          errorMessage = 'Server error during upload. Please try smaller or fewer images.';
        }
        
        toast({
          title: 'Upload Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        throw error;
      }
    },
    [initialWebsiteId, toast, setUploadedImages]
  );

  // Edit the generated website based on user instructions
  const editWebsiteContent = useCallback(
    async (instructions: string) => {
      if (!instructions.trim() || !websiteStructure) return;
      
      setIsGeneratingWebsite(true);
      
      try {
        // Add a message indicating website editing
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Making changes to your website based on your instructions. This may take a moment...',
          },
        ]);
        
        // Call the API with the current website structure and the edit instructions
        const updatedWebsiteData = await generateWebsite(
          instructions, 
          uploadedImages, 
          undefined, 
          websiteStructure
        );
        
        // Update the website structure with the new content
        setWebsiteStructure(updatedWebsiteData);
        
        // Save to localStorage for easy access later
        if (updatedWebsiteData.html) {
          localStorage.setItem('generatedWebsiteHTML', updatedWebsiteData.html);
        }
        
        // Add success message
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Your website has been updated! Take a look at the preview to see the changes.',
          },
        ]);
        
        toast({
          title: 'Success',
          description: 'Website updated successfully',
        });
      } catch (error) {
        console.error('Error updating website:', error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'I had trouble updating your website. Please try again with different instructions.',
          },
        ]);
        
        toast({
          title: 'Error',
          description: 'Failed to update website',
          variant: 'destructive',
        });
      } finally {
        setIsGeneratingWebsite(false);
      }
    },
    [uploadedImages, websiteStructure, toast]
  );
  
  // Generate website based on description
  const generateWebsiteContent = useCallback(
    async (description: string, businessType?: string) => {
      if (!description.trim()) return;

      setIsGeneratingWebsite(true);

      try {
        // Show a clear loading indicator
        toast({
          title: 'Creating Website',
          description: 'Please wait while we generate your professional website...',
        });
        
        // Include business type for better website generation
        const websiteData = await generateWebsite(description, uploadedImages, businessType);
        setWebsiteStructure(websiteData);

        // Save the website HTML in localStorage for the preview page to access
        if (websiteData?.html) {
          // Make sure the HTML content includes proper structure and styling
          const enhancedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessType || 'Business'} Website</title>
  <style>
    /* Essential styling */
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    img { max-width: 100%; height: auto; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${websiteData.html}
</body>
</html>`;
          
          // Store the HTML in localStorage for the preview page
          localStorage.setItem('generatedWebsiteHTML', enhancedHtml);
          console.log("Enhanced website saved to localStorage, length:", enhancedHtml.length);
          
          // Show success toast
          toast({
            title: 'Success!',
            description: 'Your website has been generated! Redirecting to preview...',
          });
          
          // Force navigation to preview page with a minimum delay
          // Direct page navigation is most reliable in this case
          console.log("FORCING NAVIGATION to website preview page");
          setTimeout(() => {
            window.location.href = '/website-preview';
          }, 100);
          
          // Return early to prevent any further processing
          return;
        } else {
          console.error("Failed to get website HTML");
        }
      } catch (error) {
        console.error('Error generating website:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate website',
          variant: 'destructive',
        });
      } finally {
        setIsGeneratingWebsite(false);
      }
    },
    [uploadedImages, toast]
  );

  // Clear uploaded images
  const clearUploadedImages = useCallback(() => {
    setUploadedImages([]);
  }, []);

  // Reset chat function - starts conversation over
  const resetChat = useCallback(async () => {
    // Reset to first business question
    setMessages([
      {
        role: 'assistant',
        content: "What's the name of your business?",
      },
    ]);
    // Clear any uploaded images and website structure
    setUploadedImages([]);
    setWebsiteStructure(null);
    
    // Call reset endpoint to clean server state
    try {
      await fetch('/api/reset_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteId: initialWebsiteId }),
      });
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
    
    toast({
      title: 'Chat Reset',
      description: 'Starting a fresh conversation',
    });
  }, [toast, initialWebsiteId]);

  return {
    messages,
    isLoading,
    uploadedImages,
    websiteStructure,
    isGeneratingWebsite,
    sendMessage,
    handleImageUpload,
    generateWebsiteContent,
    editWebsiteContent,
    clearUploadedImages,
    resetChat,
    fetchMessages,
  };
}
