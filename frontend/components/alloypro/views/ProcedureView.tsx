'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useCopilotStore } from '@/hooks/useCopilotStore';
import { BeamButton, TechLabel, VoicePulse } from '../IndustrialAtoms';

const ProcedureView: React.FC = () => {
  const { activeStep, procedureSteps, advanceStep, isMicActive } = useCopilotStore();
  const currentStep = procedureSteps[activeStep];
  const isLastStep = activeStep === procedureSteps.length - 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <TechLabel>
          Procedure — Step {activeStep + 1}/{procedureSteps.length}
        </TechLabel>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <p className="text-foreground border-accent rounded-sm border-l-2 pl-4 text-base leading-relaxed">
            {currentStep}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <BeamButton onClick={advanceStep}>
            {isLastStep ? 'Complete & Identify Part' : 'Next Step →'}
          </BeamButton>
        </div>
      </div>
    </div>
  );
};

export default ProcedureView;
