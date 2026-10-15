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

export type PaymentType = 'cash' | 'card'

export type Payment = {
  type: PaymentType
  amount: number
}

export type PaymentResult = {
  discountAmount: number
  cardAmount: number
  cashReceived: number
}

export type Sale = {
  id: number
  date: string
  items: { name: string; price: number; quantity: number }[]
  discountAmount: number
  total: number
  method: 'cash' | 'card' | 'mixed'
  payments: Payment[]
  change?: number
  cashier?: string
}