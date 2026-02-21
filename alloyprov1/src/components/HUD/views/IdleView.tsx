import React from "react";
import { useNavigate } from "react-router-dom";
import { useCopilotStore } from "@/store/useCopilotStore";
import { BeamButton, TechLabel } from "@/components/UI/IndustrialAtoms";
import { MapPin } from "lucide-react";

const IdleView: React.FC = () => {
  const { selectedOrder, beginInspection, hasPermissions } = useCopilotStore();
  const navigate = useNavigate();

  if (!selectedOrder) {
    navigate("/orders", { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <TechLabel>Selected Order</TechLabel>
        <h1 className="font-serif italic text-2xl text-foreground mt-1">{selectedOrder.id}</h1>
      </div>

      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm space-y-2">
        <p className="text-foreground font-semibold text-sm">{selectedOrder.customer}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{selectedOrder.system}</span>
          <span className="text-white/20">·</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{selectedOrder.oemBrand}</span>
        </div>
        <p className="text-foreground/70 text-xs leading-relaxed">{selectedOrder.description}</p>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px]">{selectedOrder.location}</span>
        </div>
      </div>

      <BeamButton onClick={beginInspection} disabled={!hasPermissions}>
        Begin Inspection · {selectedOrder.id}
      </BeamButton>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Orders
        </button>
        <span className="text-white/20">·</span>
        <button
          onClick={() => navigate("/resources")}
          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          View Docs
        </button>
      </div>
    </div>
  );
};

export default IdleView;
