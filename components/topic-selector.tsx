'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CURRICULUM_DATA, getClassesAndSubjects } from '@/lib/curriculum'
import { ChevronRight, BookOpen, GraduationCap, BookMarked } from 'lucide-react'

interface TopicSelectorProps {
  onSelectTopic?: (topicId: string) => void
  onClose?: () => void
}

export function TopicSelector({ onSelectTopic, onClose }: TopicSelectorProps) {
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const { classes, subjects } = getClassesAndSubjects()

  const filteredTopics = CURRICULUM_DATA.filter((topic) => {
    if (selectedClass != null && topic.class !== selectedClass) return false
    if (selectedSubject != null && topic.subject !== selectedSubject) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Classes: 6 to 12 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Classes (6 – 12)</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedClass === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedClass(null)}
            className="min-w-[4rem]"
          >
            All
          </Button>
          {classes.map((cls) => (
            <Button
              key={cls}
              variant={selectedClass === cls ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedClass(cls)}
              className="min-w-[4rem]"
            >
              Class {cls}
            </Button>
          ))}
        </div>
      </div>

      {/* Subjects: all NCERT subjects */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookMarked className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Subjects</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSubject === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSubject(null)}
          >
            All Subjects
          </Button>
          {subjects.map((subject) => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </Button>
          ))}
        </div>
      </div>

      {/* Available topics */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          Available Topics ({filteredTopics.length})
        </h3>
        <div className="rounded-lg border border-border bg-muted/30 max-h-[20rem] overflow-y-auto overflow-x-hidden p-1">
          {filteredTopics.length > 0 ? (
            <div className="grid gap-2">
              {filteredTopics.map((topic) => (
                <Card
                  key={topic.id}
                  className="p-3 hover:border-primary/50 hover:bg-card/90 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    onSelectTopic?.(topic.id)
                    onClose?.()
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectTopic?.(topic.id)
                      onClose?.()
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {topic.title}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="secondary" className="text-xs font-medium">
                          Class {topic.class}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {topic.subject}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                No topics found for this combination.
              </p>
              <p className="text-xs text-muted-foreground">
                Try &quot;All Classes&quot; or &quot;All Subjects&quot;, or pick another class/subject.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
