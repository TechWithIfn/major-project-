'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TopicSelector } from '@/components/topic-selector'
import { ChatContainer } from '@/components/chat-container'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { BookMarked, Lightbulb, Users, Brain, MessageSquare, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { CURRICULUM_DATA } from '@/lib/curriculum'

interface HomePageProps {
  onStartChat?: (classNum: number, subject: string) => void
}

export function HomePage({ onStartChat }: HomePageProps) {
  const [showTopicDialog, setShowTopicDialog] = useState(false)
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [startChat, setStartChat] = useState(false)
  
  const handleSelectTopic = (classNum: number, subject: string) => {
    setSelectedClass(classNum)
    setSelectedSubject(subject)
    setShowTopicDialog(false)
    setStartChat(true)
  }
  
  if (startChat) {
    return (
      <ChatContainer
        initialClass={selectedClass ?? undefined}
        initialSubject={selectedSubject ?? undefined}
        onBack={() => {
          setStartChat(false)
          setSelectedClass(null)
          setSelectedSubject(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 md:py-24">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <BookMarked className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Learn Smart with AI
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                ShikshaSahayak is your intelligent NCERT tutor. Get clear explanations, solve doubts instantly, and master any topic with our offline RAG-powered AI system.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16">
              <Button
                size="lg"
                className="gap-2 text-base"
                onClick={() => setShowTopicDialog(true)}
              >
                Start Learning Now
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base bg-transparent"
                onClick={() => setStartChat(true)}
              >
                <MessageSquare className="h-5 w-5" />
                Open Chat
              </Button>
            </div>
            
            {/* Features Grid */}
            <section id="features" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16" aria-labelledby="features-heading">
              <h2 id="features-heading" className="sr-only col-span-full">Features</h2>
              <Card className="p-6 border-primary/20 hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Intelligent RAG</h3>
                <p className="text-sm text-muted-foreground">
                  Our Retrieval-Augmented Generation system finds the most relevant NCERT content for your questions.
                </p>
              </Card>
              
              <Card className="p-6 border-accent/20 hover:border-accent/50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Offline First</h3>
                <p className="text-sm text-muted-foreground">
                  Works entirely offline with API fallback. Your learning never stops, even without internet.
                </p>
              </Card>
              
              <Card className="p-6 border-secondary/20 hover:border-secondary/50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Clear Answers</h3>
                <p className="text-sm text-muted-foreground">
                  Get simple, student-friendly explanations with examples and key points for every topic.
                </p>
              </Card>
            </section>
            
            {/* Stats Section */}
            <div className="bg-card rounded-xl p-6 sm:p-8 border border-border mb-12 sm:mb-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">40+</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Topics Covered</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-accent mb-1 sm:mb-2">6–12</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Classes Supported</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1 sm:mb-2">11+</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Subjects</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">24/7</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Always Available</p>
                </div>
              </div>
            </div>
            
            {/* Subjects Showcase */}
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Subjects Covered</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {['Mathematics', 'Science', 'Biology', 'Chemistry', 'Physics', 'English', 'History', 'Geography'].map(subject => (
                  <Badge key={subject} variant="secondary" className="px-4 py-2 text-sm">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* How it Works */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 border border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-3">
                    1
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Ask a Question</h3>
                  <p className="text-sm text-muted-foreground">
                    Type any question about NCERT topics, from basic concepts to complex problems.
                  </p>
                </div>
                <div>
                  <div className="h-10 w-10 rounded-full bg-accent text-white flex items-center justify-center font-bold mb-3">
                    2
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Retrieve Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Our RAG system finds the most relevant sections from NCERT curriculum.
                  </p>
                </div>
                <div>
                  <div className="h-10 w-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold mb-3">
                    3
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Get Answer</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive a clear, educational response with sources and key points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Topic Selector Dialog - NCERT Class 6 to 12, all subjects */}
        <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Choose Your Topic</DialogTitle>
              <DialogDescription>
                Select your class (6–12) and subject to start learning with NCERT topics.
              </DialogDescription>
            </DialogHeader>
            <TopicSelector
              onSelectTopic={(topicId) => {
                // Parse class and subject from topic selection
                const topic = CURRICULUM_DATA.find((t: any) => t.id === topicId)
                if (topic) {
                  handleSelectTopic(topic.class, topic.subject)
                }
              }}
              onClose={() => setShowTopicDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  )
}
