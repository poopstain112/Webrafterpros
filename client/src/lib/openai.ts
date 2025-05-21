import { Message, UploadedImage, WebsiteStructure } from '@/types';

// Generate or edit website content
export async function generateWebsite(
  description: string,
  images: UploadedImage[] = [],
  businessType?: string,
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  },
  existingWebsite?: WebsiteStructure
): Promise<WebsiteStructure> {
  try {
    const imageUrls = images.map(img => img.url);
    
    // Try to detect business type from description if not explicitly provided
    let detectedBusinessType = businessType;
    if (!detectedBusinessType) {
      // Look for common business type indicators in description
      const businessTypes = [
        'power washing', 'cleaning', 'home service', 'consulting', 
        'retail', 'healthcare', 'fitness', 'technology', 'education'
      ];
      
      for (const type of businessTypes) {
        if (description.toLowerCase().includes(type.toLowerCase())) {
          detectedBusinessType = type;
          break;
        }
      }
    }
    
    const isEdit = !!existingWebsite;
    console.log(`${isEdit ? 'Editing' : 'Generating'} website with business type: ${detectedBusinessType || 'unspecified'}`);
    
    const response = await fetch('/api/generate-website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        description, 
        imageUrls,
        businessType: detectedBusinessType,
        socialMedia,
        existingWebsite: isEdit ? existingWebsite : undefined,
        isEdit
      }),
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
    
    // Add each file to the form data
    files.forEach(file => {
      formData.append('images', file);
    });
    
    // Log what we're uploading
    console.log('Uploading images with formData:', {
      websiteId,
      fileCount: files.length,
      fileNames: files.map(f => f.name)
    });

    // Send the POST request to upload images
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Upload failed with status:', response.status);
      throw new Error('Failed to upload images');
    }

    // Get the response data
    const data = await response.json();
    
    // Process the response data - add displayUrl property with timestamp
    const timestamp = Date.now();
    const processedImages = data.map((img: any) => ({
      ...img,
      // Add a display URL with timestamp to prevent browser caching
      displayUrl: `${img.url}?t=${timestamp}`,
      // Make sure we have a valid URL
      url: img.url || `/uploads/${img.filename}`
    }));
    
    console.log('Processed uploaded images:', processedImages);
    
    return processedImages;
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

// Reset chat messages
export async function resetChat() {
  try {
    const response = await fetch('/api/reset_chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ websiteId: 1 }), // Default to website ID 1
    });

    if (!response.ok) {
      throw new Error('Failed to reset chat');
    }

    const result = await response.json();
    
    // Clear localStorage if server indicates we should
    if (result.clearLocalStorage) {
      localStorage.removeItem('websiteGenerated');
    }

    return result;
  } catch (error) {
    console.error('Error resetting chat:', error);
    throw error;
  }
}

export default {
  generateWebsite,
  sendChatMessage,
  uploadImages,
  getChatMessages,
  resetChat,
};
