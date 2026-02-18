'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit2, Trash2, Search, Settings, BarChart3, Users } from 'lucide-react'
import { CURRICULUM_DATA, type NCERTTopic } from '@/lib/curriculum'

interface AdminDashboardProps {
  onBack?: () => void
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [topics, setTopics] = useState<NCERTTopic[]>(() => [...CURRICULUM_DATA])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTopic, setEditingTopic] = useState<NCERTTopic | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    class: 9,
    subject: '',
    content: '',
    keyPoints: '',
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddTopic = () => {
    if (!formData.title || !formData.subject || !formData.content) {
      alert('Please fill in all required fields')
      return
    }

    const newTopic: NCERTTopic = {
      id: `topic-${Date.now()}`,
      title: formData.title,
      class: formData.class,
      subject: formData.subject,
      content: formData.content,
      keyPoints: formData.keyPoints
        .split('\n')
        .filter(point => point.trim())
        .map(point => point.trim()),
    }

    if (editingTopic) {
      setTopics(topics.map(t => (t.id === editingTopic.id ? newTopic : t)))
      setEditingTopic(null)
    } else {
      setTopics([...topics, newTopic])
    }

    setFormData({
      title: '',
      class: 9,
      subject: '',
      content: '',
      keyPoints: '',
    })
    setIsDialogOpen(false)
  }

  const handleEditTopic = (topic: NCERTTopic) => {
    setEditingTopic(topic)
    setFormData({
      title: topic.title,
      class: topic.class,
      subject: topic.subject,
      content: topic.content,
      keyPoints: topic.keyPoints.join('\n'),
    })
    setIsDialogOpen(true)
  }

  const handleDeleteTopic = (id: string) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      setTopics(topics.filter(t => t.id !== id))
    }
  }

  const filteredTopics = topics.filter(
    topic =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const subjects = Array.from(new Set(topics.map(t => t.subject)))
  const classes = Array.from(new Set(topics.map(t => t.class))).sort()

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage NCERT curriculum content</p>
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
        <Tabs defaultValue="topics" className="w-full">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full max-w-md grid-cols-3 h-auto gap-1 p-1">
            <TabsTrigger value="topics" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 min-h-[44px] sm:min-h-0">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" aria-hidden />
              Content
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 min-h-[44px] sm:min-h-0">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" aria-hidden />
              Stats
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 min-h-[44px] sm:min-h-0">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" aria-hidden />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Topics Management Tab */}
          <TabsContent value="topics" className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setEditingTopic(null)
                      setFormData({
                        title: '',
                        class: 9,
                        subject: '',
                        content: '',
                        keyPoints: '',
                      })
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Topic
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTopic
                        ? 'Update the topic details below'
                        : 'Create a new NCERT topic for the curriculum'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Topic Title *</label>
                      <Input
                        placeholder="e.g., Cell Structure and Function"
                        value={formData.title}
                        onChange={e =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Class *</label>
                        <select
                          value={formData.class}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              class: parseInt(e.target.value),
                            })
                          }
                          className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        >
                          {[6, 7, 8, 9, 10, 11, 12].map(c => (
                            <option key={c} value={c}>
                              Class {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground">Subject *</label>
                        <Input
                          placeholder="e.g., Biology"
                          value={formData.subject}
                          onChange={e =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Content *</label>
                      <Textarea
                        placeholder="Enter detailed content for this topic..."
                        value={formData.content}
                        onChange={e =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        className="mt-1 min-h-32"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Key Points (one per line)
                      </label>
                      <Textarea
                        placeholder="Point 1&#10;Point 2&#10;Point 3"
                        value={formData.keyPoints}
                        onChange={e =>
                          setFormData({ ...formData, keyPoints: e.target.value })
                        }
                        className="mt-1 min-h-24"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="bg-transparent"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddTopic}>
                        {editingTopic ? 'Update Topic' : 'Add Topic'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Topics Table */}
            {filteredTopics.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {topics.length === 0
                    ? 'No topics added yet. Create your first topic to get started.'
                    : 'No topics match your search.'}
                </p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden lg:table-cell">Key Points</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTopics.map(topic => (
                        <TableRow key={topic.id}>
                          <TableCell className="font-medium max-w-[180px] sm:max-w-none truncate" title={topic.title}>{topic.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{topic.class}</Badge>
                        </TableCell>
                        <TableCell>{topic.subject}</TableCell>
                        <TableCell className="hidden lg:table-cell">{topic.keyPoints.length} points</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTopic(topic)}
                              className="h-9 w-9 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 p-0"
                              aria-label={`Edit ${topic.title}`}
                            >
                              <Edit2 className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="h-9 w-9 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 p-0 text-destructive"
                              aria-label={`Delete ${topic.title}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Topics</p>
                <p className="text-3xl font-bold text-primary">{topics.length}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                <p className="text-3xl font-bold text-accent">{subjects.length}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Classes</p>
                <p className="text-3xl font-bold text-secondary">{classes.length}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Key Points</p>
                <p className="text-3xl font-bold text-primary">
                  {topics.reduce((sum, t) => sum + t.keyPoints.length, 0)}
                </p>
              </Card>
            </div>

            {/* Subject Distribution */}
            {subjects.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Subject Distribution</h3>
                <div className="space-y-3">
                  {subjects.map(subject => {
                    const count = topics.filter(t => t.subject === subject).length
                    const percentage = (count / topics.length) * 100
                    return (
                      <div key={subject}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{subject}</span>
                          <span className="text-sm text-muted-foreground">{count} topics</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground">
                User management and activity tracking coming soon. This will include tracking active users, their learning progress, and engagement metrics.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
