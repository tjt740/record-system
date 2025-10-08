import { useI18n } from '../i18n/I18nProvider.jsx'

const AdminList = ({
  admins = [],
  adminStatuses = {},
  onEditAdmin,
  onDeleteAdmin,
}) => {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold text-slate-800">{t('adminList.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('adminList.description')}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {admins.map((admin) => {
          const status = adminStatuses[admin.id]
          const badge = status
            ? status
            : { label: t('statusLabels.normal'), badgeClass: 'bg-status-normal/10 text-status-normal' }
          return (
            <div
              key={admin.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{admin.name}</h2>
                <p className="text-sm text-slate-500">
                  {admin.specialization || t('adminList.defaultSpecialization')}
                </p>
              </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.badgeClass}`}
                >
                  {badge.label}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  {t('adminList.periodLabel')}{' '}
                  <span className="font-medium text-slate-700">
                    {t('adminList.periodValue', [admin.startDate, admin.expirationDate])}
                  </span>
                </p>
                <p className="text-xs text-slate-500">{t('adminList.maxPeriodNote')}</p>
              </div>
              {(onEditAdmin || onDeleteAdmin) ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {onEditAdmin ? (
                    <button
                      type="button"
                      onClick={() => onEditAdmin(admin)}
                      className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800"
                    >
                      {t('common.edit')}
                    </button>
                  ) : null}
                  {onDeleteAdmin ? (
                    <button
                      type="button"
                      onClick={() => onDeleteAdmin(admin)}
                      className="rounded-full border border-status-expired/40 bg-status-expired/10 px-4 py-1.5 text-xs font-medium text-status-expired hover:bg-status-expired/20"
                    >
                      {t('common.delete')}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminList
