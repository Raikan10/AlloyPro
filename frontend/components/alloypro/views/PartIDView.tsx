'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useCopilotStore } from '@/hooks/useCopilotStore';
import { BeamButton, MetricBadge, TechLabel } from '../IndustrialAtoms';

const PartIDView: React.FC = () => {
  const { identifiedPart, completeJob } = useCopilotStore();

  if (!identifiedPart) return null;

  const lines = [
    `IDENTIFIED: ${identifiedPart.name}`,
    `CHECKING INVENTORY: ${identifiedPart.sku}`,
    `STOCK: ${identifiedPart.stock} UNITS`,
    `LEAD TIME: ${identifiedPart.leadTime}`,
    `UNIT COST: ${identifiedPart.cost}`,
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <TechLabel>Part Identification</TechLabel>
        <MetricBadge>IN STOCK</MetricBadge>
      </div>

      <div className="text-foreground/80 space-y-1 rounded-sm border border-white/5 bg-white/[0.02] p-4 font-mono text-xs">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
          >
            <span className="text-accent mr-2">›</span>
            {line}
          </motion.div>
        ))}
      </div>

      <BeamButton onClick={completeJob}>Authorize Purchase Order</BeamButton>
    </div>
  );
};

export default PartIDView;
