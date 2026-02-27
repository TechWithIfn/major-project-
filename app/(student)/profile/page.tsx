'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'

import { StudentShell } from '@/components/student/student-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NCERT_CLASSES, NCERT_SUBJECTS } from '@/lib/curriculum'
import { getStudentProfile, saveStudentProfile, type StudentProfile } from '@/lib/student/storage'

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    classLevel: '10',
    preferredSubject: 'Mathematics',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfile(getStudentProfile())
  }, [])

  const save = () => {
    saveStudentProfile(profile)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <StudentShell title="Academic Profile" description="Tailor your AI tutor's behavior by setting your class and subject preferences.">
      <div className="grid gap-7 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card premium-glass p-6 sm:p-8">
            <h2 className="type-premium-title text-xl text-foreground">Personal Details</h2>
            <p className="type-premium-body mt-1 text-sm text-muted-foreground/80 font-medium">These settings help ShikshaSahayak customize explanations specifically for your grade.</p>

            <div className="mt-8 space-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="student-name" className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Student Name</Label>
                <Input
                  id="student-name"
                  placeholder="Enter your name"
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-12 rounded-xl bg-background/50 border-border/50 text-[15px] focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Current Grade / Class</Label>
                  <Select
                    value={profile.classLevel}
                    onValueChange={(value) => setProfile((prev) => ({ ...prev, classLevel: value }))}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-background/50 border-border/50 text-[15px]">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {NCERT_CLASSES.map((classNumber) => (
                        <SelectItem key={classNumber} value={String(classNumber)}>
                          Class {classNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Focus Subject</Label>
                  <Select
                    value={profile.preferredSubject}
                    onValueChange={(value) => setProfile((prev) => ({ ...prev, preferredSubject: value }))}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-background/50 border-border/50 text-[15px]">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {NCERT_SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={save} className="h-12 w-full sm:w-fit px-8 rounded-xl grad-primary shadow-soft border-0 font-bold gap-2">
                <Save className="h-5 w-5" />
                {saved ? 'Settings Saved!' : 'Save Profile Changes'}
              </Button>
            </div>
          </Card>

          <Card className="border-dashed premium-glass p-6 rounded-2xl">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full grad-primary flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <div>
                <h4 className="type-premium-title text-sm text-foreground">Smart Personalization</h4>
                <p className="type-premium-body mt-1 text-xs text-muted-foreground">Your data is stored locally. ShikshaSahayak uses your class level to fetch specific NCERT curriculum data from its offline vector database.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card premium-glass p-6 border-primary/20">
            <h3 className="type-premium-title text-sm uppercase tracking-widest text-primary">Learning Stats</h3>
            <div className="mt-4 space-y-4">
              {[
                { label: 'Saved Notes', value: '12', color: 'bg-primary' },
                { label: 'Quizzes Taken', value: '05', color: 'bg-accent' },
                { label: 'Knowledge Score', value: 'A+', color: 'bg-green-500' }
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{stat.label}</span>
                  <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold text-white", stat.color)}>{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="premium-glass p-6 bg-accent/5 border-accent/10">
            <h3 className="type-premium-title text-xs uppercase tracking-widest text-accent">Student Feedback</h3>
            <p className="type-premium-body mt-3 text-[11px] text-muted-foreground italic">&quot;The AI tutor makes complex Science concepts very easy to digest. I love how it maps everything to NCERT.&quot;</p>
          </Card>
        </div>
      </div>
    </StudentShell>
  )
}
