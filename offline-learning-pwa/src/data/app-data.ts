import { Chapter, NavItem, QuizQuestion, Subject } from '../types';

export const sidebarItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'Progress', path: '/progress', icon: 'ChartNoAxesCombined' },
  { label: 'AI Tutor Chat', path: '/ai-tutor', icon: 'Bot' },
  { label: 'Quiz Generator', path: '/quiz-generator', icon: 'Sparkles' },
  { label: 'Summary Mode', path: '/summary-mode', icon: 'NotebookPen' },
  { label: 'Saved Bookmarks', path: '/bookmarks', icon: 'Bookmark' },
  { label: 'Student Profile', path: '/profile', icon: 'UserCircle2' },
  { label: 'Subjects', path: '/subjects', icon: 'BookOpenText' },
  { label: 'Quiz', path: '/quiz', icon: 'BrainCircuit' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
];

export const subjects: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: 'Calculator',
    description: 'Algebra, geometry, and practical arithmetic for exams.',
    chapterCount: 4,
  },
  {
    id: 'science',
    name: 'Science',
    icon: 'FlaskConical',
    description: 'Physics, chemistry, and biology fundamentals.',
    chapterCount: 4,
  },
  {
    id: 'history',
    name: 'History',
    icon: 'Landmark',
    description: 'Important events, timelines, and leaders.',
    chapterCount: 3,
  },
  {
    id: 'english',
    name: 'English',
    icon: 'Languages',
    description: 'Grammar, writing, and comprehension practice.',
    chapterCount: 3,
  },
  {
    id: 'computer',
    name: 'Computer Basics',
    icon: 'Laptop2',
    description: 'Digital literacy, internet safety, and productivity.',
    chapterCount: 3,
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: 'Globe2',
    description: 'Maps, climate, and world regions.',
    chapterCount: 3,
  },
];

export const chapters: Chapter[] = [
  { id: 'alg-basics', subjectId: 'mathematics', title: 'Algebra Basics', progress: 78, estimatedReadMinutes: 18 },
  { id: 'fractions', subjectId: 'mathematics', title: 'Fractions and Decimals', progress: 62, estimatedReadMinutes: 22 },
  { id: 'geometry', subjectId: 'mathematics', title: 'Geometry and Angles', progress: 41, estimatedReadMinutes: 20 },
  { id: 'equations', subjectId: 'mathematics', title: 'Linear Equations', progress: 15, estimatedReadMinutes: 26 },

  { id: 'matter', subjectId: 'science', title: 'States of Matter', progress: 64, estimatedReadMinutes: 19 },
  { id: 'water-cycle', subjectId: 'science', title: 'The Water Cycle', progress: 88, estimatedReadMinutes: 16 },
  { id: 'plants', subjectId: 'science', title: 'Plant Life and Photosynthesis', progress: 55, estimatedReadMinutes: 24 },
  { id: 'electricity', subjectId: 'science', title: 'Electricity Fundamentals', progress: 22, estimatedReadMinutes: 27 },

  { id: 'ancient', subjectId: 'history', title: 'Ancient Civilizations', progress: 73, estimatedReadMinutes: 21 },
  { id: 'independence', subjectId: 'history', title: 'Road to Independence', progress: 66, estimatedReadMinutes: 23 },
  { id: 'constitution', subjectId: 'history', title: 'Constitution and Democracy', progress: 38, estimatedReadMinutes: 18 },

  { id: 'grammar', subjectId: 'english', title: 'Grammar Essentials', progress: 59, estimatedReadMinutes: 22 },
  { id: 'reading', subjectId: 'english', title: 'Reading Comprehension', progress: 47, estimatedReadMinutes: 18 },
  { id: 'writing', subjectId: 'english', title: 'Writing Better Paragraphs', progress: 25, estimatedReadMinutes: 20 },

  { id: 'hardware', subjectId: 'computer', title: 'Computer Hardware Basics', progress: 80, estimatedReadMinutes: 14 },
  { id: 'internet', subjectId: 'computer', title: 'Internet Safety and Privacy', progress: 51, estimatedReadMinutes: 17 },
  { id: 'docs', subjectId: 'computer', title: 'Working with Documents', progress: 30, estimatedReadMinutes: 19 },

  { id: 'maps', subjectId: 'geography', title: 'Reading Maps', progress: 70, estimatedReadMinutes: 17 },
  { id: 'climate', subjectId: 'geography', title: 'Climate and Weather', progress: 52, estimatedReadMinutes: 23 },
  { id: 'resources', subjectId: 'geography', title: 'Natural Resources', progress: 29, estimatedReadMinutes: 21 },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Which process in plants uses sunlight to produce food?',
    options: [
      { id: 'a', text: 'Respiration' },
      { id: 'b', text: 'Photosynthesis' },
      { id: 'c', text: 'Transpiration' },
      { id: 'd', text: 'Fermentation' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'q2',
    question: 'What is 3/4 expressed as a decimal?',
    options: [
      { id: 'a', text: '0.25' },
      { id: 'b', text: '0.50' },
      { id: 'c', text: '0.75' },
      { id: 'd', text: '1.25' },
    ],
    correctOptionId: 'c',
  },
  {
    id: 'q3',
    question: 'Which menu item helps you quickly revisit saved study notes?',
    options: [
      { id: 'a', text: 'Quiz Generator' },
      { id: 'b', text: 'Saved Bookmarks' },
      { id: 'c', text: 'Summary Mode' },
      { id: 'd', text: 'AI Tutor Chat' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'q4',
    question: 'Which type of government is based on a constitution and elected representatives?',
    options: [
      { id: 'a', text: 'Democracy' },
      { id: 'b', text: 'Monarchy' },
      { id: 'c', text: 'Dictatorship' },
      { id: 'd', text: 'Feudalism' },
    ],
    correctOptionId: 'a',
  },
];

export const readerParagraphs: string[] = [
  'The water cycle describes how water moves continuously through Earth systems. It starts when heat from the sun causes water in oceans, lakes, and rivers to evaporate.',
  'As water vapor rises, it cools and turns into tiny droplets, forming clouds. This process is called condensation and is key to cloud development.',
  'When droplets combine and grow heavier, they fall as precipitation such as rain or snow. Water then collects in rivers, lakes, and soil, where the cycle starts again.',
  'This continuous cycle helps regulate climate, supports agriculture, and provides drinking water. Understanding it helps students connect weather patterns to everyday life.',
];

export const recentActivities: string[] = [
  'Completed "Fractions and Decimals" practice set (12 mins ago)',
  'Saved bookmark in "The Water Cycle" chapter (40 mins ago)',
  'Scored 3/4 in quick revision quiz (today)',
  'Used AI Tutor Chat for algebra help (yesterday)',
];