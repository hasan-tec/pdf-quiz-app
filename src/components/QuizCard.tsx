import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function QuizCard() {
  const { currentQuiz, currentIndex, answers, setAnswer, nextQuestion, prevQuestion } = useQuizStore();

  if (!currentQuiz) return null;

  const question = currentQuiz[currentIndex];
  const userAnswer = answers[currentIndex];

  const renderQuestion = () => {
    switch (question.type) {
      case 'mcq':
        return (
          <RadioGroup
            value={userAnswer}
            onValueChange={(value) => setAnswer(currentIndex, value)}
            className="space-y-3"
          >
            {question.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${i}`} />
                <Label htmlFor={`option-${i}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'tf':
        return (
          <RadioGroup
            value={userAnswer}
            onValueChange={(value) => setAnswer(currentIndex, value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false">False</Label>
            </div>
          </RadioGroup>
        );

      case 'fib':
        return (
          <Input
            type="text"
            value={userAnswer || ''}
            onChange={(e) => setAnswer(currentIndex, e.target.value)}
            placeholder="Type your answer..."
            className="mt-2"
          />
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">
              Question {currentIndex + 1} of {currentQuiz.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            {renderQuestion()}
            {userAnswer && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">
                  {userAnswer === question.correctAnswer ? (
                    <span className="text-green-600">Correct!</span>
                  ) : (
                    <span className="text-red-600">Incorrect</span>
                  )}
                </p>
                <p className="mt-2 text-sm">{question.explanation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={nextQuestion}
              disabled={currentIndex === currentQuiz.length - 1}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}