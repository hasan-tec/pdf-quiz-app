import { ClerkProvider, SignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { FileUpload } from '@/components/FileUpload';
import { QuizCard } from '@/components/QuizCard';
import { useQuizStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

const CLERK_PUB_KEY = import.meta.env.VITE_CLERK_PUB_KEY;

if (!CLERK_PUB_KEY) {
  throw new Error('Missing Clerk public key');
}

export default function App() {
  const currentQuiz = useQuizStore((state) => state.currentQuiz);
  const resetQuiz = useQuizStore((state) => state.resetQuiz);

  return (
    <ClerkProvider publishableKey={CLERK_PUB_KEY}>
      <SignedOut>
        <div className="h-screen flex items-center justify-center">
          <SignIn />
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">PDF Quiz Generator</h1>
              {currentQuiz && (
                <Button variant="outline" onClick={resetQuiz}>
                  Start New Quiz
                </Button>
              )}
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {currentQuiz ? <QuizCard /> : <FileUpload />}
          </main>
        </div>
      </SignedIn>
      
      <Toaster />
    </ClerkProvider>
  );
}