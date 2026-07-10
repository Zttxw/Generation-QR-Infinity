import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { initDB, createProject } from './projects'
import { createQR, getQRsByProject } from './qrs'

describe('Gestión de QRs (Base de Datos)', () => {
  let db: Database.Database;
  let projectId: number;

  beforeEach(() => {
    db = new Database(':memory:');
    initDB(db);
    projectId = createProject(db, 'Proyecto Test');
  })

  afterEach(() => {
    db.close();
  })

  it('debería crear un QR y listarlo bajo su proyecto', () => {
    const qrId = createQR(db, {
      name: 'Mi primer QR',
      url: 'https://google.com',
      project_id: projectId
    });
    
    const qrs = getQRsByProject(db, projectId);
    
    expect(qrs.length).toBe(1);
    expect(qrs[0].name).toBe('Mi primer QR');
    expect(qrs[0].url).toBe('https://google.com');
    expect(qrs[0].id).toBe(qrId);
  })

  it('debería fallar si la URL supera los 250 caracteres', () => {
    const longUrl = 'https://' + 'a'.repeat(250) + '.com';
    expect(() => {
      createQR(db, {
        name: 'QR demasiado largo',
        url: longUrl,
        project_id: projectId
      });
    }).toThrow(/máximo 250 caracteres/i);
  })

  it('debería fallar si se crea un QR en un proyecto que no existe', () => {
    expect(() => {
      createQR(db, {
        name: 'QR huerfano',
        url: 'https://test.com',
        project_id: 9999
      });
    }).toThrow();
  })
})
