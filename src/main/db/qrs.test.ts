import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { initDB, createProject } from './projects'
import { createQR, getQRsByProject, updateQRMetadata, deleteQR } from './qrs'

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

  it('debería actualizar los metadatos de un QR sin afectar la URL', () => {
    const qrId = createQR(db, {
      name: 'QR Original',
      url: 'https://test.com',
      project_id: projectId
    });
    
    updateQRMetadata(db, qrId, {
      name: 'QR Modificado',
      notas: 'Nota interna añadida'
    });
    
    const qrs = getQRsByProject(db, projectId);
    expect(qrs[0].name).toBe('QR Modificado');
    expect(qrs[0].notas).toBe('Nota interna añadida');
    expect(qrs[0].url).toBe('https://test.com'); // La URL permanece intacta
  })

  it('debería eliminar un QR de forma permanente', () => {
    const qrId = createQR(db, {
      name: 'QR a Borrar',
      url: 'https://test.com',
      project_id: projectId
    });
    
    deleteQR(db, qrId);
    
    const qrs = getQRsByProject(db, projectId);
    expect(qrs.length).toBe(0);
  })
})
