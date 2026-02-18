'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AdminDashboard } from '@/components/admin-dashboard'
import { ProgressTracker } from '@/components/progress-tracker'
import {
  Settings,
  Code2,
  Database,
  Zap,
  BookMarked,
  CheckCircle2,
  Globe,
  BarChart3,
  Lock,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'

export function SettingsPage() {
  const [currentView, setCurrentView] = useState<'settings' | 'admin' | 'progress'>('settings')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Render admin dashboard
  if (currentView === 'admin') {
    return <AdminDashboard onBack={() => setCurrentView('settings')} />
  }

  // Render progress tracker
  if (currentView === 'progress') {
    return <ProgressTracker onBack={() => setCurrentView('settings')} />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar showBackButton />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8" tabIndex={-1}>
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Settings className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings & Features</h1>
          </div>
          <p className="text-muted-foreground">
            System information, configuration, and advanced features for ShikshaSahayak
          </p>
        </div>

        {/* Appearance / Theme - Dark mode, Light mode, System default */}
        {mounted && (
          <Card className="p-6 mb-8 border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">Appearance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dark mode, Light mode, or System default (follows your device setting). Your choice is saved.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                Light mode
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark mode
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="gap-2"
              >
                <Monitor className="h-4 w-4" />
                System default
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6 border-accent/20 hover:border-accent/50 transition-colors cursor-pointer" onClick={() => setCurrentView('progress')}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">View your learning journey</p>
                </div>
              </div>
              <Badge variant="secondary">New</Badge>
            </div>
          </Card>

          <Card className="p-6 border-secondary/20 hover:border-secondary/50 transition-colors cursor-pointer" onClick={() => setCurrentView('admin')}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Admin Dashboard</h4>
                  <p className="text-sm text-muted-foreground">Manage curriculum content</p>
                </div>
              </div>
              <Badge className="bg-secondary">Teacher</Badge>
            </div>
          </Card>
        </div>

        {/* System Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">System Status</h3>
                <p className="text-sm text-muted-foreground">All systems operational</p>
                <div className="mt-3 flex gap-2">
                  <Badge className="bg-green-600">Online</Badge>
                  <Badge variant="outline">Stable</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/20">
            <div className="flex items-start gap-4">
              <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Performance</h3>
                <p className="text-sm text-muted-foreground">Offline RAG optimized</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="secondary">Sub 100ms</Badge>
                  <Badge variant="outline">No latency</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Configuration</h2>

            <div className="space-y-4">
              {/* RAG System */}
              <Card className="p-4 border-accent/20 hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">RAG System</h4>
                      <p className="text-sm text-muted-foreground">
                        Retrieval-Augmented Generation engine
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-accent">Enabled</Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  <p>• Vector search across NCERT curriculum</p>
                  <p>• Semantic relevance matching</p>
                  <p>• Context-aware response generation</p>
                </div>
              </Card>

              {/* LLM Configuration */}
              <Card className="p-4 border-secondary/20 hover:border-secondary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Code2 className="h-5 w-5 text-secondary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">LLM Fallback</h4>
                      <p className="text-sm text-muted-foreground">
                        API fallback with heuristic responses
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Ready</Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  <p>• API-first strategy with instant fallback</p>
                  <p>• Heuristic-based mock responses</p>
                  <p>• Context-aware response generation</p>
                </div>
              </Card>

              {/* Offline Support */}
              <Card className="p-4 border-primary/20 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Offline Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Works without internet connection
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary">Active</Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  <p>• Pre-loaded NCERT curriculum</p>
                  <p>• Client-side RAG processing</p>
                  <p>• No external dependencies required</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Curriculum Data */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Curriculum Data</h2>

            <Card className="p-6 border-primary/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">40+</div>
                  <p className="text-sm text-muted-foreground">Topics</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-1">8-12</div>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-1">5+</div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">500+</div>
                  <p className="text-sm text-muted-foreground">Key Points</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Features</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Instant RAG processing',
                'Offline-first architecture',
                'Smart context retrieval',
                'Heuristic fallback system',
                'Multi-subject support',
                'Class-based filtering',
                'Source attribution',
                'Responsive design'
              ].map((feature, i) => (
                <Card key={i} className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </Card>
              ))}
            </div>
          </div>

          {/* About */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <BookMarked className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">About ShikshaSahayak</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ShikshaSahayak is an intelligent AI tutor designed specifically for Indian students
                  learning the NCERT curriculum. Built with cutting-edge RAG technology and fallback
                  LLM integration, it provides instant, reliable answers to academic questions.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Learn More
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Documentation
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
