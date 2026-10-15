import { useState } from 'react'
import { useFormat, useT } from './i18n'
import type { PaymentResult } from './types'

type Props = {
  total: number
  saving?: boolean
  onClose: () => void
  onSuccess: (result: PaymentResult) => void
}

type Mode = 'cash' | 'card' | 'mixed'

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000]

function PaymentModal({ total, saving = false, onClose, onSuccess }: Props) {
  const t = useT()
  const format = useFormat()

  const [discount, setDiscount] = useState(0)
  const [mode, setMode] = useState<Mode>('cash')
  const [cardInput, setCardInput] = useState(0)
  const [received, setReceived] = useState(0)

  const modes: { key: Mode; label: string }[] = [
    { key: 'cash', label: t('pay.cash') },
    { key: 'card', label: t('pay.card') },
    { key: 'mixed', label: t('pay.mixed') },
  ]

  const discountAmount = Math.round((total * discount) / 100)
  const finalTotal = total - discountAmount

  // Kartadan qancha olinadi
  const cardAmount =
    mode === 'cash'
      ? 0
      : mode === 'card'
        ? finalTotal
        : Math.min(Math.max(cardInput, 0), finalTotal)

  // Naqd qancha to'lanishi kerak va qaytim
  const cashDue = finalTotal - cardAmount
  const change = received - cashDue
  const canPay = cashDue === 0 || received >= cashDue

  const inputClass =
    'rounded bg-slate-700 p-2 text-right outline-none focus:ring-2 focus:ring-emerald-400'

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-xl bg-slate-800 p-6 text-white">
        <h2 className="mb-4 text-2xl font-bold">{t('pay.title')}</h2>

        {/* Summa va chegirma */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{t('pay.subtotal')}</span>
            <span>{format.money(total)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span>{t('pay.discount')}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) =>
                setDiscount(
                  Math.min(100, Math.max(0, Number(e.target.value) || 0))
                )
              }
              className={`${inputClass} w-20`}
            />
          </div>

          <div className="flex justify-between text-xl font-bold text-emerald-400">
            <span>{t('pay.toPay')}</span>
            <span>{format.money(finalTotal)}</span>
          </div>
        </div>

        {/* To'lov turi */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`rounded-lg p-3 font-semibold ${
                mode === m.key
                  ? 'bg-emerald-500 text-slate-900'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Karta qismi */}
        {mode === 'card' && (
          <div className="mt-4 flex justify-between rounded-lg bg-slate-700 p-3">
            <span>{t('pay.byCard')}</span>
            <span className="font-bold">{format.money(finalTotal)}</span>
          </div>
        )}

        {mode === 'mixed' && (
          <div className="mt-4 space-y-2 rounded-lg bg-slate-700 p-3">
            <div className="flex items-center justify-between">
              <span>{t('pay.byCard')}</span>
              <input
                type="number"
                min={0}
                max={finalTotal}
                value={cardInput || ''}
                onChange={(e) => setCardInput(Number(e.target.value) || 0)}
                className="w-40 rounded bg-slate-600 p-2 text-right outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex justify-between">
              <span>{t('pay.cashDue')}</span>
              <span className="font-bold">{format.money(cashDue)}</span>
            </div>
          </div>
        )}

        {/* Naqd qismi */}
        {cashDue > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span>{t('pay.received')}</span>
              <input
                type="number"
                min={0}
                value={received || ''}
                onChange={(e) => setReceived(Number(e.target.value) || 0)}
                className={`${inputClass} w-40`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setReceived(cashDue)}
                className="col-span-3 rounded bg-slate-700 p-2 hover:bg-slate-600"
              >
                {t('pay.exact', { n: format.number(cashDue) })}
              </button>
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setReceived(amount)}
                  className="rounded bg-slate-700 p-2 text-sm hover:bg-slate-600"
                >
                  {format.number(amount)}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <span>{t('pay.change')}</span>
              <span className={change < 0 ? 'text-red-400' : 'text-emerald-400'}>
                {change < 0 ? t('pay.insufficient') : format.money(change)}
              </span>
            </div>
          </div>
        )}

        {/* Tugmalar */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg bg-slate-700 p-3 hover:bg-slate-600 disabled:opacity-40"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() =>
              onSuccess({
                discountAmount,
                cardAmount,
                cashReceived: cashDue > 0 ? received : 0,
              })
            }
            disabled={!canPay || saving}
            className="flex-1 rounded-lg bg-emerald-500 p-3 font-bold text-slate-900 hover:bg-emerald-400 disabled:opacity-40"
          >
            {saving ? t('pay.saving') : t('pay.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal