'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, MapPin, Plus } from 'lucide-react';
import { TechLabel } from '@/components/alloypro/IndustrialAtoms';
import { useCopilotStore } from '@/hooks/useCopilotStore';
import type { ServiceOrder, WorkStatus } from '@/hooks/useCopilotStore';

const STATUS_FILTERS: { label: string; value: WorkStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Pending Parts', value: 'pending_parts' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Completed', value: 'completed' },
];

const STATUS_STYLES: Record<WorkStatus, string> = {
  new: 'bg-accent/10 border-accent/30 text-accent',
  in_progress: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  pending_parts: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  pending_approval: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  completed: 'bg-white/5 border-white/10 text-muted-foreground',
};

const STATUS_LABELS: Record<WorkStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  pending_parts: 'Pending Parts',
  pending_approval: 'Pending Approval',
  completed: 'Completed',
};

export default function ServiceOrders() {
  const { serviceOrders } = useCopilotStore();
  const [activeFilter, setActiveFilter] = useState<WorkStatus | 'all'>('all');
  const router = useRouter();

  const filtered =
    activeFilter === 'all' ? serviceOrders : serviceOrders.filter((o) => o.status === activeFilter);

  const handleSelect = (order: ServiceOrder) => {
    router.push(`/orders/${order.id}`);
  };

  return (
    <div className="bg-background flex min-h-screen flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <TechLabel>Service Orders</TechLabel>
          <div className="mt-1 flex items-baseline gap-3">
            <h1 className="text-foreground font-serif text-2xl italic">Your Queue</h1>
            <span className="text-muted-foreground font-mono text-xs">
              {filtered.length} orders
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push('/resources')}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-sm border border-white/5 bg-white/[0.02] px-3 py-2 text-[10px] tracking-wider uppercase transition-colors hover:border-white/10"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Resources
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`shrink-0 rounded-sm border px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors ${
              activeFilter === f.value
                ? 'border-accent text-accent bg-accent/5'
                : 'text-muted-foreground border-white/5 bg-white/[0.02] hover:border-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {filtered.map((order) => (
          <button
            key={order.id}
            onClick={() => handleSelect(order)}
            className="w-full rounded-sm border border-white/5 bg-white/[0.02] p-4 text-left transition-colors hover:border-white/10 active:bg-white/[0.04]"
          >
            {/* Top row: ID + status */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-foreground font-mono text-xs">{order.id}</span>
              <span
                className={`rounded-sm border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${STATUS_STYLES[order.status]}`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            {/* Customer name */}
            <p className="text-foreground mb-1.5 text-sm font-semibold">{order.customer}</p>

            {/* System + OEM */}
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {order.system}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                {order.oemBrand}
              </span>
            </div>

            {/* Description */}
            <p className="text-foreground/70 mb-2 text-xs leading-relaxed">{order.description}</p>

            {/* Location */}
            <div className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="text-[10px] leading-snug">{order.location}</span>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No orders match this filter.
          </p>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/orders/new')}
        className="bg-accent text-background fixed right-6 bottom-6 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-opacity hover:opacity-90"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
