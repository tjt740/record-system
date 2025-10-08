import { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'
import { useI18n } from '../i18n/I18nProvider.jsx'

const colorPalette = {
  normal: '#22c55e',
  expiring: '#f97316',
  expired: '#ef4444',
  reminder: '#3b82f6',
}

const CalendarView = ({
  accounts = [],
  admins = [],
  accountStatuses = {},
  adminStatuses = {},
  onDateSelect = () => {},
}) => {
  const { t, lang } = useI18n()
  const events = useMemo(() => {
    const accountEvents = accounts.map((account) => {
      const status = accountStatuses[account.id]
      return {
        id: account.id,
        title: account.name,
        start: account.startDate,
        end: account.expirationDate,
        display: 'block',
        backgroundColor: status ? colorPalette[status.key] : colorPalette.normal,
        borderColor: status ? colorPalette[status.key] : colorPalette.normal,
        extendedProps: {
          type: 'account',
          status: status?.label ?? t('statusLabels.normal'),
          expiresOn: account.expirationDate,
        },
      }
    })

    const adminEvents = admins.map((admin) => {
      const status = adminStatuses[admin.id]
      return {
        id: admin.id,
        title: admin.name,
        start: admin.startDate,
        end: admin.expirationDate,
        display: 'background',
        backgroundColor: colorPalette.reminder + '30',
        borderColor: colorPalette.reminder,
        extendedProps: {
          type: 'admin',
          status: status?.label ?? t('statusLabels.reminder'),
          expiresOn: admin.expirationDate,
        },
      }
    })

    return [...adminEvents, ...accountEvents]
  }, [accounts, admins, accountStatuses, adminStatuses, t])

  const calendarLocale = lang === 'zh' ? zhCnLocale : undefined

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card border border-slate-200">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold text-slate-800">{t('dashboard.calendarTitle')}</h2>
        <div className="flex gap-3 text-sm text-slate-500">
          <LegendDot color={colorPalette.expired} label={t('dashboard.legendExpired')} />
          <LegendDot color={colorPalette.expiring} label={t('dashboard.legendExpiring')} />
          <LegendDot color={colorPalette.normal} label={t('dashboard.legendNormal')} />
          <LegendDot color={colorPalette.reminder} label={t('dashboard.legendReminder')} />
        </div>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dayMaxEventRows={3}
        events={events}
        height="auto"
        displayEventTime={false}
        locale={calendarLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        eventDisplay="block"
        dateClick={(info) => onDateSelect(info.dateStr)}
      />
    </div>
  )
}

const LegendDot = ({ color, label }) => (
  <span className="flex items-center gap-1.5">
    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    {label}
  </span>
)

export default CalendarView
