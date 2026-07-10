import { Database } from 'better-sqlite3'

export interface Project {
  id: number;
  name: string;
  created_at: string;
}

export function initDB(db: Database) {
  // Habilitar Foreign Keys para el borrado en cascada
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS qrs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      color_fg TEXT,
      color_bg TEXT,
      logo_path TEXT,
      notas TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);
}

export function createProject(db: Database, name: string): number {
  const stmt = db.prepare('INSERT INTO projects (name) VALUES (?)');
  const result = stmt.run(name);
  return result.lastInsertRowid as number;
}

export function getProjects(db: Database): Project[] {
  const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
  return stmt.all() as Project[];
}

export function deleteProject(db: Database, id: number): void {
  // El borrado en cascada (ON DELETE CASCADE) limpia automáticamente los QRs
  const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
  stmt.run(id);
}
