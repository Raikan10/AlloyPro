import { Navigate } from "react-router-dom";
import { useCopilotStore } from "@/store/useCopilotStore";
import HUDLayout from "@/components/HUD/HUDLayout";

const Index = () => {
  const selectedOrder = useCopilotStore((s) => s.selectedOrder);

  if (!selectedOrder) {
    return <Navigate to="/orders" replace />;
  }

  return <HUDLayout />;
};

export default Index;
