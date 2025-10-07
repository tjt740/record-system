import { useMemo } from 'react'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const statusMap = {
  normal: {
    key: 'normal',
    label: '正常',
    badgeClass: 'bg-status-normal/10 text-status-normal',
    dotClass: 'bg-status-normal',
  },
  expiring: {
    key: 'expiring',
    label: '即将过期',
    badgeClass: 'bg-status-expiring/10 text-status-expiring',
    dotClass: 'bg-status-expiring',
  },
  expired: {
    key: 'expired',
    label: '已过期',
    badgeClass: 'bg-status-expired/10 text-status-expired',
    dotClass: 'bg-status-expired',
  },
  reminder: {
    key: 'reminder',
    label: '提醒',
    badgeClass: 'bg-status-reminder/10 text-status-reminder',
    dotClass: 'bg-status-reminder',
  },
}

const parseDate = (value) => new Date(`${value}T00:00:00`)

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

const calculateAuthorizedSpan = (startDate, expirationDate) => {
  const start = parseDate(startDate)
  const end = parseDate(expirationDate)
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)
}

export const useReminders = (accounts = [], admins = [], referenceDate = new Date()) =>
  useMemo(() => {
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
      const authorizedByName = adminLookup[account.authorizedBy] ?? '未知管理员'

      if (status.key !== 'normal') {
        accountReminders.push({
          id: `${account.id}-reminder`,
          type: 'account',
          status,
          message:
            status.key === 'expired'
              ? `${account.name} 的授权已过期。`
              : `${account.name} 将在 ${status.daysRemaining} 天后到期。`,
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
              ? `${admin.name} 的授权窗口已于 ${admin.expirationDate} 关闭。`
              : `${admin.name} 将在 ${status.daysRemaining} 天后到期。`,
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
              ? `${admin.name} 的授权时长超过 12 天，请立即更换。`
              : `请在 ${admin.expirationDate} 前为 ${admin.name} 安排替换人选。`,
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
  }, [accounts, admins, referenceDate])
