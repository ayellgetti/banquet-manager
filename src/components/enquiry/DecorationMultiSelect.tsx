import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DecorationOption = {
  id: string;
  name: string;
};

type Props = {
  options: DecorationOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  invalid?: boolean;
};

export const DecorationMultiSelect = ({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search…",
  emptyLabel = "No options found.",
  invalid,
}: Props) => {
  const [open, setOpen] = useState(false);
  const selected = options.filter((option) => value.includes(option.id));

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  };

  const remove = (id: string) => {
    onChange(value.filter((item) => item !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-10 w-full justify-between px-3 py-2 font-normal",
            invalid && "border-destructive",
            !selected.length && "text-muted-foreground",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-left">
            {selected.length === 0 ? (
              <span>{placeholder}</span>
            ) : (
              selected.map((option) => (
                <Badge
                  key={option.id}
                  variant="secondary"
                  className="gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                >
                  {option.name}
                  <button
                    type="button"
                    className="rounded-sm hover:bg-muted"
                    onClick={(event) => {
                      event.stopPropagation();
                      remove(option.id);
                    }}
                    aria-label={`Remove ${option.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.id} value={option.name} onSelect={() => toggle(option.id)}>
                  <Check className={cn("mr-2 h-4 w-4", value.includes(option.id) ? "opacity-100" : "opacity-0")} />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
