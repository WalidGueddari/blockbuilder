// components/QuestionInput.tsx
import React from 'react';

import { Question } from './types';

interface QuestionInputProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({ question, onAnswer }) => {
  return (
    <div className="question-container">
      <h3>{question.question}</h3>
      <div className="choices">
        {question.choices.map((choice, index) => (
          <button key={index} onClick={() => onAnswer(choice)} className="choice-button">
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
};
