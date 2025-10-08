import { useI18n } from '../i18n/I18nProvider.jsx'

const OverviewMetrics = ({ metrics = [], title, className = '' }) => {
  const { t } = useI18n()
  const resolvedTitle = title ?? t('common.overview')
  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <p className="text-xs font-semibold tracking-wide text-slate-400">{resolvedTitle}</p>
      <div className="mt-3 space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-xs text-slate-500">{metric.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-800">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OverviewMetrics
