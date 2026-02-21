import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCopilotStore } from "@/store/useCopilotStore";
import type { ServiceOrder, WorkStatus } from "@/store/useCopilotStore";
import { TechLabel } from "@/components/UI/IndustrialAtoms";
import { MapPin, BookOpen, Plus } from "lucide-react";

const STATUS_FILTERS: { label: string; value: WorkStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "In Progress", value: "in_progress" },
  { label: "Pending Parts", value: "pending_parts" },
  { label: "Pending Approval", value: "pending_approval" },
  { label: "Completed", value: "completed" },
];

const STATUS_STYLES: Record<WorkStatus, string> = {
  new: "bg-accent/10 border-accent/30 text-accent",
  in_progress: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  pending_parts: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  pending_approval: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  completed: "bg-white/5 border-white/10 text-muted-foreground",
};

const STATUS_LABELS: Record<WorkStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  pending_parts: "Pending Parts",
  pending_approval: "Pending Approval",
  completed: "Completed",
};

const ServiceOrders: React.FC = () => {
  const { serviceOrders } = useCopilotStore();
  const [activeFilter, setActiveFilter] = useState<WorkStatus | "all">("all");
  const navigate = useNavigate();

  const filtered =
    activeFilter === "all"
      ? serviceOrders
      : serviceOrders.filter((o) => o.status === activeFilter);

  const handleSelect = (order: ServiceOrder) => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <TechLabel>Service Orders</TechLabel>
          <div className="flex items-baseline gap-3 mt-1">
            <h1 className="font-serif italic text-2xl text-foreground">Your Queue</h1>
            <span className="text-xs font-mono text-muted-foreground">{filtered.length} orders</span>
          </div>
        </div>
        <button
          onClick={() => navigate("/resources")}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-sm text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-white/10 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Resources
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold border rounded-sm transition-colors ${
              activeFilter === f.value
                ? "border-accent text-accent bg-accent/5"
                : "border-white/5 text-muted-foreground bg-white/[0.02] hover:border-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {filtered.map((order) => (
          <button
            key={order.id}
            onClick={() => handleSelect(order)}
            className="w-full text-left p-4 bg-white/[0.02] border border-white/5 rounded-sm transition-colors hover:border-white/10 active:bg-white/[0.04]"
          >
            {/* Top row: ID + status */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-foreground">{order.id}</span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border rounded-sm ${STATUS_STYLES[order.status]}`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            {/* Customer name */}
            <p className="text-foreground font-semibold text-sm mb-1.5">{order.customer}</p>

            {/* System + OEM */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {order.system}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {order.oemBrand}
              </span>
            </div>

            {/* Description */}
            <p className="text-foreground/70 text-xs leading-relaxed mb-2">{order.description}</p>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="text-[10px] leading-snug">{order.location}</span>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-12">No orders match this filter.</p>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/orders/new")}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ServiceOrders;
