import { useState } from 'react'
import type { PaymentResult } from './types'

type Props = {
  total: number
  onClose: () => void
  onSuccess: (result: PaymentResult) => void
}

function PaymentModal({ total, onClose, onSuccess }: Props) {
  const [discount, setDiscount] = useState(0)
  const [method, setMethod] = useState<'cash' | 'card'>('cash')
  const [received, setReceived] = useState(0)

  const discountAmount = Math.round((total * discount) / 100)
  const finalTotal = total - discountAmount
  const change = received - finalTotal
  const canPay = method === 'card' || received >= finalTotal

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-6 text-white">
        <h2 className="mb-4 text-2xl font-bold">To'lov</h2>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Summa:</span>
            <span>{total.toLocaleString()} so'm</span>
          </div>

          <div className="flex items-center justify-between">
            <span>Chegirma (%):</span>
            <input
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) =>
                setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))
              }
              className="w-20 rounded bg-slate-700 p-2 text-right outline-none"
            />
          </div>

          <div className="flex justify-between text-xl font-bold text-emerald-400">
            <span>To'lanadi:</span>
            <span>{finalTotal.toLocaleString()} so'm</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setMethod('cash')}
            className={`rounded-lg p-3 font-semibold ${
              method === 'cash' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700'
            }`}
          >
            Naqd
          </button>
          <button
            onClick={() => setMethod('card')}
            className={`rounded-lg p-3 font-semibold ${
              method === 'card' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700'
            }`}
          >
            Karta
          </button>
        </div>

        {method === 'cash' && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span>Berilgan pul:</span>
              <input
                type="number"
                min={0}
                value={received || ''}
                onChange={(e) => setReceived(Number(e.target.value))}
                className="w-40 rounded bg-slate-700 p-2 text-right outline-none"
              />
            </div>
            <div className="flex justify-between">
              <span>Qaytim:</span>
              <span className={change < 0 ? 'text-red-400' : 'text-emerald-400'}>
                {change < 0 ? 'Yetarli emas' : `${change.toLocaleString()} so'm`}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-700 p-3 hover:bg-slate-600"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => onSuccess({ method, discountAmount, finalTotal })}
            disabled={!canPay}
            className="flex-1 rounded-lg bg-emerald-500 p-3 font-bold text-slate-900 hover:bg-emerald-400 disabled:opacity-40"
          >
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal