import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertMessageSchema, insertWebsiteSchema } from "@shared/schema";
import { generateWebsiteContent, generateChatResponse, analyzeImages } from "./openai";

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
  // API endpoint to get all websites
  app.get("/api/websites", async (req: Request, res: Response) => {
    try {
      const websites = await storage.getAllWebsites();
      res.json(websites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

  // API endpoint to generate professional website content
  app.post("/api/generate-website", async (req: Request, res: Response) => {
    try {
      const { description, imageUrls, businessType } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      
      // Log website generation request for debugging
      console.log(`Generating website with: Description length: ${description.length}, Images: ${(imageUrls || []).length}, Business type: ${businessType || 'not specified'}`);
      
      // Generate the website content with enhanced parameters
      const websiteContent = await generateWebsiteContent(
        description, 
        imageUrls || [],
        businessType
      );
      
      console.log("Website generated successfully");
      res.json(websiteContent);
    } catch (error: any) {
      console.error("Website generation error:", error);
      res.status(500).json({ 
        message: error.message,
        details: error.stack
      });
    }
  });

  // API endpoint to upload images - completely simplified version
  app.post("/api/upload", upload.array("images", 20), async (req: Request, res: Response) => {
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
      
      console.log("RESET ALL: Deleting all messages for website ID:", websiteId);
      
      // Delete all messages for this website - make sure this is working properly
      await storage.deleteMessagesByWebsiteId(websiteId);
      
      // Verify messages were deleted
      const remainingMessages = await storage.getMessagesByWebsiteId(websiteId);
      console.log("RESET ALL: Remaining messages after deletion:", remainingMessages.length);
      
      // If there are still messages, force-delete them again
      if (remainingMessages.length > 0) {
        console.log("RESET ALL: Forcing deletion of remaining messages");
        // Try direct deletion from storage
        storage.messages.clear();
      }
      
      // Reset default initial message
      const initialMessage = {
        websiteId: websiteId,
        role: "assistant",
        content: "What's the name of your business?"
      };
      
      await storage.createMessage(initialMessage);
      
      // Verify the reset worked
      const newMessages = await storage.getMessagesByWebsiteId(websiteId);
      console.log("RESET ALL: New messages count after reset:", newMessages.length);
      
      res.status(200).json({ 
        message: "Application reset successfully",
        initialMessage 
      });
    } catch (error) {
      console.error("Error resetting application:", error);
      res.status(500).json({ error: "Failed to reset application" });
    }
  });

  app.post("/api/websites/:id/messages", async (req: Request, res: Response) => {
    try {
      const websiteId = parseInt(req.params.id);
      const { content, role, images } = req.body;
      
      console.log("Received message with images:", images?.length || 0);
      
      // Validate message data
      const validatedData = insertMessageSchema.parse({
        websiteId,
        content,
        role,
      });
      
      // Save user message
      const userMessage = await storage.createMessage(validatedData);
      
      // Get all messages for this website to provide context
      const allMessages = await storage.getMessagesByWebsiteId(websiteId);
      
      // Define the fixed sequence of business questions - JUST QUESTIONS, no paragraphs
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
      
      // Simple solution - count the number of user messages (excluding the current one)
      // This tells us which question to ask next
      const userMessagesCount = allMessages.filter(msg => msg.role === "user").length;
      
      // We're on the nth question (0-indexed), where n is the number of user messages we've seen
      // Since we just added a user message, we want to use that index to get the next question
      const nextQuestionIndex = userMessagesCount;
      
      // Print helpful debug information
      console.log("All messages:", allMessages.map(m => ({ role: m.role, content: m.content.substring(0, 30) })));
      console.log("User messages count:", userMessagesCount, "Next question index:", nextQuestionIndex);
      
      // Determine the AI response - ONLY use the exact questions, nothing else
      let aiResponse;
      
      // Simple question-only approach
      if (nextQuestionIndex >= 0 && nextQuestionIndex < BUSINESS_QUESTIONS.length) {
        // Get the next question directly from the array
        aiResponse = BUSINESS_QUESTIONS[nextQuestionIndex];
      } else if (nextQuestionIndex === BUSINESS_QUESTIONS.length) {
        // After final question, prompt for image upload - simple prompt only
        aiResponse = "Please upload images for your website.";
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
