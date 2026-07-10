import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRCard({ qr }: { qr: any }) {
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

  return (
    <div className="project-card" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
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
      <div className="actions" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
        <button className="btn-secondary">Editar</button>
        <button className="btn-primary">Exportar</button>
      </div>
    </div>
  )
}
