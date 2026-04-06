import React from 'react'

type CurrencyBadgeProps = {
  amount: number
  currencyCode?: string
  className?: string
}

const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({ amount, currencyCode, className }) => {
  const code = currencyCode ?? 'USD'
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  return (
    <span className={className}>
      {formatted} {code}
    </span>
  )
}

export default CurrencyBadge
