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
  useEffect(() => {
    async function fetchMessages() {
      try {
        const fetchedMessages = await getChatMessages(initialWebsiteId);
        if (fetchedMessages.length === 0) {
          // Add initial message if no messages exist - first business question
          setMessages([
            {
              role: 'assistant',
              content: "What's the name of your business?",
            },
          ]);
        } else {
          setMessages(fetchedMessages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history',
          variant: 'destructive',
        });
      }
    }

    fetchMessages();
  }, [initialWebsiteId, toast]);

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

      setMessages(prev => [...prev, userMessage, loadingMessage]);
      setIsLoading(true);

      try {
        // Send message to API including uploaded images
        const response = await sendChatMessage(initialWebsiteId, content, 'user', uploadedImages);

        // Update messages
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isLoading);
          return [...filtered, response.userMessage, response.aiMessage];
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
        const imageList = await uploadImages(initialWebsiteId, files);
        setUploadedImages(prev => [...prev, ...imageList]);
        toast({
          title: 'Success',
          description: `Uploaded ${files.length} image${files.length > 1 ? 's' : ''}`,
        });
      } catch (error) {
        console.error('Error uploading images:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload images',
          variant: 'destructive',
        });
      }
    },
    [initialWebsiteId, toast]
  );

  // Generate website based on description
  const generateWebsiteContent = useCallback(
    async (description: string) => {
      if (!description.trim()) return;

      setIsGeneratingWebsite(true);

      try {
        // Add a message indicating website generation
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Generating your website based on your description. This may take a moment...',
          },
        ]);

        const websiteData = await generateWebsite(description, uploadedImages);
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
  };
}
