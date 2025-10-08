import { useMemo, useState } from 'react'
import Dashboard from './pages/Dashboard'
import AccountList from './pages/AccountList'
import AdminList from './pages/AdminList'
import ReminderCenter from './pages/ReminderCenter'
import OverviewMetrics from './components/OverviewMetrics.jsx'
import { useSupabaseData } from './hooks/useSupabaseData'
import { useReminders } from './hooks/useReminders'

const navigationItems = [
  { key: 'dashboard', label: '日历视图' },
  { key: 'accounts', label: '账号列表' },
  { key: 'admins', label: '管理员列表' },
  { key: 'reminders', label: '提醒中心' },
]

const App = () => {
  const [activeView, setActiveView] = useState('dashboard')
  const { accounts, admins, stats, isLoading, error, refresh, isSupabaseEnabled } =
    useSupabaseData()
  const reminders = useReminders(accounts, admins)

  const metrics = useMemo(
    () => [
      { label: '账号总数', value: stats.totalAccounts },
      { label: '管理员总数', value: stats.totalAdmins },
    ],
    [stats.totalAccounts, stats.totalAdmins],
  )

  const dataStatus = useMemo(() => {
    if (!isSupabaseEnabled) {
      return {
        tone: 'warning',
        message: '正在使用示例数据，可在 Supabase 配置后同步真实数据。',
      }
    }
    if (error) {
      return {
        tone: 'error',
        message: '无法连接 Supabase，已回退到示例数据。',
      }
    }
    if (isLoading) {
      return {
        tone: 'info',
        message: '正在同步 Supabase 数据...',
      }
    }
    return {
      tone: 'success',
      message: 'Supabase 数据已同步。',
    }
  }, [isSupabaseEnabled, error, isLoading])

  const renderContent = () => {
    const pageProps = {
      accounts,
      admins,
      accountStatuses: reminders.accountStatuses,
      adminStatuses: reminders.adminStatuses,
    }

    switch (activeView) {
      case 'accounts':
        return <AccountList {...pageProps} />
      case 'admins':
        return <AdminList admins={admins} adminStatuses={reminders.adminStatuses} />
      case 'reminders':
        return (
          <ReminderCenter
            accountReminders={reminders.accountReminders}
            adminReminders={reminders.adminReminders}
            replacementSuggestions={reminders.replacementSuggestions}
          />
        )
      case 'dashboard':
      default:
        return (
          <Dashboard
            accounts={accounts}
            admins={admins}
            accountStatuses={reminders.accountStatuses}
            adminStatuses={reminders.adminStatuses}
            accountReminders={reminders.accountReminders}
            adminReminders={reminders.adminReminders}
            replacementSuggestions={reminders.replacementSuggestions}
            getAccountsExpiringOn={reminders.getAccountsExpiringOn}
          />
        )
    }
  }

  const statusBadgeStyles = {
    success: 'bg-status-normal/10 text-status-normal',
    info: 'bg-status-reminder/10 text-status-reminder',
    warning: 'bg-status-expiring/10 text-status-expiring',
    error: 'bg-status-expired/10 text-status-expired',
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 shadow-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              AAM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">账号授权管理器</p>
              <p className="text-xs text-slate-500">授权可视化与提醒中心</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-2">
            {navigationItems.map((item) => {
              const isActive = activeView === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveView(item.key)}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-card'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
          <OverviewMetrics metrics={metrics} className="mt-6" />
        </aside>
        <div className="flex flex-1 flex-col">
          <header className="flex flex-col gap-4 border-b border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white lg:hidden">
                AAM
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">账号授权管理器</h1>
                <p className="text-xs text-slate-500">
                  集中搜索、添加并监控所有授权信息。
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  type="search"
                  placeholder="搜索账号、管理员或提醒..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 sm:w-64"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                >
                  新增账号
                </button>
                <button
                  type="button"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  新增管理员
                </button>
              </div>
            </div>
            <div
              className={`inline-flex items-center justify-between gap-2 rounded-full px-4 py-2 text-xs font-medium ${statusBadgeStyles[dataStatus.tone]}`}
            >
              <span>{dataStatus.message}</span>
              {isSupabaseEnabled ? (
                <button
                  type="button"
                  onClick={refresh}
                  className="rounded-full border border-transparent bg-white/30 px-2 py-0.5 text-xs text-slate-600 transition hover:bg-white/60"
                >
                  刷新
                </button>
              ) : null}
            </div>
            <div className="lg:hidden">
              <OverviewMetrics metrics={metrics} />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl p-6">{renderContent()}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
