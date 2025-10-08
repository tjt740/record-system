import ReminderPanel from '../components/ReminderPanel'

const ReminderCenter = ({
  accountReminders = [],
  adminReminders = [],
  replacementSuggestions = [],
}) => {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold text-slate-800">提醒中心</h1>
        <p className="mt-1 text-sm text-slate-500">集中查看即将到期的账号与管理员及替换建议。</p>
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
