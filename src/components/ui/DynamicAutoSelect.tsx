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
            "w-full justify-between h-12 border-2 rounded-2xl bg-background font-bold px-4 hover:bg-muted/10 transition-all text-left",
            !selectedOption && "text-muted-foreground font-medium",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border-2 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command className="bg-background">
          <div className="flex items-center border-b-2 px-3">
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              className="h-11 border-none focus:ring-0 font-bold placeholder:font-medium placeholder:text-muted-foreground/50"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto scrollbar-hide">
            <CommandEmpty className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Package className="h-8 w-8 text-muted-foreground opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{emptyMessage}</p>
              </div>
            </CommandEmpty>
            <CommandGroup className="p-2">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option.value)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer rounded-xl data-[selected=true]:bg-primary data-[selected=true]:text-white transition-all mb-1 last:mb-0 group"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-black text-xs uppercase tracking-tight transition-colors">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter opacity-60 group-data-[selected=true]:text-white/80">
                        {option.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {value === option.value && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse group-data-[selected=true]:bg-white" />
                    )}
                    <Check
                      className={cn(
                        "h-4 w-4 text-primary transition-all scale-75 opacity-0 group-data-[selected=true]:text-white",
                        value === option.value && "opacity-100 scale-100"
                      )}
                    />
                  </div>
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
