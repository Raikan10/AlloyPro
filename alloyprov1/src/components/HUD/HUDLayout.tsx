import React from "react";
import ViewportAR from "@/components/HUD/ViewportAR";
import CockpitSheet from "@/components/HUD/CockpitSheet";

const HUDLayout: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <ViewportAR />
      <CockpitSheet />
    </div>
  );
};

export default HUDLayout;
