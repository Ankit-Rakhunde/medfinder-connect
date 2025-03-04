
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
}>({
  expanded: true,
  setExpanded: () => {},
})

function SidebarProvider({
  children,
  defaultExpanded = true,
}: {
  children: React.ReactNode
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  return React.useContext(SidebarContext)
}

function Sidebar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useSidebar()
  return (
    <aside
      className={cn(
        "relative flex h-full flex-col overflow-y-auto bg-sidebar-background text-sidebar-foreground border-border transition-all duration-300 ease-in-out",
        expanded ? "w-64" : "w-14",
        className
      )}
      data-expanded={expanded}
      {...props}
    >
      {children}
    </aside>
  )
}

function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useSidebar()
  return (
    <div
      className={cn(
        "flex h-16 items-center gap-2 px-3 font-semibold",
        expanded ? "justify-start" : "justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-3 py-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useSidebar()
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t bg-sidebar-background p-2",
        expanded ? "justify-start" : "justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("pb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarGroupLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useSidebar()
  return expanded ? (
    <div
      className={cn("mb-1 px-2 text-xs font-semibold text-sidebar-foreground/70", className)}
      {...props}
    >
      {children}
    </div>
  ) : null
}

function SidebarGroupContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("space-y-1", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarMenu({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("", className)}
      {...props}
    >
      <ul className="space-y-1">
        {children}
      </ul>
    </nav>
  )
}

function SidebarMenuItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("", className)} {...props}>
      {children}
    </li>
  )
}

interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  active?: boolean
  asChild?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, active, asChild = false, children, ...props }, ref) => {
    const { expanded } = useSidebar()
    const Comp = asChild ? React.Fragment : "button"
    const childProps = asChild ? { children } : {}
    
    return (
      <Comp {...childProps}>
        <button
          ref={ref}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            expanded ? "justify-start" : "justify-center",
            active && "bg-sidebar-accent text-sidebar-accent-foreground",
            className
          )}
          {...props}
        >
          {expanded ? (
            children
          ) : (
            <SidebarIcon expanded={expanded}>{children}</SidebarIcon>
          )}
        </button>
      </Comp>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

function SidebarTrigger({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const { expanded, setExpanded } = useSidebar()
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border bg-background px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        className
      )}
      onClick={() => setExpanded(!expanded)}
      {...props}
    >
      {expanded ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

// This helper component extracts the first icon from children
function SidebarIcon({ expanded, children }: { expanded: boolean, children: React.ReactNode }) {
  // Find the first icon (lucide-react icon)
  const iconChild = React.Children.toArray(children).find(
    (child) => 
      React.isValidElement(child) && 
      child.props && 
      child.props.className && 
      typeof child.props.className === 'string' && 
      child.props.className.includes('lucide')
  );

  // Return the icon if found, otherwise return first child
  return (
    <div className="flex justify-center">
      {iconChild || React.Children.toArray(children)[0]}
    </div>
  );
}

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
