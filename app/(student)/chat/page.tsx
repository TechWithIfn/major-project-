'use client'

import { useSearchParams } from 'next/navigation'
import { StudentShell } from '@/components/student/student-shell'
import { ChatContainer } from '@/components/chat-container'

export default function ChatPage() {
  const searchParams = useSearchParams()
  const initialSubject = searchParams.get('subject')
  const classParam = searchParams.get('class')
  const initialClass = classParam ? Number(classParam) : undefined

  return (
    <StudentShell title="AI Tutor Chat" description="Ask NCERT questions with source-grounded responses in a focused research workspace.">
      <div className="relative -mt-4 -mx-6 h-[calc(100svh-4rem)] overflow-hidden bg-background lg:-mx-8">
        <div className="relative h-full p-0 sm:p-3 lg:p-4">
          <div className="h-full overflow-hidden border-y border-border/50 bg-background sm:rounded-xl sm:border">
            <ChatContainer initialClass={initialClass} initialSubject={initialSubject ?? undefined} />
          </div>
        </div>
      </div>
    </StudentShell>
  )
}
