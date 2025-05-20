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
    // Extract business details from the description
    const extractBusinessInfoResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a data extraction specialist. Your task is to extract structured business information from the following text that contains a conversation about a business website. 

          Extract ONLY factual information that was explicitly provided, do not invent or assume any details.
          
          Return a JSON object with the following structure:
          {
            "businessName": "The exact business name",
            "location": "The business location",
            "services": ["Service 1", "Service 2"],
            "uniqueSellingPoints": ["USP 1", "USP 2"],
            "targetCustomers": "Description of ideal customers",
            "slogan": "Business slogan or tagline (if any)",
            "hours": "Business hours",
            "contact": {
              "phone": "Phone number",
              "email": "Email address",
              "address": "Physical address"
            },
            "colors": ["Color 1", "Color 2"],
            "socialMedia": ["Platform 1", "Platform 2"]
          }
          
          If any field is missing information, use null or an empty array as appropriate. Be precise and only include information that was explicitly mentioned.`
        },
        {
          role: "user",
          content: description
        }
      ],
      response_format: { type: "json_object" },
    });

    const businessInfo = JSON.parse(extractBusinessInfoResponse.choices[0].message.content || "{}");
    
    // Format image information
    const formattedImageUrls = imageUrls.map(url => ({ path: url }));
    
    // Generate theme based on business type
    const themeResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a brand strategist specializing in website color psychology and visual design. Based on the business information provided, suggest a premium, harmonious color palette (5-6 colors) with exact hex codes that would create an exceptional website experience.
          
          For a boat rental company named after Poseidon (Greek god of the sea), you might suggest:
          - Primary: #0B4F6C (deep ocean blue) - For brand identity and main elements
          - Secondary: #01BAEF (vibrant cerulean) - For accents and call-to-action elements
          - Tertiary: #FBFBFF (off-white) - For backgrounds and negative space
          - Accent 1: #B80C09 (coral red) - For important highlights and energy
          - Accent 2: #040F16 (midnight blue) - For contrast and depth
          - Accent 3: #FFD700 (golden yellow) - For subtle luxury touches

          Return your response as a JSON object with the following structure:
          {
            "colorPalette": {
              "primary": "#hex",
              "secondary": "#hex",
              "tertiary": "#hex",
              "accent1": "#hex",
              "accent2": "#hex",
              "accent3": "#hex"
            },
            "typography": {
              "headingFont": "Font family suggestion",
              "bodyFont": "Font family suggestion" 
            },
            "mood": "The mood/feeling this palette evokes",
            "rationale": "Brief explanation of why this palette works for this business"
          }`
        },
        {
          role: "user",
          content: JSON.stringify(businessInfo)
        }
      ],
      response_format: { type: "json_object" },
    });

    const themeInfo = JSON.parse(themeResponse.choices[0].message.content || "{}");
    
    // Generate content for website sections
    const contentResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert website copywriter for premium businesses. Create engaging, persuasive content for each section of a high-end business website. 
          
          Craft compelling headlines, subheadlines, and body copy that conveys the business's value proposition and engages visitors.
          
          For a boat rental company, instead of generic copy like "We offer boat rentals", write compelling content like:
          "Experience the freedom of Florida's waterways aboard our immaculately maintained fleet of pontoon boats. Each vessel in our collection offers unparalleled comfort with premium seating, advanced navigation systems, and all the amenities you need for a perfect day on the water."
          
          Return your content as a JSON object with the following structure:
          {
            "hero": {
              "headline": "Compelling main headline",
              "subheadline": "Supporting statement",
              "ctaText": "Call to action button text"
            },
            "about": {
              "headline": "About section headline",
              "content": "Engaging paragraph about the business (min 150 words, include specific details from business information)"
            },
            "services": {
              "headline": "Services section headline",
              "intro": "Brief introduction",
              "servicesList": [
                {
                  "name": "Service name",
                  "description": "Detailed description (min 75 words)"
                }
              ]
            },
            "features": {
              "headline": "Features/Benefits headline",
              "featuresList": [
                {
                  "name": "Feature name",
                  "description": "Brief feature description"
                }
              ]
            },
            "cta": {
              "headline": "Call to action headline",
              "content": "Compelling reason to act",
              "buttonText": "CTA button text"
            },
            "testimonials": {
              "headline": "Testimonials headline",
              "testimonialsList": [
                {
                  "quote": "Realistic customer testimonial",
                  "author": "Customer name",
                  "location": "Location"
                }
              ]
            },
            "contact": {
              "headline": "Contact section headline",
              "content": "Brief message encouraging contact"
            }
          }`
        },
        {
          role: "user",
          content: JSON.stringify({
            businessInfo: businessInfo,
            imageCount: imageUrls.length,
            themeInfo: themeInfo
          })
        }
      ],
      response_format: { type: "json_object" },
    });

    const contentInfo = JSON.parse(contentResponse.choices[0].message.content || "{}");
    
    // Generate complete website HTML and CSS
    const websiteResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a senior frontend engineer specializing in creating pixel-perfect, high-end websites worth $20,000 or more.

          CREATE A COMPLETE, FULLY FUNCTIONAL, VISUALLY STUNNING WEBSITE with the following requirements:
          
          1. RESPONSIVENESS: Website must look perfect on ALL screen sizes from mobile to desktop
          2. ACCESSIBILITY: Follow WCAG standards for accessibility
          3. PERFORMANCE: Optimize for fast loading and smooth animations
          4. CODE QUALITY: Write clean, semantic HTML and efficient CSS
          5. VISUAL APPEAL: Create a truly premium-looking design
          
          THE HTML MUST:
          - Have proper document structure (<DOCTYPE>, <html>, <head>, <body>)
          - Include all necessary meta tags, favicon links, etc.
          - Use semantic HTML5 elements (<header>, <nav>, <main>, <section>, <footer>)
          - Be fully responsive without external frameworks
          - Include working navigation, forms, and interactive elements
          - Properly showcase all provided images
          - Include Font Awesome icons for visual appeal (link to Font Awesome CDN)
          - Have properly structured text with appropriate heading hierarchy
          
          THE CSS MUST:
          - Be modern and feature-rich with animations, transitions, and effects
          - Use custom properties (CSS variables) for the color scheme
          - Implement responsive design without external frameworks
          - Include hover/active states for interactive elements
          - Feature sophisticated animations and transitions
          - Create visual interest with layered elements, subtle shadows
          - Use modern CSS techniques like Grid and Flexbox
          - Include media queries for perfect responsive behavior
          
          IMPORTANT VISUAL REQUIREMENTS:
          - The website must look like it cost $20,000 to design
          - Design must be cohesive, with consistent color application
          - Typography must be impeccable with proper hierarchy
          - Use generous whitespace to create a sense of luxury
          - Include subtle animations that enhance the experience
          - Navigation must be intuitive yet distinctive
          - Call-to-action elements should stand out
          - Layout should feel custom-designed
          
          RETURN A JSON OBJECT with the following structure:
          {
            "html": "Complete HTML code",
            "css": "Complete CSS code",
            "structure": {
              "header": { "title": "Website Title", "navigation": ["Home", "About", "Services", "Gallery", "Contact"] },
              "sections": [
                {"id": "hero", "type": "hero", "title": "Main Headline", "subtitle": "Supporting text"},
                {"id": "about", "type": "about", "title": "About Us", "content": "Company description"},
                {"id": "services", "type": "services", "title": "Our Services"},
                {"id": "gallery", "type": "gallery", "title": "Our Work", "images": [image paths]},
                {"id": "testimonials", "type": "testimonials", "title": "What Clients Say"},
                {"id": "contact", "type": "contact", "title": "Contact Us"}
              ],
              "footer": { "columns": [{"title": "About", "links": ["Our Story", "Team"]}, {"title": "Contact", "contact_info": {}}] }
            },
            "recommendation": "Recommendations for elevating the website even further"
          }`
        },
        {
          role: "user",
          content: JSON.stringify({
            businessInfo: businessInfo,
            images: formattedImageUrls,
            theme: themeInfo,
            content: contentInfo
          })
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(websiteResponse.choices[0].message.content || "{}");

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
  "Where is your business located?",
  "What products or services do you offer?",
  "What makes your business unique compared to competitors?",
  "Who is your ideal customer?",
  "What's your business slogan or tagline (if you have one)?",
  "What are your business hours?",
  "What contact information should be on the website?",
  "What are your primary business colors (if you have brand colors)?",
  "Do you have any social media accounts to link on the website?"
];

// Process user message and generate response
export async function generateChatResponse(
  messages: { role: string; content: string }[]
): Promise<string> {
  try {
    // Get the count of user and assistant messages
    const userMessageCount = messages.filter(m => m.role === "user").length;
    const assistantMessageCount = messages.filter(m => m.role === "assistant").length;
    
    // Check if we should be asking sequential questions
    // Ensure we always alternate: assistant asks a question, user answers, then assistant asks next question
    if (userMessageCount === assistantMessageCount && userMessageCount <= BUSINESS_QUESTIONS.length) {
      // We're in question-asking mode and it's time to ask the next question
      // Return the next question in sequence
      return BUSINESS_QUESTIONS[assistantMessageCount - 1];
    }

    // Check if we've just finished all the questions and should prompt for images
    if (userMessageCount === BUSINESS_QUESTIONS.length + 1 && 
        assistantMessageCount === BUSINESS_QUESTIONS.length) {
      return "Thank you for providing all that information! Now, please upload some images for your website. " +
             "High-quality images are essential for creating a premium website. " +
             "Once you've uploaded your images, click the 'Create Website' button to see a preview.";
    }
    
    // Check if the previous message is from a user (we're responding to user input)
    const isRespondingToUser = messages[messages.length - 1].role === "user";
    
    let systemPrompt = "";
    
    if (isRespondingToUser) {
      // If we've gathered all business info and now the user is asking questions or requesting changes
      if (userMessageCount > BUSINESS_QUESTIONS.length + 1) {
        systemPrompt = `You are a premium website design consultant working with a client on their $20,000 custom website.
        
        The client might ask for design changes, request feature adjustments, or ask questions about their website.
        
        Respond with expertise and confidence, explaining how you'll implement any requested changes or answering
        their questions thoughtfully. Always maintain a tone of luxury and exclusivity.
        
        If they request a change, acknowledge it and explain how you'll enhance their website with their feedback.
        
        Keep your responses concise, professional, and focused on helping them get the perfect website.`;
      } else {
        // We're still gathering business information, so enhance their answers into professional copy
        systemPrompt = `You are a professional website consultant that helps users create premium, $20,000-caliber websites.
        
        Take the user's input and enhance it into compelling, professional website copy. 
        Transform simple answers into polished, engaging content that could appear directly on a premium website.
        
        For example, if a user says "We sell shoes", you should respond with elegant marketing copy like:
        "Perfect. I've refined that into: 'Discover unparalleled craftsmanship with our curated collection of luxury footwear. Each pair is meticulously designed to combine timeless elegance with modern comfort, ensuring you make a statement with every step.'"
        
        After acknowledging their input and providing your enhanced version, ask the NEXT QUESTION from the sequence.
        This creates a guided interview flow where you're helping the user build their website one step at a time.`;
      }
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

    let responseContent = response.choices[0].message.content || "";
    
    // ALWAYS return just the next question with no additional commentary
    // Completely ignore the GPT response and just send the next question directly
    if (isRespondingToUser) {
      // If we're within the question sequence, return the next question
      if (assistantMessageCount < BUSINESS_QUESTIONS.length) {
        return BUSINESS_QUESTIONS[assistantMessageCount];
      } 
      // If we've gone through all questions, prompt for images
      else if (assistantMessageCount === BUSINESS_QUESTIONS.length) {
        return "Please upload images for your website.";
      }
    }

    return responseContent;
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
