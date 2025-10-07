import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

const AccountTable = ({
  accounts = [],
  admins = [],
  accountStatuses = {},
  title = '账号列表',
  subtitle,
  actions,
}) => {
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
        authorizedByName: adminLookup[account.authorizedBy] ?? 'Unknown',
        status: accountStatuses[account.id],
      })),
    [accounts, adminLookup, accountStatuses],
  )

  const columns = useMemo(
    () => [
      {
        header: '账号名称',
        accessorKey: 'name',
        cell: (info) => (
          <div className="font-medium text-slate-800">{info.getValue()}</div>
        ),
      },
      {
        header: '授权管理员',
        accessorKey: 'authorizedByName',
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      },
      {
        header: '到期日期',
        accessorKey: 'expirationDate',
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      },
      {
        header: '状态',
        accessorKey: 'status',
        cell: (info) => {
          const status = info.getValue()
          if (!status) {
            return <span className="text-slate-500">未知</span>
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
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
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
                  当前筛选暂无账号数据。
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
