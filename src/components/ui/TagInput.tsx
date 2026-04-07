import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TagInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ value, onChange, placeholder, className, ...props }, ref) => {
    const [pendingValue, setPendingValue] = React.useState("")

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim()
      if (trimmedTag && !value.includes(trimmedTag)) {
        onChange([...value, trimmedTag])
      }
      setPendingValue("")
    }

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault()
        addTag(pendingValue)
      } else if (e.key === "Backspace" && !pendingValue && value.length > 0) {
        e.preventDefault()
        removeTag(value[value.length - 1])
      }
    }

    return (
      <div className={cn(
        "flex min-h-[44px] w-full flex-wrap gap-2 rounded-xl border-2 bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-primary/20",
        className
      )}>
        {value.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-0"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 rounded-full outline-none hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={ref}
          className="flex-1 bg-transparent py-1 outline-none placeholder:text-muted-foreground placeholder:font-medium disabled:cursor-not-allowed disabled:opacity-50 min-w-[120px]"
          placeholder={value.length === 0 ? placeholder : ""}
          value={pendingValue}
          onChange={(e) => setPendingValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(pendingValue)}
          {...props}
        />
      </div>
    )
  }
)

TagInput.displayName = "TagInput"
