export type Lesson = {
  id: string;
  title: string;
  duration: string;
  subject: string;
  content: string;
};

export const starterLessons: Lesson[] = [
  {
    id: 'math-fractions',
    title: 'Fractions Made Simple',
    duration: '20 min',
    subject: 'Math',
    content:
      'A fraction has two parts: numerator and denominator. Add like fractions by adding numerators while keeping denominators the same. For unlike fractions, first find a common denominator.',
  },
  {
    id: 'science-water-cycle',
    title: 'Understanding the Water Cycle',
    duration: '18 min',
    subject: 'Science',
    content:
      'The water cycle has four major stages: evaporation, condensation, precipitation, and collection. Heat from the sun drives evaporation and keeps this process moving on Earth.',
  },
  {
    id: 'history-independence',
    title: 'Road to Independence',
    duration: '25 min',
    subject: 'History',
    content:
      'Independence movements involved social, political, and economic struggles. Students should focus on major events, key leaders, and long-term impact on society and governance.',
  },
];