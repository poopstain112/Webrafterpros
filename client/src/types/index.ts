export type Message = {
  id?: number;
  content: string;
  role: "user" | "assistant";
  createdAt?: string;
  isLoading?: boolean;
  images?: UploadedImage[];
};

export type UploadedImage = {
  id?: number;
  url: string;
  filename: string;
  analysis?: string;
};

export type WebsiteData = {
  id?: number;
  name: string;
  description: string;
  websiteJson: WebsiteStructure;
  userId?: number;
  createdAt?: string;
};

export type WebsiteStructure = {
  html: string;
  css: string;
  structure: {
    header?: any;
    sections?: any[];
    footer?: any;
  };
  recommendation?: string;
};

export type EditableElement = {
  id: string;
  type: 'text' | 'image' | 'button' | 'container';
  content?: string;
  url?: string;
  style?: Record<string, string>;
};

export type ViewMode = 'desktop' | 'mobile';
