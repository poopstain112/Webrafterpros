import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// Function to get business-specific content based on business type
function getBusinessSpecificContent(businessType: string) {
  const businessTypes = {
    'car dealership': {
      heroTitle: 'Quality Vehicles at Competitive Prices',
      heroDescription: 'Discover our extensive selection of quality vehicles. We offer competitive pricing, financing options, and exceptional customer service to help you find your perfect match.',
      ctaText: 'View Inventory',
      services: [
        {
          title: 'Vehicle Sales',
          description: 'Browse our extensive inventory of quality vehicles. Each one undergoes thorough inspection to ensure reliability and performance.',
          cta: 'Browse Inventory'
        },
        {
          title: 'Financing Options',
          description: 'We offer competitive financing options to fit your budget. Our finance team works with multiple lenders to find the best rates and terms for your situation.',
          cta: 'Apply Today'
        },
        {
          title: 'Service Department',
          description: 'Our certified technicians provide quality maintenance and repair services to keep your vehicle running smoothly. From oil changes to major repairs, we have got you covered.',
          cta: 'Schedule Service'
        }
      ]
    },
    'restaurant': {
      heroTitle: 'Exceptional Dining Experience',
      heroDescription: 'Enjoy our carefully crafted menu featuring fresh, locally-sourced ingredients. Our passionate chefs create memorable dishes in a welcoming atmosphere.',
      ctaText: 'View Menu',
      services: [
        {
          title: 'Signature Dishes',
          description: 'Explore our selection of chef-crafted signature dishes prepared with the finest ingredients and culinary expertise.',
          cta: 'View Menu'
        },
        {
          title: 'Catering Services',
          description: 'Let us cater your next event with our customized menu options. From corporate events to private parties, we deliver exceptional food and service.',
          cta: 'Get Quote'
        },
        {
          title: 'Private Dining',
          description: 'Host your special occasion in our elegant private dining areas. Perfect for celebrations, business meetings, and intimate gatherings.',
          cta: 'Reserve Now'
        }
      ]
    },
    'salon': {
      heroTitle: 'Exceptional Beauty & Styling Services',
      heroDescription: 'Experience professional hair and beauty services that help you look and feel your best. Our skilled stylists deliver personalized care in a relaxing environment.',
      ctaText: 'Book Appointment',
      services: [
        {
          title: 'Hair Styling',
          description: 'From trendy cuts to elegant styles, our experienced stylists create the perfect look tailored to your preferences and hair type.',
          cta: 'See Styles'
        },
        {
          title: 'Color Services',
          description: 'Transform your look with our premium color services. Our colorists are experts in techniques from subtle highlights to bold transformations.',
          cta: 'Learn More'
        },
        {
          title: 'Spa Treatments',
          description: 'Indulge in our rejuvenating spa treatments designed to help you relax, refresh, and renew with professional products and techniques.',
          cta: 'View Services'
        }
      ]
    }
  };
  
  // Default content for any business type not specifically defined
  const defaultContent = {
    heroTitle: 'Professional Services Tailored to Your Needs',
    heroDescription: 'We provide high-quality services designed to meet your specific requirements. Our experienced team delivers exceptional results with personalized attention.',
    ctaText: 'Learn More',
    services: [
      {
        title: 'Primary Service',
        description: 'Our core service offering designed to meet your essential needs with professional expertise and attention to detail.',
        cta: 'Learn More'
      },
      {
        title: 'Secondary Service',
        description: 'Our complementary service that enhances our primary offering, providing additional value and solutions for more specialized requirements.',
        cta: 'Discover'
      },
      {
        title: 'Premium Service',
        description: 'Our top-tier offering designed for clients with advanced needs, providing comprehensive solutions with exceptional attention to detail.',
        cta: 'Get Started'
      }
    ]
  };
  
  // Check if the business type is one of our predefined types
  const normalizedType = businessType.toLowerCase().trim();
  for (const [type, content] of Object.entries(businessTypes)) {
    if (normalizedType.includes(type)) {
      return content;
    }
  }
  
  // Return default content if no specific business type is matched
  return defaultContent;
}

// Process website descriptions and generate website content
export async function generateWebsiteContent(
  description: string,
  imageUrls: string[] = [],
  businessType?: string,
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  }
): Promise<{
  html: string;
  css: string;
  structure: any;
  recommendation: string;
  sectionOptions?: any;
  industrySpecificFeatures?: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
}> {
  // Determine business-specific content based on business type
  const businessSpecificContent = getBusinessSpecificContent(businessType || '');
  
  console.log("Generating website with images:", imageUrls);
  
  // Create a professional business website with minimal customization options
  // Focus on the essential elements: contact info, theme colors, images, and social media
  {
    // Map image URLs for use in the template, ensuring they have proper absolute paths
    console.log("Original image URLs:", imageUrls);
    
    const mappedImages = imageUrls.map(url => {
      // Handle different URL formats and ensure they start with /uploads/
      if (url.startsWith('/uploads/')) {
        return url;
      } else if (url.includes('/uploads/')) {
        // Extract the path after /uploads/
        const parts = url.split('/uploads/');
        return `/uploads/${parts[1]}`;
      } else if (url.includes('://')) {
        // For full URLs, keep as is (like unsplash images)
        return url;
      } else {
        // If it's just a filename, assume it's in uploads folder
        return `/uploads/${url.split('/').pop()}`;
      }
    });
    
    console.log("Mapped image URLs:", mappedImages);
    
    // Use high-quality backup images from Unsplash in case the uploaded images aren't available
    const defaultImages = [
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=85',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=85',
      'https://images.unsplash.com/photo-1606836576983-8b458e75221d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=85',
      'https://images.unsplash.com/photo-1626897793786-c4b3d9d0cf93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=85',
      'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=85'
    ];
    
    // Log image details for debugging
    console.log("Number of mapped images:", mappedImages.length);
    
    // Ensure all image paths are absolute from the domain root
    const heroImage = mappedImages[0] || defaultImages[0];
    const serviceImage1 = mappedImages[1] || defaultImages[1];
    const serviceImage2 = mappedImages[2] || defaultImages[2];
    const serviceImage3 = mappedImages[3] || defaultImages[3];
    const aboutImage = mappedImages[4] || defaultImages[4];
    const ctaImage = mappedImages[5] || 'https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${(() => {
    // Extract business name from description
    const businessNameMatch = description.match(/name is "([^"]+)"/i) || description.match(/called "([^"]+)"/i);
    if (businessNameMatch) return businessNameMatch[1];
    
    // Fallback to first part of description
    const firstPart = description.split("|")[0] || description.split(".")[0];
    return firstPart.length > 50 ? "Professional Services" : firstPart;
  })()} | Professional Services</title>
  <meta name="description" content="Professional pet grooming services for all types of pets. We provide grooming, bathing, styling and specialized pet care in a jungle-themed environment.">
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1rem;
      color: #0d47a1;
    }
    
    h1 {
      font-size: 2.5rem;
    }
    
    h2 {
      font-size: 2rem;
    }
    
    h3 {
      font-size: 1.75rem;
    }
    
    p {
      margin-bottom: 1rem;
    }
    
    /* Layout */
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .section {
      padding: 4rem 0;
    }
    
    .section-title {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .section-title:after {
      content: '';
      display: block;
      width: 80px;
      height: 4px;
      background: linear-gradient(to right, #0d47a1, #42a5f5);
      margin: 1rem auto;
    }
    
    /* Header and Navigation */
    header {
      background-color: #fff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: fixed;
      width: 100%;
      top: 0;
      z-index: 1000;
    }
    
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }
    
    .logo {
      font-size: 1.8rem;
      font-weight: 800;
      color: #0d47a1;
      text-decoration: none;
    }
    
    .nav-menu {
      display: flex;
      list-style: none;
    }
    
    .nav-item {
      margin-left: 1.5rem;
    }
    
    .nav-link {
      color: #333;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s;
    }
    
    .nav-link:hover {
      color: #0d47a1;
    }
    
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }
    
    /* Hero Section */
    .hero {
      background: linear-gradient(rgba(30, 64, 175, 0.85), rgba(30, 64, 175, 0.9)), url('${heroImage}') no-repeat center/cover;
      height: 85vh;
      display: flex;
      align-items: center;
      color: #fff;
      margin-top: 70px;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
      z-index: 1;
    }
    
    .hero-content {
      max-width: 800px;
      position: relative;
      z-index: 2;
    }
    
    .hero h1 {
      font-size: 3.25rem;
      margin-bottom: 1.5rem;
      color: #fff;
      font-weight: 800;
      letter-spacing: -0.025em;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }
    
    .hero p {
      font-size: 1.25rem;
      margin-bottom: 2.5rem;
      opacity: 0.95;
      line-height: 1.7;
      max-width: 600px;
    }
    
    .btn {
      display: inline-block;
      padding: 0.85rem 2.25rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      text-align: center;
      box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;
    }
    
    .btn-primary {
      background-color: #2563eb;
      color: #fff;
      border: none;
    }
    
    .btn-primary:hover {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    }
    
    .btn-primary:active {
      transform: translateY(1px);
    }
    
    /* Services Section */
    .services {
      background-color: #fff;
    }
    
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .service-card {
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04), 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }
    
    .service-card:hover {
      transform: translateY(-12px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06);
    }
    
    .service-card img {
      width: 100%;
      height: 240px;
      object-fit: cover;
      transition: transform 0.5s ease;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }
    
    .service-card:hover img {
      transform: scale(1.05);
    }
    
    .service-content {
      padding: 1.5rem;
    }
    
    .service-content h3 {
      color: #0d47a1;
      margin-bottom: 1rem;
    }
    
    /* About Section */
    .about {
      background-color: #f9f9f9;
    }
    
    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }
    
    .about-img {
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .about-img img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .about-content h2 {
      margin-bottom: 1.5rem;
    }
    
    .about-content p {
      margin-bottom: 1rem;
    }
    
    /* Call to Action */
    .cta {
      background: linear-gradient(rgba(13, 71, 161, 0.9), rgba(13, 71, 161, 0.9)), url('${ctaImage}') no-repeat center/cover;
      color: #fff;
      text-align: center;
      padding: 5rem 0;
    }
    
    .cta h2 {
      color: #fff;
      margin-bottom: 1.5rem;
    }
    
    .cta p {
      max-width: 700px;
      margin: 0 auto 2rem;
      font-size: 1.1rem;
    }
    
    /* Contact Section */
    .contact {
      background-color: #fff;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .contact-info {
      margin-bottom: 2rem;
    }
    
    .contact-info h3 {
      margin-bottom: 1rem;
    }
    
    .contact-info p {
      margin-bottom: 0.5rem;
    }
    
    .contact-form {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }
    
    textarea.form-control {
      resize: vertical;
      min-height: 150px;
    }
    
    .btn-submit {
      background-color: #2563eb;
      color: #fff;
      border: none;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
      letter-spacing: 0.02em;
      box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    
    .btn-submit:hover {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    }
    
    .btn-submit:active {
      transform: translateY(1px);
    }
    
    /* Footer */
    footer {
      background-color: #0d47a1;
      color: #fff;
      padding: 3rem 0;
    }
    
    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }
    
    .footer-col h3 {
      color: #fff;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
    }
    
    .footer-links {
      list-style: none;
    }
    
    .footer-links li {
      margin-bottom: 0.8rem;
    }
    
    .footer-links a {
      color: #fff;
      opacity: 0.8;
      text-decoration: none;
      transition: opacity 0.3s;
    }
    
    .footer-links a:hover {
      opacity: 1;
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
    }
    
    .social-links a {
      display: inline-block;
      width: 40px;
      height: 40px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      text-decoration: none;
      transition: background-color 0.3s;
    }
    
    .social-links a:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .copyright {
      text-align: center;
      padding-top: 2rem;
      margin-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Responsive Design */
    @media (max-width: 992px) {
      h1 {
        font-size: 2.2rem;
      }
      
      h2 {
        font-size: 1.8rem;
      }
      
      .hero {
        height: 70vh;
      }
      
      .about-grid {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: block;
      }
      
      .nav-menu {
        position: fixed;
        top: 70px;
        left: -100%;
        background-color: #fff;
        width: 100%;
        flex-direction: column;
        text-align: center;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        transition: left 0.3s;
        padding: 1rem 0;
      }
      
      .nav-menu.active {
        left: 0;
      }
      
      .nav-item {
        margin: 1rem 0;
      }
      
      .hero {
        height: 60vh;
        margin-top: 60px;
      }
      
      .hero h1 {
        font-size: 2rem;
      }
      
      .services-grid,
      .contact-grid {
        grid-template-columns: 1fr;
      }
      
      .section {
        padding: 3rem 0;
      }
    }
    
    @media (max-width: 576px) {
      .hero {
        height: auto;
        padding: 4rem 0;
      }
      
      .btn {
        display: block;
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <!-- Header & Navigation -->
  <header>
    <div class="container header-container">
      <a href="#" class="logo">${(() => {
        // Extract business name from description - robust universal patterns
        const parts = description.split('|').map(p => p.trim());
        // Look for business name in the second part (most common pattern)
        if (parts.length > 1 && parts[1].length > 0 && parts[1].length < 100) {
          return parts[1];
        }
        // Fallback patterns for other formats
        const businessNameMatch = description.match(/[Tt]he name is "([^"]+)"/i) || 
                                description.match(/name is "([^"]+)"/i) || 
                                description.match(/called "([^"]+)"/i) ||
                                description.match(/business is ([^.|]+)/i);
        return businessNameMatch ? businessNameMatch[1].trim() : "Your Business";
      })()}</a>
      <button class="mobile-menu-btn">&#9776;</button>
      <ul class="nav-menu">
        <li class="nav-item"><a href="#" class="nav-link">Home</a></li>
        <li class="nav-item"><a href="#services" class="nav-link">Services</a></li>
        <li class="nav-item"><a href="#about" class="nav-link">About Us</a></li>
        <li class="nav-item"><a href="#contact" class="nav-link">Contact</a></li>
      </ul>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h1>${(() => {
          // Extract business name from description - robust universal patterns
          const parts = description.split('|').map(p => p.trim());
          // Look for business name in the second part (most common pattern)
          if (parts.length > 1 && parts[1].length > 0 && parts[1].length < 100) {
            return parts[1];
          }
          // Fallback patterns for other formats
          const businessNameMatch = description.match(/[Tt]he name is "([^"]+)"/i) || 
                                  description.match(/name is "([^"]+)"/i) || 
                                  description.match(/called "([^"]+)"/i) ||
                                  description.match(/business is ([^.|]+)/i);
          return businessNameMatch ? businessNameMatch[1].trim() : businessSpecificContent.heroTitle;
        })()}</h1>
        <p>${description.split("|")[0] || businessSpecificContent.heroDescription}</p>
        <a href="#contact" class="btn btn-primary">${businessSpecificContent.ctaText}</a>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="services" class="section services">
    <div class="container">
      <div class="section-title">
        <h2>Our Services</h2>
        <p>Professional solutions tailored to your needs</p>
      </div>
      <div class="services-grid">
        <div class="service-card">
          <img src="${serviceImage1}" alt="Primary Service" onerror="this.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'; this.onerror=null;">
          <div class="service-content">
            <h3>${businessSpecificContent.services[0].title}</h3>
            <p>${businessSpecificContent.services[0].description}</p>
            <a href="#contact" class="btn btn-primary">${businessSpecificContent.services[0].cta}</a>
          </div>
        </div>
        <div class="service-card">
          <img src="${serviceImage2}" alt="${businessSpecificContent.services[1].title}" onerror="this.src='https://images.unsplash.com/photo-1613553474179-e1eda3ea5734?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'; this.onerror=null;">
          <div class="service-content">
            <h3>${businessSpecificContent.services[1].title}</h3>
            <p>${businessSpecificContent.services[1].description}</p>
            <a href="#contact" class="btn btn-primary">${businessSpecificContent.services[1].cta}</a>
          </div>
        </div>
        <div class="service-card">
          <img src="${serviceImage3}" alt="${businessSpecificContent.services[2].title}" onerror="this.src='https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'; this.onerror=null;">
          <div class="service-content">
            <h3>${businessSpecificContent.services[2].title}</h3>
            <p>${businessSpecificContent.services[2].description}</p>
            <a href="#contact" class="btn btn-primary">${businessSpecificContent.services[2].cta}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="section about">
    <div class="container">
      <div class="about-grid">
        <div class="about-img">
          <img src="${aboutImage}" alt="About Our Business" onerror="this.src='https://images.unsplash.com/photo-1595814432025-409872c11f8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'; this.onerror=null;">
        </div>
        <div class="about-content">
          <h2>About Us</h2>
          <p>${description.split("|")[0] || "Our Business"} is a dedicated service provider committed to excellence. We're focused on delivering the highest quality services tailored to our clients' specific needs.</p>
          <p>As a ${description.split("|")[3] || "trusted local business"}, we understand the unique requirements of our customers. We take pride in our work and strive to exceed your expectations with every interaction.</p>
          <p>What sets us apart is our commitment to quality and attention to detail. We aim to provide exceptional service and ensure complete customer satisfaction with every project we undertake.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Call to Action -->
  <section class="cta">
    <div class="container">
      <h2>Ready to Get Started?</h2>
      <p>Contact us today for a free consultation and quote. We're ready to provide the exceptional service you deserve.</p>
      <a href="#contact" class="btn btn-primary">Contact Us Now</a>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="section contact">
    <div class="container">
      <div class="section-title">
        <h2>Contact Us</h2>
        <p>Get in touch for a free quote</p>
      </div>
      <div class="contact-grid">
        <div class="contact-info">
          <h3>Get In Touch</h3>
          <p><strong>Phone:</strong> ${description.split("|")[7] || "(123) 456-7890"}</p>
          <p><strong>Email:</strong> info@yourbusiness.com</p>
          <p><strong>Address:</strong> ${description.split("|")[1] || "Your Business Location"}</p>
          <p><strong>Hours:</strong> Monday-Friday, 9am-5pm</p>
          <div class="social-links">
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f">f</i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram">i</i></a>
          </div>
        </div>
        <div class="contact-form">
          <h3>Send Us a Message</h3>
          <form>
            <div class="form-group">
              <input type="text" class="form-control" placeholder="Your Name" required>
            </div>
            <div class="form-group">
              <input type="email" class="form-control" placeholder="Your Email" required>
            </div>
            <div class="form-group">
              <input type="tel" class="form-control" placeholder="Your Phone">
            </div>
            <div class="form-group">
              <textarea class="form-control" placeholder="Your Message" required></textarea>
            </div>
            <button type="submit" class="btn btn-submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h3>${description.split("|")[0] || "Our Business"}</h3>
          <p>${description.split("|")[1] || "Professional services"} in ${description.split("|")[3] ? description.split("|")[3].split(" ").pop() : "your area"}. Contact us today to learn how we can assist you with your specific needs.</p>
        </div>
        <div class="footer-col">
          <h3>Quick Links</h3>
          <ul class="footer-links">
            <li><a href="#">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Services</h3>
          <ul class="footer-links">
            <li><a href="#">Residential Cleaning</a></li>
            <li><a href="#">Commercial Cleaning</a></li>
            <li><a href="#">Deep Cleaning</a></li>
            <li><a href="#">Move In/Out Cleaning</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Contact Us</h3>
          <ul class="footer-links">
            <li>Phone: (386) 871-9200</li>
            <li>Email: info@eeezycleaning.com</li>
            <li>Daytona Beach, FL</li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        <p>&copy; 2025 ${description.split("|")[0] || "Our Business"}. All Rights Reserved.</p>
      </div>
    </div>
  </footer>

  <script>
    // Simple mobile menu toggle
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
      document.querySelector('.nav-menu').classList.toggle('active');
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          document.querySelector('.nav-menu').classList.remove('active');
        }
      });
    });
  </script>
</body>
</html>`,
      css: "",
      structure: {},
      recommendation: "Your professional website has been generated! Consider adding your own high-quality photos of your cleaning services to make it even more personalized.",
    };
  }
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
          
          CRITICAL: Pay special attention to unique business concepts like:
          - Specialty bars (puppy bars, cat cafes, themed establishments)
          - Entertainment venues with unique concepts
          - Hybrid businesses that combine multiple concepts
          
          When you see terms like "bar" in the business name, recognize it as a hospitality/entertainment establishment, not a service business.
          
          Return a JSON object with the following structure:
          {
            "businessName": "The exact business name as provided",
            "businessType": "The specific type of establishment (Bar, Restaurant, Retail Store, Pet Bar, Entertainment Venue, etc.)",
            "industry": "The specific industry (Hospitality, Entertainment, Pet Services, etc.)",
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
    
    // Include social media links if provided
    const socialMediaInfo = socialMedia || {};
    console.log("Social media links for website:", socialMediaInfo);
    
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
          - Hospitality/Bars/Restaurants: Describe atmosphere, drinks/food, social experience, and unique venue concept
          - Entertainment Venues: Focus on the experience, entertainment value, and social atmosphere
          - Specialty Concepts (Pet Bars, Cat Cafes): Emphasize the unique concept, target audience, and distinctive experience
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
          
          And a specialty bar might need vibrant, experience-focused language:
          "Step into Savannah's Puppy Bar, where tail-wagging meets cocktail shaking in Daytona Beach's most unique social experience. Our specially crafted 'stiff drinks for pets' and welcoming atmosphere create the perfect playground for furry friends and their humans to unwind together."
          
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
            themeInfo: themeInfo,
            socialMedia: socialMediaInfo
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
          
In addition to the main website, for each major section (hero, about, services, testimonials, contact), generate 3 alternative versions with different styles, layouts, and content approaches. Structure these alternatives in a way that allows easy swapping between versions.

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
          
          SOCIAL MEDIA INTEGRATION:
          - If social media links are provided, create prominent, functional buttons in the website
          - Position social media links in both the header and footer for maximum visibility
          - Use appropriate icons for each social platform (Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok)
          - Ensure all social media links open in new tabs and have proper hover effects
          - Apply cohesive styling to social media buttons that matches the website's design language
          
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
            content: contentInfo,
            socialMedia: socialMediaInfo
          })
        }
      ],
      response_format: { type: "json_object" },
    });

    try {
      const result = JSON.parse(websiteResponse.choices[0].message.content || "{}");
      
      // Extract section options if they exist
      const sectionOptions = result.sectionOptions || {
        hero: [result.sections?.hero || {}],
        about: [result.sections?.about || {}],
        services: [result.sections?.services || {}],
        testimonials: [result.sections?.testimonials || {}],
        contact: [result.sections?.contact || {}]
      };
      
      // If no section options were generated, create default placeholder options
      Object.keys(sectionOptions).forEach(sectionKey => {
        if (!Array.isArray(sectionOptions[sectionKey]) || sectionOptions[sectionKey].length === 0) {
          sectionOptions[sectionKey] = [{}];
        }
        
        // Ensure we have 3 options for each section
        while (sectionOptions[sectionKey].length < 3) {
          // Create empty placeholders that will be filled later when editing
          sectionOptions[sectionKey].push({...sectionOptions[sectionKey][0]});
        }
      });

      return {
        html: result.html || "",
        css: result.css || "",
        structure: result.structure || {},
        recommendation: result.recommendation || "",
        sectionOptions: sectionOptions
      };
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response content:", websiteResponse.choices[0].message.content);
      
      // Provide a fallback response with error details
      return {
        html: "<div>Website generation encountered an error. Please try again.</div>",
        css: "",
        structure: {},
        recommendation: "An error occurred during website generation. Please try again or modify your description.",
        sectionOptions: {}
      };
    }
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate website content: ${error.message}`);
  }
}

// Import centralized questions
import { BUSINESS_QUESTIONS, INITIAL_GREETING } from "@shared/questions";

// Process user message and generate response
export async function generateChatResponse(
  messages: { role: string; content: string }[],
  isWebsiteEdit: boolean = false,
  collectSocialMedia: boolean = false
): Promise<string> {
  try {
    // Special case for website editing
    if (isWebsiteEdit) {
      // Use OpenAI to edit the website HTML directly
      const systemMessage = {
        role: "system" as const, 
        content: `You are an expert web developer specializing in HTML and CSS. 
          Your task is to modify website HTML code based on the user's request. 
          Return ONLY the complete updated HTML. Do not include explanations, commentary, or markdown formatting.`
      };
      
      // Convert messages to the correct format
      const formattedMessages = messages.map(msg => ({
        role: msg.role as "user" | "assistant" | "system", 
        content: msg.content
      }));
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [systemMessage, ...formattedMessages],
        max_tokens: 4000,
      });
      
      return response.choices[0].message.content || "";
    }
    
    // Regular chat flow
    // Get the count of user and assistant messages
    const userMessageCount = messages.filter(m => m.role === "user").length;
    const assistantMessageCount = messages.filter(m => m.role === "assistant").length;
    
    // If this is the very first message (no messages yet), start the conversation
    if (messages.length === 0 || (userMessageCount === 0 && assistantMessageCount === 0)) {
      return INITIAL_GREETING;
    }
    
    // PRIORITY: During question sequence, ONLY use approved questions
    if (userMessageCount <= BUSINESS_QUESTIONS.length) {
      const nextQuestionIndex = userMessageCount - 1;
      console.log(`QUESTION SEQUENCE: User count ${userMessageCount}, Question index ${nextQuestionIndex}`);
      
      if (nextQuestionIndex >= 0 && nextQuestionIndex < BUSINESS_QUESTIONS.length) {
        console.log(`RETURNING QUESTION: ${BUSINESS_QUESTIONS[nextQuestionIndex]}`);
        return BUSINESS_QUESTIONS[nextQuestionIndex];
      }
    }

    // After all questions, prompt for images
    if (userMessageCount === BUSINESS_QUESTIONS.length + 1) {
      return "Perfect! I have everything I need to create your professional website. Now please upload 1-5 high-quality photos of your work, location, or team so I can build a site that truly represents your business.";
    }
    
    // Only use OpenAI for post-question conversations
    const systemPrompt = `You are a premium website design consultant. The user has completed the question sequence and you're now helping with final details or changes.`;
    
    const typedMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map(msg => ({
        role: (msg.role === "user" || msg.role === "assistant" || msg.role === "system") 
          ? msg.role as "user" | "assistant" | "system" 
          : "user" as const,
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
