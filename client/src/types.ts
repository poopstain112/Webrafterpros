export interface Message {
  id: number;
  websiteId: number;
  content: string;
  role: string;
  createdAt: string;
}

export interface UploadedImage {
  id: number;
  websiteId: number;
  filename: string;
  url: string;
  createdAt: string;
}

export interface WebsiteStructure {
  html: string;
  css: string;
  structure: any;
  recommendation?: string;
  industrySpecificFeatures?: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
}