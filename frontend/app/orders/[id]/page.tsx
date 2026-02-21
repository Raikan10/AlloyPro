'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  History,
  Mail,
  MapPin,
  Package,
  Phone,
  Wrench,
  XCircle,
} from 'lucide-react';
import { BeamButton, TechLabel } from '@/components/alloypro/IndustrialAtoms';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCopilotStore } from '@/hooks/useCopilotStore';

const CONFIDENCE_STYLES: Record<string, string> = {
  high: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  medium: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  low: 'bg-red-500/10 border-red-500/30 text-red-400',
};

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-accent/10 border-accent/30 text-accent',
  in_progress: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  pending_parts: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  pending_approval: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  completed: 'bg-white/5 border-white/10 text-muted-foreground',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  pending_parts: 'Pending Parts',
  pending_approval: 'Pending Approval',
  completed: 'Completed',
};

const SectionIcon: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2">
    <span className="text-accent">{icon}</span>
    <span>{label}</span>
  </div>
);

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { serviceOrders, selectOrder, beginInspection } = useCopilotStore();

  const order = serviceOrders.find((o) => o.id === id);

  if (!order) {
    router.replace('/orders');
    return null;
  }

  const handleBeginInspection = () => {
    selectOrder(order);
    beginInspection();
    router.push('/');
  };

  const reportedDate = order.reportedAt
    ? format(new Date(order.reportedAt), 'dd MMM yyyy, HH:mm')
    : '—';

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 p-4">
        <button
          onClick={() => router.push('/orders')}
          className="text-muted-foreground hover:text-foreground p-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-xs">{order.id}</span>
            <span
              className={`rounded-sm border px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase ${STATUS_STYLES[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <h1 className="text-foreground truncate font-serif text-lg italic">{order.customer}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* System + OEM quick info */}
        <div className="flex items-center gap-2 py-3">
          <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
            {order.system}
          </span>
          <span className="text-white/20">·</span>
          <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
            {order.oemBrand}
          </span>
        </div>

        <Accordion
          type="multiple"
          defaultValue={['summary', 'hypothesis', 'parts', 'tools']}
          className="flex flex-col gap-1"
        >
          {/* 1. Issue Summary */}
          <AccordionItem value="summary" className="border-white/5">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <SectionIcon icon={<FileText className="h-4 w-4" />} label="Issue Summary" />
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-foreground mb-3 text-sm leading-relaxed">{order.description}</p>
              {order.fullDetail && (
                <div className="rounded-sm border border-white/5 bg-white/[0.02] p-3">
                  <TechLabel>Full Report</TechLabel>
                  <p className="text-foreground/70 mt-1 text-xs leading-relaxed">
                    {order.fullDetail}
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 2. Reporter Contact */}
          <AccordionItem value="reporter" className="border-white/5">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <SectionIcon icon={<Mail className="h-4 w-4" />} label="Reporter Contact" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <p className="text-foreground text-sm font-semibold">{order.reporter.name}</p>
                <a
                  href={`mailto:${order.reporter.email}`}
                  className="text-accent flex items-center gap-2 text-xs hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {order.reporter.email}
                </a>
                <a
                  href={`tel:${order.reporter.phone}`}
                  className="text-accent flex items-center gap-2 text-xs hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {order.reporter.phone}
                </a>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. When and Where */}
          <AccordionItem value="location" className="border-white/5">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <SectionIcon icon={<MapPin className="h-4 w-4" />} label="When & Where" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <div className="text-foreground/70 flex items-center gap-2 text-xs">
                  <Clock className="text-muted-foreground h-3.5 w-3.5" />
                  {reportedDate}
                </div>
                <div className="text-foreground/70 flex items-start gap-2 text-xs">
                  <MapPin className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div>
                    <p>{order.location}</p>
                    {order.locationDetail && (
                      <p className="text-muted-foreground mt-0.5">{order.locationDetail}</p>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Service History */}
          <AccordionItem value="history" className="border-white/5">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <SectionIcon
                icon={<History className="h-4 w-4" />}
                label={order.isRecurring ? 'Service History ⚠ Recurring' : 'Service History'}
              />
            </AccordionTrigger>
            <AccordionContent>
              {order.isRecurring && (
                <div className="mb-3 flex items-center gap-2 rounded-sm border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
                    Recurring Issue Detected
                  </span>
                </div>
              )}
              {order.serviceHistory.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {order.serviceHistory.map((entry) => (
                    <div
                      key={entry.workOrderId}
                      className="rounded-sm border border-white/5 bg-white/[0.02] p-3"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {entry.workOrderId}
                        </span>
                        <span className="text-muted-foreground text-[10px]">{entry.date}</span>
                      </div>
                      <p className="text-foreground text-xs">{entry.summary}</p>
                      <p className="text-foreground/60 mt-1 text-[11px]">{entry.outcome}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  No prior service history for this equipment.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 5. Diagnostic Hypothesis */}
          <AccordionItem value="hypothesis" className="border-white/5">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <SectionIcon icon={<Brain className="h-4 w-4" />} label="Diagnostic Hypothesis" />
            </AccordionTrigger>
            <AccordionContent>
              {order.hypothesis.symptom ? (
                <div className="flex flex-col gap-3">
                  {/* Confidence */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-sm border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${CONFIDENCE_STYLES[order.hypothesis.confidence]}`}
                    >
                      {order.hypothesis.confidence} confidence
                    </span>
                  </div>

                  {/* Symptom */}
                  <div>
                    <TechLabel>Symptom</TechLabel>
                    <p className="text-foreground mt-1 text-xs">{order.hypothesis.symptom}</p>
                  </div>

                  {/* Sub-system analysis */}
                  <div>
                    <TechLabel>Sub-System Analysis</TechLabel>
                    <div className="mt-1 flex flex-col gap-2">
                      {order.hypothesis.subSystemAnalysis.map((item, i) => (
                        <div key={i} className="text-foreground/70 flex items-start gap-2 text-xs">
                          <span className="text-accent mt-0.5 shrink-0 font-mono text-[10px]">
                            {i + 1}.
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Root cause */}
                  <div className="bg-accent/5 border-accent/20 rounded-sm border p-3">
                    <TechLabel>Likely Root Cause</TechLabel>
                    <p className="text-foreground mt-1 text-xs leading-relaxed">
                      {order.hypothesis.likelyRootCause}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">No diagnostic hypothesis available.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 6. Prior Work */}
          <AccordionItem value="priorWork" className="border-white/5">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <SectionIcon icon={<ClipboardList className="h-4 w-4" />} label="Prior Work Done" />
            </AccordionTrigger>
            <AccordionContent>
              {order.priorWork ? (
                <p className="text-foreground/70 text-xs leading-relaxed">{order.priorWork}</p>
              ) : (
                <p className="text-muted-foreground text-xs">No prior work recorded.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 7. Recommended Spare Parts */}
          <AccordionItem value="parts" className="border-white/5">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <SectionIcon icon={<Package className="h-4 w-4" />} label="Recommended Spare Parts" />
            </AccordionTrigger>
            <AccordionContent>
              {order.recommendedParts.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {order.recommendedParts.map((part) => (
                    <div
                      key={part.sku}
                      className="flex items-center justify-between rounded-sm border border-white/5 bg-white/[0.02] p-3"
                    >
                      <div>
                        <p className="text-foreground text-xs font-semibold">{part.name}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-muted-foreground font-mono text-[10px]">
                            {part.sku}
                          </span>
                          <span className="text-white/20">·</span>
                          <span className="text-muted-foreground text-[10px]">
                            Qty: {part.quantity}
                          </span>
                        </div>
                      </div>
                      {part.inStock ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> In Stock
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400">
                          <XCircle className="h-3 w-3" /> Order Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">No parts recommended.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 8. Required Tools */}
          <AccordionItem value="tools" className="border-white/5">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <SectionIcon icon={<Wrench className="h-4 w-4" />} label="Required Tools" />
            </AccordionTrigger>
            <AccordionContent>
              {order.requiredTools.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {order.requiredTools.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-start gap-3 rounded-sm border border-white/5 bg-white/[0.02] p-3"
                    >
                      <Wrench className="text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <div>
                        <p className="text-foreground text-xs font-semibold">{tool.name}</p>
                        <p className="text-foreground/60 mt-0.5 text-[11px]">{tool.purpose}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">No specific tools listed.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <BeamButton onClick={handleBeginInspection}>Begin Inspection</BeamButton>
          <button
            onClick={() => router.push('/orders')}
            className="text-muted-foreground hover:text-foreground py-2 text-center text-xs transition-colors"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
}
