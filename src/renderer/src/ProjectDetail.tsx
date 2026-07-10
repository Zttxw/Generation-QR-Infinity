import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, QrCode, Image as ImageIcon } from 'lucide-react'
import QRCard from './components/QRCard'

export default function ProjectDetail({ project, onBack }: { project: any, onBack: () => void }) {
  const [qrs, setQrs] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingQR, setEditingQR] = useState<any | null>(null)
  const [qrToDelete, setQrToDelete] = useState<number | null>(null)
  
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [notas, setNotas] = useState('')
  const [colorFg, setColorFg] = useState('#000000')
  const [colorBg, setColorBg] = useState('#ffffff')
  const [logoPath, setLogoPath] = useState<string | null>(null)
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
      if (editingQR) {
        await window.api.db.updateQRMetadata(editingQR.id, {
          name: name.trim(),
          notas: notas.trim()
        })
      } else {
        await window.api.db.createQR({
          name: name.trim(),
          url: url.trim(),
          project_id: project.id,
          color_fg: colorFg,
          color_bg: colorBg,
          logo_path: logoPath || undefined,
          notas: notas.trim()
        })
      }
      
      setName('')
      setUrl('')
      setNotas('')
      setColorFg('#000000')
      setColorBg('#ffffff')
      setLogoPath(null)
      setShowModal(false)
      setEditingQR(null)
      loadQRs()
    } catch (err: any) {
      setError(err.message || 'Error al guardar el QR')
    }
  }

  const handleDeleteQR = async () => {
    if (qrToDelete) {
      await window.api.db.deleteQR(qrToDelete)
      setQrToDelete(null)
      loadQRs()
    }
  }

  const openCreateModal = () => {
    setEditingQR(null)
    setName('')
    setUrl('')
    setNotas('')
    setColorFg('#000000')
    setColorBg('#ffffff')
    setLogoPath(null)
    setShowModal(true)
  }

  const openEditModal = (qr: any) => {
    setEditingQR(qr)
    setName(qr.name)
    setUrl(qr.url) // Solo lectura
    setNotas(qr.notas || '')
    setShowModal(true)
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
        <button className="btn-primary" onClick={openCreateModal}>
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
            <QRCard 
              key={qr.id} 
              qr={qr} 
              onEdit={openEditModal} 
              onDelete={(id) => setQrToDelete(id)} 
            />
          ))
        )}
      </main>

      {/* Modal Creación de QR */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingQR ? 'Editar Metadatos' : 'Crear Código QR'}</h2>
            {editingQR && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>La URL de destino no puede modificarse. Para cambiar el destino, crea un QR nuevo.</p>}
            
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
                disabled={!!editingQR}
                style={editingQR ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                onChange={(e) => {
                  if (e.target.value.length <= 250 && !editingQR) setUrl(e.target.value)
                }}
              />

              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Notas internas (Opcional)</label>
              <textarea 
                placeholder="Propósito, ubicación física..." 
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', resize: 'vertical' }}
              />
              
              {!editingQR && (
                <>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Color QR</label>
                      <input type="color" value={colorFg} onChange={(e) => setColorFg(e.target.value)} style={{ padding: '0', height: '40px', cursor: 'pointer' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Color Fondo</label>
                      <input type="color" value={colorBg} onChange={(e) => setColorBg(e.target.value)} style={{ padding: '0', height: '40px', cursor: 'pointer' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Logo (Opcional)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button type="button" className="btn-secondary" onClick={async () => {
                        const path = await window.api.fs.selectLogo();
                        if (path) setLogoPath(path);
                      }}>
                        <ImageIcon size={18} /> Seleccionar Logo Local
                      </button>
                      {logoPath && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Logo cargado listo ✓</span>}
                    </div>
                  </div>
                </>
              )}
              
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => { setShowModal(false); setEditingQR(null); setError(''); }}>Cancelar</button>
                <button type="submit" className="btn-primary">{editingQR ? 'Guardar Cambios' : 'Generar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Confirmación Eliminar QR */}
      {qrToDelete !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Eliminar Código QR</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              ¿Estás seguro de que deseas eliminar este código QR permanentemente? 
              <br /><strong style={{ color: 'white' }}>Esta acción es irreversible.</strong>
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setQrToDelete(null)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDeleteQR}>Eliminar Permanentemente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
