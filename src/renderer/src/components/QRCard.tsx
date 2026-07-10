import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Trash2 } from 'lucide-react'

export default function QRCard({ qr, onEdit, onDelete }: { qr: any, onEdit: (qr: any) => void, onDelete: (id: number) => void }) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLogo() {
      if (qr.logo_path) {
        const base64 = await window.api.fs.readImage(qr.logo_path)
        setLogoSrc(base64)
      }
    }
    fetchLogo()
  }, [qr.logo_path])

  const handleExport = async (format: 'svg' | 'png') => {
    const wrapper = document.getElementById(`qr-wrapper-${qr.id}`)
    if (!wrapper) return
    const svgElement = wrapper.querySelector('svg')
    if (!svgElement) return
    
    const svgString = new XMLSerializer().serializeToString(svgElement)
    
    if (format === 'svg') {
      await window.api.fs.exportSvg(qr.name, svgString)
    } else {
      const canvas = document.createElement("canvas");
      const size = 1024;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = async () => {
        ctx?.drawImage(img, 0, 0, size, size);
        const pngData = canvas.toDataURL("image/png");
        await window.api.fs.exportPng(qr.name, pngData);
      };
      const modifiedSvg = svgString.replace(/width="[0-9]+" height="[0-9]+"/, `width="${size}" height="${size}"`);
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(modifiedSvg)));
    }
  }

  return (
    <div className="project-card" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div id={`qr-wrapper-${qr.id}`} style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <QRCodeSVG 
          value={qr.url} 
          size={180} 
          level="H" 
          fgColor={qr.color_fg || '#000000'}
          bgColor={qr.color_bg || '#ffffff'}
          includeMargin={false}
          imageSettings={logoSrc ? {
            src: logoSrc,
            height: 40,
            width: 40,
            excavate: true
          } : undefined}
        />
      </div>
      <h3 style={{ margin: '0' }}>{qr.name}</h3>
      <p className="date" style={{ marginTop: '0.5rem', wordBreak: 'break-all' }}>{qr.url}</p>
      {qr.notas && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{qr.notas}</p>}
      <div className="actions" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', gap: '0.25rem' }}>
        <button className="btn-secondary" onClick={() => onEdit(qr)}>Editar</button>
        <button className="btn-primary" onClick={() => handleExport('svg')}>SVG</button>
        <button className="btn-primary" onClick={() => handleExport('png')}>PNG</button>
        <button className="btn-danger-outline" style={{ padding: '0.5rem' }} onClick={() => onDelete(qr.id)} title="Eliminar QR">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
