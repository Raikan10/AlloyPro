'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { useCopilotStore } from '@/hooks/useCopilotStore';
import { BeamButton, TechLabel } from '../IndustrialAtoms';

const IdleView: React.FC = () => {
  const { selectedOrder, beginInspection, hasPermissions } = useCopilotStore();
  const router = useRouter();

  if (!selectedOrder) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
        <TechLabel>System Idle</TechLabel>
        <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
          No active service order selected. Please select an order from the queue to begin
          diagnostic inspection.
        </p>
        <BeamButton onClick={() => router.push('/orders')}>View Service Queue</BeamButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <TechLabel>Selected Order</TechLabel>
        <h1 className="text-foreground mt-1 font-serif text-2xl italic">{selectedOrder.id}</h1>
      </div>

      <div className="space-y-2 rounded-sm border border-white/5 bg-white/[0.02] p-3">
        <p className="text-foreground text-sm font-semibold">{selectedOrder.customer}</p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
            {selectedOrder.system}
          </span>
          <span className="text-white/20">·</span>
          <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
            {selectedOrder.oemBrand}
          </span>
        </div>
        <p className="text-foreground/70 text-xs leading-relaxed">{selectedOrder.description}</p>
        <div className="text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span className="text-[10px]">{selectedOrder.location}</span>
        </div>
      </div>

      <BeamButton onClick={beginInspection} disabled={!hasPermissions}>
        Begin Inspection · {selectedOrder.id}
      </BeamButton>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => router.push('/orders')}
          className="text-muted-foreground hover:text-foreground text-[10px] tracking-wider uppercase transition-colors"
        >
          ← Back to Orders
        </button>
        <span className="text-white/20">·</span>
        <button
          onClick={() => router.push('/resources')}
          className="text-muted-foreground hover:text-foreground text-[10px] tracking-wider uppercase transition-colors"
        >
          View Docs
        </button>
      </div>
    </div>
  );
};

export default IdleView;
