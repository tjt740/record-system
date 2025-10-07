import { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'

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
          status: status?.label ?? '正常',
          expiresOn: account.expirationDate,
        },
      }
    })

    const adminEvents = admins.map((admin) => {
      const status = adminStatuses[admin.id]
      return {
        id: admin.id,
        title: `${admin.name}（管理员）`,
        start: admin.startDate,
        end: admin.expirationDate,
        display: 'background',
        backgroundColor: colorPalette.reminder + '30',
        borderColor: colorPalette.reminder,
        extendedProps: {
          type: 'admin',
          status: status?.label ?? '提醒',
          expiresOn: admin.expirationDate,
        },
      }
    })

    return [...adminEvents, ...accountEvents]
  }, [accounts, admins, accountStatuses, adminStatuses])

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card border border-slate-200">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold text-slate-800">授权日历</h2>
        <div className="flex gap-3 text-sm text-slate-500">
          <LegendDot color={colorPalette.expired} label="已过期" />
          <LegendDot color={colorPalette.expiring} label="即将过期" />
          <LegendDot color={colorPalette.normal} label="正常" />
          <LegendDot color={colorPalette.reminder} label="管理员提醒" />
        </div>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dayMaxEventRows={3}
        events={events}
        height="auto"
        displayEventTime={false}
        locale={zhCnLocale}
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
