'use client'
import { type ReactNode, useEffect, useRef } from 'react'

/**
 * Demande de confirmation avant une action irréversible, comme la fonte d'un objet. Elle utilise
 * l'élément dialog du navigateur, comme le guide du jeu : focus, touche Échap et fond inerte sont
 * gérés par le navigateur. Le bouton d'annulation reçoit le focus : un appui machinal sur Entrée
 * n'exécute pas l'action.
 */
export function ConfirmDialog({
  open,
  title,
  confirmLabel,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean
  title: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)

  // La fenêtre suit la propriété open ; elle s'ouvre en fenêtre modale.
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) {
      element.showModal()
      cancel.current?.focus()
    }
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className="guide panel confirm"
      aria-labelledby="confirm-title"
      onClose={() => {
        // Fermeture par Échap ou par le navigateur : c'est une annulation.
        if (open) onCancel()
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <div className="guide-body">{children}</div>
      <div className="row guide-actions">
        <button ref={cancel} type="button" className="secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="button" className="danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
