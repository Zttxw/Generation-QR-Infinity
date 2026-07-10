import { Database } from 'better-sqlite3'

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

export function createQR(db: Database, data: Omit<QR, 'id' | 'created_at'>): number {
  if (data.url.length > 250) {
    throw new Error('La URL no puede superar el máximo de 250 caracteres.');
  }

  const stmt = db.prepare(`
    INSERT INTO qrs (name, url, project_id, color_fg, color_bg, logo_path, notas) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.name, 
    data.url, 
    data.project_id, 
    data.color_fg || null, 
    data.color_bg || null, 
    data.logo_path || null, 
    data.notas || null
  );
  
  return result.lastInsertRowid as number;
}

export function getQRsByProject(db: Database, projectId: number): QR[] {
  const stmt = db.prepare('SELECT * FROM qrs WHERE project_id = ? ORDER BY created_at DESC');
  return stmt.all(projectId) as QR[];
}

export function deleteQR(db: Database, id: number): void {
  const stmt = db.prepare('DELETE FROM qrs WHERE id = ?');
  stmt.run(id);
}

export function updateQRMetadata(
  db: Database, 
  id: number, 
  updates: Partial<Pick<QR, 'name' | 'notas' | 'project_id'>>
): void {
  const setClauses: string[] = [];
  const values: any[] = [];
  
  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    values.push(updates.name);
  }
  if (updates.notas !== undefined) {
    setClauses.push('notas = ?');
    values.push(updates.notas);
  }
  if (updates.project_id !== undefined) {
    setClauses.push('project_id = ?');
    values.push(updates.project_id);
  }
  
  if (setClauses.length === 0) return;
  
  values.push(id);
  const query = `UPDATE qrs SET ${setClauses.join(', ')} WHERE id = ?`;
  
  const stmt = db.prepare(query);
  stmt.run(...values);
}
