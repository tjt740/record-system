import AccountTable from '../components/AccountTable'

const AccountList = ({
  accounts = [],
  admins = [],
  accountStatuses = {},
}) => {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold text-slate-800">账号目录</h1>
        <p className="mt-1 text-sm text-slate-500">查看全部账号的授权信息与负责人。</p>
      </header>

      <AccountTable
        accounts={accounts}
        admins={admins}
        accountStatuses={accountStatuses}
        title="全部账号"
        subtitle="按名称排序展示"
      />
    </div>
  )
}

export default AccountList
