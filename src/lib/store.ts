import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Question {
  type: 'mcq' | 'tf' | 'fib';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizState {
  currentQuiz: Question[] | null;
  currentIndex: number;
  score: number;
  answers: Record<number, string>;
  setQuiz: (questions: Question[]) => void;
  setAnswer: (index: number, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentQuiz: null,
      currentIndex: 0,
      score: 0,
      answers: {},

      setQuiz: (questions) => set({ currentQuiz: questions, currentIndex: 0, score: 0, answers: {} }),
      
      setAnswer: (index, answer) => {
        const state = get();
        const newAnswers = { ...state.answers, [index]: answer };
        const question = state.currentQuiz?.[index];
        
        const newScore = Object.entries(newAnswers).reduce((acc, [idx, ans]) => {
          const q = state.currentQuiz?.[Number(idx)];
          return acc + (q?.correctAnswer === ans ? 1 : 0);
        }, 0);

        set({ answers: newAnswers, score: newScore });
      },

      nextQuestion: () => {
        const { currentIndex, currentQuiz } = get();
        if (currentQuiz && currentIndex < currentQuiz.length - 1) {
          set({ currentIndex: currentIndex + 1 });
        }
      },

      prevQuestion: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1 });
        }
      },

      resetQuiz: () => set({ currentQuiz: null, currentIndex: 0, score: 0, answers: {} }),
    }),
    {
      name: 'quiz-storage',
    }
  )
);