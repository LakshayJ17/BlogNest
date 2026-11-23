import { KeyboardEvent, ReactNode, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

export interface MenuItem {
  label: string;
  icon?: Icon;
  onSelect?: () => void;
  /** Internal route */
  to?: string;
  /** External URL, opens in a new tab */
  href?: string;
  tone?: "danger";
  hidden?: boolean;
  className?: string;
}

interface MenuProps {
  /** Accessible name for the trigger button */
  label: string;
  trigger: ReactNode;
  items: MenuItem[];
  header?: ReactNode;
  triggerClassName?: string;
  align?: "start" | "end";
  placement?: "bottom" | "top";
}

const itemClass =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink-soft " +
  "hover:bg-bone focus:bg-bone focus:outline-none";

/** Dropdown menu with keyboard support: arrows to move, Escape to close. */
export function Menu({
  label,
  trigger,
  items,
  header,
  triggerClassName,
  align = "end",
  placement = "bottom",
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const elements = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const index = elements.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % elements.length;
    if (event.key === "ArrowUp") next = (index - 1 + elements.length) % elements.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = elements.length - 1;
    if (event.key === "Tab") setOpen(false);
    if (next >= 0) {
      event.preventDefault();
      elements[next]?.focus();
    }
  };

  const close = () => setOpen(false);
  const visibleItems = items.filter((item) => !item.hidden);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={cn(
            "absolute z-50 min-w-52 rounded-lg border border-line bg-surface p-1 shadow-float",
            align === "end" ? "right-0" : "left-0",
            placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          )}
        >
          {header}
          {visibleItems.map((item) => {
            const ItemIcon = item.icon;
            const content = (
              <>
                {ItemIcon && <ItemIcon size={16} aria-hidden="true" className="shrink-0 opacity-70" />}
                {item.label}
              </>
            );
            const className = cn(itemClass, item.tone === "danger" && "text-tag-red hover:bg-tag-red-bg focus:bg-tag-red-bg", item.className);

            if (item.to) {
              return (
                <Link key={item.label} role="menuitem" to={item.to} onClick={close} className={className}>
                  {content}
                </Link>
              );
            }
            if (item.href) {
              return (
                <a
                  key={item.label}
                  role="menuitem"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className={className}
                >
                  {content}
                </a>
              );
            }
            return (
              <button
                key={item.label}
                role="menuitem"
                type="button"
                onClick={() => {
                  close();
                  item.onSelect?.();
                }}
                className={className}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
