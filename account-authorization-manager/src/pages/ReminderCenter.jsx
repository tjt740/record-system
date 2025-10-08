import ReminderPanel from '../components/ReminderPanel'
import { useI18n } from '../i18n/I18nProvider.jsx'

const ReminderCenter = ({
  accountReminders = [],
  adminReminders = [],
  replacementSuggestions = [],
}) => {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold text-slate-800">{t('reminders.reminderCenterTitle')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('reminders.reminderCenterDescription')}</p>
      </header>
      <ReminderPanel
        accountReminders={accountReminders}
        adminReminders={adminReminders}
        replacementSuggestions={replacementSuggestions}
      />
    </div>
  )
}

export default ReminderCenter
