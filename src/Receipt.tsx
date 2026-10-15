import { useFormat, useT } from './i18n'
import { useSettingsStore } from './settingsStore'
import type { PaymentType, Sale } from './types'

type Props = {
  sale: Sale
  onClose: () => void
}

function Receipt({ sale, onClose }: Props) {
  const t = useT()
  const format = useFormat()
  const settings = useSettingsStore((state) => state.settings)

  const paymentLabel = (type: PaymentType) =>
    t(type === 'cash' ? 'pay.cash' : 'pay.card')

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="max-h-[90vh] overflow-y-auto rounded-xl bg-slate-800 p-6">
        <div
          id="receipt"
          className="w-72 bg-white p-4 font-mono text-sm text-black"
        >
          <h2 className="text-center text-xl font-bold">{settings.shopName}</h2>
          {settings.shopAddress && (
            <p className="text-center text-xs">{settings.shopAddress}</p>
          )}
          {settings.shopPhone && (
            <p className="text-center text-xs">{settings.shopPhone}</p>
          )}
          <p className="text-center">{t('receipt.title')}</p>
          <hr className="my-2 border-dashed border-black" />

          <p>
            {t('receipt.number')} {sale.id}
          </p>
          <p>
            {t('receipt.date')} {format.date(sale.date)}
          </p>
          {sale.cashier && (
            <p>
              {t('receipt.cashier')} {sale.cashier}
            </p>
          )}
          <hr className="my-2 border-dashed border-black" />

          {sale.items.map((item, index) => (
            <div key={index} className="mb-1">
              <p>{item.name}</p>
              <div className="flex justify-between">
                <span>
                  {item.quantity} x {format.number(item.price)}
                </span>
                <span>{format.number(item.quantity * item.price)}</span>
              </div>
            </div>
          ))}
          <hr className="my-2 border-dashed border-black" />

          {sale.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>{t('receipt.discount')}</span>
              <span>-{format.number(sale.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold">
            <span>{t('receipt.total')}</span>
            <span>{format.money(sale.total)}</span>
          </div>
          <hr className="my-2 border-dashed border-black" />

          {sale.payments.map((payment) => (
            <div key={payment.type} className="flex justify-between">
              <span>{paymentLabel(payment.type)}:</span>
              <span>{format.number(payment.amount)}</span>
            </div>
          ))}
          {sale.change ? (
            <div className="flex justify-between">
              <span>{t('pay.change')}</span>
              <span>{format.number(sale.change)}</span>
            </div>
          ) : null}

          <p className="mt-4 text-center">
            {settings.receiptFooter || t('receipt.thanks')}
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-lg bg-emerald-500 p-3 font-bold text-slate-900 hover:bg-emerald-400"
          >
            {t('receipt.print')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-700 p-3 text-white hover:bg-slate-600"
          >
            {t('receipt.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Receipt