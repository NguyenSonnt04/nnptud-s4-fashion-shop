import { useId, useState } from 'react'
import { parseListInput, uploadAdminImage } from '../../lib/admin.js'
import { resolveImageUrl } from '../../lib/models.js'
import { AdminUploadIcon } from './AdminIcons.jsx'

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <section className="admin-page-header">
      <div>
        {eyebrow ? <p className="admin-page-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="admin-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </section>
  )
}

export function AdminMetricCard({ label, meta, tone = 'default', value }) {
  return (
    <article className={`admin-metric admin-metric-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {meta ? <span>{meta}</span> : null}
    </article>
  )
}

export function AdminPanel({ children, description, title }) {
  return (
    <section className="admin-panel-card">
      {(title || description) && (
        <div className="admin-panel-head">
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
        </div>
      )}
      {children}
    </section>
  )
}

export function AdminStatusPill({ children, tone = 'default' }) {
  return <span className={`admin-status admin-status-${tone}`}>{children}</span>
}

export function AdminEmptyState({ action, message, title }) {
  return (
    <div className="admin-empty">
      <h3>{title}</h3>
      <p>{message}</p>
      {action ? <div className="admin-empty-action">{action}</div> : null}
    </div>
  )
}

export function AdminImageField({ hint, label, onChange, required = false, value }) {
  const inputId = useId()
  const [isUploading, setIsUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const imageList = parseListInput(value)

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setIsUploading(true)
    setStatusMessage('')

    try {
      const uploadedPath = await uploadAdminImage(file)
      const nextValue = [...imageList, uploadedPath].join('\n')
      onChange(nextValue)
      setStatusMessage('Đã tải ảnh lên backend và thêm vào danh sách.')
    } catch (error) {
      setStatusMessage(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="field field-stacked">
      <div className="admin-field-head">
        <label htmlFor={inputId}>{label}</label>
        <label className="admin-upload-button" htmlFor={`${inputId}-upload`}>
          <AdminUploadIcon className="admin-inline-icon" />
          {isUploading ? 'Đang tải ảnh...' : 'Tải ảnh từ máy'}
        </label>
      </div>
      <textarea
        id={inputId}
        placeholder="Mỗi dòng một URL hoặc path ảnh từ backend"
        required={required}
        rows="4"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        accept="image/*"
        className="admin-hidden-input"
        id={`${inputId}-upload`}
        type="file"
        onChange={handleFileChange}
      />
      {hint ? <p className="field-note">{hint}</p> : null}
      {statusMessage ? <p className="field-note">{statusMessage}</p> : null}
      {imageList.length > 0 ? (
        <div className="admin-image-grid">
          {imageList.slice(0, 4).map((image) => (
            <div className="admin-image-thumb" key={image}>
              <img alt="" src={resolveImageUrl(image)} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
