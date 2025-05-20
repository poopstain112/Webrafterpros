import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// Process website descriptions and generate website content
export async function generateWebsiteContent(
  description: string,
  imageUrls: string[] = [],
  businessType?: string
): Promise<{
  html: string;
  css: string;
  structure: any;
  recommendation: string;
  industrySpecificFeatures?: string[];
}> {
  try {
    // Extract business details from the description
    const extractBusinessInfoResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a branding strategist specializing in extracting and enhancing business details for premium website creation. Your task is to analyze a conversation about ANY type of business and extract comprehensive structured information.

          PRIMARY GOAL: Extract ONLY factual information that was explicitly provided in the conversation. When information is ambiguous or missing, use null or empty arrays as appropriate.
          
          SECONDARY GOAL: For certain fields like uniqueSellingPoints and businessDescription, craft a more polished, professional version while maintaining 100% factual accuracy to what was provided.
          
          Return a JSON object with the following structure:
          {
            "businessName": "The exact business name as provided",
            "businessType": "The type of business (Restaurant, E-commerce, Professional Services, etc.)",
            "industry": "The specific industry the business operates in",
            "location": "The specific business location",
            "services": ["Service 1", "Service 2"],
            "products": ["Product 1", "Product 2"],
            "uniqueSellingPoints": ["Enhanced USP 1", "Enhanced USP 2"],
            "businessDescription": "A comprehensive, well-crafted description based solely on the information provided. This should read like professional marketing copy while maintaining perfect factual accuracy.",
            "targetCustomers": "Enhanced description of ideal customers",
            "slogan": "Business slogan or tagline (if provided)",
            "hours": "Business hours",
            "contact": {
              "phone": "Phone number",
              "email": "Email address",
              "address": "Physical address"
            },
            "colors": ["Color 1", "Color 2"],
            "socialMedia": ["Platform 1", "Platform 2"]
          }
          
          CRITICAL RULES:
          1. NEVER invent core facts, services, or contact information not explicitly mentioned
          2. Only enhance language and presentation, never the underlying facts
          3. If the business name lacks "proper noun capitalization", apply standard capitalization rules
          4. This must work for ANY type of business (retail, service, tech, healthcare, etc.)
          5. Be precise and thorough in your extraction - if it wasn't mentioned, don't include it`
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
    
    // Generate premium theme based on business type
    const themeResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are the world's most prestigious brand designer who creates custom visual identities for elite clients across ANY industry. Your color palettes are featured in design annuals and win international awards. Your expertise in color psychology, typography, and visual harmony creates immersive brand experiences that elevate businesses to iconic status.

          ESSENTIAL REQUIREMENTS:
          - Create a sophisticated, harmonious color system appropriate for the specific industry and business type
          - Design a palette that feels uniquely crafted for the specific business based on its attributes
          - Select colors with perfect color theory relationships (complementary, analogous, etc.)
          - Choose typography that creates an unmistakable professional voice appropriate to the industry
          - Develop a cohesive visual language that works across digital and print applications
          - Consider the emotional and psychological impact of each color choice
          - Ensure the palette communicates the intended brand positioning and personality
          
          THE THEME MUST:
          - Be versatile enough to apply to any business type (retail, tech, healthcare, services, etc.)
          - Include a custom-tailored color palette based on industry best practices and brand psychology
          - Feature a carefully selected typography system appropriate to the specific business
          - Include thoughtful gradient combinations for modern design elements
          - Create a distinctive visual identity that enhances the business's unique attributes
          
          EXAMPLES BY INDUSTRY:
          
          For a luxury fashion brand:
          - Palette: Sophisticated blacks, whites, and gold accents
          - Typography: Elegant serifs and refined sans-serifs
          - Mood: Exclusive, aspirational, refined
          
          For a tech startup:
          - Palette: Vibrant primary with complementary accents
          - Typography: Modern, clean sans-serifs
          - Mood: Innovative, energetic, forward-thinking
          
          For a healthcare provider:
          - Palette: Calming blues and greens with warm accents
          - Typography: Approachable, clear, balanced type system
          - Mood: Trustworthy, reassuring, expert
          
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
            "gradients": {
              "primary": "linear-gradient(to right, #hex, #hex)",
              "secondary": "linear-gradient(to right, #hex, #hex)",
              "accent": "linear-gradient(to right, #hex, #hex)"
            },
            "typography": {
              "displayFont": "Premium display font name",
              "headingFont": "Heading font name",
              "bodyFont": "Body font name",
              "accentFont": "Optional accent font"
            },
            "mood": "The specific emotional quality this palette evokes",
            "rationale": "In-depth explanation of how this palette fits the business type and industry",
            "designNotes": "Strategic application guidelines for this palette"
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
    
    // Generate content for website sections for ANY business type
    const contentResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are the world's most versatile copywriter responsible for creating exceptional, award-winning content for any type of business website. Your words create immersive brand narratives that captivate target audiences across industries. You craft extraordinary copy that would be suitable for premium websites across all sectors.

          IMPORTANT REQUIREMENTS:
          - Create content that feels custom-crafted specifically for the unique business based on its industry and attributes
          - Develop a distinctive brand voice that aligns with the business's industry and target audience
          - Craft compelling, emotionally resonant headlines that capture attention immediately
          - Write body copy with perfect rhythm, pacing, and flow
          - Include specific details from the business information to create authentic, personalized content
          - Convey unique value propositions with sophisticated language
          - Create narrative throughlines that connect sections cohesively
          - Balance aspirational language with concrete details
          - Use literary techniques (metaphor, alliteration, etc.) thoughtfully
          
          YOU MUST ADAPT TO ANY BUSINESS TYPE:
          - Retail/E-commerce: Focus on product quality, selection, and customer experience
          - Professional Services: Emphasize expertise, process, and client outcomes
          - Healthcare: Highlight care quality, patient experience, and wellness outcomes
          - Technology: Showcase innovation, efficiency, and competitive advantages
          - Hospitality: Describe experiences, amenities, and ambiance
          - Education: Feature learning outcomes, teaching approach, and student success
          
          CRITICALLY IMPORTANT:
          - DO NOT use generic statements like "high-quality service" or "customer satisfaction"
          - DO NOT write bland, interchangeable copy that could apply to any business
          - INSTEAD, write content that could ONLY apply to THIS SPECIFIC business
          - BE SPECIFIC about their unique offerings and customer experience
          - ADAPT the tone and style to the business's industry and target audience
          
          For example, a tech company might need crisp, forward-thinking language:
          "Transform your digital infrastructure with CloudSync's revolutionary edge computing platform. Our proprietary algorithms reduce latency by 75% while enhancing security protocols, giving your enterprise the competitive advantage in today's data-driven marketplace."
          
          While a bakery might need warm, sensory-rich descriptions:
          "Each morning at Wheatfield Bakery begins at 3 AM, when our artisans hand-mix organic heritage grains into doughs that will rise slowly, developing complex flavors and that perfect contrast between crackling crust and pillowy interior that only traditional methods can achieve."
          
          Return your content as a JSON object with the following structure:
          {
            "hero": {
              "headline": "Bold, memorable headline (max 8 words)",
              "subheadline": "Elegant supporting statement (1-2 sentences)",
              "ctaText": "Compelling call to action (3-5 words)"
            },
            "about": {
              "headline": "Distinctive about section headline",
              "content": "Storytelling narrative about the business (200-250 words, include specific details about the business's unique attributes)"
            },
            "offerings": {
              "headline": "Industry-appropriate headline for services/products",
              "intro": "Captivating introduction (2-3 sentences)",
              "offeringsList": [
                {
                  "name": "Distinctively named offering",
                  "description": "Richly detailed description with specific benefits (100-150 words)"
                }
              ]
            },
            "experience": {
              "headline": "Customer/client experience headline",
              "content": "Vivid description of what customers will experience (150-200 words)",
              "benefitsList": [
                {
                  "name": "Distinctive benefit name",
                  "description": "Emotionally resonant description with specific details (30-40 words)"
                }
              ]
            },
            "cta": {
              "headline": "Urgent, compelling call to action headline",
              "content": "Persuasive reason to act immediately (50-75 words)",
              "buttonText": "Action-oriented button text"
            },
            "testimonials": {
              "headline": "Social proof headline",
              "testimonialsList": [
                {
                  "quote": "Authentic-sounding testimonial with specific details about experience (50-60 words)",
                  "author": "Realistic customer name",
                  "location": "Specific location"
                }
              ]
            },
            "contact": {
              "headline": "Connection-focused contact headline",
              "content": "Inviting message encouraging immediate contact (40-50 words)"
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
    
    // Generate complete award-winning website HTML and CSS for ANY industry
    const websiteResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an award-winning frontend architect who creates revolutionary digital experiences for businesses across ALL industries. Your websites are taught in design schools worldwide and set new standards for digital excellence regardless of the business type.

          YOUR TASK: Create a COMPLETE HTML FILE containing a professional business website. The output must begin with <!DOCTYPE html> and be fully functional when viewed in a browser.
          
          CRITICAL REQUIREMENTS:
          1. Return ONE COMPLETE HTML document with embedded CSS/JS
          2. Start with proper <!DOCTYPE html> declaration
          3. Include ALL CSS within <style> tags
          4. Include responsive design that works perfectly on mobile
          5. Create a professional, modern design with navigation, hero section, services, and contact
          6. DO NOT return JSON or markdown code blocks - ONLY the HTML document
          
          INDUSTRY ADAPTATION:
          - Adapt the design language to perfectly suit the specific business industry
          - Create layouts appropriate for the business type (e-commerce, services, healthcare, etc.)
          - Implement industry-specific components and interaction patterns
          - Ensure the visual design aligns with industry expectations while being innovative
          - Use design patterns that best showcase the specific business's offerings
          
          TECHNICAL EXCELLENCE:
          - Craft pixel-perfect, semantically flawless HTML5
          - Write bleeding-edge CSS with sophisticated animations and transitions
          - Implement flawless responsive behavior across ALL devices (mobile, tablet, desktop)
          - Ensure perfect accessibility (WCAG AAA compliance)
          - Optimize performance with efficient code structure
          - Include meta tags for perfect SEO and social sharing
          
          VISUAL PERFECTION:
          - Create a design that perfectly matches the business's brand identity
          - Implement sophisticated micro-interactions and motion design
          - Utilize advanced CSS techniques (variable fonts, backdrop-filter, etc.)
          - Create a distinctive visual language unique to this business
          - Implement perfect visual hierarchy and typography
          - Use layered design elements to create depth and dimension
          
          REVOLUTIONARY UX:
          - Design intuitive navigation patterns optimized for the business's content structure
          - Implement sophisticated scroll-based interactions
          - Create memorable moments that surprise and delight users
          - Ensure the entire experience feels cohesive and intentional
          - Design with a perfect balance of innovation and usability
          
          CRITICAL MOBILE REQUIREMENTS:
          - Design a perfect mobile experience first
          - Ensure all interactive elements are perfectly sized for touch
          - Create adaptive layouts that maximize each screen size
          - Design mobile-specific interactions appropriate to the business type
          
          BUSINESS-SPECIFIC ADAPTATIONS:
          - For retail/e-commerce: Create product showcases, galleries, and shopping features
          - For services: Emphasize process, benefits, and client outcomes
          - For healthcare: Focus on care quality, accessibility, and patient experience
          - For hospitality: Showcase experiences, amenities, and booking capabilities
          - For technology: Demonstrate innovation, efficiency, and technical excellence
          - For education: Feature learning outcomes, programs, and institutional values
          
          RETURN A JSON OBJECT with the following structure:
          {
            "html": "Complete HTML code",
            "css": "Complete CSS code",
            "structure": {
              "header": { "title": "Website Title", "navigation": ["Home", "About", "Services/Products", "Gallery", "Contact"] },
              "sections": [
                {"id": "hero", "type": "hero", "title": "Main Headline", "subtitle": "Supporting text"},
                {"id": "about", "type": "about", "title": "About Us", "content": "Company description"},
                {"id": "offerings", "type": "offerings", "title": "Our Services/Products"},
                {"id": "gallery", "type": "gallery", "title": "Gallery", "images": [image paths]},
                {"id": "experience", "type": "experience", "title": "Customer Experience"},
                {"id": "cta", "type": "cta", "title": "Call to Action"},
                {"id": "testimonials", "type": "testimonials", "title": "Testimonials"},
                {"id": "contact", "type": "contact", "title": "Contact Us"}
              ],
              "footer": { "columns": [{"title": "About", "links": ["Our Story", "Team"]}, {"title": "Contact", "contact_info": {}}] }
            },
            "industrySpecificFeatures": ["List of industry-specific features implemented"],
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
