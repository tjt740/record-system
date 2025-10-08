const AdminList = ({ admins = [], adminStatuses = {} }) => {

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold text-slate-800">管理员名单</h1>
        <p className="mt-1 text-sm text-slate-500">关注管理员授权周期，提前做好替换计划。</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {admins.map((admin) => {
          const status = adminStatuses[admin.id]
          const badge = status
            ? status
            : { label: '正常', badgeClass: 'bg-status-normal/10 text-status-normal' }
          return (
            <div
              key={admin.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{admin.name}</h2>
                  <p className="text-sm text-slate-500">{admin.specialization}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.badgeClass}`}
                >
                  {badge.label}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  授权周期:{' '}
                  <span className="font-medium text-slate-700">
                    {admin.startDate} → {admin.expirationDate}
                  </span>
                </p>
                <p className="text-xs text-slate-500">每位管理员最长授权周期 12 天。</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminList
