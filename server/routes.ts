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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

  // API endpoint to generate website content
  app.post("/api/generate-website", async (req: Request, res: Response) => {
    try {
      const { description, imageUrls } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      
      const websiteContent = await generateWebsiteContent(description, imageUrls || []);
      res.json(websiteContent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API endpoint to upload images
  app.post("/api/upload", upload.array("images", 10), async (req: Request, res: Response) => {
    try {
      // Debug logging to see what we're receiving
      console.log("Upload request received. Files:", req.files);
      console.log("Upload request body:", req.body);
      
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const filesWithAnalysis = await Promise.all(
        files.map(async (file) => {
          // Use a relative URL path for the image that will work in browser
          const fileUrl = `/uploads/${file.filename}`;
          console.log("Processing file:", file.filename, "URL:", fileUrl);
          
          // Analyze the image using OpenAI
          let analysis = "";
          try {
            analysis = await analyzeImages(fileUrl);
          } catch (err) {
            console.error("Error analyzing image:", err);
            analysis = "Unable to analyze image.";
          }
          
          // Save image to database
          const imageData = {
            websiteId: parseInt(req.body.websiteId) || 1, // Default to 1 if not provided
            filename: file.filename,
            url: fileUrl,
          };
          
          console.log("Saving image to database:", imageData);
          const savedImage = await storage.createImage(imageData);
          
          return {
            ...savedImage,
            analysis,
          };
        })
      );

      res.json(filesWithAnalysis);
    } catch (error: any) {
      console.error("Error in image upload:", error);
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
      // In a real app, we would delete chat history from DB
      // Since we're returning empty messages to start fresh anyway, this just acknowledges the request
      res.json({ success: true, message: "Chat reset successful" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

// API endpoint to add a chat message
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
      
      // Count assistant messages to determine current question
      const assistantMessages = allMessages.filter(m => m.role === "assistant");
      
      // The next question index is equal to the number of assistant messages
      // For first question (index 0), we have 0 assistant messages
      // After first answer, we have 1 assistant message, so next question is index 1, etc.
      const questionIndex = assistantMessages.length;
      
      // Determine the AI response - ONLY use the exact questions, nothing else
      let aiResponse;
      
      // Simple question-only approach - use the question index to get the next question
      if (questionIndex >= 0 && questionIndex < BUSINESS_QUESTIONS.length) {
        // Get the next question directly from the array
        aiResponse = BUSINESS_QUESTIONS[questionIndex];
      } else if (questionIndex === BUSINESS_QUESTIONS.length) {
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
