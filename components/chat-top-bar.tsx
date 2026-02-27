import { ArrowLeft, Layers, Target, Trophy } from 'lucide-react'
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
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/95 px-3 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center gap-2">
        {onBack && (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background p-1 px-1.5">
            <div className="flex items-center gap-1 border-r border-border/50 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Layers className="h-3 w-3" />
              <span className="hidden sm:inline">Grade</span>
            </div>
            <Select
              value={selectedClass != null ? String(selectedClass) : 'all'}
              onValueChange={(v) => onClassChange(v === 'all' ? null : Number(v))}
            >
              <SelectTrigger className="h-7 w-[4.5rem] border-0 bg-transparent px-2 text-xs font-medium focus:ring-0">
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

          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background p-1 px-1.5">
            <div className="flex items-center gap-1 border-r border-border/50 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Target className="h-3 w-3" />
              <span className="hidden sm:inline">Subject</span>
            </div>
            <Select
              value={selectedSubject ?? 'all'}
              onValueChange={(v) => onSubjectChange(v === 'all' ? null : v)}
            >
              <SelectTrigger className="h-7 w-fit min-w-[5rem] border-0 bg-transparent px-2 text-xs font-medium focus:ring-0">
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

          <div className="hidden items-center gap-1.5 rounded-lg border border-border/60 bg-background p-1 px-1.5 lg:flex">
            <div className="flex items-center gap-1 border-r border-border/50 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Trophy className="h-3 w-3" />
              <span>Mode</span>
            </div>
            <Select value={difficulty} onValueChange={(v) => onDifficultyChange(v as 'easy' | 'standard' | 'exam')}>
              <SelectTrigger className="h-7 w-[8rem] border-0 bg-transparent px-2 text-xs font-medium focus:ring-0">
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
          <div className="mx-1 hidden h-7 w-[1px] bg-border/40 sm:block" />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
