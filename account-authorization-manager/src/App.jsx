import { useEffect, useMemo, useRef, useState } from 'react'
import Dashboard from './pages/Dashboard'
import AccountList from './pages/AccountList'
import AdminList from './pages/AdminList'
import ReminderCenter from './pages/ReminderCenter'
import OverviewMetrics from './components/OverviewMetrics.jsx'
import AdminFormModal from './components/AdminFormModal.jsx'
import AccountFormModal from './components/AccountFormModal.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import { useSupabaseData } from './hooks/useSupabaseData'
import { useReminders } from './hooks/useReminders'
import { useI18n } from './i18n/I18nProvider.jsx'

const App = () => {
  const { t, lang, setLanguage, availableLanguages } = useI18n()
  const [activeView, setActiveView] = useState('dashboard')
  const {
    accounts,
    admins,
    stats,
    isLoading,
    error,
    refresh,
    isSupabaseEnabled,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useSupabaseData()
  const reminders = useReminders(accounts, admins)

  const [adminModalState, setAdminModalState] = useState({
    open: false,
    mode: 'create',
    admin: null,
  })
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false)
  const [adminSubmitError, setAdminSubmitError] = useState(null)

  const [accountModalState, setAccountModalState] = useState({
    open: false,
    mode: 'create',
    account: null,
  })
  const [isAccountSubmitting, setIsAccountSubmitting] = useState(false)
  const [accountSubmitError, setAccountSubmitError] = useState(null)

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null,
    entity: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmError, setConfirmError] = useState(null)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const langMenuRef = useRef(null)

  const navigationItems = useMemo(
    () => [
      { key: 'dashboard', label: t('navigation.dashboard') },
      { key: 'accounts', label: t('navigation.accounts') },
      { key: 'admins', label: t('navigation.admins') },
      { key: 'reminders', label: t('navigation.reminders') },
    ],
    [t],
  )

  const metrics = useMemo(
    () => [
      { label: t('metrics.accounts'), value: stats.totalAccounts },
      { label: t('metrics.admins'), value: stats.totalAdmins },
    ],
    [stats.totalAccounts, stats.totalAdmins, t],
  )

  const dataStatus = useMemo(() => {
    if (!isSupabaseEnabled) {
      return {
        tone: 'warning',
        message: t('status.mockMode'),
      }
    }
    if (error) {
      return {
        tone: 'error',
        message: t('status.supabaseError'),
      }
    }
    if (isLoading) {
      return {
        tone: 'info',
        message: t('status.supabaseSyncing'),
      }
    }
    return {
      tone: 'success',
      message: t('status.supabaseSync'),
    }
  }, [isSupabaseEnabled, error, isLoading, t])

  const adminOptions = useMemo(
    () =>
      admins.map((admin) => ({
        id: admin.id,
        name: admin.name,
      })),
    [admins],
  )

  const languageOptions = useMemo(
    () =>
      availableLanguages.map((code) => ({
        code,
        label: t(`common.languageName.${code}`),
      })),
    [availableLanguages, t],
  )

  useEffect(() => {
    if (!isLangMenuOpen) {
      return
    }
    const handleClickOutside = (event) => {
      if (!langMenuRef.current?.contains(event.target)) {
        setIsLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLangMenuOpen])

  const openCreateAdminModal = () => {
    setAdminSubmitError(null)
    setAdminModalState({ open: true, mode: 'create', admin: null })
  }

  const openEditAdminModal = (admin) => {
    setAdminSubmitError(null)
    setAdminModalState({ open: true, mode: 'edit', admin })
  }

  const openCreateAccountModal = () => {
    setAccountSubmitError(null)
    setAccountModalState({ open: true, mode: 'create', account: null })
  }

  const openEditAccountModal = (account) => {
    setAccountSubmitError(null)
    setAccountModalState({ open: true, mode: 'edit', account })
  }

  const requestDeleteAdmin = (admin) => {
    setConfirmError(null)
    setConfirmState({
      open: true,
      type: 'admin',
      entity: admin,
    })
  }

  const requestDeleteAccount = (account) => {
    setConfirmError(null)
    setConfirmState({
      open: true,
      type: 'account',
      entity: account,
    })
  }

  const renderContent = () => {
    const pageProps = {
      accounts,
      admins,
      accountStatuses: reminders.accountStatuses,
      adminStatuses: reminders.adminStatuses,
    }

    switch (activeView) {
      case 'accounts':
        return (
          <AccountList
            {...pageProps}
            onCreateAccount={openCreateAccountModal}
            onEditAccount={openEditAccountModal}
            onDeleteAccount={requestDeleteAccount}
          />
        )
      case 'admins':
        return (
          <AdminList
            admins={admins}
            adminStatuses={reminders.adminStatuses}
            onEditAdmin={openEditAdminModal}
            onDeleteAdmin={requestDeleteAdmin}
          />
        )
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
            onCreateAccount={openCreateAccountModal}
            onEditAccount={openEditAccountModal}
            onDeleteAccount={requestDeleteAccount}
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

  const closeAdminModal = () => {
    if (isAdminSubmitting) {
      return
    }
    setAdminModalState({ open: false, mode: 'create', admin: null })
    setAdminSubmitError(null)
  }

  const closeAccountModal = () => {
    if (isAccountSubmitting) {
      return
    }
    setAccountModalState({ open: false, mode: 'create', account: null })
    setAccountSubmitError(null)
  }

  const handleAdminSubmit = async (payload) => {
    try {
      setIsAdminSubmitting(true)
      setAdminSubmitError(null)
      if (adminModalState.mode === 'edit' && adminModalState.admin) {
        await updateAdmin(adminModalState.admin.id, payload)
      } else {
        await addAdmin(payload)
      }
      closeAdminModal()
    } catch (submitError) {
      setAdminSubmitError(submitError?.message ?? t('adminForm.failure'))
    } finally {
      setIsAdminSubmitting(false)
    }
  }

  const handleAccountSubmit = async (payload) => {
    try {
      setIsAccountSubmitting(true)
      setAccountSubmitError(null)
      if (accountModalState.mode === 'edit' && accountModalState.account) {
        await updateAccount(accountModalState.account.id, payload)
      } else {
        await addAccount(payload)
      }
      closeAccountModal()
    } catch (submitError) {
      setAccountSubmitError(submitError?.message ?? t('accountForm.failure'))
    } finally {
      setIsAccountSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!confirmState.open || !confirmState.entity) {
      return
    }
    try {
      setIsDeleting(true)
      setConfirmError(null)
      if (confirmState.type === 'admin') {
        await deleteAdmin(confirmState.entity.id)
      } else if (confirmState.type === 'account') {
        await deleteAccount(confirmState.entity.id)
      }
      setConfirmState({ open: false, type: null, entity: null })
    } catch (err) {
      setConfirmError(err?.message ?? t('confirm.failure'))
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmTitle =
    confirmState.type === 'admin'
      ? t('confirm.deleteAdminTitle')
      : confirmState.type === 'account'
      ? t('confirm.deleteAccountTitle')
      : ''

  const confirmDescription =
    confirmState.type === 'admin'
      ? t('confirm.deleteAdminDescription', [confirmState.entity?.name ?? ''])
      : confirmState.type === 'account'
      ? t('confirm.deleteAccountDescription', [confirmState.entity?.name ?? ''])
      : ''

  const toggleLanguageMenu = () => {
    setIsLangMenuOpen((prev) => !prev)
  }

  const handleLanguageSelect = (code) => {
    setLanguage(code)
    setIsLangMenuOpen(false)
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
              <p className="text-sm font-semibold text-slate-800">{t('common.appName')}</p>
              <p className="text-xs text-slate-500">{t('common.appTagline')}</p>
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
                <h1 className="text-lg font-semibold text-slate-800">{t('common.appName')}</h1>
                <p className="text-xs text-slate-500">{t('common.appTagline')}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  type="search"
                  placeholder={t('common.searchPlaceholder')}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 sm:w-64"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openCreateAccountModal}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                >
                  {t('common.addAccount')}
                </button>
                <button
                  type="button"
                  onClick={openCreateAdminModal}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {t('common.addAdmin')}
                </button>
              </div>
            </div>
            <div className="relative flex flex-col items-end gap-2" ref={langMenuRef}>
              <button
                type="button"
                onClick={toggleLanguageMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                aria-label={t('common.languageLabel')}
              >
                {lang === 'zh' ? 'EN' : 'ZH'}
              </button>
              {isLangMenuOpen ? (
                <div className="absolute right-0 top-11 z-10 w-32 rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-card">
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => handleLanguageSelect(option.code)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-slate-50 ${
                        option.code === lang ? 'font-semibold text-slate-800' : 'text-slate-600'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span className="text-xs text-slate-400">{option.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl p-6">{renderContent()}</div>
          </main>
        </div>
      </div>
      <div
        className={`fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-card ${statusBadgeStyles[dataStatus.tone]}`}
      >
        <span>{dataStatus.message}</span>
        {isSupabaseEnabled ? (
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-transparent bg-white/30 px-2 py-0.5 text-xs text-slate-600 transition hover:bg-white/60"
          >
            {t('common.refresh')}
          </button>
        ) : null}
      </div>
      <AdminFormModal
        open={adminModalState.open}
        mode={adminModalState.mode}
        initialData={adminModalState.admin}
        onClose={closeAdminModal}
        onSubmit={handleAdminSubmit}
        isSubmitting={isAdminSubmitting}
        submitError={adminSubmitError}
        isSupabaseEnabled={isSupabaseEnabled}
      />
      <AccountFormModal
        open={accountModalState.open}
        mode={accountModalState.mode}
        initialData={accountModalState.account}
        adminOptions={adminOptions}
        onClose={closeAccountModal}
        onSubmit={handleAccountSubmit}
        isSubmitting={isAccountSubmitting}
        submitError={accountSubmitError}
        isSupabaseEnabled={isSupabaseEnabled}
      />
      <ConfirmDialog
        open={confirmState.open}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={t('common.confirmDelete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (isDeleting) {
            return
          }
          setConfirmState({ open: false, type: null, entity: null })
          setConfirmError(null)
        }}
        isProcessing={isDeleting}
        errorMessage={confirmError}
      />
    </div>
  )
}

export default App
