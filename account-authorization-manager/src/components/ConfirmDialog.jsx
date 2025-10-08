import { useI18n } from '../i18n/I18nProvider.jsx'

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isProcessing = false,
  errorMessage,
}) => {
  const { t } = useI18n()
  const resolvedConfirmLabel = confirmLabel ?? t('common.confirm')
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel')
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        ) : null}
        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-status-expired/40 bg-status-expired/10 px-4 py-3 text-xs text-status-expired">
            {errorMessage}
          </div>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800"
          disabled={isProcessing}
        >
            {resolvedCancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-full bg-status-expired px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-400"
          disabled={isProcessing}
        >
            {isProcessing ? t('common.processing') : resolvedConfirmLabel}
        </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
