import React from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useCopilotStore } from "@/store/useCopilotStore";
import { TechLabel, BeamButton } from "@/components/UI/IndustrialAtoms";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Brain,
  Wrench,
  Package,
  ClipboardList,
  History,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  medium: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  low: "bg-red-500/10 border-red-500/30 text-red-400",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-accent/10 border-accent/30 text-accent",
  in_progress: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  pending_parts: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  pending_approval: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  completed: "bg-white/5 border-white/10 text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  pending_parts: "Pending Parts",
  pending_approval: "Pending Approval",
  completed: "Completed",
};

const SectionIcon: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2">
    <span className="text-accent">{icon}</span>
    <span>{label}</span>
  </div>
);

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { serviceOrders, selectOrder, beginInspection } = useCopilotStore();

  const order = serviceOrders.find((o) => o.id === id);

  if (!order) return <Navigate to="/orders" replace />;

  const handleBeginInspection = () => {
    selectOrder(order);
    beginInspection();
    navigate("/");
  };

  const reportedDate = order.reportedAt
    ? format(new Date(order.reportedAt), "dd MMM yyyy, HH:mm")
    : "—";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
            <span
              className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border rounded-sm ${STATUS_STYLES[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <h1 className="font-serif italic text-lg text-foreground truncate">{order.customer}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* System + OEM quick info */}
        <div className="flex items-center gap-2 py-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {order.system}
          </span>
          <span className="text-white/20">·</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {order.oemBrand}
          </span>
        </div>

        <Accordion type="multiple" defaultValue={["summary", "hypothesis", "parts", "tools"]} className="flex flex-col gap-1">
          {/* 1. Issue Summary */}
          <AccordionItem value="summary" className="border-white/5">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <SectionIcon icon={<FileText className="w-4 h-4" />} label="Issue Summary" />
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-foreground text-sm leading-relaxed mb-3">{order.description}</p>
              {order.fullDetail && (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                  <TechLabel>Full Report</TechLabel>
                  <p className="text-foreground/70 text-xs leading-relaxed mt-1">{order.fullDetail}</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 2. Reporter Contact */}
          <AccordionItem value="reporter" className="border-white/5">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <SectionIcon icon={<Mail className="w-4 h-4" />} label="Reporter Contact" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <p className="text-foreground text-sm font-semibold">{order.reporter.name}</p>
                <a
                  href={`mailto:${order.reporter.email}`}
                  className="flex items-center gap-2 text-accent text-xs hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {order.reporter.email}
                </a>
                <a
                  href={`tel:${order.reporter.phone}`}
                  className="flex items-center gap-2 text-accent text-xs hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {order.reporter.phone}
                </a>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. When and Where */}
          <AccordionItem value="location" className="border-white/5">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <SectionIcon icon={<MapPin className="w-4 h-4" />} label="When & Where" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-foreground/70">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {reportedDate}
                </div>
                <div className="flex items-start gap-2 text-xs text-foreground/70">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
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
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <SectionIcon
                icon={<History className="w-4 h-4" />}
                label={
                  order.isRecurring
                    ? "Service History ⚠ Recurring"
                    : "Service History"
                }
              />
            </AccordionTrigger>
            <AccordionContent>
              {order.isRecurring && (
                <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                    Recurring Issue Detected
                  </span>
                </div>
              )}
              {order.serviceHistory.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {order.serviceHistory.map((entry) => (
                    <div
                      key={entry.workOrderId}
                      className="p-3 bg-white/[0.02] border border-white/5 rounded-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {entry.workOrderId}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                      </div>
                      <p className="text-xs text-foreground">{entry.summary}</p>
                      <p className="text-[11px] text-foreground/60 mt-1">{entry.outcome}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No prior service history for this equipment.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 5. Diagnostic Hypothesis */}
          <AccordionItem value="hypothesis" className="border-white/5">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <SectionIcon icon={<Brain className="w-4 h-4" />} label="Diagnostic Hypothesis" />
            </AccordionTrigger>
            <AccordionContent>
              {order.hypothesis.symptom ? (
                <div className="flex flex-col gap-3">
                  {/* Confidence */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border rounded-sm ${CONFIDENCE_STYLES[order.hypothesis.confidence]}`}
                    >
                      {order.hypothesis.confidence} confidence
                    </span>
                  </div>

                  {/* Symptom */}
                  <div>
                    <TechLabel>Symptom</TechLabel>
                    <p className="text-xs text-foreground mt-1">{order.hypothesis.symptom}</p>
                  </div>

                  {/* Sub-system analysis */}
                  <div>
                    <TechLabel>Sub-System Analysis</TechLabel>
                    <div className="mt-1 flex flex-col gap-2">
                      {order.hypothesis.subSystemAnalysis.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-foreground/70"
                        >
                          <span className="text-accent font-mono text-[10px] mt-0.5 shrink-0">
                            {i + 1}.
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Root cause */}
                  <div className="p-3 bg-accent/5 border border-accent/20 rounded-sm">
                    <TechLabel>Likely Root Cause</TechLabel>
                    <p className="text-xs text-foreground mt-1 leading-relaxed">
                      {order.hypothesis.likelyRootCause}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No diagnostic hypothesis available.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 6. Prior Work */}
          <AccordionItem value="priorWork" className="border-white/5">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <SectionIcon icon={<ClipboardList className="w-4 h-4" />} label="Prior Work Done" />
            </AccordionTrigger>
            <AccordionContent>
              {order.priorWork ? (
                <p className="text-xs text-foreground/70 leading-relaxed">{order.priorWork}</p>
              ) : (
                <p className="text-xs text-muted-foreground">No prior work recorded.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 7. Recommended Spare Parts */}
          <AccordionItem value="parts" className="border-white/5">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <SectionIcon icon={<Package className="w-4 h-4" />} label="Recommended Spare Parts" />
            </AccordionTrigger>
            <AccordionContent>
              {order.recommendedParts.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {order.recommendedParts.map((part) => (
                    <div
                      key={part.sku}
                      className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-sm"
                    >
                      <div>
                        <p className="text-xs text-foreground font-semibold">{part.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {part.sku}
                          </span>
                          <span className="text-white/20">·</span>
                          <span className="text-[10px] text-muted-foreground">
                            Qty: {part.quantity}
                          </span>
                        </div>
                      </div>
                      {part.inStock ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400">
                          <XCircle className="w-3 h-3" /> Order Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No parts recommended.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* 8. Required Tools */}
          <AccordionItem value="tools" className="border-white/5">
            <AccordionTrigger className="text-sm hover:no-underline py-3">
              <SectionIcon icon={<Wrench className="w-4 h-4" />} label="Required Tools" />
            </AccordionTrigger>
            <AccordionContent>
              {order.requiredTools.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {order.requiredTools.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-sm"
                    >
                      <Wrench className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-foreground font-semibold">{tool.name}</p>
                        <p className="text-[11px] text-foreground/60 mt-0.5">{tool.purpose}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No specific tools listed.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <BeamButton onClick={handleBeginInspection}>Begin Inspection</BeamButton>
          <button
            onClick={() => navigate("/orders")}
            className="text-xs text-muted-foreground hover:text-foreground text-center py-2 transition-colors"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
