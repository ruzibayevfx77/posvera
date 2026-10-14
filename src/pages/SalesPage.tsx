import { useSaleStore } from '../salesStore'

function SalesPage() {
  const sales = useSaleStore((state) => state.sales)

  const revenue = sales.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Sotuvlar tarixi</h1>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">Sotuvlar soni</p>
          <p className="text-3xl font-bold">{sales.length}</p>
        </div>
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-slate-400">Umumiy tushum</p>
          <p className="text-3xl font-bold text-emerald-400">
            {revenue.toLocaleString()} so'm
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sales.length === 0 && (
          <p className="text-slate-400">Hali sotuv bo'lmagan</p>
        )}
        {sales.map((sale) => (
          <div key={sale.id} className="rounded-xl bg-slate-800 p-4">
            <div className="flex justify-between text-sm text-slate-400">
              <span>{new Date(sale.date).toLocaleString()}</span>
              <span>{sale.method === 'cash' ? 'Naqd' : 'Karta'}</span>
            </div>
            <ul className="my-2 space-y-1">
              {sale.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-slate-400">
                {sale.discountAmount > 0
                  ? `Chegirma: ${sale.discountAmount.toLocaleString()}`
                  : ''}
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {sale.total.toLocaleString()} so'm
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SalesPage