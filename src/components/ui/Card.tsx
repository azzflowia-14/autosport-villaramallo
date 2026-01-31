import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-dark-800 rounded-xl border border-dark-700 overflow-hidden', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-dark-700', className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('px-6 py-4 bg-dark-900 border-t border-dark-700', className)}>
      {children}
    </div>
  )
}
