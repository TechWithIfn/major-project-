'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, BookMarked, Zap, Target, Calendar, Clock } from 'lucide-react'

interface TopicProgress {
  id: string
  title: string
  subject: string
  class: number
  progress: number
  questionsAnswered: number
  correctAnswers: number
  lastStudied: Date
}

interface ProgressTrackerProps {
  onBack?: () => void
}

export function ProgressTracker({ onBack }: ProgressTrackerProps) {
  const [topicsProgress] = useState<TopicProgress[]>([
    {
      id: '1',
      title: 'Cell Structure and Function',
      subject: 'Biology',
      class: 11,
      progress: 75,
      questionsAnswered: 24,
      correctAnswers: 18,
      lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Photosynthesis',
      subject: 'Biology',
      class: 11,
      progress: 60,
      questionsAnswered: 18,
      correctAnswers: 11,
      lastStudied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Quadratic Equations',
      subject: 'Mathematics',
      class: 10,
      progress: 85,
      questionsAnswered: 32,
      correctAnswers: 27,
      lastStudied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      title: 'The Renaissance',
      subject: 'History',
      class: 9,
      progress: 45,
      questionsAnswered: 12,
      correctAnswers: 5,
      lastStudied: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  ])

  const overallProgress = Math.round(
    topicsProgress.reduce((sum, t) => sum + t.progress, 0) / topicsProgress.length
  )

  const totalQuestions = topicsProgress.reduce((sum, t) => sum + t.questionsAnswered, 0)
  const totalCorrect = topicsProgress.reduce((sum, t) => sum + t.correctAnswers, 0)
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  const subjectProgress = Array.from(
    new Set(topicsProgress.map(t => t.subject))
  ).map(subject => {
    const subjects = topicsProgress.filter(t => t.subject === subject)
    const avgProgress = Math.round(
      subjects.reduce((sum, t) => sum + t.progress, 0) / subjects.length
    )
    return { subject, progress: avgProgress, count: subjects.length }
  })

  const progressTrend = [
    { day: 'Mon', progress: 35 },
    { day: 'Tue', progress: 42 },
    { day: 'Wed', progress: 48 },
    { day: 'Thu', progress: 55 },
    { day: 'Fri', progress: 62 },
    { day: 'Sat', progress: 68 },
    { day: 'Sun', progress: 72 },
  ]

  const COLORS = ['#0F3460', '#00BCD4', '#FF6B35', '#F7A600']

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Your Progress</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Track your learning journey</p>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack} className="bg-transparent shrink-0 min-h-[44px] sm:min-h-0" aria-label="Back to settings">
                Back to Home
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 border-primary/20">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-xl sm:text-3xl font-bold text-primary mt-1 sm:mt-2">{overallProgress}%</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-accent/20">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Accuracy Rate</p>
                <p className="text-xl sm:text-3xl font-bold text-accent mt-1 sm:mt-2">{accuracy}%</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-accent" aria-hidden />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-secondary/20">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Questions Done</p>
                <p className="text-xl sm:text-3xl font-bold text-secondary mt-1 sm:mt-2">{totalQuestions}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" aria-hidden />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-primary/20">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Topics Covered</p>
                <p className="text-xl sm:text-3xl font-bold text-primary mt-1 sm:mt-2">{topicsProgress.length}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookMarked className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 h-auto gap-1 p-1">
            <TabsTrigger value="progress" className="text-xs sm:text-sm py-2 min-h-[44px] sm:min-h-0">Progress</TabsTrigger>
            <TabsTrigger value="breakdown" className="text-xs sm:text-sm py-2 min-h-[44px] sm:min-h-0">Breakdown</TabsTrigger>
            <TabsTrigger value="topics" className="text-xs sm:text-sm py-2 min-h-[44px] sm:min-h-0">Topics</TabsTrigger>
          </TabsList>

          {/* Progress Over Time */}
          <TabsContent value="progress" className="space-y-4">
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Weekly Progress Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={progressTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Subject Breakdown */}
          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
                  Subject Progress
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={subjectProgress}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ subject, progress }) => `${subject}: ${progress}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="progress"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">By Subject</h3>
                <div className="space-y-4">
                  {subjectProgress.map(({ subject, progress }) => (
                    <div key={subject}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{subject}</span>
                        <Badge variant="secondary" className="text-xs">
                          {progress}%
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Topics Progress */}
          <TabsContent value="topics" className="space-y-4">
            <div className="space-y-4">
              {topicsProgress.map(topic => (
                <Card key={topic.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{topic.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {topic.subject}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Class {topic.class}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{topic.progress}%</p>
                      <p className="text-xs text-muted-foreground">Complete</p>
                    </div>
                  </div>

                  <Progress value={topic.progress} className="mb-3 h-2" />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 shrink-0" aria-hidden />
                      {topic.correctAnswers}/{topic.questionsAnswered} correct
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 shrink-0" aria-hidden />
                      {Math.round((topic.correctAnswers / topic.questionsAnswered) * 100)}%
                      accuracy
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" aria-hidden />
                      {Math.floor(
                        (Date.now() - topic.lastStudied.getTime()) / (1000 * 60 * 60 * 24)
                      )}
                      d ago
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
