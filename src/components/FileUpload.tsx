import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { generateQuiz } from '@/lib/gemini';
import { useQuizStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export function FileUpload() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const setQuiz = useQuizStore((state) => state.setQuiz);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !file.type.includes('pdf') || !user) {
      toast({
        title: 'Error',
        description: 'Please upload a valid PDF file',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from('talktopdf')
        .upload(fileName, file);

      if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('talktopdf')
        .getPublicUrl(fileName);

      const quiz = await generateQuiz(publicUrl);
      
      if (!quiz.questions || quiz.questions.length === 0) {
        throw new Error('No questions generated');
      }

      setQuiz(quiz.questions);

      toast({
        title: 'Success',
        description: 'Quiz generated successfully!',
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: 'Error',
        description: `Failed to process PDF: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, setQuiz]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Generating quiz...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? 'Drop the PDF here'
                  : 'Drag & drop a PDF here, or click to select'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}