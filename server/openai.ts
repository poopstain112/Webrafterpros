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
      ? `The user has provided ${imageUrls.length} images (${imageUrls.join(", ")}). Please incorporate all of these images strategically throughout the website, treating them as premium photography assets.`
      : "The user hasn't provided any images yet.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a high-end creative director at an exclusive web design agency that charges $20,000+ per website. Your clients include luxury brands and premium businesses.
          
          Your task is to create a visually stunning, high-end website based on the user's description that looks like it cost $20,000 to design.
          
          PREMIUM WEBSITE REQUIREMENTS:
          - Create an exceptional, sophisticated website that exudes luxury and exclusivity
          - The HTML must follow perfect semantic structure with responsive design built-in
          - Use advanced CSS techniques including elegant animations, transitions, and micro-interactions
          - Implement thoughtful whitespace and perfect typography with proper hierarchy
          - Design should feature layered elements that create depth and dimension
          - Include subtle parallax-like effects and elegant scroll animations
          - Create custom gradient buttons with sophisticated hover effects
          - Design a premium-looking navigation experience
          - Include elegant animations that trigger on scroll or hover
          - Implement perfect responsive behavior across all devices
          
          VISUAL DESIGN REQUIREMENTS:
          - Use a sophisticated, premium color palette appropriate for the industry
          - Create a stunning visual hierarchy with perfect typographic scale
          - Implement premium card/panel designs with subtle shadows and layering
          - Use elegant spacing throughout to create a sense of luxury
          - Design beautiful, high-end CTAs that entice interaction
          - Create a distinctive, memorable hero section
          - Implement sophisticated layout techniques that feel custom-designed
          - Use subtle background patterns or gradients where appropriate
          - Design should reflect current 2025 premium web design trends
          
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
            "recommendation": "Recommendations for elevating the website even further"
          }`,
        },
        {
          role: "user",
          content: `I need a premium, high-end business website for: ${description}. ${imagesPrompt}
          
          Requirements for this $20,000 website:
          1. Create a visually stunning, luxury-level design that looks truly premium
          2. All images must be incorporated elegantly throughout the site as professional assets
          3. The website must feature sophisticated animations and interactions
          4. Typography and spacing must be impeccable, creating a sense of luxury
          5. The color palette must be refined and premium-looking
          6. The site must include compelling, persuasive marketing copy
          7. Navigation must be intuitive yet distinctive
          8. Design should feature modern touches like layered elements and parallax-like effects
          
          Create this as if it were designed by a top-tier agency for a premium client with an unlimited budget. Make it truly exceptional.`,
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

// Business questions the chatbot will ask in sequence to gather information
const BUSINESS_QUESTIONS = [
  "What's the name of your business?",
  "What industry or sector is your business in? (e.g., healthcare, retail, construction)",
  "What products or services do you offer? List the main ones.",
  "What makes your business unique compared to competitors?",
  "Who is your target audience or ideal customer?",
  "What are your business values or mission?",
  "Do you have any specific color preferences for your website?",
  "Is there anything specific you want to highlight on your website?"
];

// Process user message and generate response
export async function generateChatResponse(
  messages: { role: string; content: string }[]
): Promise<string> {
  try {
    // Check if this is a new conversation and we need to ask business questions
    if (messages.filter(m => m.role === "user").length <= 2) {
      // Find the appropriate question to ask based on conversation history
      const questionIndex = messages.filter(m => m.role === "assistant").length;
      if (questionIndex < BUSINESS_QUESTIONS.length) {
        return BUSINESS_QUESTIONS[questionIndex];
      }
    }
    
    // If we've already asked all the questions, or this is a response to a user question
    // Check if the previous message is from a user (we're responding to user input)
    const isRespondingToUser = messages[messages.length - 1].role === "user";
    
    let systemPrompt = "";
    
    if (isRespondingToUser) {
      systemPrompt = `You are a professional website consultant that helps users create premium, $20,000-caliber websites. 
        
        Take the user's input and enhance it into compelling, professional website copy. 
        Transform simple answers into polished, engaging content that could appear directly on a premium website.
        
        For example, if a user says "We sell shoes", you should respond with elegant marketing copy like:
        "I've refined that into: 'Discover unparalleled craftsmanship with our curated collection of luxury footwear. Each pair is meticulously designed to combine timeless elegance with modern comfort, ensuring you make a statement with every step.'"
        
        Always acknowledge their input, then provide the enhanced version that you've crafted.
        Keep your responses concise but impactful.`;
    } else {
      // Default chatbot behavior
      systemPrompt = `You are a helpful AI assistant specializing in premium website creation. 
        Provide concise yet valuable responses about creating high-end websites.
        If asked about technical details, explain the sophisticated techniques used in modern web development.
        Maintain a tone that reflects expertise in premium design and development.`;
    }
    
    // Properly type the messages for OpenAI API
    const typedMessages = [
      {
        role: "system" as const,
        content: systemPrompt
      },
      ...messages.map(msg => ({
        role: (msg.role === "user" || msg.role === "assistant" || msg.role === "system") 
          ? msg.role as "user" | "assistant" | "system" 
          : "user" as const, // fallback to user if unknown role
        content: msg.content
      }))
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: typedMessages
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
          content: "You are a luxury brand creative director specializing in premium website aesthetics. Your expertise is analyzing images and crafting sophisticated descriptions for high-end business websites."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image for use in a premium $20,000 website. Provide an elegant description of what it shows and suggest how it could enhance the website's aesthetic (hero section, testimonial background, brand story, etc.). Focus on its premium qualities and emotional impact."
            },
            {
              type: "image_url",
              image_url: {
                url: fullImageUrl
              }
            }
          ] as any, // Type assertion to fix compatibility issues
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
