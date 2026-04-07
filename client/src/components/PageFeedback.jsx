export function PageFeedback({ eyebrow, title, message, actions, tone = 'default' }) {
  return (
    <section className={`state-panel state-panel-${tone}`}>
      {eyebrow ? <p className="state-eyebrow">{eyebrow}</p> : null}
      <h1 className="state-title">{title}</h1>
      <p className="state-message">{message}</p>
      {actions ? <div className="state-actions">{actions}</div> : null}
    </section>
  )
}
