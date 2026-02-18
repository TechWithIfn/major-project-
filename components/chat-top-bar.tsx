'use client'

import { BookMarked } from 'lucide-react'
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
  /** Optional slot for e.g. Recent Chats button */
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
    <header className="sticky top-0 z-20 safe-top border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 sm:gap-3 px-3 sm:px-4">
        {onBack && (
          <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 touch-target sm:h-9 sm:w-9 sm:min-w-0 sm:min-h-0" onClick={onBack} aria-label="Back to home">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        )}
        <Link href="/" className="flex items-center gap-2 shrink-0 min-h-[44px] min-w-[44px] items-center justify-center sm:min-w-0 sm:min-h-0" aria-label="ShikshaSahayak home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookMarked className="h-4 w-4 text-primary-foreground" aria-hidden />
          </div>
          <span className="font-semibold text-foreground hidden sm:inline">ShikshaSahayak</span>
        </Link>

        <Select
          value={selectedClass != null ? String(selectedClass) : 'all'}
          onValueChange={(v) => onClassChange(v === 'all' ? null : Number(v))}
        >
          <SelectTrigger className="w-[5rem] sm:w-[7rem] h-9 text-xs sm:text-sm shrink-0">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {NCERT_CLASSES.map((c) => (
              <SelectItem key={c} value={String(c)}>Class {c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSubject ?? 'all'}
          onValueChange={(v) => onSubjectChange(v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[5.5rem] sm:w-[10rem] max-w-[30vw] sm:max-w-[40vw] h-9 text-xs sm:text-sm shrink-0">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {NCERT_SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficulty} onValueChange={(v) => onDifficultyChange(v as 'easy' | 'standard' | 'exam')}>
          <SelectTrigger className="w-[5rem] sm:w-[8rem] h-9 text-xs sm:text-sm shrink-0 hidden md:flex">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="standard">NCERT Standard</SelectItem>
            <SelectItem value="exam">Exam-oriented</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1 shrink-0">
          {extraActions}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
