export type NavItem = {
  label: string;
  path: string;
  icon: string;
};

export type Subject = {
  id: string;
  name: string;
  icon: string;
  description: string;
  chapterCount: number;
};

export type Chapter = {
  id: string;
  subjectId: string;
  title: string;
  progress: number;
  estimatedReadMinutes: number;
};

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
};

export type StudyMaterialKind = 'textbook' | 'notes';

export type OfflineSubject = Subject & {
  totalMaterials: number;
  estimatedOfflineSizeKb: number;
  updatedAt: string;
};

export type OfflineChapter = Chapter & {
  sortOrder: number;
  hasTextbook: boolean;
  hasNotes: boolean;
  completed: boolean;
  updatedAt: string;
};

export type OfflineStudyMaterial = {
  id: string;
  subjectId: string;
  chapterId: string;
  kind: StudyMaterialKind;
  title: string;
  summary: string;
  blocks: string[];
  highlights: string[];
  sortOrder: number;
  updatedAt: string;
};

export type OfflineBookmark = {
  id: string;
  chapterId: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
};

export type OfflineChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type OfflineBookmarkedChapter = {
  bookmark: OfflineBookmark;
  chapter: OfflineChapter;
  subject: OfflineSubject | null;
};

export type OfflineQuizQuestion = QuizQuestion & {
  explanation: string;
};

export type OfflineQuiz = {
  id: string;
  subjectId: string | null;
  chapterId: string | null;
  title: string;
  description: string;
  durationMinutes: number;
  updatedAt: string;
  questions: OfflineQuizQuestion[];
};

export type ChapterProgress = {
  id: string;
  chapterId: string;
  completed: boolean;
  lastPosition: number;
  updatedAt: string;
};

export type QuizAnswerRecord = {
  id: string;
  quizId: string;
  questionId: string;
  selectedAnswer: string;
  updatedAt: string;
};

export type QuizResultRecord = {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  durationSeconds: number;
  completedAt: string;
};

export type ChapterProgressDashboardRow = {
  chapterId: string;
  title: string;
  completed: boolean;
  lastPosition: number;
};

export type SubjectProgressSummary = {
  subjectId: string;
  subjectName: string;
  totalChapters: number;
  completedChapters: number;
  completionRate: number;
  chapters: ChapterProgressDashboardRow[];
};

export type ProgressDashboardSnapshot = {
  totalSubjects: number;
  totalChapters: number;
  completedChapters: number;
  completionRate: number;
  recentQuizResults: QuizResultRecord[];
  subjectSummaries: SubjectProgressSummary[];
};

export type DashboardActivityItem = {
  id: string;
  kind: 'bookmark' | 'quiz' | 'completion';
  timestamp: string;
  message: string;
};

export type DashboardSnapshot = {
  totalSubjects: number;
  completedChapters: number;
  bookmarkedItems: number;
  recentActivity: DashboardActivityItem[];
};

export type OfflineStudyBundle = {
  seededAt: string;
  subjects: OfflineSubject[];
  chapters: OfflineChapter[];
  materials: OfflineStudyMaterial[];
  quizzes: OfflineQuiz[];
};

export type OfflineChapterBundle = {
  subject: OfflineSubject | null;
  chapter: OfflineChapter;
  progress: ChapterProgress | null;
  textbook: OfflineStudyMaterial | null;
  notes: OfflineStudyMaterial | null;
  quiz: OfflineQuiz | null;
  isBookmarked: boolean;
};