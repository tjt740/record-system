import { useMemo, useState } from 'react'
import CalendarView from '../components/CalendarView'
import AccountTable from '../components/AccountTable'
import ReminderPanel from '../components/ReminderPanel'
import { mockAccounts } from '../data/mockAccounts'
import { mockAdmins } from '../data/mockAdmins'
import { useReminders } from '../hooks/useReminders'

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null)
  const {
    accountStatuses,
    adminStatuses,
    accountReminders,
    adminReminders,
    replacementSuggestions,
    getAccountsExpiringOn,
  } = useReminders(mockAccounts, mockAdmins)

  const tableAccounts = useMemo(() => {
    if (!selectedDate) {
      return mockAccounts
    }
    const expiring = getAccountsExpiringOn(selectedDate)
    return expiring.length ? expiring : mockAccounts
  }, [selectedDate, getAccountsExpiringOn])

  const tableSubtitle = selectedDate
    ? `${selectedDate} 到期的账号`
    : '全部账号授权概览'

  return (
    <div className="space-y-6">
      <ReminderPanel
        accountReminders={accountReminders}
        adminReminders={adminReminders}
        replacementSuggestions={replacementSuggestions}
      />

      <CalendarView
        accounts={mockAccounts}
        admins={mockAdmins}
        accountStatuses={accountStatuses}
        adminStatuses={adminStatuses}
        onDateSelect={setSelectedDate}
      />

      <AccountTable
        accounts={tableAccounts}
        admins={mockAdmins}
        accountStatuses={accountStatuses}
        title="账号授权状态"
        subtitle={tableSubtitle}
        actions={
          selectedDate ? (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              清除筛选
            </button>
          ) : null
        }
      />
    </div>
  )
}

export default Dashboard
