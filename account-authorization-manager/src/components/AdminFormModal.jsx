import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'

const MAX_COVERAGE_DAYS = 12
const MS_PER_DAY = 1000 * 60 * 60 * 24

const emptyForm = {
  name: '',
  specialization: '',
  password: '',
  notes: '',
  startDate: '',
  endDate: '',
}

const computeRemainingDays = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return MAX_COVERAGE_DAYS
  }
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return MAX_COVERAGE_DAYS
  }
  const diff = Math.round((end - start) / MS_PER_DAY) + 1
  return MAX_COVERAGE_DAYS - diff
}

const AdminFormModal = ({
  open,
  mode = 'create',
  initialData,
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
        specialization: initialData.specialization ?? '',
        password: initialData.password ?? '',
        notes: initialData.notes ?? '',
        startDate: initialData.startDate ?? '',
        endDate: initialData.expirationDate ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [open, initialData])

  const remainingDays = useMemo(
    () => computeRemainingDays(form.startDate, form.endDate),
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
      return t('adminForm.errors.nameRequired')
    }
    if (!form.startDate || !form.endDate) {
      return t('adminForm.errors.datesRequired')
    }
    const start = new Date(`${form.startDate}T00:00:00`)
    const end = new Date(`${form.endDate}T00:00:00`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return t('adminForm.errors.invalidDate')
    }
    if (end < start) {
      return t('adminForm.errors.endBeforeStart')
    }
    const diff = Math.round((end - start) / MS_PER_DAY) + 1
    if (diff > MAX_COVERAGE_DAYS) {
      return t('adminForm.errors.maxDuration', [MAX_COVERAGE_DAYS])
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
      specialization: form.specialization.trim(),
      password: form.password.trim(),
      notes: form.notes.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {mode === 'edit' ? t('adminForm.titleEdit') : t('adminForm.titleCreate')}
            </h2>
            <p className="text-sm text-slate-500">{t('adminForm.description')}</p>
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
            {t('adminForm.name')}
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder={t('adminForm.namePlaceholder')}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              {t('adminForm.startDate')}
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {t('adminForm.endDate')}
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            {t('adminForm.specialization')}
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              type="text"
              placeholder={t('adminForm.specializationPlaceholder')}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              {t('adminForm.password')}
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="text"
                placeholder={t('adminForm.passwordPlaceholder')}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {t('adminForm.notes')}
              <input
                name="notes"
                value={form.notes}
                onChange={handleChange}
                type="text"
                placeholder={t('adminForm.notesPlaceholder')}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <p
            className={`text-xs ${
              remainingDays >= 0 ? 'text-slate-500' : 'text-status-expired'
            }`}
          >
            {t('adminForm.periodInfo', [remainingDays, MAX_COVERAGE_DAYS])}
          </p>

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
                ? t('adminForm.successEdit')
                : t('adminForm.successCreate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminFormModal
