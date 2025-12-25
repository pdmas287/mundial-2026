import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full bg-white/10 border-2 border-white/20 rounded-lg px-4 py-3 text-white',
          'placeholder:text-white/50 focus:outline-none focus:border-yellow-400 focus:shadow-lg',
          'focus:shadow-yellow-400/30 transition-all duration-300',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
