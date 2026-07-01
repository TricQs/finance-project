export type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  currency: string
  locale: string
  timezone: string
  role: 'user' | 'admin'
  is_premium: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Account = {
  id: string
  user_id: string
  name: string
  type: 'bank' | 'ewallet' | 'cash' | 'investment' | 'other'
  institution: string | null
  account_number: string | null
  balance: number
  currency: string
  color: string
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TransactionType = 'income' | 'expense'

export type Transaction = {
  id: string
  user_id: string
  account_id: string | null
  type: TransactionType
  amount: number
  category: string
  description: string | null
  date: string
  receipt_url: string | null
  is_recurring: boolean
  recurring_interval: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  created_at: string
  updated_at: string
}

export type Transfer = {
  id: string
  user_id: string
  from_account_id: string | null
  to_account_id: string | null
  amount: number
  description: string | null
  date: string
  created_at: string
}

export type InvestmentType = 'gold' | 'stock' | 'crypto' | 'mutual_fund' | 'other'

export type Investment = {
  id: string
  user_id: string
  type: InvestmentType
  name: string
  ticker: string | null
  platform: string | null
  quantity: number
  buy_price: number
  buy_date: string
  notes: string | null
  is_sold: boolean
  sold_price: number | null
  sold_date: string | null
  created_at: string
}

export type Goal = {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  icon: string
  color: string
  is_completed: boolean
  created_at: string
}

export type Debt = {
  id: string
  user_id: string
  type: 'debt' | 'receivable'
  contact_name: string
  original_amount: number
  remaining_amount: number
  due_date: string | null
  description: string | null
  is_settled: boolean
  created_at: string
}

export type Budget = {
  id: string
  user_id: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  month: number | null
  year: number
  created_at: string
}

// Auth types
export type AuthError = {
  message: string
}