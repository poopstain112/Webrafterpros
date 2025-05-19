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
      ? `The user has provided these images (${imageUrls.join(", ")}). Please incorporate them appropriately.`
      : "The user hasn't provided any images yet.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional website designer and developer. Your task is to generate website content based on user descriptions.
          Create a modern, responsive website with clean design and clear visual hierarchy.
          Focus on business website templates.
          Generate a JSON structure that can be used to render the website.
          Also provide recommendations on how to improve the website.
          Return a JSON object with the following structure:
          {
            "html": "The HTML code for the website",
            "css": "The CSS code for the website",
            "structure": {
              // A nested JSON structure representing the website's components
              "header": { ... },
              "sections": [ ... ],
              "footer": { ... }
            },
            "recommendation": "Recommendations for improving the website"
          }`,
        },
        {
          role: "user",
          content: `I need a website with the following description: ${description}. ${imagesPrompt}`,
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
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
                url: imageUrl
              }
            }
          ],
        },
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error: any) {
    console.error("OpenAI Image Analysis error:", error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

export default {
  generateWebsiteContent,
  generateChatResponse,
  analyzeImages,
};
