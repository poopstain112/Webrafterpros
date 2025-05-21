import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import WebsitePreview from '@/components/WebsitePreview';
import MobilePullToRefresh from '@/components/MobilePullToRefresh';

const WebsitePreviewScreen = () => {
  const [websiteHtml, setWebsiteHtml] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const loadWebsiteHTML = () => {
    // Get the stored website HTML from localStorage
    const storedHtml = localStorage.getItem('generatedWebsiteHTML');
    console.log("WebsitePreviewScreen: Checking for stored HTML", storedHtml ? "HTML found, length: " + storedHtml.length : "No HTML found");
    
    if (storedHtml && storedHtml.length > 150) {
      setWebsiteHtml(storedHtml);
      return true;
    }
    
    // If not found or too short, create a proper default template
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
    
    // Save this template to localStorage and set it as current website
    localStorage.setItem('generatedWebsiteHTML', defaultTemplate);
    setWebsiteHtml(defaultTemplate);
    return true;
  };
  
  // Handle refreshing the page content
  const handleRefresh = async () => {
    console.log("Pull-to-refresh triggered, reloading website HTML");
    loadWebsiteHTML();
  };
  
  useEffect(() => {
    // Try to load website from localStorage
    if (!loadWebsiteHTML()) {
      // If no HTML is found, create a default one immediately
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

      // Save this to localStorage and set it
      localStorage.setItem('generatedWebsiteHTML', defaultTemplate);
      setWebsiteHtml(defaultTemplate);
      console.log("Created and saved default website template");
    }
  }, []);

  const handleBackToChat = () => {
    setLocation('/');
  };

  if (!websiteHtml) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-bold mb-4">No Website Found</h2>
        <p className="text-gray-600 mb-6">No generated website content was found.</p>
        <Button onClick={handleBackToChat}>Return to Chat</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header - Streamlined */}
      <div className="flex items-center justify-between bg-blue-600 text-white p-3 shadow-md">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToChat}
            className="text-white hover:bg-blue-700 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Website Preview</h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleBackToChat}
          className="text-white border-white hover:bg-blue-700"
        >
          <Home className="h-4 w-4 mr-1" />
          Back to Chat
        </Button>
      </div>
      
      {/* Website Preview - with pull-to-refresh capability */}
      <div className="flex-1 bg-gray-100" style={{ height: 'calc(100vh - 56px)' }}>
        {websiteHtml ? (
          <MobilePullToRefresh onRefresh={handleRefresh}>
            <WebsitePreview html={websiteHtml} />
          </MobilePullToRefresh>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading website preview...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsitePreviewScreen;