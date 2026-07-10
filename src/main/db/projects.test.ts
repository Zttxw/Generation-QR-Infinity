import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { initDB, createProject, getProjects, deleteProject } from './projects'

describe('Gestión de Proyectos (Base de Datos)', () => {
  let db: Database.Database;

  beforeEach(() => {
    // Usar base de datos en memoria para los tests
    db = new Database(':memory:');
    initDB(db);
  })

  afterEach(() => {
    db.close();
  })

  it('debería inicializar la tabla projects correctamente', () => {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'").get();
    expect(table).toBeDefined();
  })

  it('debería crear un proyecto y listarlo', () => {
    const projectId = createProject(db, 'Proyecto A');
    const projects = getProjects(db);
    
    expect(projects.length).toBe(1);
    expect(projects[0].name).toBe('Proyecto A');
    expect(projects[0].id).toBe(projectId);
    expect(projects[0].created_at).toBeDefined();
  })

  it('debería eliminar un proyecto', () => {
    const projectId = createProject(db, 'Proyecto a Eliminar');
    deleteProject(db, projectId);
    
    const projects = getProjects(db);
    expect(projects.length).toBe(0);
  })
})
