import AccountTable from '../components/AccountTable'
import { useI18n } from '../i18n/I18nProvider.jsx'

const AccountList = ({
  accounts = [],
  admins = [],
  accountStatuses = {},
  onCreateAccount,
  onEditAccount,
  onDeleteAccount,
}) => {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-xl font-semibold text-slate-800">{t('accountList.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('accountList.description')}</p>
      </header>

      <AccountTable
        accounts={accounts}
        admins={admins}
        accountStatuses={accountStatuses}
        title={t('accountList.tableTitle')}
        subtitle={t('accountList.tableSubtitle')}
        actions={
          onCreateAccount ? (
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

export default AccountList
