import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import SimplePullToRefresh from './SimplePullToRefresh';
import { useToast } from '@/hooks/use-toast';

interface WebsitePreviewProps {
  websiteStructure?: {
    html: string;
    css: string;
    structure: any;
    recommendation?: string;
  };
  onClose?: () => void;
  onEdit?: (instructions?: string) => void;
  html?: string;
}

export default function WebsitePreview({ websiteStructure, onClose, onEdit, html }: WebsitePreviewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInstructions, setEditInstructions] = useState("");
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [recommendationText, setRecommendationText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Load website content from props or localStorage
  useEffect(() => {
    if (html) {
      // If direct HTML is provided
      setHtmlContent(html);
      setCssContent('');
    } else if (websiteStructure) {
      // Use passed website structure if available
      setHtmlContent(websiteStructure.html || '');
      setCssContent(websiteStructure.css || '');
      setRecommendationText(websiteStructure.recommendation || '');
    } else {
      // Try to load from localStorage
      const storedHtml = localStorage.getItem('generatedWebsiteHTML');
      if (storedHtml) {
        setHtmlContent(storedHtml);
        setCssContent(''); // No CSS in localStorage version
      } else {
        // Set default example website if nothing is found
        setHtmlContent(`
          <div class="container py-5">
            <header class="text-center mb-5">
              <h1 class="display-4">Your Business Name</h1>
              <p class="lead">Professional services for every need</p>
            </header>
            <section class="row">
              <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-sm">
                  <div class="card-body">
                    <h3>Our Services</h3>
                    <p>We provide top-quality services tailored to your needs.</p>
                    <ul>
                      <li>Professional Consultation</li>
                      <li>Expert Solutions</li>
                      <li>Customer Support</li>
                    </ul>
                    <button class="btn btn-primary">Learn More</button>
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-sm">
                  <div class="card-body">
                    <h3>About Us</h3>
                    <p>With years of experience, our team is dedicated to delivering excellence.</p>
                    <p>We take pride in our work and commitment to customer satisfaction.</p>
                    <button class="btn btn-outline-primary">Contact Us</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        `);
        setCssContent(''); 
      }
    }
  }, [websiteStructure, html]);

  // Function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Re-fetch content from localStorage
    const storedHtml = localStorage.getItem('generatedWebsiteHTML');
    if (storedHtml) {
      setHtmlContent(storedHtml);
    }
    
    // Simulate loading time
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Process HTML content - if it's already a full HTML document, use it as is
  const processHtmlContent = () => {
    // Add JavaScript to make buttons functional
    const makeButtonsFunctional = (html) => {
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Add click events to all buttons with specific functions
      const buttons = tempDiv.querySelectorAll('button');
      buttons.forEach(button => {
        // Make sure it has at least a basic onclick attribute
        if (!button.hasAttribute('onclick')) {
          const buttonText = button.textContent ? button.textContent.toLowerCase() : '';
          
          // Handle contact-related buttons
          if (buttonText.includes('contact') || buttonText.includes('quote') || buttonText.includes('get in touch')) {
            // Contact buttons should scroll to contact section
            button.setAttribute('onclick', "document.getElementById('contact') ? document.getElementById('contact').scrollIntoView({behavior: 'smooth'}) : false");
          } 
          // Handle about-related buttons
          else if (buttonText.includes('learn more') || buttonText.includes('about') || buttonText.includes('our story')) {
            // About buttons should go to about section
            button.setAttribute('onclick', "document.getElementById('about') ? document.getElementById('about').scrollIntoView({behavior: 'smooth'}) : false");
          } 
          // Handle service-related buttons
          else if (buttonText.includes('service') || buttonText.includes('what we do') || buttonText.includes('work')) {
            // Service buttons should go to services section
            button.setAttribute('onclick', "document.getElementById('services') ? document.getElementById('services').scrollIntoView({behavior: 'smooth'}) : false");
          }
          // Handle call buttons
          else if (buttonText.includes('call') || buttonText.includes('phone')) {
            button.setAttribute('onclick', "window.location.href = 'tel:+15551234567'");
          }
          // Handle email buttons
          else if (buttonText.includes('email') || buttonText.includes('mail') || buttonText.includes('message')) {
            button.setAttribute('onclick', "window.location.href = 'mailto:info@frontiermodeling.com'");
          }
          // Default to contact section for CTA buttons
          else {
            button.setAttribute('onclick', "document.getElementById('contact') ? document.getElementById('contact').scrollIntoView({behavior: 'smooth'}) : false");
          }
        }
      });
      
      // Also fix anchor links to use smooth scrolling
      const links = tempDiv.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        if (!link.hasAttribute('onclick')) {
          const href = link.getAttribute('href');
          if (href && href !== '#') {
            link.setAttribute('onclick', `event.preventDefault(); document.querySelector('${href}') ? document.querySelector('${href}').scrollIntoView({behavior: 'smooth'}) : window.location.href = '${href}'`);
          }
        }
      });
      
      // Add JavaScript for smooth scrolling and button functionality
      const scriptTag = document.createElement('script');
      scriptTag.innerHTML = `
        // Enable smooth scrolling
        document.addEventListener('DOMContentLoaded', function() {
          // Find all buttons and add click handlers
          document.querySelectorAll('button').forEach(function(button) {
            if (!button.hasAttribute('onclick')) {
              button.addEventListener('click', function() {
                // Check if the button has a specific purpose based on its text
                const text = button.textContent.toLowerCase();
                if (text.includes('contact') || text.includes('quote') || text.includes('get in touch')) {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) contactSection.scrollIntoView({behavior: 'smooth'});
                } else if (text.includes('learn') || text.includes('about') || text.includes('our story')) {
                  const aboutSection = document.getElementById('about');
                  if (aboutSection) aboutSection.scrollIntoView({behavior: 'smooth'});
                } else if (text.includes('service') || text.includes('what we do') || text.includes('work')) {
                  const servicesSection = document.getElementById('services');
                  if (servicesSection) servicesSection.scrollIntoView({behavior: 'smooth'});
                } else if (text.includes('call') || text.includes('phone')) {
                  window.location.href = 'tel:+15551234567';
                } else if (text.includes('email') || text.includes('mail') || text.includes('message')) {
                  window.location.href = 'mailto:info@frontiermodeling.com';
                } else {
                  // Default to contact section for CTA buttons
                  const contactSection = document.getElementById('contact');
                  if (contactSection) contactSection.scrollIntoView({behavior: 'smooth'});
                }
              });
            }
          });
          
          // Find all anchor links and add smooth scrolling for internal links
          document.querySelectorAll('a').forEach(function(anchor) {
            const href = anchor.getAttribute('href');
            
            // Handle social media links
            if (anchor.classList.contains('social-icon') || 
                anchor.classList.contains('social-link') ||
                (anchor.querySelector('i.fa-facebook') || anchor.querySelector('i.fab.fa-facebook') || 
                 anchor.querySelector('svg.facebook') || anchor.innerHTML.includes('facebook'))) {
              anchor.setAttribute('href', 'https://facebook.com/');
              anchor.setAttribute('target', '_blank');
              anchor.setAttribute('rel', 'noopener noreferrer');
            }
            else if (anchor.querySelector('i.fa-instagram') || anchor.querySelector('i.fab.fa-instagram') || 
                     anchor.querySelector('svg.instagram') || anchor.innerHTML.includes('instagram')) {
              anchor.setAttribute('href', 'https://instagram.com/');
              anchor.setAttribute('target', '_blank');
              anchor.setAttribute('rel', 'noopener noreferrer');
            }
            // Handle email links
            else if (href && href.startsWith('mailto:')) {
              // Email links already work by default
            }
            // Handle phone links
            else if (href && href.startsWith('tel:')) {
              // Phone links already work by default
            }
            // For internal anchor links, use smooth scrolling
            else if (href && href.startsWith('#')) {
              anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                  targetElement.scrollIntoView({behavior: 'smooth'});
                }
              });
            }
          });
        });
      `;
      
      // Add script to the end of the body
      const bodyElement = tempDiv.querySelector('body');
      if (bodyElement) {
        bodyElement.appendChild(scriptTag);
      }
      
      return tempDiv.innerHTML;
    };
    
    // If the content already has DOCTYPE or <html> tag, it's likely a complete document
    if (htmlContent && (htmlContent.trim().startsWith('<!DOCTYPE html>') || 
        htmlContent.trim().startsWith('<html'))) {
      return makeButtonsFunctional(htmlContent);
    }

    // If there's no HTML content or it's very short, create a default website
    if (!htmlContent || htmlContent.length < 150) {
      const defaultTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Frontier Modeling - Professional Services</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
    .hero { background-color: #0d6efd; color: white; padding: 5rem 0; }
    .service-card { transition: all 0.3s ease; }
    .service-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#">Frontier Modeling</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="#services">Services</a></li>
          <li class="nav-item"><a class="nav-link" href="#about">About</a></li>
          <li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <section class="hero">
    <div class="container text-center">
      <h1 class="display-4 fw-bold mb-4">Professional Services</h1>
      <p class="lead mb-4">Quality work with guaranteed satisfaction</p>
      <button class="btn btn-light btn-lg px-4">Get a Free Quote</button>
    </div>
  </section>

  <section id="services" class="py-5">
    <div class="container">
      <h2 class="text-center mb-5">Our Services</h2>
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card service-card h-100">
            <div class="card-body text-center">
              <h3>Service One</h3>
              <p>Detailed description of our main service offering and its benefits.</p>
              <button class="btn btn-primary">Learn More</button>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card service-card h-100">
            <div class="card-body text-center">
              <h3>Service Two</h3>
              <p>Explanation of our secondary service and how it helps our customers.</p>
              <button class="btn btn-primary">Learn More</button>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card service-card h-100">
            <div class="card-body text-center">
              <h3>Service Three</h3>
              <p>Description of our specialized service that sets us apart from competitors.</p>
              <button class="btn btn-primary">Learn More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="about" class="py-5 bg-light">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-6">
          <h2 class="mb-4">About Our Company</h2>
          <p class="lead">With years of experience in the industry, we deliver exceptional results for every client.</p>
          <p>Our dedicated team uses the best equipment and techniques to ensure quality work every time. We're committed to customer satisfaction in everything we do.</p>
          <button class="btn btn-primary mt-3">Our Story</button>
        </div>
        <div class="col-md-6">
          <div class="rounded overflow-hidden shadow">
            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" class="img-fluid" alt="Team at work">
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="contact" class="py-5 bg-primary text-white text-center">
    <div class="container">
      <h2 class="mb-4">Ready to get started?</h2>
      <p class="lead mb-4">Contact us today for a free consultation</p>
      <button class="btn btn-light btn-lg">Contact Us Now</button>
    </div>
  </section>

  <footer class="bg-dark text-white py-4">
    <div class="container">
      <div class="row">
        <div class="col-md-6 mb-4 mb-md-0">
          <h4>Frontier Modeling</h4>
          <p>Professional services for commercial and residential needs.</p>
        </div>
        <div class="col-md-6">
          <h4>Contact Info</h4>
          <p>123 Main Street, Anytown, USA<br>
          Phone: (555) 123-4567<br>
          Email: info@frontiermodeling.com</p>
        </div>
      </div>
      <hr class="my-4 bg-secondary">
      <p class="text-center mb-0">&copy; 2025 Frontier Modeling. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
      
      // Save to localStorage too
      localStorage.setItem('generatedWebsiteHTML', defaultTemplate);
      return defaultTemplate;
    }

    // Otherwise, wrap the content in a full HTML document
    return makeButtonsFunctional(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssContent}
    /* Add essential styles to ensure proper display */
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    * {
      box-sizing: border-box;
    }
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
    header, nav, section, footer {
      width: 100%;
      display: block;
    }
    /* Add button hover effects for better UX */
    button, .btn {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    button:hover, .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    /* Smooth scrolling for entire page */
    html {
      scroll-behavior: smooth;
    }
  </style>
</head>
<body>
  ${htmlContent || '<div class="container"><h1>Website Preview</h1><p>Loading content...</p></div>'}
</body>
</html>`);
  };
  
  // Create the final HTML document to display
  const fullHtml = processHtmlContent();
  
  // Handle submitting edit instructions
  const handleSubmitEdit = async () => {
    if (editInstructions.trim()) {
      try {
        // If there's an external edit handler, use it
        if (onEdit) {
          onEdit(editInstructions);
          setIsEditMode(false);
          setEditInstructions("");
          return;
        }
        
        // Otherwise, make a direct API call to edit the website
        setIsEditMode(false);
        
        // Show loading state
        const loadingToast = toast({
          title: "Updating Website",
          description: "Please wait while we apply your changes...",
          duration: 30000, // Long duration since this might take time
        });
        
        // Get current HTML
        const currentHtml = htmlContent;
        
        // Call the API to edit the website
        const response = await fetch('/api/edit-website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instructions: editInstructions,
            html: currentHtml,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update website');
        }
        
        // Get updated HTML
        const result = await response.json();
        
        // Update localStorage with the new HTML
        if (result && result.html) {
          localStorage.setItem('generatedWebsiteHTML', result.html);
          setHtmlContent(result.html);
          
          // Clear edit instructions
          setEditInstructions("");
          
          // Show success message and dismiss loading toast
          toast({
            title: "Success!",
            description: "Your website has been updated.",
            duration: 3000,
          });
        }
        
        // Dismiss loading toast
        loadingToast.dismiss();
        
      } catch (error) {
        console.error('Error updating website:', error);
        
        // Show error message
        toast({
          title: "Update Failed",
          description: "There was a problem updating your website. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };
  
  // Handle pre-defined edits
  const handlePresetEdit = async (editType: string) => {
    const loadingToast = toast({
      title: "Updating Website",
      description: `Applying ${editType} changes...`,
      duration: 30000,
    });
    
    try {
      let editInstructions = "";
      
      switch (editType) {
        case "color-scheme":
          editInstructions = "Update the website's color scheme to use a professional blue and white color palette. Apply blue to headings, buttons, and section backgrounds, and use white for text and content areas. Ensure the website has a high-end, professional $2k look.";
          break;
        case "contact-form":
          editInstructions = "Add a minimal but functional contact form to the website with fields for name, email, phone, and message. Place it in the contact section and style it to match the website's design. Keep it clean and elegant like a $2k professional website.";
          break;
        case "buttons":
          editInstructions = "Simplify and improve all buttons on the website. Keep only essential buttons for email, phone, and social media (Facebook and Instagram). Ensure all buttons have real functionality - email buttons should link to mailto:info@frontiermodeling.com, phone buttons should link to tel:+15551234567, and social media buttons should link to the respective platforms. Add hover effects, rounded corners, and consistent styling. Make them visually appealing and fully functional.";
          break;
        case "social-media":
          editInstructions = "Add minimal, elegant social media icons for Facebook and Instagram to the website footer or contact section. Ensure these are actually functional and link to the respective platforms. Remove any non-essential social media links like Twitter or LinkedIn unless specifically requested.";
          break;
        default:
          editInstructions = "";
      }
      
      if (editInstructions) {
        // Call the API to edit the website
        const response = await fetch('/api/edit-website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instructions: editInstructions,
            html: htmlContent,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update website');
        }
        
        // Get updated HTML
        const result = await response.json();
        
        // Update localStorage with the new HTML
        if (result && result.html) {
          localStorage.setItem('generatedWebsiteHTML', result.html);
          setHtmlContent(result.html);
          
          // Show success message
          toast({
            title: "Success!",
            description: `The ${editType.replace('-', ' ')} has been updated.`,
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Error updating website:', error);
      
      toast({
        title: "Update Failed",
        description: "There was a problem updating your website. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      loadingToast.dismiss();
    }
  };
  
  // Handle close preview
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // If no onClose handler, navigate back to chat
      setLocation('/');
    }
  };

  // Check if this is standalone mode (from WebsitePreviewScreen)
  const isStandalone = !onClose;

  return (
    <div className={`${isStandalone ? '' : 'fixed inset-0 bg-black/50 z-50'} flex flex-col h-full`}>
      {/* Only show header in popup mode, not in the dedicated preview screen */}
      {!isStandalone && !isEditMode && (
        <div className="bg-blue-600 text-white p-3 shadow-md flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">Website Preview</h2>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setIsEditMode(true)} 
              variant="outline"
              className="text-white border-white hover:bg-blue-700"
            >
              Edit Website
            </Button>
            <Button 
              onClick={handleClose}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Close
            </Button>
          </div>
        </div>
      )}
      
      {/* Only show a "Back" button when in edit mode and not in standalone */}
      {!isStandalone && isEditMode && (
        <div className="bg-blue-600 text-white p-3 shadow-md flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">Edit Website</h2>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setIsEditMode(false)} 
              variant="outline"
              className="text-white border-white hover:bg-blue-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleClose}
              variant="outline"
              className="text-white border-white hover:bg-blue-700"
            >
              Back to Chat
            </Button>
          </div>
        </div>
      )}
      
      {/* Show only Edit button in standalone mode (when on the dedicated preview page) */}
      {isStandalone && !isEditMode && (
        <div className="absolute top-3 right-3 z-10">
          <Button 
            onClick={() => setIsEditMode(true)} 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md"
          >
            Edit Website
          </Button>
        </div>
      )}
      
      {isEditMode ? (
        <div className="flex-1 flex flex-col bg-gray-100 p-4">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Edit Your Website</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose from the options below or describe custom changes.
            </p>
            
            {/* Quick edit options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <Button 
                variant="outline"
                className="justify-start text-left p-4 h-auto border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => handlePresetEdit("color-scheme")}
              >
                <div>
                  <span className="font-medium">Change Color Scheme</span>
                  <p className="text-xs text-gray-500 mt-1">Update to blue and white colors</p>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="justify-start text-left p-4 h-auto border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => handlePresetEdit("contact-form")}
              >
                <div>
                  <span className="font-medium">Add Contact Form</span>
                  <p className="text-xs text-gray-500 mt-1">Include form with name, email and message fields</p>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="justify-start text-left p-4 h-auto border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => handlePresetEdit("buttons")}
              >
                <div>
                  <span className="font-medium">Improve Buttons</span>
                  <p className="text-xs text-gray-500 mt-1">Add hover effects and rounded corners</p>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="justify-start text-left p-4 h-auto border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => handlePresetEdit("social-media")}
              >
                <div>
                  <span className="font-medium">Add Social Media</span>
                  <p className="text-xs text-gray-500 mt-1">Include Facebook, Instagram, and Twitter icons</p>
                </div>
              </Button>
            </div>
            
            {/* Custom edit option */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">Custom Changes</h4>
              <textarea
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                placeholder="Describe what you'd like to change about your website..."
                className="w-full h-24 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => setIsEditMode(false)} 
                variant="outline"
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitEdit}
                disabled={!editInstructions.trim()}
                className="bg-blue-500 hover:bg-blue-600 font-medium"
              >
                Apply Changes
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-white border rounded overflow-hidden">
            <div className="text-center py-2 bg-gray-50 border-b text-sm text-gray-500">
              Preview (changes will appear after applying)
            </div>
            <iframe 
              srcDoc={fullHtml}
              title="Website Preview"
              className="w-full h-full border-none"
              sandbox="allow-same-origin"
              style={{ height: 'calc(100% - 30px)' }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gray-100 overflow-hidden" style={{ position: 'relative' }}>
          <iframe 
            ref={(iframe) => {
              // Add listener to prevent navigation from opening in the same iframe
              if (iframe) {
                iframe.onload = () => {
                  try {
                    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDocument) {
                      const links = iframeDocument.getElementsByTagName('a');
                      
                      // Prevent default navigation and stop event propagation for all links
                      for (let i = 0; i < links.length; i++) {
                        links[i].addEventListener('click', (e) => {
                          e.preventDefault();
                          // Either prevent navigation entirely or handle it in a specific way
                          console.log('Link clicked, navigation prevented');
                        });
                      }
                    }
                  } catch (e) {
                    console.error('Error adding navigation handlers:', e);
                  }
                };
              }
            }}
            srcDoc={fullHtml}
            title="Website Preview"
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts allow-forms"
            style={{
              minHeight: "100vh",
              width: "100%",
              border: "none",
              display: "block"
            }}
          />
        </div>
      )}
      
      {recommendationText && !isEditMode && showRecommendation && (
        <div className="bg-blue-50 p-4 border-t border-blue-100 relative">
          <button 
            onClick={() => setShowRecommendation(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Close recommendations"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <p className="text-sm text-gray-700">{recommendationText}</p>
        </div>
      )}
    </div>
  );
}