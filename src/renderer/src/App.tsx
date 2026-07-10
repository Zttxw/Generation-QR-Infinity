import { useState, useEffect } from 'react'
import { Plus, Trash2, QrCode, FolderGit2 } from 'lucide-react'
import ProjectDetail from './ProjectDetail'
import './assets/main.css'

export default function App() {
  const [projects, setProjects] = useState<any[]>([])
  const [activeProject, setActiveProject] = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)

  const loadProjects = async () => {
    const list = await window.api.db.getProjects()
    setProjects(list)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    await window.api.db.createProject(newProjectName.trim())
    setNewProjectName('')
    setShowModal(false)
    loadProjects()
  }

  const confirmDelete = async () => {
    if (projectToDelete === null) return
    await window.api.db.deleteProject(projectToDelete)
    setProjectToDelete(null)
    loadProjects()
  }

  if (activeProject) {
    return <ProjectDetail project={activeProject} onBack={() => setActiveProject(null)} />
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo-container">
          <QrCode className="icon" size={28} color="#60a5fa" />
          <h1>QR Eterno</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nuevo Proyecto
        </button>
      </header>

      <main className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <FolderGit2 size={48} className="empty-icon" />
            <p>No tienes proyectos. Crea uno para comenzar.</p>
          </div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="project-card">
              <h3>{p.name}</h3>
              <p className="date">Creado: {new Date(p.created_at).toLocaleDateString()}</p>
              <div className="actions">
                <button className="btn-danger-outline" onClick={(e) => { e.stopPropagation(); setProjectToDelete(p.id); }}>
                  <Trash2 size={16} /> Eliminar
                </button>
                <button className="btn-secondary" onClick={() => setActiveProject(p)}>Abrir</button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Modal Creación */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Crear Proyecto</h2>
            <form onSubmit={handleCreate}>
              <input 
                autoFocus
                placeholder="Nombre del proyecto..." 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminación (Prevención de pérdida de datos) */}
      {projectToDelete !== null && (
        <div className="modal-overlay">
          <div className="modal modal-danger">
            <h2>¿Eliminar Proyecto?</h2>
            <p className="warning-text">
              Esta acción es <strong>irreversible</strong> y eliminará permanentemente el proyecto y todos los códigos QR que contiene. No hay copia de seguridad.
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setProjectToDelete(null)}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDelete}>Sí, eliminar para siempre</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
