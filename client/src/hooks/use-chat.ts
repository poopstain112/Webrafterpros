import { useState, useEffect, useCallback } from 'react';
import { Message, UploadedImage, WebsiteStructure } from '@/types';
import { sendChatMessage, uploadImages, generateWebsite, getChatMessages } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';

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
      if (!content.trim()) return;

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

        // Replace loading message with AI response, don't add a second user message
        setMessages(prev => {
          // Remove the loading message
          const withoutLoading = prev.filter(m => !m.isLoading);
          // Add the AI response
          return [...withoutLoading, response.aiMessage];
        });

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

  // Handle image uploads
  const handleImageUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      try {
        // Display loading toast
        toast({
          title: 'Uploading images',
          description: 'Please wait while your images are being uploaded...',
        });
        
        // Upload images to server
        const imageList = await uploadImages(initialWebsiteId, files);
        console.log('Server returned images:', imageList);
        
        // Use the display URL if it exists, otherwise add a timestamp
        const processedImages = imageList.map(img => ({
          ...img,
          url: img.displayUrl || `${img.url}?t=${Date.now()}`
        }));
        
        // Update state with new images
        setUploadedImages(prev => [...prev, ...processedImages]);
        
        // Show success message
        toast({
          title: 'Success',
          description: `Uploaded ${files.length} image${files.length > 1 ? 's' : ''}`,
        });
        
        // Return the processed images for any additional handling
        return processedImages;
      } catch (error) {
        console.error('Error uploading images:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload images',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [initialWebsiteId, toast]
  );

  // Generate website based on description
  const generateWebsiteContent = useCallback(
    async (description: string, businessType?: string) => {
      if (!description.trim()) return;

      setIsGeneratingWebsite(true);

      try {
        // Add a message indicating website generation
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Generating your professional website based on your description. This may take a moment...',
          },
        ]);

        // Include business type for better website generation
        const websiteData = await generateWebsite(description, uploadedImages, businessType);
        setWebsiteStructure(websiteData);

        // Add success message
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Your website has been generated! Take a look at the preview on the right and let me know if you\'d like to make any changes.',
          },
        ]);

        toast({
          title: 'Success',
          description: 'Website generated successfully',
        });
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
    clearUploadedImages,
    resetChat,
    fetchMessages,
  };
}
