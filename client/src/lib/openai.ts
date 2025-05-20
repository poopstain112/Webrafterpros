import { Message, UploadedImage, WebsiteStructure } from '@/types';

// Generate website content from description and images
export async function generateWebsite(
  description: string,
  images: UploadedImage[] = []
): Promise<WebsiteStructure> {
  try {
    const imageUrls = images.map(img => img.url);
    
    const response = await fetch('/api/generate-website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description, imageUrls }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate website');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating website:', error);
    throw error;
  }
}

// Send a chat message and get a response
export async function sendChatMessage(
  websiteId: number,
  content: string,
  role: 'user' | 'assistant' = 'user',
  images?: UploadedImage[]
): Promise<{ userMessage: Message; aiMessage: Message }> {
  try {
    console.log(`Sending message to website ID: ${websiteId}`, { content, role });
    
    const response = await fetch(`/api/websites/${websiteId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, role, images }),
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      try {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      } catch (jsonError) {
        // If we can't parse JSON, just use the status text
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
    }

    const result = await response.json();
    console.log('Received response:', result);
    return result;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

// Upload images
export async function uploadImages(
  websiteId: number,
  files: File[]
): Promise<UploadedImage[]> {
  try {
    const formData = new FormData();
    formData.append('websiteId', websiteId.toString());
    
    // Use the same field name as specified in the multer setup on the server
    files.forEach(file => {
      formData.append('images', file);
    });
    
    // Log the files being uploaded in a more stable way
    console.log('Uploading images with formData:', {
      websiteId,
      fileCount: files.length,
      fileNames: files.map(f => f.name)
    });

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload images');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}

// Get all chat messages for a website
export async function getChatMessages(websiteId: number): Promise<Message[]> {
  try {
    console.log(`Fetching messages for website ID: ${websiteId}`);
    const response = await fetch(`/api/websites/${websiteId}/messages`);

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      try {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch messages');
      } catch (jsonError) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log(`Received ${data.length} messages from API`);
    return data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return []; // Return empty array instead of throwing to prevent app crashes
  }
}

export default {
  generateWebsite,
  sendChatMessage,
  uploadImages,
  getChatMessages,
};
