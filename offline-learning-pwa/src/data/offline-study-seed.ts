import { chapters as baseChapters, quizQuestions as baseQuizQuestions, subjects as baseSubjects } from './app-data';
import type {
  OfflineChapter,
  OfflineQuiz,
  OfflineStudyBundle,
  OfflineStudyMaterial,
  OfflineSubject,
} from '../types';

const seededAt = '2026-03-16T00:00:00.000Z';

const subjectProfiles: Record<
  string,
  {
    conceptFocus: string;
    skillFocus: string;
    classroomLens: string;
    notePrompts: string[];
  }
> = {
  mathematics: {
    conceptFocus: 'patterns, operations, and step-by-step reasoning',
    skillFocus: 'write the formula first, then solve the worked example without skipping steps',
    classroomLens: 'checking units, signs, and the order of operations',
    notePrompts: [
      'Write the rule in your own words before solving.',
      'Compare the worked example with one mistake students often make.',
      'Finish with a one-line self-check to verify the answer.',
    ],
  },
  science: {
    conceptFocus: 'observation, explanation, and simple cause-and-effect models',
    skillFocus: 'connect each definition to a real process or experiment you can describe aloud',
    classroomLens: 'linking theory to everyday examples and visual diagrams',
    notePrompts: [
      'Underline the process words that show what changes.',
      'Summarize the topic using one diagram and one sentence.',
      'Review the vocabulary list before starting the quiz.',
    ],
  },
  history: {
    conceptFocus: 'timelines, turning points, and the reasons events mattered',
    skillFocus: 'pair each event with its cause, impact, and one memorable date or leader',
    classroomLens: 'seeing how decisions changed people, systems, and public life',
    notePrompts: [
      'Make a mini timeline with three important milestones.',
      'Record one cause and one effect for the chapter topic.',
      'Add a key leader, law, or institution to help recall the theme.',
    ],
  },
  english: {
    conceptFocus: 'meaning, structure, and confident written expression',
    skillFocus: 'read the example twice, then identify grammar, tone, and vocabulary cues',
    classroomLens: 'turning reading patterns into clearer speaking and writing',
    notePrompts: [
      'List the keywords that signal the grammar pattern.',
      'Rewrite one example sentence in your own style.',
      'End with a quick comprehension question for self-testing.',
    ],
  },
  computer: {
    conceptFocus: 'devices, workflows, and safe digital habits',
    skillFocus: 'say what each tool does, when to use it, and how to stay secure while using it',
    classroomLens: 'practical digital tasks students face in school and daily life',
    notePrompts: [
      'Match each tool or feature to its purpose.',
      'Write down one safe habit you should always follow.',
      'Summarize the workflow as a short numbered list.',
    ],
  },
  geography: {
    conceptFocus: 'places, patterns on maps, and how environment shapes people and resources',
    skillFocus: 'use a map clue, a climate clue, and a resource clue to explain the topic clearly',
    classroomLens: 'connecting location with weather, livelihoods, and movement',
    notePrompts: [
      'Mark the physical feature or region being discussed.',
      'Write one sentence that explains why the location matters.',
      'Add one resource, climate, or map symbol to remember.',
    ],
  },
};

const chapterOrderBySubject = new Map<string, number>();

const offlineChapters: OfflineChapter[] = baseChapters.map((chapter) => {
  const nextSortOrder = (chapterOrderBySubject.get(chapter.subjectId) ?? 0) + 1;
  chapterOrderBySubject.set(chapter.subjectId, nextSortOrder);

  return {
    ...chapter,
    sortOrder: nextSortOrder,
    hasTextbook: true,
    hasNotes: true,
    completed: false,
    updatedAt: seededAt,
  };
});

const subjectById = new Map(baseSubjects.map((subject) => [subject.id, subject]));

function buildTextbookBlocks(subjectName: string, chapterTitle: string, profile: (typeof subjectProfiles)[string]): string[] {
  return [
    `${chapterTitle} is stored locally as part of the ${subjectName} offline library, so students can keep studying even when the network is unavailable. The chapter focuses on ${profile.conceptFocus} and is organized for quick review on low-connectivity devices.`,
    `The textbook section explains ${chapterTitle} through guided examples, plain-language definitions, and revision checkpoints. Students should use this chapter by reading one section at a time, pausing to restate the idea before moving ahead.`,
    `For stronger retention, pair the reading with ${profile.skillFocus}. This chapter also encourages ${profile.classroomLens}, helping students move from passive reading to active recall before they attempt the quiz.`,
  ];
}

function buildNoteBlocks(subjectName: string, chapterTitle: string, profile: (typeof subjectProfiles)[string]): string[] {
  return [
    `${chapterTitle} note pack: keep the core definition, one example, and one revision question on the same screen for fast offline revision.`,
    `When revising ${subjectName}, students should focus on the chapter goal, the most common misunderstanding, and one real use case that makes the lesson easier to remember.`,
  ];
}

const offlineMaterials: OfflineStudyMaterial[] = offlineChapters.flatMap((chapter) => {
  const subject = subjectById.get(chapter.subjectId);

  if (!subject) {
    return [];
  }

  const profile = subjectProfiles[chapter.subjectId] ?? subjectProfiles.mathematics;

  return [
    {
      id: `${chapter.id}-textbook`,
      subjectId: chapter.subjectId,
      chapterId: chapter.id,
      kind: 'textbook',
      title: `${chapter.title} Textbook`,
      summary: `Offline textbook material for ${chapter.title} with worked explanations and revision checkpoints.`,
      blocks: buildTextbookBlocks(subject.name, chapter.title, profile),
      highlights: [
        `Available offline through IndexedDB for ${subject.name}.`,
        `Study flow: read, restate, and review before attempting the quiz.`,
      ],
      sortOrder: 1,
      updatedAt: seededAt,
    },
    {
      id: `${chapter.id}-notes`,
      subjectId: chapter.subjectId,
      chapterId: chapter.id,
      kind: 'notes',
      title: `${chapter.title} Notes`,
      summary: `Short notes for ${chapter.title} designed for fast offline revision and memory recall.`,
      blocks: buildNoteBlocks(subject.name, chapter.title, profile),
      highlights: profile.notePrompts.map((prompt) => `${prompt} (${chapter.title})`),
      sortOrder: 2,
      updatedAt: seededAt,
    },
  ];
});

const materialCountBySubject = offlineMaterials.reduce<Record<string, number>>((counts, material) => {
  counts[material.subjectId] = (counts[material.subjectId] ?? 0) + 1;
  return counts;
}, {});

const offlineSubjects: OfflineSubject[] = baseSubjects.map((subject) => ({
  ...subject,
  totalMaterials: materialCountBySubject[subject.id] ?? 0,
  estimatedOfflineSizeKb: Math.max((materialCountBySubject[subject.id] ?? 1) * 42, 96),
  updatedAt: seededAt,
}));

const quizExplanations: Record<string, string> = {
  q1: 'Photosynthesis is the correct answer because plants use sunlight, water, and carbon dioxide to produce food.',
  q2: 'Three quarters is equivalent to 0.75 because dividing 3 by 4 gives seventy-five hundredths.',
  q3: 'Saved Bookmarks is correct because it stores locally cached highlights and chapter jump points for quick return visits.',
  q4: 'Democracy is correct because it uses a constitution and elected representatives to guide government.',
};

const offlineQuizzes: OfflineQuiz[] = [
  {
    id: 'quick-revision',
    subjectId: null,
    chapterId: null,
    title: 'Offline Quick Revision Quiz',
    description: 'A locally stored quiz bundle that remains available without internet for fast revision sessions.',
    durationMinutes: 8,
    updatedAt: seededAt,
    questions: baseQuizQuestions.map((question) => ({
      ...question,
      explanation:
        quizExplanations[question.id] ??
        'Review the textbook summary and note highlights again before you retry this question offline.',
    })),
  },
];

export const offlineStudySeed: OfflineStudyBundle = {
  seededAt,
  subjects: offlineSubjects,
  chapters: offlineChapters,
  materials: offlineMaterials,
  quizzes: offlineQuizzes,
};