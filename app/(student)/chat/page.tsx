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
    <StudentShell title="AI Learning Assistant" description="Engage in a deep learning dialogue with ShikshaSahayak. Your personal tutor is ready.">
      <div className="relative -mt-4 -mx-6 h-[calc(100svh-4rem)] overflow-hidden lg:-mx-8">
        <ChatContainer initialClass={initialClass} initialSubject={initialSubject ?? undefined} />
      </div>
    </StudentShell>
  )
}
