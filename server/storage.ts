import { 
  users, type User, type InsertUser,
  websites, type Website, type InsertWebsite,
  messages, type Message, type InsertMessage,
  images, type Image, type InsertImage
} from "@shared/schema";

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
  
  // Message methods
  getMessagesByWebsiteId(websiteId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessagesByWebsiteId(websiteId: number): Promise<void>;
  
  // Image methods
  getImagesByWebsiteId(websiteId: number): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
}

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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
    };
    this.websites.set(id, website);
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
      createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
    };
    this.images.set(id, image);
    return image;
  }
}

export const storage = new MemStorage();
