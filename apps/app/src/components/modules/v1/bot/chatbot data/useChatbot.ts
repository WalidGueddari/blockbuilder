// hooks/useChatbot.ts
import { useState } from 'react';

import { dynamicQuestionSelection, generateRecommendation } from './blockchainUtils';
import { Question, Responses } from './types';

export type ChatStep = 'initial' | 'questions' | 'recommendation';

export const useChatbot = () => {
  const [step, setStep] = useState<ChatStep>('initial');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Responses>({});
  const [recommendation, setRecommendation] = useState<string>('');

  // Handle initial input submission from the user.
  const handleInitialSubmit = (input: string) => {
    const isBlockchain = input.toLowerCase().includes('blockchain');
    const newMessages = [
      ...messages,
      { text: input, isUser: true },
      {
        text: isBlockchain
          ? "Sounds like a blockchain project! Let's continue..."
          : 'Can you provide more details?',
        isUser: false,
      },
    ];

    const selectedQuestions = dynamicQuestionSelection(input);
    setMessages(newMessages);
    setQuestions(selectedQuestions);
    setStep('questions');
  };

  // Handle an answer for a given question.
  const handleAnswer = (question: string, answer: string) => {
    const newResponses = { ...responses, [question]: answer };
    setResponses(newResponses);

    // Append the answer to the chat messages.
    setMessages((prev) => [...prev, { text: answer, isUser: true }]);

    // Check if there are unanswered questions.
    if (questions.every((q) => newResponses[q.question] !== undefined)) {
      const rec = generateRecommendation(newResponses);
      setRecommendation(rec);
      setStep('recommendation');
      setMessages((prev) => [...prev, { text: rec, isUser: false }]);
    }
  };

  return {
    step,
    messages,
    questions,
    responses,
    recommendation,
    handleInitialSubmit,
    handleAnswer,
  };
};
