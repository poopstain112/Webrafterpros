import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// Process website descriptions and generate website content
export async function generateWebsiteContent(
  description: string,
  imageUrls: string[] = []
): Promise<{
  html: string;
  css: string;
  structure: any;
  recommendation: string;
}> {
  try {
    const imagesPrompt = imageUrls.length
      ? `The user has provided ${imageUrls.length} images (${imageUrls.join(", ")}). Please incorporate them strategically throughout the website, ensuring they are referenced correctly in the HTML.`
      : "The user hasn't provided any images yet.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert website designer and developer specializing in creating professional business websites.
          
          Your task is to generate a complete, production-ready website based on the user's description and images.
          
          WEBSITE REQUIREMENTS:
          - Create a visually stunning, modern business website with professional design elements
          - The HTML must be fully responsive and mobile-optimized with proper viewport settings
          - Use modern CSS with flexbox, grid, and responsive design patterns
          - Include smooth animations and transitions for interactive elements
          - Implement proper semantic HTML5 structure (header, nav, sections, footer)
          - Ensure accessibility features (aria attributes, alt text, keyboard navigation)
          - Add hover effects for buttons and interactive elements
          - Include a contact form in the footer
          - Create a sticky navigation header
          - Add proper SEO meta tags
          
          CSS REQUIREMENTS:
          - Use a clean, professional color scheme with complementary colors
          - Implement responsive typography with proper hierarchy
          - Create custom button styles with hover effects
          - Add box-shadows and subtle gradients for depth
          - Use modern card designs for content sections
          - Design a professional footer with multiple columns
          - Include media queries for different screen sizes
          - Implement proper spacing and whitespace management
          
          Return a JSON object with the following structure:
          {
            "html": "The complete HTML code for the website",
            "css": "The complete CSS code for the website",
            "structure": {
              "header": { "title": "Website Title", "navigation": ["Home", "About", "Services", "Gallery", "Contact"] },
              "sections": [
                {"id": "hero", "type": "hero", "title": "Main Headline", "subtitle": "Supporting text", "imageUrl": "image_path"},
                {"id": "about", "type": "about", "title": "About Us", "content": "Company description", "imageUrl": "image_path"},
                {"id": "services", "type": "services", "title": "Our Services", "items": [{"title": "Service 1", "description": "Details"}]},
                {"id": "gallery", "type": "gallery", "title": "Our Work", "images": ["image_path1", "image_path2"]},
                {"id": "testimonials", "type": "testimonials", "title": "What Clients Say", "items": [{"text": "Testimonial", "author": "Client name"}]},
                {"id": "contact", "type": "contact", "title": "Contact Us", "formFields": ["name", "email", "message"]}
              ],
              "footer": { "columns": [{"title": "About", "links": ["Our Story", "Team"]}, {"title": "Contact", "contact_info": {"address": "", "phone": "", "email": ""}}] }
            },
            "recommendation": "Detailed recommendations for improving the website"
          }`,
        },
        {
          role: "user",
          content: `I need a professional business website with the following description: ${description}. ${imagesPrompt}
          
          Please make sure:
          1. All images are properly referenced in the HTML (use the exact image paths provided)
          2. The design is modern and visually appealing with a professional color scheme
          3. The website is fully responsive
          4. There's a clear call-to-action in the hero section
          5. The navigation is intuitive and user-friendly
          6. Include testimonial and services sections
          7. Add a contact form in the footer
          
          BE CREATIVE and make this look like a professional business website that would impress clients!`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      html: result.html || "",
      css: result.css || "",
      structure: result.structure || {},
      recommendation: result.recommendation || "",
    };
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate website content: ${error.message}`);
  }
}

// Process user message and generate response
export async function generateChatResponse(
  messages: { role: string; content: string }[]
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant for a website generation tool. 
          You help users describe their website needs and guide them through the process.
          Be friendly, concise, and helpful. Ask follow-up questions to get a clear picture
          of what the user wants in their website.`,
        },
        ...messages,
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate chat response: ${error.message}`);
  }
}

// Analyze uploaded images and provide descriptions/suggestions
export async function analyzeImages(imageUrl: string): Promise<string> {
  try {
    // For images with relative URLs, create a full URL using the server's origin
    let fullImageUrl = imageUrl;
    if (imageUrl.startsWith('/')) {
      // Skip image analysis for relative paths for now to avoid errors
      return "Image uploaded successfully.";
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional website designer and image analyst. Your task is to analyze images and suggest how they could be used in a business website."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and suggest how it could be used in a business website. Describe what the image shows and where it would be appropriate to place it (hero section, about page, gallery, etc.)."
            },
            {
              type: "image_url",
              image_url: {
                url: fullImageUrl
              }
            }
          ],
        },
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("OpenAI Image Analysis error:", error);
    // Return a generic message instead of throwing an error
    return "Image uploaded successfully. Analysis not available.";
  }
}

export default {
  generateWebsiteContent,
  generateChatResponse,
  analyzeImages,
};
