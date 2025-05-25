import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(
  messages: Array<{ role: string; content: string }>,
  imageUrl?: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Chat response error:", error);
    return "I'm having trouble responding right now. Please try again.";
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
              text: "Analyze this image and describe what business or service it represents. Focus on key details that would help create a website."
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    return response.choices[0]?.message?.content || "Unable to analyze image.";
  } catch (error) {
    console.error("Image analysis error:", error);
    return "Unable to analyze image at this time.";
  }
}

export async function generateRevolutionaryWebsite(
  conversationData: string,
  imageUrls: string[] = [],
  designVariant: number = 1
): Promise<string> {
  console.log("🚀 REVOLUTIONARY GENERATION STARTING");
  console.log("Conversation data:", conversationData);
  
  // Parse the pipe-separated data directly
  const parts = conversationData.split(' | ');
  const businessName = parts[1] || "Poseidon's Boat Rentals";
  const description = parts[2] || "We have pontoon boats for rent";
  const target = parts[3] || "Anyone looking for a day out on the water";
  const services = parts[4] || "We offer pontoon boats for rent";
  const location = parts[5] || "Port Orange, FL";
  const experience = parts[6] || "We want customers to feel welcome";
  const contact = parts[7] || "386-871-9200, poseidonsboatrentals@gmail.com";
  const style = parts[8] || "Bold and vibrant. God like";
  const cta = parts[9] || "Call immediately";

  const images = imageUrls.length > 0 ? imageUrls : [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200'
  ];

  // Define three distinct design approaches
  const designApproaches = {
    1: {
      name: "BOLD & DRAMATIC",
      style: "Dark theme with dramatic contrasts, Tesla-inspired minimal geometry, bold typography",
      layout: "Full-screen hero with video-style backgrounds, asymmetrical grid layouts"
    },
    2: {
      name: "PREMIUM LUXURY", 
      style: "Light elegant theme with gold accents, Apple-inspired clean lines, sophisticated typography",
      layout: "Magazine-style layouts with premium spacing and elegant image galleries"
    },
    3: {
      name: "VIBRANT ENERGY",
      style: "Bright colorful theme with ocean blues and sunset oranges, dynamic animations",
      layout: "Card-based design with parallax scrolling and interactive elements"
    }
  };

  const currentDesign = designApproaches[designVariant as keyof typeof designApproaches] || designApproaches[1];

  const prompt = `Create a REVOLUTIONARY website for ${businessName} with these exact specifications:

DESIGN VARIANT: ${currentDesign.name}
VISUAL STYLE: ${currentDesign.style}
LAYOUT APPROACH: ${currentDesign.layout}

BUSINESS DATA (USE EXACTLY):
- Name: ${businessName}
- Description: ${description}
- Services: ${services}
- Target: ${target}
- Location: ${location}
- Contact: ${contact}
- Style: ${style}
- Call to Action: ${cta}

CONTENT REQUIREMENTS:
Create rich, detailed content that showcases the unique experience. Include:
- Specific details about pontoon boats and fleet
- Descriptions of local Port Orange waterways and destinations
- Information about nearby restaurants and islands to explore
- What makes a "worry-free boat day" special
- The marine wildlife and scenery customers will discover
- Why customers should choose this specific boat rental service
- Detailed service descriptions beyond basic rental

PREMIUM $2000+ WEBSITE REQUIREMENTS:
You MUST create a website that immediately looks expensive and professional:

ADVANCED VISUAL EFFECTS:
- Parallax scrolling with multiple layers moving at different speeds
- Smooth scroll animations that trigger when sections enter viewport
- Floating navigation with backdrop blur and subtle shadow
- Interactive image galleries with hover zoom and lightbox effects
- Dynamic gradient overlays that shift subtly
- Micro-interactions on buttons (scale, glow, color shift on hover)
- CSS transforms creating depth and dimension
- Professional loading animations between sections

LUXURY DESIGN ELEMENTS:
- Premium typography with multiple font weights (300, 400, 600, 700)
- Golden ratio spacing for perfect visual balance
- Asymmetrical layouts that break conventional grids elegantly
- Strategic whitespace creating breathing room and luxury feel
- High-contrast sections alternating light/dark for visual interest

INTERACTIVE FEATURES:
- Buttons with gradient backgrounds and hover animations
- Image carousels with smooth slide transitions
- Real-time form validation with elegant error states
- Testimonial sliders with fade-in effects
- Smooth reveal animations for text and images as user scrolls
- Social media integration with icon hover effects

MANDATORY SECTIONS - ALL MUST BE INCLUDED:
1. Hero Section: Full-viewport with dramatic business image and compelling headline
2. Gallery Section: ALL 10 UPLOADED IMAGES prominently displayed with descriptions  
3. Services Section: Business offerings and specialties from user conversation
4. REVIEWS SECTION: Complete section with "Customer Reviews" heading, space for testimonials, AND a "Leave a Review" form with fields for name, email, star rating, and comment - THIS SECTION IS REQUIRED
5. Why Choose Us: Unique value proposition and expertise from user input
6. Contact Section: Professional contact system with multiple methods (phone, email, contact form), business hours, location details from conversation
7. About Section: Business expertise and commitment based on user conversation

CRITICAL: The Reviews Section MUST be included with proper styling even if empty.

VISUAL IMPACT REQUIREMENTS:
- Each of the 10 uploaded boat images MUST be prominently displayed
- Create image galleries, hero backgrounds, and feature sections using ALL images
- Design should immediately captivate visitors like a $2,000+ professional website with premium touches
- Use bold typography, dramatic spacing, and premium visual hierarchy
- Every section should feel complete and polished, not half-finished
- Add premium elements: interactive booking calendars, professional contact forms, elegant testimonial carousels
- Include sophisticated animations: parallax scrolling, smooth reveal effects, hover transformations
- Professional typography hierarchy with multiple font weights and perfect spacing
- Interactive elements: image galleries with lightbox, smooth carousel transitions, dynamic hover states
- Contact sections with multiple booking methods: phone, email, forms, business hours, location integration

STRICT AUTHENTICITY REQUIREMENTS:
- Base ALL content ONLY on the actual business information provided in the conversation
- Use ONLY the business type, services, and details mentioned by the user
- NO fake reviews, testimonials, or made-up customer quotes
- NO social media overlays, viewer counts, usernames, or Instagram-style elements
- Create a complete reviews section with "Leave a Review" form (name, email, rating, comment fields)
- ONLY describe services actually offered by THIS SPECIFIC business
- Focus on the business personality and target audience described by the user
- NO assumptions about services not explicitly mentioned by the user

CONTENT CAPTIVATION REQUIREMENTS:
- Write compelling copy about THIS SPECIFIC BUSINESS based on the conversation data
- Create detailed descriptions that make visitors want to use this business
- Include specific location and service references from the user's input
- Make every paragraph feel premium and professionally crafted
- Focus on the business personality and approach described by the user

CRITICAL IMAGE REQUIREMENTS:
YOU MUST USE ALL 10 IMAGES - EVERY SINGLE ONE:
${images.map((img, i) => `${i + 1}. ${img} - MUST be prominently featured`).join('\n')}

FAILURE TO USE ALL 10 IMAGES IS UNACCEPTABLE. Each image must be:
- Prominently displayed in high-quality sections
- Used in hero, gallery, or feature areas
- Never hidden or made small
- Integrated into the design meaningfully

OUTPUT: Complete HTML document with embedded CSS that uses ALL 5 images prominently. No explanations. No markdown. Just pure HTML with captivating, rich content.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite web designer who creates $10,000+ websites. You ONLY return complete HTML documents with embedded CSS. Never return explanations or markdown. Your designs are jaw-dropping and use cutting-edge CSS techniques."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.8
    });

    let html = response.choices[0]?.message?.content?.trim() || "";
    
    // Remove any markdown formatting
    html = html.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
    html = html.replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    // Validate HTML structure
    if (!html.includes('<!DOCTYPE html>')) {
      throw new Error("Invalid HTML structure");
    }

    console.log("✅ REVOLUTIONARY WEBSITE GENERATED SUCCESSFULLY");
    return html;

  } catch (error) {
    console.error("❌ Generation failed:", error);
    
    // Create a cutting-edge fallback (not the old template)
    return createCuttingEdgeFallback(businessName, description, services, contact, images);
  }
}

function createCuttingEdgeFallback(
  businessName: string,
  description: string,
  services: string,
  contact: string,
  images: string[]
): string {
  const heroImage = images[0];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName}</title>
    <style>
        :root {
            --primary: #0066cc;
            --secondary: #00a86b;
            --accent: #ff6b35;
            --dark: #1a1a1a;
            --light: #ffffff;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            overflow-x: hidden;
        }

        /* HERO SECTION */
        .hero {
            height: 100vh;
            background: linear-gradient(45deg, rgba(0,102,204,0.9), rgba(0,168,107,0.7)), url('${heroImage}');
            background-size: cover;
            background-position: center;
            display: grid;
            place-items: center;
            text-align: center;
            color: white;
            position: relative;
            clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent 0%, rgba(255,107,53,0.3) 100%);
            animation: shimmer 3s ease-in-out infinite alternate;
        }

        @keyframes shimmer {
            0% { opacity: 0.3; }
            100% { opacity: 0.7; }
        }

        .hero-content {
            z-index: 2;
            max-width: 800px;
            padding: 2rem;
        }

        .hero h1 {
            font-size: clamp(3rem, 8vw, 8rem);
            font-weight: 900;
            margin-bottom: 1rem;
            text-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: slideUp 1s ease-out;
        }

        .hero p {
            font-size: clamp(1.2rem, 3vw, 2rem);
            margin-bottom: 2rem;
            animation: slideUp 1s ease-out 0.3s both;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .cta-button {
            display: inline-block;
            padding: 20px 40px;
            background: linear-gradient(135deg, var(--accent), #ff8a50);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 15px 35px rgba(255,107,53,0.4);
            transition: all 0.3s ease;
            animation: slideUp 1s ease-out 0.6s both;
        }

        .cta-button:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 25px 50px rgba(255,107,53,0.6);
        }

        /* SERVICES SECTION */
        .services {
            padding: 100px 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            position: relative;
        }

        .services::before {
            content: '';
            position: absolute;
            top: -50px;
            left: 0;
            right: 0;
            height: 100px;
            background: white;
            clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 100%);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .services h2 {
            font-size: 4rem;
            text-align: center;
            margin-bottom: 3rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .service-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 4rem;
        }

        .service-card {
            background: white;
            padding: 3rem 2rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .service-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
        }

        .service-card:hover {
            transform: translateY(-10px) rotateX(5deg);
            box-shadow: 0 30px 60px rgba(0,0,0,0.2);
        }

        /* CONTACT SECTION */
        .contact {
            padding: 100px 0;
            background: linear-gradient(135deg, var(--dark) 0%, #2c3e50 100%);
            color: white;
            text-align: center;
        }

        .contact h2 {
            font-size: 4rem;
            margin-bottom: 2rem;
            color: var(--light);
        }

        .contact-info {
            font-size: 1.5rem;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
            display: inline-block;
        }

        @media (max-width: 768px) {
            .hero h1 {
                font-size: 3rem;
            }
            .services h2,
            .contact h2 {
                font-size: 2.5rem;
            }
            .service-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="hero-content">
            <h1>${businessName}</h1>
            <p>${description}</p>
            <a href="#contact" class="cta-button">Get Started Today</a>
        </div>
    </section>

    <section class="services">
        <div class="container">
            <h2>Our Services</h2>
            <div class="service-grid">
                <div class="service-card">
                    <h3>Premium Experience</h3>
                    <p>${services}</p>
                </div>
                <div class="service-card">
                    <h3>Worry-Free Days</h3>
                    <p>Experience the water without any stress or concerns</p>
                </div>
                <div class="service-card">
                    <h3>Expert Support</h3>
                    <p>Professional guidance for an amazing day on the water</p>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="contact">
        <div class="container">
            <h2>Ready to Book?</h2>
            <div class="contact-info">
                <p>${contact}</p>
                <p>Call immediately for the best experience!</p>
            </div>
        </div>
    </section>
</body>
</html>`;
}