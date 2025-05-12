import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Rocket, Settings } from 'lucide-react';

interface ModeSelectorProps {
  mode: 'beginner' | 'advanced';
  onModeChange: (mode: 'beginner' | 'advanced') => void;
}

export const ModeSelector = ({ mode, onModeChange }: ModeSelectorProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label className="text-lg font-medium">Select Mode</Label>
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              variant={mode === 'beginner' ? 'default' : 'outline'}
              className="h-auto flex-col items-start space-y-2 p-4"
              onClick={() => onModeChange('beginner')}
            >
              <Rocket className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Beginner Mode</div>
                <div className="text-muted-foreground text-sm">
                  Simple interface with guided steps and preset options
                </div>
              </div>
            </Button>

            <Button
              variant={mode === 'advanced' ? 'default' : 'outline'}
              className="h-auto flex-col items-start space-y-2 p-4"
              onClick={() => onModeChange('advanced')}
            >
              <Settings className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Advanced Mode</div>
                <div className="text-muted-foreground text-sm">
                  Full control over contract parameters and advanced features
                </div>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
