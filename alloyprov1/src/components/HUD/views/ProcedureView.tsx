import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCopilotStore } from "@/store/useCopilotStore";
import { BeamButton, TechLabel, VoicePulse } from "@/components/UI/IndustrialAtoms";

const ProcedureView: React.FC = () => {
  const { activeStep, procedureSteps, advanceStep, isMicActive } = useCopilotStore();
  const currentStep = procedureSteps[activeStep];
  const isLastStep = activeStep === procedureSteps.length - 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <TechLabel>Procedure — Step {activeStep + 1}/{procedureSteps.length}</TechLabel>
        {isMicActive && <VoicePulse />}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <p className="text-foreground text-base leading-relaxed border-l-2 border-accent pl-4 rounded-sm">
            {currentStep}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <BeamButton onClick={advanceStep}>
            {isLastStep ? "Complete & Identify Part" : "Next Step →"}
          </BeamButton>
        </div>
      </div>
    </div>
  );
};

export default ProcedureView;
