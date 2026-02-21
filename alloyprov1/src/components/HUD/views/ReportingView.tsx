import React from "react";
import { motion } from "framer-motion";
import { useCopilotStore } from "@/store/useCopilotStore";
import { BeamButton, TechLabel } from "@/components/UI/IndustrialAtoms";

const ReportingView: React.FC = () => {
  const { identifiedPart, resetWorkflow } = useCopilotStore();

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="font-serif italic text-4xl text-foreground">
          Job Complete.
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="border-l-2 border-accent pl-4 space-y-3"
      >
        <TechLabel>Root Cause Analysis</TechLabel>
        <p className="text-foreground/70 text-sm">
          Thermal degradation of the primary isolation valve gasket caused a slow pressure leak in sector 7-G. Valve array replaced and system re-pressurized.
        </p>

        {identifiedPart && (
          <div className="mt-3">
            <TechLabel>Ordered Parts</TechLabel>
            <div className="font-mono text-xs text-foreground/60 mt-1 space-y-0.5">
              <p>× 1 — {identifiedPart.name} ({identifiedPart.sku})</p>
              <p>Cost: {identifiedPart.cost} · ETA: {identifiedPart.leadTime}</p>
            </div>
          </div>
        )}
      </motion.div>

      <BeamButton onClick={resetWorkflow}>New Inspection</BeamButton>
    </div>
  );
};

export default ReportingView;
