import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useI18n } from '../i18n/I18nProvider.jsx'

const AccountTable = ({
  accounts = [],
  admins = [],
  accountStatuses = {},
  title,
  subtitle,
  actions,
  onEditAccount,
  onDeleteAccount,
}) => {
  const { t } = useI18n()
  const adminLookup = useMemo(
    () =>
      admins.reduce((acc, admin) => {
        acc[admin.id] = admin.name
        return acc
      }, {}),
    [admins],
  )

  const data = useMemo(
    () =>
      accounts.map((account) => ({
        ...account,
        authorizedByName: account.authorizedBy
          ? adminLookup[account.authorizedBy] ?? t('common.notLinked')
          : t('common.notLinked'),
        status: accountStatuses[account.id],
      })),
    [accounts, adminLookup, accountStatuses],
  )

  const columns = useMemo(() => {
    const baseColumns = [
      {
        header: t('tables.accountName'),
        accessorKey: 'name',
        cell: (info) => (
          <div className="font-medium text-slate-800">{info.getValue()}</div>
        ),
      },
      {
        header: t('tables.authorizedBy'),
        accessorKey: 'authorizedByName',
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      },
      {
        header: t('tables.expirationDate'),
        accessorKey: 'expirationDate',
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      },
      {
        header: t('tables.status'),
        accessorKey: 'status',
        cell: (info) => {
          const status = info.getValue()
          if (!status) {
            return <span className="text-slate-500">{t('statusLabels.normal')}</span>
          }
          return (
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${status.badgeClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
              {status.label}
            </span>
          )
        },
      },
    ]

    if (onEditAccount || onDeleteAccount) {
      baseColumns.push({
        id: 'actions',
        header: t('tables.actions'),
        cell: (info) => {
          const account = info.row.original
          return (
            <div className="flex flex-wrap gap-2">
              {onEditAccount ? (
                <button
                  type="button"
                  onClick={() => onEditAccount(account)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-slate-300 hover:text-slate-800"
                >
                  {t('common.edit')}
                </button>
              ) : null}
              {onDeleteAccount ? (
                <button
                  type="button"
                  onClick={() => onDeleteAccount(account)}
                  className="rounded-full border border-status-expired/40 bg-status-expired/10 px-3 py-1 text-xs text-status-expired hover:bg-status-expired/20"
                >
                  {t('common.delete')}
                </button>
              ) : null}
            </div>
          )
        },
      })
    }

    return baseColumns
  }, [onEditAccount, onDeleteAccount, t])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const resolvedTitle = title ?? t('accountList.tableTitle')
  const resolvedSubtitle = subtitle !== undefined ? subtitle : t('accountList.tableSubtitle')

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{resolvedTitle}</h2>
          {resolvedSubtitle ? (
            <p className="text-sm text-slate-500">{resolvedSubtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-slate-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  {t('tables.emptyAccounts')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AccountTable
