export type Product = {
  id: number
  name: string
  price: number
  category: string
  stock: number
}

export type CartItem = Product & {
  quantity: number
}

export type PaymentResult = {
  method: 'cash' | 'card'
  discountAmount: number
  finalTotal: number
}

export type Sale = {
  id: number
  date: string
  items: { name: string; price: number; quantity: number }[]
  discountAmount: number
  total: number
  method: 'cash' | 'card'
  cashier?: string
}