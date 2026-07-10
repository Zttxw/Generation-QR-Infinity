import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function ProjectDetail({ project, onBack }: { project: any, onBack: () => void }) {
  const [qrs, setQrs] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const loadQRs = async () => {
    const list = await window.api.db.getQRsByProject(project.id)
    setQrs(list)
  }

  useEffect(() => {
    loadQRs()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim() || !url.trim()) {
      setError('Nombre y URL son obligatorios.')
      return
    }
    
    if (url.length > 250) {
      setError('La URL no puede superar los 250 caracteres.')
      return
    }

    try {
      await window.api.db.createQR({
        name: name.trim(),
        url: url.trim(),
        project_id: project.id
      })
      setName('')
      setUrl('')
      setShowModal(false)
      loadQRs()
    } catch (err: any) {
      setError(err.message || 'Error al crear el QR')
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo-container">
          <button className="btn-ghost" onClick={onBack} style={{ padding: '0.5rem', marginRight: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <h1>{project.name}</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nuevo QR
        </button>
      </header>

      <main className="projects-grid">
        {qrs.length === 0 ? (
          <div className="empty-state">
            <QrCode size={48} className="empty-icon" />
            <p>Este proyecto no tiene códigos QR aún.</p>
          </div>
        ) : (
          qrs.map((qr) => (
            <div key={qr.id} className="project-card" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <QRCodeSVG 
                  value={qr.url} 
                  size={180} 
                  level="H" 
                  includeMargin={false} 
                />
              </div>
              <h3 style={{ margin: '0' }}>{qr.name}</h3>
              <p className="date" style={{ marginTop: '0.5rem', wordBreak: 'break-all' }}>{qr.url}</p>
              <div className="actions" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                <button className="btn-secondary">Editar</button>
                <button className="btn-primary">Exportar</button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Modal Creación de QR */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Crear Código QR</h2>
            <form onSubmit={handleCreate}>
              {error && <p className="warning-text" style={{ padding: '0.75rem', marginBottom: '1rem' }}>{error}</p>}
              
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nombre interno</label>
              <input 
                autoFocus
                placeholder="Ej. Promo Verano" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                URL Destino <span style={{ fontSize: '0.8rem', float: 'right' }}>{url.length}/250</span>
              </label>
              <input 
                placeholder="https://..." 
                value={url}
                onChange={(e) => {
                  if (e.target.value.length <= 250) setUrl(e.target.value)
                }}
              />
              
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => { setShowModal(false); setError(''); }}>Cancelar</button>
                <button type="submit" className="btn-primary">Generar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
