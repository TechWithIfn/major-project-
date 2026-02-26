'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookMarked,
  BookOpenCheck,
  Brain,
  CircleUserRound,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Sparkles,
} from 'lucide-react'

import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface StudentShellProps {
  title: string
  description: string
  children: ReactNode
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'AI Tutor Chat', icon: Brain },
  { href: '/quiz', label: 'Quiz Generator', icon: NotebookPen },
  { href: '/summary', label: 'Summary Mode', icon: Sparkles },
  { href: '/bookmarks', label: 'Saved Bookmarks', icon: BookOpenCheck },
  { href: '/profile', label: 'Student Profile', icon: CircleUserRound },
]

export function StudentShell({ title, description, children }: StudentShellProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon" className="border-r-0">
        <SidebarHeader className="border-b border-sidebar-border/50 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl grad-primary shadow-glow shadow-primary/20">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-base font-bold leading-none tracking-tight">ShikshaSahayak</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Offline AI Intelligence</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="gap-0 py-2">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">Learning Hub</SidebarGroupLabel>
            <SidebarGroupContent className="mt-2 px-2">
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label} className={cn(
                        "h-10 transition-all duration-200",
                        active ? "bg-primary/10 text-primary hover:bg-primary/15" : "hover:bg-muted"
                      )}>
                        <Link href={item.href} className="flex items-center gap-3">
                          <Icon className={cn("h-4.5 w-4.5", active ? "text-primary" : "text-muted-foreground")} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/50 p-4">
          <div className="flex flex-col gap-4 group-data-[collapsible=icon]:hidden">
            <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
              <p className="text-xs font-semibold text-primary">Pro Tip</p>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                Use "Summary Mode" for quick chapter revisions before exams.
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between group-data-[collapsible=icon]:hidden">
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background grad-surface">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-muted" />
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-tight sm:text-base">{title}</h1>
              <p className="hidden text-[11px] text-muted-foreground font-medium sm:block">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="hidden rounded-full px-4 h-9 font-medium sm:inline-flex border-primary/20 bg-transparent text-primary hover:bg-primary/5 hover:text-primary">
              <Link href="/chat" className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5" />
                Ask My Tutor
              </Link>
            </Button>
            <div className="h-8 w-8 rounded-full grad-primary flex items-center justify-center text-[10px] font-bold text-white shadow-soft">
              IS
            </div>
          </div>
        </header>

        <main id="main-content" className="relative flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
