import { ArrowLeft, BookMarked, Brain, Layers, Target, Trophy } from 'lucide-react'
import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { NCERT_CLASSES, NCERT_SUBJECTS } from '@/lib/curriculum'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ChatTopBarProps {
  selectedClass: number | null
  selectedSubject: string | null
  onClassChange: (value: number | null) => void
  onSubjectChange: (value: string | null) => void
  difficulty: 'easy' | 'standard' | 'exam'
  onDifficultyChange: (value: 'easy' | 'standard' | 'exam') => void
  onBack?: () => void
  extraActions?: React.ReactNode
}

export function ChatTopBar({
  selectedClass,
  selectedSubject,
  onClassChange,
  onSubjectChange,
  difficulty,
  onDifficultyChange,
  onBack,
  extraActions,
}: ChatTopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex h-8 w-8 items-center justify-center rounded-lg grad-primary shadow-soft sm:hidden">
          <BookMarked className="h-4 w-4 text-white" />
        </div>

        <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 p-1 px-1.5">
            <div className="flex items-center gap-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 border-r border-border/50">
              <Layers className="h-3 w-3" />
              <span className="hidden sm:inline">Grade</span>
            </div>
            <Select
              value={selectedClass != null ? String(selectedClass) : 'all'}
              onValueChange={(v) => onClassChange(v === 'all' ? null : Number(v))}
            >
              <SelectTrigger className="h-7 w-[4.5rem] border-0 bg-transparent px-2 text-xs font-semibold focus:ring-0">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {NCERT_CLASSES.map((c) => (
                  <SelectItem key={c} value={String(c)}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 p-1 px-1.5">
            <div className="flex items-center gap-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 border-r border-border/50">
              <Target className="h-3 w-3" />
              <span className="hidden sm:inline">Subject</span>
            </div>
            <Select
              value={selectedSubject ?? 'all'}
              onValueChange={(v) => onSubjectChange(v === 'all' ? null : v)}
            >
              <SelectTrigger className="h-7 w-fit min-w-[5rem] border-0 bg-transparent px-2 text-xs font-semibold focus:ring-0">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {NCERT_SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 p-1 px-1.5 hidden lg:flex">
            <div className="flex items-center gap-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 border-r border-border/50">
              <Trophy className="h-3 w-3" />
              <span>Mode</span>
            </div>
            <Select value={difficulty} onValueChange={(v) => onDifficultyChange(v as 'easy' | 'standard' | 'exam')}>
              <SelectTrigger className="h-7 w-[8rem] border-0 bg-transparent px-2 text-xs font-semibold focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Elementary</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="exam">Competency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {extraActions}
          <div className="h-8 w-[1px] bg-border/40 mx-1 hidden sm:block" />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
