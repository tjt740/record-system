import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const parseDate = (value) => new Date(`${value}T00:00:00`)

const calculateAuthorizedSpan = (startDate, expirationDate) => {
  const start = parseDate(startDate)
  const end = parseDate(expirationDate)
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)
}

export const useReminders = (accounts = [], admins = [], referenceDate = new Date()) => {
  const { t } = useI18n()

  return useMemo(() => {
    const statusMap = {
      normal: {
        key: 'normal',
        label: t('statusLabels.normal'),
        badgeClass: 'bg-status-normal/10 text-status-normal',
        dotClass: 'bg-status-normal',
      },
      expiring: {
        key: 'expiring',
        label: t('statusLabels.expiring'),
        badgeClass: 'bg-status-expiring/10 text-status-expiring',
        dotClass: 'bg-status-expiring',
      },
      expired: {
        key: 'expired',
        label: t('statusLabels.expired'),
        badgeClass: 'bg-status-expired/10 text-status-expired',
        dotClass: 'bg-status-expired',
      },
      reminder: {
        key: 'reminder',
        label: t('statusLabels.reminder'),
        badgeClass: 'bg-status-reminder/10 text-status-reminder',
        dotClass: 'bg-status-reminder',
      },
    }

    const getStatus = (expirationDate, today) => {
      const normalizedToday = new Date(today)
      normalizedToday.setHours(0, 0, 0, 0)
      const target = parseDate(expirationDate)
      const diffMs = target.getTime() - normalizedToday.getTime()
      const diffDays = Math.ceil(diffMs / MS_PER_DAY)

      if (diffDays < 0) {
        return { ...statusMap.expired, daysRemaining: diffDays }
      }

      if (diffDays <= 3) {
        return { ...statusMap.expiring, daysRemaining: diffDays }
      }

      return { ...statusMap.normal, daysRemaining: diffDays }
    }

    const today = new Date(referenceDate)
    today.setHours(0, 0, 0, 0)

    const adminLookup = admins.reduce((acc, admin) => {
      acc[admin.id] = admin.name
      return acc
    }, {})

    const accountStatuses = {}
    const adminStatuses = {}
    const byDate = {}
    const accountReminders = []
    const adminReminders = []
    const replacementSuggestions = []

    accounts.forEach((account) => {
      const status = getStatus(account.expirationDate, today)
      accountStatuses[account.id] = status
      const authorizedByName = adminLookup[account.authorizedBy] ?? t('reminders.unknownAdmin')

      if (status.key !== 'normal') {
        accountReminders.push({
          id: `${account.id}-reminder`,
          type: 'account',
          status,
          message:
            status.key === 'expired'
              ? t('reminders.accountExpired', [account.name])
              : t('reminders.accountExpiring', [account.name, status.daysRemaining]),
          account: {
            ...account,
            authorizedByName,
          },
        })
      }

      const expiryKey = account.expirationDate
      if (!byDate[expiryKey]) {
        byDate[expiryKey] = []
      }
      byDate[expiryKey].push({
        ...account,
        authorizedByName,
      })
    })

    admins.forEach((admin) => {
      const status = getStatus(admin.expirationDate, today)
      adminStatuses[admin.id] = status

      if (status.key !== 'normal') {
        adminReminders.push({
          id: `${admin.id}-reminder`,
          type: 'admin',
          status: statusMap.reminder,
          message:
            status.key === 'expired'
              ? t('reminders.adminExpired', [admin.name, admin.expirationDate])
              : t('reminders.adminExpiring', [admin.name, status.daysRemaining]),
          admin,
        })
      }

      const span = calculateAuthorizedSpan(admin.startDate, admin.expirationDate)
      if (span > 12 || status.key !== 'normal') {
        replacementSuggestions.push({
          id: `${admin.id}-replacement`,
          type: 'replacement',
          status: statusMap.reminder,
          message:
            span > 12
              ? t('reminders.replacementOverLimit', [admin.name])
              : t('reminders.replacementUpcoming', [admin.name, admin.expirationDate]),
          admin,
        })
      }
    })

    const getAccountsExpiringOn = (dateString) => byDate[dateString] ?? []

    return {
      today,
      accountStatuses,
      adminStatuses,
      accountReminders,
      adminReminders,
      replacementSuggestions,
      getAccountsExpiringOn,
      statusMap,
    }
  }, [accounts, admins, referenceDate, t])
}
