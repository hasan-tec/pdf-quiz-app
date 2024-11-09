import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateQuiz(pdfUrl: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `Generate a comprehensive quiz based on the content from this PDF: ${pdfUrl}

Please create:
1. 5 multiple choice questions
2. 3 true/false questions
3. 2 fill-in-the-blank questions

Format the response as a JSON object with this structure:
{
  "questions": [
    {
      "type": "mcq"|"tf"|"fib",
      "question": "string",
      "options": ["array of options"] (for MCQ only),
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, without any additional formatting or markdown syntax.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Remove any potential markdown formatting
    const jsonString = text.replace(/^```json\n|\n```$/g, '').trim();
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON:', jsonString);
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}