export interface Question {
  id: number;
  status: 'Correct' | 'Incorrect' | 'Skipped';
  question_text: string;
  options: string[];
  correct_answers: number[];
  explanation: string;
  references: string[];
  domain: string;
  images: string[];
}

export interface PracticeTest {
  title: string;
  questions: Question[];
}

export interface UserAttempt {
  id: string;
  certId: string;
  testId: string;
  testTitle: string;
  date: string;
  mode: 'practice' | 'exam';
  score: number;
  correctCount: number;
  totalCount: number;
  answers: Record<number, number[]>; // questionId -> chosenIndices[]
  timeTaken: number; // in seconds
  completed: boolean;
}

export interface ActiveSession {
  testId: string;
  testTitle: string;
  mode: 'practice' | 'exam';
  currentQuestionIndex: number;
  answers: Record<number, number[]>;
  flaggedQuestions: number[]; // array of question IDs
  timeRemaining: number; // in seconds
  isFinished: boolean;
  timeTaken: number; // in seconds
}
