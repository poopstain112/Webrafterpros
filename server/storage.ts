import { 
  users, type User, type InsertUser,
  websites, type Website, type InsertWebsite,
  messages, type Message, type InsertMessage,
  images, type Image, type InsertImage
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface with CRUD methods for all entities
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Website methods
  getAllWebsites(): Promise<Website[]>;
  getWebsite(id: number): Promise<Website | undefined>;
  createWebsite(website: InsertWebsite): Promise<Website>;
  updateWebsite(website: Website): Promise<Website>;
  
  // Message methods
  getMessagesByWebsiteId(websiteId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessagesByWebsiteId(websiteId: number): Promise<void>;
  
  // Image methods
  getImagesByWebsiteId(websiteId: number): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Website methods
  async getAllWebsites(): Promise<Website[]> {
    return await db.select().from(websites);
  }
  
  async getWebsite(id: number): Promise<Website | undefined> {
    const [website] = await db.select().from(websites).where(eq(websites.id, id));
    return website;
  }
  
  async createWebsite(insertWebsite: InsertWebsite): Promise<Website> {
    const [website] = await db.insert(websites).values(insertWebsite).returning();
    return website;
  }
  
  async updateWebsite(website: Website): Promise<Website> {
    const { id, ...updateData } = website;
    const [updatedWebsite] = await db
      .update(websites)
      .set(updateData)
      .where(eq(websites.id, id))
      .returning();
    return updatedWebsite;
  }
  
  // Message methods
  async getMessagesByWebsiteId(websiteId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.websiteId, websiteId))
      .orderBy(messages.createdAt);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
  
  async deleteMessagesByWebsiteId(websiteId: number): Promise<void> {
    console.log(`RESET: Deleting all messages for website ID ${websiteId}`);
    await db.delete(messages).where(eq(messages.websiteId, websiteId));
  }
  
  // Image methods
  async getImagesByWebsiteId(websiteId: number): Promise<Image[]> {
    return await db.select()
      .from(images)
      .where(eq(images.websiteId, websiteId));
  }
  
  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db.insert(images).values(insertImage).returning();
    return image;
  }
}

// Keep the MemStorage for now as a fallback but use DatabaseStorage
export class MemStorage implements IStorage {
  // Made messages accessible so we can force-clear if needed
  users: Map<number, User>;
  websites: Map<number, Website>;
  messages: Map<number, Message>;
  images: Map<number, Image>;
  private userCurrentId: number;
  private websiteCurrentId: number;
  private messageCurrentId: number;
  private imageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.websites = new Map();
    this.messages = new Map();
    this.images = new Map();
    this.userCurrentId = 1;
    this.websiteCurrentId = 1;
    this.messageCurrentId = 1;
    this.imageCurrentId = 1;
    
    // Initialize with a default website
    const defaultWebsite: Website = {
      id: 1,
      name: "My First Website",
      userId: 1,
      description: "A simple business website",
      websiteJson: {
        html: "",
        css: "",
        structure: {
          header: {},
          sections: [],
          footer: {}
        }
      },
      sectionOptions: {
        hero: [{}, {}, {}],
        about: [{}, {}, {}],
        services: [{}, {}, {}],
        testimonials: [{}, {}, {}],
        contact: [{}, {}, {}]
      },
      createdAt: new Date()
    };
    this.websites.set(1, defaultWebsite);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Website methods
  async getAllWebsites(): Promise<Website[]> {
    return Array.from(this.websites.values());
  }
  
  async getWebsite(id: number): Promise<Website | undefined> {
    return this.websites.get(id);
  }
  
  async createWebsite(insertWebsite: InsertWebsite): Promise<Website> {
    const id = this.websiteCurrentId++;
    const website: Website = {
      ...insertWebsite,
      id,
      createdAt: new Date()
    };
    this.websites.set(id, website);
    return website;
  }
  
  async updateWebsite(website: Website): Promise<Website> {
    this.websites.set(website.id, website);
    return website;
  }
  
  // Message methods
  async getMessagesByWebsiteId(websiteId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.websiteId === websiteId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }
  
  async deleteMessagesByWebsiteId(websiteId: number): Promise<void> {
    console.log(`RESET: Completely clearing all messages`);
    
    // Just nuke everything and start fresh - the most reliable approach
    this.messages = new Map();
    console.log("RESET: Created fresh message storage");
    
    // Reset the message ID counter
    this.messageCurrentId = 1;
    console.log("RESET: Reset message ID counter");
  }
  
  // Image methods
  async getImagesByWebsiteId(websiteId: number): Promise<Image[]> {
    return Array.from(this.images.values())
      .filter(image => image.websiteId === websiteId);
  }
  
  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.imageCurrentId++;
    const image: Image = {
      ...insertImage,
      id,
      createdAt: new Date()
    };
    this.images.set(id, image);
    return image;
  }
}

// Use DatabaseStorage for production
export const storage = new DatabaseStorage();
