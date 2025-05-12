'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Rocket, Save } from 'lucide-react';

import type { ContractConfig } from '../../../types';
import { NetworkSelect } from '../deployment/NetworkSelect';
import { ContractPreview } from '../editor/ContractPreview';
import { ContractFeatures } from './ContractFeatures';
import { ContractMetadata } from './ContractMetadata';
import { ContractNameSymbol } from './ContractNameSymbol';
import { ContractTypeSelector } from './ContractTypeSelector';

interface BeginnerModeProps {
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
}

export const BeginnerMode = ({
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
}: BeginnerModeProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="border-border/40 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/50">
            <CardTitle className=" items-center gap-2 text-xl">
              <NetworkSelect
                selectedNetworkId={selectedNetworkId}
                setSelectedNetworkId={setSelectedNetworkId}
                networks={networks}
                networksLoading={networksLoading}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <ContractTypeSelector
                contractConfig={contractConfig}
                setContractConfig={setContractConfig}
              />

              <ContractNameSymbol
                contractConfig={contractConfig}
                setContractConfig={setContractConfig}
                validationErrors={validationErrors}
              />

              <ContractFeatures
                contractConfig={contractConfig}
                setContractConfig={setContractConfig}
              />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="metadata">
                  <AccordionTrigger>Additional Metadata</AccordionTrigger>
                  <AccordionContent>
                    <ContractMetadata
                      contractConfig={contractConfig}
                      setContractConfig={setContractConfig}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Real-time preview */}
              <ContractPreview contractConfig={contractConfig} />

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onDeploy}
                  className="h-11 flex-1 font-medium"
                  disabled={
                    loading || !selectedNetworkId || Object.keys(validationErrors).length > 0
                  }
                >
                  {loading ? (
                    <>
                      <span className="mr-2 animate-spin">⚙️</span>
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Deploy Contract
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onSaveDraft} className="h-11">
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
