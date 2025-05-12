'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';

import { exampleUseCases } from '../../../constants/useCases';
import type { ContractConfig } from '../../../types';
import { generateContract } from '../../../utils';
import { NetworkSelect } from '../deployment/NetworkSelect';
import { CodeEditor } from '../editor/CodeEditor';
import { AdvancedFeatures } from './AdvancedFeatures';
import { ContractMetadata } from './ContractMetadata';

interface AdvancedModeProps {
  selectedNetworkId: string;
  setSelectedNetworkId: (value: string) => void;
  networks: any[];
  networksLoading: boolean;
  contractConfig: ContractConfig;
  setContractConfig: (config: ContractConfig) => void;
  validationErrors: { [key: string]: string };
  loading: boolean;
  onDeploy: () => void;
  onSaveDraft: () => void;
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
}

export const AdvancedMode = ({
  selectedNetworkId,
  setSelectedNetworkId,
  networks,
  networksLoading,
  contractConfig,
  setContractConfig,
  validationErrors,
  loading,
  onDeploy,
  onSaveDraft,
  generatedCode,
  setGeneratedCode,
}: AdvancedModeProps) => {
  // Function to update config and regenerate code
  const updateConfigAndCode = (newConfig: ContractConfig) => {
    setContractConfig(newConfig);
    try {
      const code = generateContract(newConfig);
      setGeneratedCode(code);
    } catch (error) {
      console.error('Failed to generate contract code:', error);
    }
  };

  const handleTemplateSelect = (useCase: (typeof exampleUseCases)[0]) => {
    const newConfig = {
      ...contractConfig,
      contractType: useCase.type,
      name: useCase.defaults.name || '',
      symbol: useCase.defaults.symbol || '',
      mintable: useCase.defaults.mintable ?? false,
      burnable: useCase.defaults.burnable ?? false,
      pausable: useCase.defaults.pausable ?? false,
    };

    updateConfigAndCode(newConfig);
  };

  const handleNameChange = (name: string) => {
    const newConfig = { ...contractConfig, name };
    updateConfigAndCode(newConfig);
  };

  const handleSymbolChange = (symbol: string) => {
    const newConfig = { ...contractConfig, symbol };
    updateConfigAndCode(newConfig);
  };

  const handleFeatureChange = (feature: 'mintable' | 'burnable' | 'pausable', checked: boolean) => {
    const newConfig = {
      ...contractConfig,
      [feature]: checked,
      contractType: contractConfig.contractType || 'ERC20',
    };
    updateConfigAndCode(newConfig);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[350px_1fr]">
      {/* Left side - Form controls */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <NetworkSelect
                  selectedNetworkId={selectedNetworkId}
                  setSelectedNetworkId={setSelectedNetworkId}
                  networks={networks}
                  networksLoading={networksLoading}
                />

                <div className="space-y-2">
                  <Label>What would you like to create?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {exampleUseCases.map((useCase) => (
                      <Button
                        key={useCase.id}
                        variant={
                          contractConfig.contractType === useCase.type ? 'default' : 'outline'
                        }
                        className="justify-start"
                        onClick={() => handleTemplateSelect(useCase)}
                      >
                        {useCase.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Contract Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      value={contractConfig.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter contract name"
                      className={validationErrors.name ? 'border-red-500 pr-8' : 'pr-8'}
                    />
                    {validationErrors.name ? (
                      <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {validationErrors.name && (
                    <p className="text-xs text-red-500">{validationErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <div className="relative">
                    <Input
                      id="symbol"
                      type="text"
                      value={contractConfig.symbol}
                      onChange={(e) => handleSymbolChange(e.target.value)}
                      placeholder="Enter contract symbol"
                      className={validationErrors.symbol ? 'border-red-500 pr-8' : 'pr-8'}
                    />
                    {validationErrors.symbol ? (
                      <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {validationErrors.symbol && (
                    <p className="text-xs text-red-500">{validationErrors.symbol}</p>
                  )}
                </div>

                <AdvancedFeatures
                  contractConfig={contractConfig}
                  handleFeatureChange={handleFeatureChange}
                />
              </TabsContent>

              <TabsContent value="metadata">
                <ContractMetadata
                  contractConfig={contractConfig}
                  setContractConfig={setContractConfig}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex gap-2 border-t pt-4">
              <Button
                onClick={onDeploy}
                className="flex-1"
                disabled={loading || !selectedNetworkId || Object.keys(validationErrors).length > 0}
              >
                {loading ? 'Deploying...' : 'Deploy Contract'}
              </Button>
              <Button variant="outline" onClick={onSaveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Code display */}
      <CodeEditor
        code={generatedCode}
        onChange={(value) => setGeneratedCode(value || '')}
        className="relative"
      />
    </div>
  );
};
