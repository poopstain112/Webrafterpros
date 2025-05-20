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
    const response = await fetch(`/api/websites/${websiteId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, role, images }),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      } catch (jsonError) {
        // If we can't parse JSON, just use the status text
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
    }

    return await response.json();
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
    const response = await fetch(`/api/websites/${websiteId}/messages`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch messages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
}

export default {
  generateWebsite,
  sendChatMessage,
  uploadImages,
  getChatMessages,
};
