import React from 'react'
import { CurrencyNumbers } from "@/components/CurrencyNumbers";

type CurrencyBadgeProps = {
  amount: number
  className?: string
}

const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({ amount, className }) => {
  return (
    <span className={className}>
      <CurrencyNumbers amount={amount} />
    </span>
  )
}

export default CurrencyBadge
