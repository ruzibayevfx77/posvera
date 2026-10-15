import { useSaleStore } from '../salesStore'
import { useFormat, useT } from '../i18n'
import type { PaymentType } from '../types'

function SalesPage() {
  const t = useT()
  const format = useFormat()
  const sales = useSaleStore((state) => state.sales)

  const paymentLabel = (type: PaymentType) =>
    t(type === 'cash' ? 'pay.cash' : 'pay.card')

  const revenue = sales.reduce((sum, s) => sum + s.total, 0)

  const sumByType = (type: PaymentType) =>
    sales.reduce(
      (sum, s) =>
        sum +
        s.payments
          .filter((p) => p.type === type)
          .reduce((acc, p) => acc + p.amount, 0),
      0
    )

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">{t('sales.title')}</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">{t('sales.count')}</p>
          <p className="text-3xl font-bold">{sales.length}</p>
        </div>
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">{t('sales.revenue')}</p>
          <p className="text-2xl font-bold text-emerald-400">
            {format.money(revenue)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">{t('pay.cash')}</p>
          <p className="text-2xl font-bold">{format.money(sumByType('cash'))}</p>
        </div>
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">{t('pay.card')}</p>
          <p className="text-2xl font-bold">{format.money(sumByType('card'))}</p>
        </div>
      </div>

      <div className="space-y-3">
        {sales.length === 0 && <p className="text-slate-400">{t('sales.empty')}</p>}
        {sales.map((sale) => (
          <div key={sale.id} className="rounded-xl bg-slate-800 p-4">
            <div className="flex justify-between text-sm text-slate-400">
              <span>{format.date(sale.date)}</span>
              <span>
                {sale.cashier ? `${sale.cashier} • ` : ''}
                {sale.payments
                  .map((p) => `${paymentLabel(p.type)} ${format.number(p.amount)}`)
                  .join(' + ')}
              </span>
            </div>
            <ul className="my-2 space-y-1">
              {sale.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{format.number(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-slate-400">
                {sale.discountAmount > 0
                  ? `${t('sales.discount')} ${format.number(sale.discountAmount)}`
                  : ''}
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {format.money(sale.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SalesPage