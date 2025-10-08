import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const emptyForm = {
  name: '',
  authorizedBy: '',
  startDate: '',
  endDate: '',
}

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return null
  }
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null
  }
  return Math.round((end - start) / MS_PER_DAY) + 1
}

const AccountFormModal = ({
  open,
  mode = 'create',
  initialData,
  adminOptions = [],
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError,
  isSupabaseEnabled,
}) => {
  const { t } = useI18n()
  const [form, setForm] = useState(emptyForm)
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    if (!open) {
      return
    }
    setLocalError(null)
    if (initialData) {
      setForm({
        name: initialData.name ?? '',
        authorizedBy: initialData.authorizedBy ?? '',
        startDate: initialData.startDate ?? '',
        endDate: initialData.expirationDate ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, initialData])

  const durationDays = useMemo(
    () => calculateDuration(form.startDate, form.endDate),
    [form.startDate, form.endDate],
  )

  if (!open) {
    return null
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validate = () => {
    if (!form.name.trim()) {
      return t('accountForm.errors.nameRequired')
    }
    if (!form.authorizedBy) {
      return t('accountForm.errors.adminRequired')
    }
    if (!form.startDate || !form.endDate) {
      return t('accountForm.errors.datesRequired')
    }
    const start = new Date(`${form.startDate}T00:00:00`)
    const end = new Date(`${form.endDate}T00:00:00`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return t('accountForm.errors.invalidDate')
    }
    if (end < start) {
      return t('accountForm.errors.endBeforeStart')
    }
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errorMessage = validate()
    if (errorMessage) {
      setLocalError(errorMessage)
      return
    }
    setLocalError(null)
    await onSubmit({
      name: form.name.trim(),
      authorizedBy: form.authorizedBy || null,
      startDate: form.startDate,
      endDate: form.endDate,
      durationDays,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {mode === 'edit' ? t('accountForm.titleEdit') : t('accountForm.titleCreate')}
            </h2>
            <p className="text-sm text-slate-500">{t('accountForm.description')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 hover:bg-slate-200"
            disabled={isSubmitting}
          >
            {t('common.close')}
          </button>
        </div>

        {!isSupabaseEnabled ? (
          <div className="mb-4 rounded-xl border border-status-expiring/40 bg-status-expiring/10 px-4 py-3 text-xs text-status-expiring">
            {t('common.mockModeNotice')}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            {t('accountForm.name')}
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder={t('accountForm.namePlaceholder')}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {t('accountForm.authorizedBy')}
            <select
              name="authorizedBy"
              value={form.authorizedBy}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">{t('common.selectOption')}</option>
              {adminOptions.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              {t('accountForm.startDate')}
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {t('accountForm.endDate')}
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <p className="text-xs text-slate-500">{t('accountForm.durationLabel', [durationDays])}</p>

          {localError ? (
            <div className="rounded-xl border border-status-expired/40 bg-status-expired/10 px-4 py-3 text-xs text-status-expired">
              {localError}
            </div>
          ) : null}

          {submitError ? (
            <div className="rounded-xl border border-status-expired/40 bg-status-expired/10 px-4 py-3 text-xs text-status-expired">
              {submitError}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t('common.submitInProgress')
                : mode === 'edit'
                ? t('accountForm.successEdit')
                : t('accountForm.successCreate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountFormModal
