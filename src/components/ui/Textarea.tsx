'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-autosport-red focus:border-autosport-red resize-none bg-dark-900 text-white placeholder:text-gray-500',
            error ? 'border-red-500' : 'border-dark-600',
            className
          )}
          rows={4}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
