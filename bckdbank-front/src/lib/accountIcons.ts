import { CreditCard, PiggyBank, Wallet } from 'lucide-react'
import type { AccountType } from './api'

export const accountIcons: Record<AccountType, typeof Wallet> = {
  SAVINGS: PiggyBank,
  CHECKING: Wallet,
  CREDIT: CreditCard,
}
