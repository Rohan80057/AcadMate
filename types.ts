
export enum View {
  Home = 'HOME',
  Pomodoro = 'POMODORO',
  Notes = 'NOTES',
  PdfViewer = 'PDF_VIEWER',
  Webview = 'WEBVIEW',
  AiChat = 'AI_CHAT',
  Settings = 'SETTINGS',
}

export interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface PdfFile {
  name: string;
  dataUrl: string; // Base64 encoded
}

export type PdfFolders = Record<string, PdfFile[]>;


export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

export interface UserProfile {
  name: string;
  email: string;
  profilePic?: string; // base64
  dob?: string;
  college?: string;
}
