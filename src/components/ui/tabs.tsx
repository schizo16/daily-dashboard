import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-orientation={orientation}
      className={cn("flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      className={cn("flex gap-1", className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        "text-[var(--text-3)] hover:text-[var(--text-2)]",
        "data-active:text-[var(--text)] data-active:bg-[var(--surface)] data-active:shadow-sm",
        "outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      className={cn("text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
