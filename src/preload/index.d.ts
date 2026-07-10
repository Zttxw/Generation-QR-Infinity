import { ElectronAPI } from '@electron-toolkit/preload'

export interface Project {
  id: number;
  name: string;
  created_at: string;
}

export interface DbAPI {
  getProjects: () => Promise<Project[]>;
  createProject: (name: string) => Promise<number>;
  deleteProject: (id: number) => Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      db: DbAPI
    }
  }
}
