import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DynamicAutoSelectProps {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function DynamicAutoSelect({
  options,
  value,
  onSelect,
  placeholder = "Select option...",
  emptyMessage = "No results found.",
  className
}: DynamicAutoSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 border-input bg-background font-normal px-3 hover:bg-accent hover:text-accent-foreground transition-colors text-left font-sans",
            !selectedOption && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-200">
        <Command className="bg-transparent">
          <div className="flex items-center border-b px-3">
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              className="h-10 border-none focus:ring-0 placeholder:text-muted-foreground"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup className="p-1">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option.value)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start px-2 py-1.5 cursor-pointer rounded-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <div className="flex items-center w-full justify-between">
                    <span className="text-sm">
                      {option.label}
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4 opacity-0 transition-opacity",
                        value === option.value && "opacity-100"
                      )}
                    />
                  </div>
                  {option.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {option.description}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

import { Package } from "lucide-react"
