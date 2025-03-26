import { CheckCircle, Loader2 } from 'lucide-react';

type Step = {
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
};

type ProgressIndicatorProps = {
  steps: Step[];
};

export function ProgressIndicator({ steps }: ProgressIndicatorProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-2">
          {step.status === 'pending' && (
            <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
          )}
          {step.status === 'in-progress' && (
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          )}
          {step.status === 'completed' && <CheckCircle className="h-6 w-6 text-green-500" />}
          <span className={step.status === 'completed' ? 'text-green-500' : ''}>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
