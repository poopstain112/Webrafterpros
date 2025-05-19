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
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const filesWithAnalysis = await Promise.all(
        files.map(async (file) => {
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
          const analysis = await analyzeImages(fileUrl);
          
          // Save image to database
          const imageData = {
            websiteId: parseInt(req.body.websiteId) || 1, // Default to 1 if not provided
            filename: file.filename,
            url: fileUrl,
          };
          
          const savedImage = await storage.createImage(imageData);
          
          return {
            ...savedImage,
            analysis,
          };
        })
      );

      res.json(filesWithAnalysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API endpoint to get chat messages for a website
  app.get("/api/websites/:id/messages", async (req: Request, res: Response) => {
    try {
      const websiteId = parseInt(req.params.id);
      const messages = await storage.getMessagesByWebsiteId(websiteId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API endpoint to add a chat message
  app.post("/api/websites/:id/messages", async (req: Request, res: Response) => {
    try {
      const websiteId = parseInt(req.params.id);
      const { content, role } = req.body;
      
      // Validate message data
      const validatedData = insertMessageSchema.parse({
        websiteId,
        content,
        role,
      });
      
      // Save user message
      const savedMessage = await storage.createMessage(validatedData);
      
      // Get all messages for this website to provide context
      const allMessages = await storage.getMessagesByWebsiteId(websiteId);
      const formattedMessages = allMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Generate AI response
      const aiResponse = await generateChatResponse(formattedMessages);
      
      // Save AI response
      const aiMessage = await storage.createMessage({
        websiteId,
        content: aiResponse,
        role: "assistant",
      });
      
      // Return both messages
      res.status(201).json({
        userMessage: savedMessage,
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
