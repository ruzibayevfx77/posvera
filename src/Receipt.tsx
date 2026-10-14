import type { Sale } from './types'

type Props = {
  sale: Sale
  onClose: () => void
}

function Receipt({ sale, onClose }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="max-h-[90vh] overflow-y-auto rounded-xl bg-slate-800 p-6">
        <div
          id="receipt"
          className="w-72 bg-white p-4 font-mono text-sm text-black"
        >
          <h2 className="text-center text-xl font-bold">POSVERA</h2>
          <p className="text-center">Sotuv cheki</p>
          <hr className="my-2 border-dashed border-black" />

          <p>Chek raqami: {sale.id}</p>
          <p>Sana: {new Date(sale.date).toLocaleString()}</p>
          {sale.cashier && <p>Kassir: {sale.cashier}</p>}
          <hr className="my-2 border-dashed border-black" />

          {sale.items.map((item, index) => (
            <div key={index} className="mb-1">
              <p>{item.name}</p>
              <div className="flex justify-between">
                <span>
                  {item.quantity} x {item.price.toLocaleString()}
                </span>
                <span>{(item.quantity * item.price).toLocaleString()}</span>
              </div>
            </div>
          ))}
          <hr className="my-2 border-dashed border-black" />

          {sale.discountAmount > 0 && (
            <div className="flex justify-between">
              <span>Chegirma:</span>
              <span>-{sale.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold">
            <span>JAMI:</span>
            <span>{sale.total.toLocaleString()} so'm</span>
          </div>
          <p>To'lov: {sale.method === 'cash' ? 'Naqd' : 'Karta'}</p>

          <p className="mt-4 text-center">Xaridingiz uchun rahmat!</p>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-lg bg-emerald-500 p-3 font-bold text-slate-900 hover:bg-emerald-400"
          >
            Chop etish
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-700 p-3 text-white hover:bg-slate-600"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  )
}

export default Receipt