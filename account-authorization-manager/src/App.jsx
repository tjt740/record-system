import { useMemo, useState } from 'react'
import Dashboard from './pages/Dashboard'
import AccountList from './pages/AccountList'
import AdminList from './pages/AdminList'
import ReminderCenter from './pages/ReminderCenter'
import { mockAccounts } from './data/mockAccounts'
import { mockAdmins } from './data/mockAdmins'

const navigationItems = [
  { key: 'dashboard', label: '日历视图' },
  { key: 'accounts', label: '账号列表' },
  { key: 'admins', label: '管理员列表' },
  { key: 'reminders', label: '提醒中心' },
]

const App = () => {
  const [activeView, setActiveView] = useState('dashboard')

  const metrics = useMemo(() => {
    const totalAccounts = mockAccounts.length
    const totalAdmins = mockAdmins.length

    return [
      { label: '账号总数', value: totalAccounts },
      { label: '管理员总数', value: totalAdmins },
    ]
  }, [])

  const renderContent = () => {
    switch (activeView) {
      case 'accounts':
        return <AccountList />
      case 'admins':
        return <AdminList />
      case 'reminders':
        return <ReminderCenter />
      case 'dashboard':
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 shadow-card lg:flex">
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
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold tracking-wide text-slate-400">概览</p>
            <div className="mt-3 space-y-3">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="text-xs text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
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
