export default function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = 'Delete' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-popup" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">⚠️</div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
