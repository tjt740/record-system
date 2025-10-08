import { useI18n } from '../i18n/I18nProvider.jsx'

const ReminderPanel = ({
  accountReminders = [],
  adminReminders = [],
  replacementSuggestions = [],
}) => {
  const { t } = useI18n()
  const sections = [
    {
      key: 'account',
      title: t('reminders.accountReminders'),
      description: t('reminders.accountRemindersDescription'),
      accent: 'bg-status-expiring/10 text-status-expiring',
      items: accountReminders,
    },
    {
      key: 'admin',
      title: t('reminders.adminReminders'),
      description: t('reminders.adminRemindersDescription'),
      accent: 'bg-status-reminder/10 text-status-reminder',
      items: adminReminders,
    },
    {
      key: 'replacement',
      title: t('reminders.replacement'),
      description: t('reminders.replacementDescription'),
      accent: 'bg-status-reminder/10 text-status-reminder',
      items: replacementSuggestions,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sections.map((section) => (
        <div
          key={section.key}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">{section.title}</h3>
              <p className="text-sm text-slate-500">{section.description}</p>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${section.accent}`}
            >
              {t('reminders.items', [section.items.length])}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {section.items.length ? (
              section.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm font-medium text-slate-700">{item.message}</p>
                  {item.account ? (
                    <p className="text-xs text-slate-500">
                      {t('reminders.authorizedBy', [item.account.authorizedByName])}
                    </p>
                  ) : null}
                  {item.admin ? (
                    <p className="text-xs text-slate-500">
                      {t('reminders.adminWindowEnds', [item.admin.expirationDate])}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                {t('reminders.none')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReminderPanel
