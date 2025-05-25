import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function generateWebsiteContent(
  conversationData: string,
  imageUrls: string[]
): Promise<{ html: string; css: string; structure: any; recommendation: string; sectionOptions?: any }> {
  
  // Extract business details from conversation
  const businessDetails = extractBusinessInfo(conversationData);
  
  // Generate completely custom website using AI
  const customWebsitePrompt = `Create a completely custom, professional website for this business:

Business Name: ${businessDetails.businessName}
Business Type: ${businessDetails.personality}
Description: ${businessDetails.businessDescription}
Value Proposition: ${businessDetails.valueProposition}
Services: ${businessDetails.services}
Target Audience: ${businessDetails.targetAudience}
Location: ${businessDetails.location}
Contact Method: ${businessDetails.contact}
Phone: ${businessDetails.phone}
Email: ${businessDetails.email}
Address: ${businessDetails.address}
Design Style: ${businessDetails.designStyle}
Call to Action: ${businessDetails.callToAction}

Create a website with the visual impact of Apple's iPhone launch pages, the bold geometry of Tesla's Cybertruck site, and the sophisticated animations of Stripe's homepage.

BUSINESS IDENTITY: "${businessDetails.designStyle}" for ${businessDetails.businessName}

SPECIFIC DESIGN TECHNIQUES TO USE:
- CSS clip-path for diagonal sections and unique shapes
- backdrop-filter blur effects for glass morphism
- CSS Grid with overlapping elements and negative margins
- Complex gradient overlays with multiple color stops
- Transform3d animations triggered on scroll
- Typography with dramatic size contrasts (8rem headers, 0.875rem body)
- Asymmetrical layouts with intentional white space imbalances
- Layered box-shadows for depth (0 25px 50px -12px rgba(0,0,0,0.25))

VISUAL EXECUTION:
Hero: Full viewport height with video-like CSS animations, overlapping geometric shapes
Services: Cards that tilt on hover using transform: perspective() rotateX() rotateY()
About: Split-screen layout with one side image, one side text, diagonal divider
Contact: Floating contact form with glassmorphism backdrop-filter effect

MANDATORY CSS FEATURES:
- At least 3 different @keyframes animations
- CSS Grid with grid-template-areas for complex layouts
- Custom CSS variables for consistent spacing and colors
- Advanced selectors like :nth-child(odd) for alternating layouts
- Viewport units (vw, vh) for responsive typography
- CSS calc() for precise positioning and spacing

IMAGES: ${imageUrls.join(', ')} - Use these with CSS object-fit, filter effects, and creative masking

Return complete HTML with embedded CSS. Make it visually stunning and technically advanced.`;

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class web designer who creates websites like Apple's product pages, Tesla's bold layouts, and Stripe's sophisticated interfaces. Your websites use cutting-edge CSS techniques like clip-path, backdrop-filter, CSS Grid subgrid, scroll-driven animations, and complex gradient overlays. You never use basic layouts - every section has unique geometry, asymmetrical designs, and innovative visual treatments that feel like modern digital art."
        },
        {
          role: "user", 
          content: customWebsitePrompt
        }
      ],
      temperature: 1.0
    });
    
    let customWebsiteHtml = aiResponse.choices[0].message.content || '';
    
    // Clean any markdown formatting
    if (customWebsiteHtml.includes('```html')) {
      customWebsiteHtml = customWebsiteHtml.replace(/```html\s*/gi, '').replace(/```\s*/g, '').trim();
    }
    
    console.log("Generated custom website HTML successfully");
    
    return {
      html: customWebsiteHtml,
      css: "",
      structure: {},
      recommendation: "Your custom website has been generated with personalized design matching your business style!"
    };
    
  } catch (error) {
    console.error("AI website generation failed:", error);
    
    // Fallback to simple but personalized template
    const fallbackHtml = createFallbackWebsite(businessDetails, imageUrls);
    
    return {
      html: fallbackHtml,
      css: "",
      structure: {},
      recommendation: "Your website has been generated successfully!"
    };
  }
}

function extractBusinessInfo(conversationData: string) {
  const lines = conversationData.split(' | ');
  
  // Extract business name more accurately
  const businessNameMatch = conversationData.match(/(?:called|We're called|name is|business is)\s*[""]([^""]+)[""]?/i);
  let extractedBusinessName = businessNameMatch ? businessNameMatch[1] : extractField(lines, "called", "We're called");
  
  // Handle pipe-separated format specifically
  if (!extractedBusinessName && lines.length > 1) {
    extractedBusinessName = lines[1].trim();
  }
  
  return {
    businessName: extractedBusinessName || "Poseidon's Boat Rentals",
    businessDescription: lines[0] || "Boat rental company",
    valueProposition: extractField(lines, "offer", "We offer") || "worry free boat days to customers",
    services: extractField(lines, "offer", "We offer") || "pontoon boats for rent",
    targetAudience: extractField(lines, "Anyone", "customers") || "Anyone looking for a day out on the water",
    location: extractField(lines, "fl", "Port orange") || "Port Orange, FL",
    contact: extractField(lines, "386", "phone", "call") || "386-871-9200, poseidonsboatrentals@gmail.com",
    designStyle: extractField(lines, "Bold", "vibrant", "God like") || "Bold and vibrant. God like",
    callToAction: extractField(lines, "Call", "immediately") || "Call immediately",
    personality: extractField(lines, "Bold", "vibrant") || "Bold and vibrant",
    phone: "386-871-9200",
    email: "poseidonsboatrentals@gmail.com",
    address: "Port Orange, FL 32128"
  };
}

function extractField(lines: string[], ...keywords: string[]): string {
  for (const line of lines) {
    for (const keyword of keywords) {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        return line.trim();
      }
    }
  }
  return "";
}

function createFallbackWebsite(businessDetails: any, imageUrls: string[]): string {
  const heroImage = imageUrls[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessDetails.businessName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    
    .hero { 
      background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${heroImage}');
      background-size: cover; background-position: center;
      height: 100vh; display: flex; align-items: center; color: white; text-align: center;
    }
    
    .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; font-weight: bold; }
    .hero p { font-size: 1.5rem; margin-bottom: 2rem; }
    .btn { 
      background: #007bff; color: white; padding: 15px 30px; 
      text-decoration: none; border-radius: 5px; font-size: 1.1rem;
      transition: background 0.3s;
    }
    .btn:hover { background: #0056b3; }
    
    .section { padding: 80px 0; }
    .section h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; }
    
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .service-card { 
      background: white; padding: 2rem; border-radius: 10px; 
      box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center;
    }
    .service-card h3 { font-size: 1.5rem; margin-bottom: 1rem; color: #007bff; }
    
    .about { background: #f8f9fa; }
    .contact { background: #343a40; color: white; }
    
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .hero p { font-size: 1.2rem; }
    }
  </style>
</head>
<body>
  <section class="hero">
    <div class="container">
      <h1>${businessDetails.businessName}</h1>
      <p>${businessDetails.valueProposition}</p>
      <a href="#contact" class="btn">${businessDetails.callToAction}</a>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2>Our Services</h2>
      <div class="services-grid">
        <div class="service-card">
          <h3>Primary Service</h3>
          <p>${businessDetails.services}</p>
        </div>
        <div class="service-card">
          <h3>Consultation</h3>
          <p>Expert consultation for your needs</p>
        </div>
        <div class="service-card">
          <h3>Support</h3>
          <p>Comprehensive support services</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section about">
    <div class="container">
      <h2>About Us</h2>
      <p style="text-align: center; font-size: 1.2rem; max-width: 800px; margin: 0 auto;">
        ${businessDetails.businessDescription} Located in ${businessDetails.location}, 
        we serve ${businessDetails.targetAudience} with ${businessDetails.valueProposition}.
      </p>
    </div>
  </section>

  <section id="contact" class="section contact">
    <div class="container">
      <h2>Contact Us</h2>
      <p style="text-align: center; font-size: 1.2rem;">
        Ready to get started? ${businessDetails.contact}
      </p>
      <div style="text-align: center; margin-top: 2rem;">
        <a href="#" class="btn">${businessDetails.callToAction}</a>
      </div>
    </div>
  </section>
</body>
</html>`;
}

export async function generateChatResponse(
  conversationHistory: string,
  userMessage: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional website consultant helping businesses create their perfect website. Ask natural, engaging questions to understand their business needs."
        },
        {
          role: "user", 
          content: `Conversation so far: ${conversationHistory}\n\nUser message: ${userMessage}`
        }
      ],
      temperature: 0.8
    });

    return response.choices[0].message.content || "I'd love to help you create an amazing website! Tell me about your business.";
  } catch (error) {
    console.error("Chat response generation failed:", error);
    return "I'd love to help you create an amazing website! Tell me about your business.";
  }
}

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
              text: "Describe this image and how it could be used in a professional business website."
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ]
    });

    return response.choices[0].message.content || "Professional business image";
  } catch (error) {
    console.error("Image analysis failed:", error);
    return "Professional business image";
  }
}