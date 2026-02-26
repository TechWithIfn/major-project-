'use client'

import { useEffect, useState } from 'react'
import { BookmarkX, Trash2, MessageSquare, ClipboardList, BookOpen, Search } from 'lucide-react'

import { StudentShell } from '@/components/student/student-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { BookmarkItem } from '@/lib/student/storage'
import { getBookmarks, removeBookmark } from '@/lib/student/storage'

export default function BookmarksPage() {
  const [items, setItems] = useState<BookmarkItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setItems(getBookmarks())
  }, [])

  const handleDelete = (id: string) => {
    setItems(removeBookmark(id))
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <ClipboardList className="h-4 w-4 text-accent" />
      case 'summary': return <BookOpen className="h-4 w-4 text-primary" />
      default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <StudentShell title="Knowledge Hub" description="Review your saved explanations, custom quizzes, and conceptual summaries.">
      <div className="flex flex-col gap-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search through your saved knowledge..."
            className="pl-11 h-12 rounded-2xl bg-background/50 border-border/50 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {items.length === 0 ? (
          <Card className="p-12 text-center glass-card border-dashed">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
              <BookmarkX className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-foreground">No Knowledge Saved Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">Start a conversation with ShikshaSahayak or generate a quiz to build your personal knowledge repository here.</p>
          </Card>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground font-medium">No results found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start justify-between p-6 bg-muted/30 border-b border-border/40">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-background shadow-soft flex items-center justify-center border border-border/50">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base tracking-tight">{item.title}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-[10px] font-bold rounded-full px-3 py-0.5 bg-background/50 border-border/50">
                      {item.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/80 font-medium">{item.content}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentShell>
  )
}
