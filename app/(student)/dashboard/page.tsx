import Link from 'next/link'
import { ArrowRight, BookOpen, BookOpenCheck, Brain, CircleUserRound, ClipboardList, LayoutDashboard, Sparkles } from 'lucide-react'

import { StudentShell } from '@/components/student/student-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { NCERT_SUBJECTS } from '@/lib/curriculum'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  return (
    <StudentShell title="Dashboard" description="Welcome back! Your personal NCERT learning workspace is ready.">
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-4 lg:grid-rows-2">
        <Card className="glass-card premium-indigo-hero gemini-grid-surface overflow-hidden p-8 lg:col-span-3 lg:row-span-1 relative">
          <div className="relative z-10">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Intelligence Engine Active
            </Badge>
            <h2 className="type-premium-title text-3xl text-white">Welcome back, Scholar!</h2>
            <p className="type-premium-body mt-3 max-w-xl text-base text-indigo-100/90 font-medium">
              Your offline AI tutor has analyzed <span className="text-primary font-bold">14 new NCERT chapters</span> since your last session. Ready to master a new concept today?
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="grad-primary shadow-glow h-12 px-8 rounded-xl border-0 font-bold">
                <Link href="/chat" className="gap-2">
                  <Brain className="h-5 w-5" />
                  Start AI Session
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-xl border-border/60 bg-background/50 text-foreground hover:bg-primary/5 hover:border-primary/30 font-bold">
                <Link href="/quiz" className="gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Test Knowledge
                </Link>
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        </Card>

        <Card className="glass-card premium-glass p-6 lg:col-span-1 lg:row-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <LayoutDashboard className="h-5 w-5" />
            <h3 className="font-bold uppercase text-xs tracking-widest">Navigation</h3>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { href: '/summary', label: 'Summary Mode', icon: Sparkles, desc: 'Quick revision notes' },
              { href: '/bookmarks', label: 'Knowledge Hub', icon: BookOpenCheck, desc: 'Your saved pearls' },
              { href: '/profile', label: 'My Profile', icon: CircleUserRound, desc: 'Grade & Subject settings' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 rounded-2xl border border-border/40 bg-background/40 p-4 transition-all hover:border-primary/40 hover:bg-primary/5 hover:translate-x-1 hover:shadow-soft group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 border border-border/50 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{item.desc}</span>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="mt-8 p-4 rounded-xl bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-2 text-accent mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Offline Status</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">System is running on local LLM. Connectivity: 100% Reliable.</p>
          </div>
        </Card>

        <Card className="glass-card premium-glass p-8 lg:col-span-3 lg:row-span-1 border-primary/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Learning Progress
            </h3>
            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">Week 4 / Chapter 12</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Chat Sessions', value: '42', trend: '+5' },
              { label: 'Quizzes Taken', value: '18', trend: '+2' },
              { label: 'Topics Mastered', value: '09', trend: '+1' },
              { label: 'Avg Accuracy', value: '88%', trend: '+3%' }
            ].map(stat => (
              <div key={stat.label} className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground">{stat.value}</span>
                  <span className="text-[10px] font-bold text-green-500">{stat.trend}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-14 sm:mt-16">
        <div className="mb-7 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-border/50 pb-4">
          <div className="space-y-1">
            <h3 className="type-premium-title text-2xl text-foreground flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              Curriculum Explorer
            </h3>
            <p className="text-sm text-muted-foreground font-medium">Deep-dive into specific NCERT subjects with AI guidance.</p>
          </div>
          <Button variant="ghost" className="hidden sm:inline-flex text-primary font-bold hover:bg-primary/5 rounded-xl">View All Subjects</Button>
        </div>

        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {NCERT_SUBJECTS.map((subject, idx) => {
            const colors = [
              'hover:border-blue-500/40 hover:shadow-blue-500/10',
              'hover:border-purple-500/40 hover:shadow-purple-500/10',
              'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
              'hover:border-amber-500/40 hover:shadow-amber-500/10'
            ]
            return (
              <Link
                href={`/chat?subject=${encodeURIComponent(subject)}`}
                key={subject}
                className={cn(
                  "group relative h-48 overflow-hidden rounded-3xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-muted/10 shadow-soft",
                  colors[idx % colors.length]
                )}
              >
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:grad-primary group-hover:text-white transition-all duration-500 shadow-sm">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase opacity-60">NCERT</Badge>
                  </div>
                  <div>
                    <p className="text-clamp-2 text-lg sm:text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{subject}</p>
                    <p className="mt-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium italic">Master complex theories instantly</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Sparkles className="h-3 w-3" />
                    Open Tutor Chat
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-125" />
              </Link>
            )
          })}
        </div>
      </div>
    </StudentShell>
  )
}
