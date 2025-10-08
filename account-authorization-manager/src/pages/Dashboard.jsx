import { useMemo, useState } from 'react'
import CalendarView from '../components/CalendarView'
import AccountTable from '../components/AccountTable'
import ReminderPanel from '../components/ReminderPanel'
import { useI18n } from '../i18n/I18nProvider.jsx'

const Dashboard = ({
  accounts = [],
  admins = [],
  accountStatuses = {},
  adminStatuses = {},
  accountReminders = [],
  adminReminders = [],
  replacementSuggestions = [],
  getAccountsExpiringOn = () => [],
  onCreateAccount,
  onEditAccount,
  onDeleteAccount,
}) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const { t } = useI18n()

  const tableAccounts = useMemo(() => {
    if (!selectedDate) {
      return accounts
    }
    const expiring = getAccountsExpiringOn(selectedDate)
    return expiring.length ? expiring : accounts
  }, [accounts, selectedDate, getAccountsExpiringOn])

  const tableSubtitle = selectedDate
    ? t('dashboard.tableSubtitleDate', [selectedDate])
    : t('dashboard.tableSubtitleAll')

  return (
    <div className="space-y-6">
      <ReminderPanel
        accountReminders={accountReminders}
        adminReminders={adminReminders}
        replacementSuggestions={replacementSuggestions}
      />

      <CalendarView
        accounts={accounts}
        admins={admins}
        accountStatuses={accountStatuses}
        adminStatuses={adminStatuses}
        onDateSelect={setSelectedDate}
      />

      <AccountTable
        accounts={tableAccounts}
        admins={admins}
        accountStatuses={accountStatuses}
        title={t('dashboard.tableTitle')}
        subtitle={tableSubtitle}
        actions={
          selectedDate ? (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              {t('dashboard.clearFilter')}
            </button>
          ) : onCreateAccount ? (
            <button
              type="button"
              onClick={onCreateAccount}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {t('common.addAccount')}
            </button>
          ) : null
        }
        onEditAccount={onEditAccount}
        onDeleteAccount={onDeleteAccount}
      />
    </div>
  )
}

export default Dashboard
