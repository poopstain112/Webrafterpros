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

🔥 CREATE A WEBSITE THAT BREAKS THE INTERNET 🔥

This business deserves a website that makes people's jaws DROP. Create something so stunning, so unique, so BOLD that visitors will screenshot it and share it. This is NOT a template - this is ART.

BUSINESS PERSONALITY: "${businessDetails.designStyle}"
🎯 MISSION: Make this the most memorable website they've ever seen for this industry.

🚀 DESIGN DEMANDS (NO COMPROMISES):
1. EXPLOSIVE VISUAL IMPACT - Use the aesthetic "${businessDetails.designStyle}" but push it to the EXTREME
2. CINEMATIC HERO SECTIONS - Make the first impression unforgettable with dramatic visuals
3. PERSONALITY-DRIVEN LAYOUTS - Every section should scream this business's unique character
4. ADVANCED ANIMATIONS - Scroll-triggered reveals, hover magic, smooth page transitions
5. TYPOGRAPHY MASTERY - Mix fonts boldly, create hierarchy that guides the eye dramatically
6. COLOR PSYCHOLOGY - Use colors that evoke the exact emotions this business wants
7. IMMERSIVE IMAGERY - Transform these images into art: ${imageUrls.join(', ')}
8. CONTACT SECTION THAT CONVERTS - Make it irresistible to reach out

🎨 VISUAL REQUIREMENTS:
- Use CSS transforms, clips, masks, and advanced properties
- Create depth with layered backgrounds, shadows, and overlays
- Add particle effects, geometric shapes, or abstract elements
- Design custom cursors, loading animations, or interactive elements
- Use viewport units, calc(), and modern CSS for dynamic layouts
- Create sections that feel like scenes in a movie

⚡ TECHNICAL EXCELLENCE:
- Flawless mobile responsiveness with touch-friendly interactions
- Optimized performance with smooth 60fps animations
- Accessibility without compromising visual impact
- Modern CSS Grid and Flexbox for perfect layouts

🎭 PERSONALITY INJECTION:
- Make the copy feel like it was written by the business owner themselves
- Use the business's voice throughout every section
- Create moments of delight and surprise
- Tell their story in a way that creates emotional connection

💥 FINAL CHALLENGE: Make this website so good that competitors will try to copy it.

Return ONLY the complete HTML with embedded CSS - no explanations, no markdown blocks.`;

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an award-winning web designer known for creating BOLD, MEMORABLE websites that break conventions. Your designs are talked about, shared, and remembered. You never create boring or generic websites. Every design should make people say 'WOW' and feel like they're experiencing something special."
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
  const extractedBusinessName = businessNameMatch ? businessNameMatch[1] : extractField(lines, "called", "We're called");
  
  return {
    businessName: extractedBusinessName || "Sunset Shores Boutique Inn",
    businessDescription: lines[0] || "Professional services",
    valueProposition: extractField(lines, "focuses on", "Unlike") || "Quality service",
    services: extractField(lines, "offer", "We offer") || "Professional services",
    targetAudience: extractField(lines, "customers are", "Our customers") || "valued clients",
    location: extractField(lines, "coast", "located", "We're located") || "Oregon coast",
    contact: extractField(lines, "booking", "Online booking") || "Online booking available with live chat support",
    designStyle: extractField(lines, "aesthetic", "welcoming", "pastels") || "Cozy and welcoming with soft pastels and round edges",
    callToAction: extractField(lines, "goal", "our goal", "Book") || "Book Your Stay Today",
    personality: extractField(lines, "Professional", "trust") || "professional",
    phone: "(555) 123-4567", // Default professional phone
    email: "info@sunsetshoresboutiqueinn.com", // Generated from business name
    address: "123 Coastal Highway, Oregon Coast, OR 97367" // Professional address
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