import { ElectronAPI } from '@electron-toolkit/preload'

export interface Project {
  id: number;
  name: string;
  created_at: string;
}

export interface QR {
  id: number;
  name: string;
  url: string;
  project_id: number;
  color_fg?: string;
  color_bg?: string;
  logo_path?: string;
  notas?: string;
  created_at: string;
}

export interface DbAPI {
  getProjects: () => Promise<Project[]>;
  createProject: (name: string) => Promise<number>;
  deleteProject: (id: number) => Promise<void>;
  createQR: (data: Omit<QR, 'id' | 'created_at'>) => Promise<number>;
  getQRsByProject: (projectId: number) => Promise<QR[]>;
  updateQRMetadata: (id: number, updates: Partial<Pick<QR, 'name' | 'notas' | 'project_id'>>) => Promise<void>;
  deleteQR: (id: number) => Promise<void>;
}

export interface FsAPI {
  selectLogo: () => Promise<string | null>;
  readImage: (path: string) => Promise<string | null>;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      db: DbAPI,
      fs: FsAPI
    }
  }
}
