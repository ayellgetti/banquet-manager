import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Strikethrough } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd: string) => {
    document.execCommand(cmd, false);
    ref.current?.focus();
    onChange(ref.current?.innerHTML || "");
  };

  const btn = "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors";

  return (
    <div className={cn("rounded-md border border-input bg-background", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-input p-1 no-print">
        <button type="button" className={btn} onClick={() => exec("bold")} aria-label="Bold"><Bold className="h-4 w-4" /></button>
        <button type="button" className={btn} onClick={() => exec("italic")} aria-label="Italic"><Italic className="h-4 w-4" /></button>
        <button type="button" className={btn} onClick={() => exec("underline")} aria-label="Underline"><Underline className="h-4 w-4" /></button>
        <button type="button" className={btn} onClick={() => exec("strikeThrough")} aria-label="Strikethrough"><Strikethrough className="h-4 w-4" /></button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" className={btn} onClick={() => exec("insertUnorderedList")} aria-label="Bullet list"><List className="h-4 w-4" /></button>
        <button type="button" className={btn} onClick={() => exec("insertOrderedList")} aria-label="Numbered list"><ListOrdered className="h-4 w-4" /></button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="min-h-[160px] w-full px-3 py-2 text-sm outline-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
      />
    </div>
  );
}