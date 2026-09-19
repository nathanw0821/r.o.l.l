"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Touch-aware tooltip.
 *
 * Radix Tooltip opens on hover and keyboard focus only; by design it never opens on
 * touch, which left the builder's calculation breakdowns unreachable on phones.
 * These wrappers keep the Radix behaviour for mouse and keyboard, and add
 * tap-to-toggle for touch and pen: a tap on the trigger opens the content, a second
 * tap on the trigger or a tap anywhere else closes it. Every existing
 * `<Tooltip><TooltipTrigger/><TooltipContent/></Tooltip>` gets this for free.
 */
type TapToggleContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const TapToggleContext = React.createContext<TapToggleContextValue | null>(null);

function Tooltip({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange]
  );
  const value = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <TapToggleContext.Provider value={value}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </TapToggleContext.Provider>
  );
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onPointerDown, onClick, ...props }, ref) => {
  const context = React.useContext(TapToggleContext);
  const tapRef = React.useRef<{ touch: boolean; wasOpen: boolean }>({ touch: false, wasOpen: false });

  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      {...props}
      onPointerDown={(event) => {
        // Record the state before Radix closes an open tooltip on pointer down.
        tapRef.current = {
          touch: event.pointerType === "touch" || event.pointerType === "pen",
          wasOpen: context?.open ?? false
        };
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !context || !tapRef.current.touch) return;
        // Stop Radix's own click handler from closing the tooltip we are opening.
        event.preventDefault();
        context.setOpen(!tapRef.current.wasOpen);
        tapRef.current.touch = false;
      }}
    />
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, collisionPadding = 8, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    collisionPadding={collisionPadding}
    className={cn(
      "z-[10000] overflow-hidden rounded-md border border-border/80 bg-[#0c1014] px-3 py-1.5 text-xs text-foreground shadow-2xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-w-[min(280px,calc(100vw-16px))] break-words opacity-100",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

export function InfoTooltip({ content, label = "More information" }: { content: React.ReactNode; label?: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className="touch-hit inline-flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-[0.78rem] font-bold hover:bg-foreground/20 transition-colors"
          >
            i
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
