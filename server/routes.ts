import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertMessageSchema, insertWebsiteSchema } from "@shared/schema";
import { generateRevolutionaryWebsite, generateChatResponse, analyzeImages } from "./openai-revolutionary";

// Set up multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage2,
  limits: { 
    fileSize: 15 * 1024 * 1024, // 15MB limit - increased from 5MB
    files: 20 // Allow up to 20 files per upload
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded images directly
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  // API endpoint to get all websites
  app.get("/api/websites", async (req: Request, res: Response) => {
    try {
      const websites = await storage.getAllWebsites();
      res.json(websites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Direct access to generated website HTML
  app.get("/website-view", async (req: Request, res: Response) => {
    try {
      const website = await storage.getWebsite(1);
      if (!website || !website.generatedHtml) {
        return res.send(`
          <html>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
              <h2>No website generated yet</h2>
              <p>Please generate a website first through the chat interface.</p>
              <a href="/" style="color: blue;">← Back to Chat</a>
            </body>
          </html>
        `);
      }
      res.send(website.generatedHtml);
    } catch (error) {
      res.status(500).send("Error loading website");
    }
  });

  // API endpoint to get a single website
  app.get("/api/websites/:id", async (req: Request, res: Response) => {
    try {
      const website = await storage.getWebsite(parseInt(req.params.id));
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }
      res.json(website);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API endpoint to create a new website
  app.post("/api/websites", async (req: Request, res: Response) => {
    try {
      const validatedData = insertWebsiteSchema.parse(req.body);
      const website = await storage.createWebsite(validatedData);
      res.status(201).json(website);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // API endpoint to edit existing website
  app.post("/api/edit-website", async (req: Request, res: Response) => {
    try {
      const { instructions, html, socialMedia } = req.body;
      
      if (!instructions || !html) {
        return res.status(400).json({ message: "Instructions and current HTML are required" });
      }
      
      console.log(`Editing website with instructions: ${instructions.substring(0, 100)}...`);
      console.log(`Social media links for editing:`, socialMedia);
      
      // Get all messages as context for the website
      const websiteId = 1; // Default website ID
      const allMessages = await storage.getMessagesByWebsiteId(websiteId);
      
      // Format messages for AI input
      const formattedMessages = allMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Get all images for context
      const websiteImages = await storage.getImagesByWebsiteId(websiteId);
      const imageUrls = websiteImages.map(img => img.url);
      
      // Import OpenAI module from our file
      const { generateChatResponse } = await import("./openai");
      
      // Create special prompts for common edit requests
      let editPrompt = '';
      
      // Check for social media edits first
      if (instructions.toLowerCase().includes('social media') || 
          (instructions.toLowerCase().includes('add') && 
          (instructions.toLowerCase().includes('facebook') || 
           instructions.toLowerCase().includes('instagram') || 
           instructions.toLowerCase().includes('twitter') ||
           instructions.toLowerCase().includes('linkedin') ||
           instructions.toLowerCase().includes('youtube') ||
           instructions.toLowerCase().includes('tiktok')))) {
        
        // Get social media links from request body if available
        const socialMedia = req.body.socialMedia || {};
        
        editPrompt = `
As an expert web developer, I need you to add or update social media links on this website:

${Object.keys(socialMedia).length > 0 ? 
`Add the following social media links with proper icons and styling:
${Object.entries(socialMedia).map(([platform, url]) => `- ${platform}: ${url}`).join('\n')}` : 
`Add placeholders for common social media links with proper icons.`}

Implementation requirements:
1. Add social media icons in both the header and footer areas
2. Use proper icons for each platform (Facebook, Instagram, Twitter, etc.)
3. Make sure all links have target="_blank" to open in new tabs
4. Add hover effects that match the website's design language
5. Ensure icons are mobile-friendly and properly sized for touch
6. Maintain the existing design language and color scheme

Here is the full HTML code:
\`\`\`html
${html}
\`\`\`

Please provide ONLY the complete updated HTML with social media functionality. Do not include explanations.
`;
      } 
      // Check for button functionality fixes
      else if (instructions.toLowerCase().includes('button') && 
          (instructions.toLowerCase().includes('fix') || 
           instructions.toLowerCase().includes("don't function") || 
           instructions.toLowerCase().includes("dont function") ||
           instructions.toLowerCase().includes("not working"))) {
        editPrompt = `
As an expert web developer, I need you to fix all buttons in this website to make them functional:

1. If the button is meant to navigate to another page, add appropriate href="#section-id" attributes
2. If the button is meant to perform an action, add JavaScript functionality
3. For contact buttons, make them either open an email application or scroll to a contact form
4. Add smooth scrolling behavior for anchor links
5. Add hover effects to all buttons for better user experience

Here is the full HTML code:
\`\`\`html
${html}
\`\`\`

Please provide ONLY the complete updated HTML with functioning buttons. Do not include explanations.
`;
      } else {
        // Use the standard prompt for other edit requests
        editPrompt = `
I need to update my website HTML based on these instructions: "${instructions}"

Here is the current HTML code:
\`\`\`html
${html}
\`\`\`

Please provide ONLY the complete, updated HTML code with the requested changes. Do not include explanations or markdown - ONLY return valid HTML.
`;
      }
      
      // Create message object
      const chatMessage = {
        role: "user",
        content: editPrompt
      };
      
      // Add edit request to the message history
      await storage.createMessage({
        websiteId,
        role: "user",
        content: `Website edit request: ${instructions}`
      });
      
      // Generate a modified version of the HTML
      const updatedHtml = await generateChatResponse([chatMessage], true);
      
      // Extract just the HTML part if the response contains extra text
      let finalHtml = updatedHtml;
      
      // If the response contains HTML tags but also other text, try to extract just the HTML
      if (updatedHtml.includes("<!DOCTYPE html>")) {
        const htmlStartIndex = updatedHtml.indexOf("<!DOCTYPE html>");
        finalHtml = updatedHtml.substring(htmlStartIndex);
      }
      
      // Update the website in storage
      const website = await storage.getWebsite(websiteId);
      if (website) {
        // Update the HTML in the website JSON
        const websiteJson = website.websiteJson as any;
        const updatedWebsite = {
          ...website,
          websiteJson: {
            ...websiteJson,
            html: finalHtml
          }
        };
        await storage.updateWebsite(updatedWebsite);
      }
      
      // Add AI's response to message history
      await storage.createMessage({
        websiteId,
        role: "assistant",
        content: "I've updated your website with the requested changes. The buttons should now be fully functional."
      });
      
      // Update the localStorage
      console.log("Website edited successfully");
      
      // Return the updated HTML
      res.json({
        html: finalHtml,
        message: "Website updated successfully."
      });
    } catch (error: any) {
      console.error("Website editing error:", error);
      res.status(500).json({ 
        message: error.message,
        details: error.stack
      });
    }
  });

  // Old generate-website route removed - now using clean 3-variant system

  // API endpoint to upload images - completely simplified version
  app.post("/api/upload", upload.array("images", 10), async (req: Request, res: Response) => {
    try {
      console.log("Upload request received");
      
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      console.log(`Received ${files.length} files`);
      
      // Create simple response with all necessary info
      const uploadedImages = files.map(file => {
        const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
        const imageUrl = `/uploads/${file.filename}`;
        
        console.log(`Processed file ${file.filename} as ${imageUrl}`);
        
        // Return complete object with all required fields
        return {
          id: uniqueId,
          websiteId: parseInt(req.body.websiteId) || 1,
          filename: file.filename,
          url: imageUrl,
          createdAt: new Date().toISOString(),
          analysis: "Image uploaded successfully"
        };
      });
      
      // Save to database in background (don't wait for it)
      for (const img of uploadedImages) {
        storage.createImage({
          websiteId: img.websiteId,
          filename: img.filename,
          url: img.url
        }).catch(err => {
          console.error("Error saving to database:", err);
          // Continue execution even if database save fails
        });
      }

      // Return immediately with processed images
      res.status(201).json(uploadedImages);
    } catch (error: any) {
      console.error("Image upload error:", error);
      res.status(500).json({ 
        message: "Upload failed",
        error: error.message 
      });
    }
  });

  // API endpoint to get images for a website
  app.get("/api/websites/:id/images", async (req: Request, res: Response) => {
    try {
      const websiteId = parseInt(req.params.id);
      const images = await storage.getImagesByWebsiteId(websiteId);
      res.json(images);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API endpoint to switch section options
  app.post("/api/websites/:id/switch-section", async (req: Request, res: Response) => {
    try {
      const websiteId = parseInt(req.params.id);
      const { sectionName, optionIndex } = req.body;
      
      if (!sectionName || optionIndex === undefined) {
        return res.status(400).json({ message: "Section name and option index are required" });
      }
      
      // Get the current website
      const website = await storage.getWebsite(websiteId);
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }
      
      // Get the section options
      const sectionOptions = website.sectionOptions as any || {};
      const websiteJson = website.websiteJson as any || {};
      const originalHtml = websiteJson.html || '';
      
      // If we don't have options for this section, return an error
      if (!sectionOptions[sectionName] || !Array.isArray(sectionOptions[sectionName]) || !sectionOptions[sectionName][optionIndex]) {
        return res.status(400).json({ message: `No options available for section "${sectionName}" at index ${optionIndex}` });
      }
      
      // Generate updated HTML using OpenAI that replaces the current section with the selected option
      const { generateChatResponse } = await import("./openai");
      
      const chatMessage = {
        role: "user",
        content: `
I need to update a specific section of my website HTML.

Replace the "${sectionName}" section with option ${optionIndex + 1}.

Here is the current HTML:
\`\`\`html
${originalHtml}
\`\`\`

Here is the replacement content for the "${sectionName}" section:
\`\`\`html
${JSON.stringify(sectionOptions[sectionName][optionIndex])}
\`\`\`

Please return the complete updated HTML with the new section in place. Do not include any explanations, only the HTML.
`
      };
      
      // Get updated HTML
      const updatedHtml = await generateChatResponse([chatMessage], true);
      
      // Update website with new HTML
      const updatedWebsite = {
        ...website,
        websiteJson: {
          ...(websiteJson),
          html: updatedHtml
        }
      };
      
      await storage.updateWebsite(updatedWebsite);
      
      res.json({
        html: updatedHtml,
        message: `Section "${sectionName}" updated to option ${optionIndex + 1}`
      });
    } catch (error: any) {
      console.error("Error switching section option:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // API endpoint to get chat messages for a website
  app.get("/api/websites/:id/messages", async (req: Request, res: Response) => {
    try {
      const websiteId = parseInt(req.params.id);
      const messages = await storage.getMessagesByWebsiteId(websiteId);
      const images = await storage.getImagesByWebsiteId(websiteId);
      
      // Add images to user messages if they exist
      const messagesWithImages = messages.map(msg => {
        if (msg.role === 'user') {
          // Find images created right before this message (within 5 seconds)
          const messageImages = images.filter(img => {
            const imgTime = new Date(img.createdAt).getTime();
            const msgTime = new Date(msg.createdAt).getTime();
            const timeDiff = Math.abs(msgTime - imgTime);
            return timeDiff < 5000; // 5 seconds
          });
          
          if (messageImages.length > 0) {
            return {
              ...msg,
              images: messageImages
            };
          }
        }
        return msg;
      });
      
      res.json(messagesWithImages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Clean reset endpoint
  app.post("/api/reset_chat", async (req: Request, res: Response) => {
    try {
      // Actually delete all messages for website ID 1 
      // (or req.body.websiteId if provided in a multi-website setup)
      const websiteId = req.body.websiteId || 1;
      await storage.deleteMessagesByWebsiteId(websiteId);
      
      // Clear the "websiteGenerated" flag from client
      res.json({ 
        success: true, 
        message: "Chat reset successful",
        clearLocalStorage: true
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

// API endpoint to add a chat message
  // Reset all data for a website (needed for "Start Over" functionality)
  app.post("/api/reset_all", async (req: Request, res: Response) => {
    try {
      // Get the default website ID (should be 1 for most users)
      const websiteId = req.body.websiteId || 1;
      
      console.log("===== FULL RESET REQUESTED =====");
      
      // Completely reset all data in memory storage
      await storage.deleteMessagesByWebsiteId(websiteId);
      
      // Import centralized greeting and reset to initial message
      const { INITIAL_GREETING } = await import("@shared/questions");
      const initialMessage = {
        websiteId: websiteId,
        role: "assistant",
        content: INITIAL_GREETING
      };
      
      await storage.createMessage(initialMessage);
      
      console.log("===== RESET COMPLETE =====");
      
      res.status(200).json({ 
        message: "Application reset successfully",
        initialMessage 
      });
    } catch (error) {
      console.error("Error resetting application:", error);
      res.status(500).json({ error: "Failed to reset application" });
    }
  });

  // Generate website variant on demand
  app.post("/api/generate-variant", async (req: Request, res: Response) => {
    try {
      const { websiteId, description, variant } = req.body;
      
      // Get the conversation messages to build the real business data
      const messages = await storage.getMessagesByWebsiteId(websiteId);
      const userMessages = messages.filter(msg => msg.role === 'user');
      
      // Build conversation data from actual user responses
      const conversationData = userMessages.length > 0 ? 
        userMessages.map(msg => msg.content).join(' | ') : 
        'Universal business website';
      console.log(`🚀 REVOLUTIONARY GENERATION STARTING`);
      console.log(`Conversation data: ${conversationData}`);
      
      // Get ONLY images from current conversation session (last 10 minutes)
      const allImages = await storage.getImagesByWebsiteId(websiteId);
      const currentTime = new Date().getTime();
      const currentSessionImages = allImages.filter(img => {
        const imgTime = new Date(img.createdAt).getTime();
        const timeDiff = currentTime - imgTime;
        return timeDiff < 10 * 60 * 1000; // Only images from last 10 minutes
      });
      
      const images = currentSessionImages
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      
      const imageUrls = images.map(img => img.url);
      
      console.log(`🎨 GENERATING VARIANT ${variant}`);
      const html = await generateRevolutionaryWebsite(conversationData, imageUrls, variant);
      
      res.json({ success: true, html });
    } catch (error) {
      console.error("Error generating variant:", error);
      res.status(500).json({ error: "Failed to generate variant" });
    }
  });

  // Deploy website endpoint
  app.post("/api/deploy-website", async (req: Request, res: Response) => {
    try {
      const { variant, variantName, html, customDomain } = req.body;
      
      if (!html || !variant) {
        return res.status(400).json({ message: "Missing required data for deployment" });
      }

      // Generate a unique deployment ID
      const deploymentId = `website-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create deployment directory
      const fs = require('fs');
      const path = require('path');
      const deploymentDir = path.join(process.cwd(), 'deployed-sites', deploymentId);
      
      if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
      }

      // Save the HTML file
      const htmlPath = path.join(deploymentDir, 'index.html');
      fs.writeFileSync(htmlPath, html);

      // Copy any uploaded images to the deployment
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const deployedUploadsDir = path.join(deploymentDir, 'uploads');
      
      if (fs.existsSync(uploadsDir)) {
        fs.mkdirSync(deployedUploadsDir, { recursive: true });
        const uploadFiles = fs.readdirSync(uploadsDir);
        uploadFiles.forEach(file => {
          const srcPath = path.join(uploadsDir, file);
          const destPath = path.join(deployedUploadsDir, file);
          fs.copyFileSync(srcPath, destPath);
        });
      }

      // Determine the deployment URL
      const baseUrl = req.protocol + '://' + req.get('host');
      const deploymentUrl = customDomain ? 
        `https://${customDomain}` : 
        `${baseUrl}/deployed/${deploymentId}`;

      // Save deployment metadata
      const deploymentMeta = {
        id: deploymentId,
        variant,
        variantName,
        customDomain: customDomain || null,
        deployedAt: new Date().toISOString(),
        url: deploymentUrl
      };
      
      const metaPath = path.join(deploymentDir, 'deployment.json');
      fs.writeFileSync(metaPath, JSON.stringify(deploymentMeta, null, 2));

      res.json({
        success: true,
        deploymentId,
        url: deploymentUrl,
        message: `${variantName} website deployed successfully!`
      });

    } catch (error: any) {
      console.error('Deployment error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to deploy website: " + error.message 
      });
    }
  });

  // Serve deployed websites
  app.use('/deployed', express.static(path.join(process.cwd(), 'deployed-sites')));

  app.post("/api/websites/:id/messages", async (req: Request, res: Response) => {
    try {
      const websiteId = parseInt(req.params.id);
      const { content, role, images } = req.body;
      
      console.log("Received message with images:", images?.length || 0);
      
      // Create message data without validation to avoid schema issues
      const messageData = {
        websiteId,
        content,
        role,
      };
      
      // Save user message
      const userMessage = await storage.createMessage(messageData);
      
      // Get all messages for this website to provide context
      const allMessages = await storage.getMessagesByWebsiteId(websiteId);
      
      // Check for website generation notification
      if (content.toLowerCase().includes("website has been generated") || 
          content.toLowerCase().includes("look at the preview")) {
        
        // This should be an AI message, not a user message
        // Delete the user message that was incorrectly created
        await storage.deleteMessagesByWebsiteId(websiteId);
        
        // Create the AI message for website generation notification
        const aiMessage = await storage.createMessage({
          websiteId,
          content: "Your website has been generated! You can view it in the preview tab. Let me know if you'd like to make any changes to the design or content.",
          role: "assistant",
        });
        
        // Return the AI message as both user and AI message to maintain the UI flow
        // The client should display this properly without both messages appearing
        return res.status(201).json({
          userMessage: null, // Don't return a user message
          aiMessage,
        });
      }
      
      // Special case for website generation messages
      if (content && content.toLowerCase().includes('website has been generated')) {
        console.log("Website generation message detected, handling specially");
        
        // Check if we already have a generation message to avoid duplicates
        const hasGenerationMessage = allMessages.some(msg => 
          msg.content && msg.content.toLowerCase().includes('website has been generated')
        );
        
        if (hasGenerationMessage) {
          console.log("Generation message already exists, not adding duplicate");
          // Just return the existing message if we already have one
          const existingMessage = allMessages.find(msg => 
            msg.content && msg.content.toLowerCase().includes('website has been generated')
          );
          
          return res.status(200).json({
            userMessage,
            aiMessage: existingMessage,
          });
        }
        
        // If we don't have a generation message, create one and continue
        console.log("First generation message, proceeding normally");
      }
      
      // Define the approved sequence of business questions
      // Import the centralized questions
      const { BUSINESS_QUESTIONS } = await import("@shared/questions");
      
      // Simple solution - count the number of user messages (excluding the current one)
      // This tells us which question to ask next
      const userMessagesCount = allMessages.filter(msg => msg.role === "user").length;
      
      // We're on the nth question (0-indexed), where n is the number of user messages we've seen
      // Since we just added a user message, we want to use that index to get the next question
      const nextQuestionIndex = userMessagesCount - 1;
      
      // Print helpful debug information
      console.log("All messages:", allMessages.map(m => ({ role: m.role, content: m.content.substring(0, 30) })));
      console.log("User messages count:", userMessagesCount, "Next question index:", nextQuestionIndex);
      
      // Determine the AI response - ONLY use the exact questions, nothing else
      let aiResponse;
      
      // Simple question-only approach
      if (nextQuestionIndex >= 0 && nextQuestionIndex < BUSINESS_QUESTIONS.length) {
        // Get the next question directly from the array
        aiResponse = BUSINESS_QUESTIONS[nextQuestionIndex];
        console.log(`USING QUESTION ${nextQuestionIndex}: ${aiResponse}`);
      } else if (nextQuestionIndex === BUSINESS_QUESTIONS.length) {
        // After final question, prompt for social media and then images with a cleaner message
        aiResponse = "Great! Now let's finalize your website. Please add your social media links and upload images using the buttons below.";
      } else {
        // After images upload, respond to any additional questions
        // Format messages for OpenAI
        const formattedMessages = allMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
        
        aiResponse = await generateChatResponse(formattedMessages);
      }
      
      // Save AI response - guaranteed to be just a question
      const aiMessage = await storage.createMessage({
        websiteId,
        content: aiResponse,
        role: "assistant",
      });
      
      // Add images to user message if provided
      let userMessageWithImages = userMessage;
      if (images && images.length > 0) {
        console.log("Adding images to message:", images);
        // Convert image URLs to relative paths if they're full URLs
        const processedImages = images.map((img: any) => {
          if (img.url && img.url.includes('http')) {
            // Extract the relative path from a full URL
            const urlParts = img.url.split('/uploads/');
            if (urlParts.length > 1) {
              return { ...img, url: `/uploads/${urlParts[1]}` };
            }
          }
          return img;
        });
        
        // Create a new object with only the properties that exist in the database schema
        userMessageWithImages = {
          ...userMessage,
          // We'll handle images separately in the client
        };
      }
      
      // Return both messages
      res.status(201).json({
        userMessage: userMessageWithImages,
        aiMessage,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  const httpServer = createServer(app);

  return httpServer;
}
