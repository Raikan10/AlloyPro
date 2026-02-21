'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Package,
  Terminal,
  Truck,
} from 'lucide-react';
import { BeamButton, TechLabel } from '@/components/alloypro/IndustrialAtoms';
import { useCopilotStore } from '@/hooks/useCopilotStore';

export default function PurchaseOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { serviceOrders } = useCopilotStore();

  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = serviceOrders.find((o) => o.id === id);

  if (!order) {
    router.replace('/orders');
    return null;
  }

  // The primary recommended part (e.g., VAV Unit Controller)
  const part = order.recommendedParts[0];

  const handlePlaceOrder = async () => {
    setIsOrdering(true);
    setError(null);

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: order,
          partDetails: part || { name: 'VAV Unit Controller', sku: 'VAV-CTRL-X1', quantity: 1 },
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error.');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setOrderComplete(true);
    } catch (err: any) {
      setError(err.message || 'Failed to process purchase order via Dust API.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="bg-softblack flex min-h-screen flex-col items-center justify-center p-6 font-sans text-white">
        <div className="animate-in fade-in zoom-in-95 w-full max-w-md duration-500">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="mb-2 flex h-20 w-20 animate-bounce items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <TechLabel className="bg-emerald-500/20 text-emerald-400">SUCCESS</TechLabel>
              <h1 className="font-serif text-3xl tracking-tight italic">Purchase Order Placed</h1>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                The PO for <span className="text-foreground">{part?.name || 'VAV Unit'}</span> has
                been automatically generated and submitted to procurement via Dust integration.
              </p>
            </div>

            <div className="mt-6 w-full space-y-3 rounded-sm border border-white/10 bg-white/5 p-4 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground tracking-wider uppercase">Order Ref:</span>
                <span className="text-accent font-mono">
                  PO-{(Math.random() * 10000).toFixed(0).padStart(4, '0')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground tracking-wider uppercase">Assigned to:</span>
                <span className="font-semibold">{order.customer}</span>
              </div>
            </div>

            <div className="w-full pt-8">
              <BeamButton onClick={() => router.push('/')}>Return to Dashboard</BeamButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-softblack min-h-screen font-sans text-white">
      {/* Header */}
      <header className="fixed top-0 z-40 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-sm bg-white/5 hover:bg-white/10"
            disabled={isOrdering}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <TechLabel className="text-accent">Procurement</TechLabel>
          <div className="h-10 w-10" />
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-6 pt-24 pb-32">
        <div className="mb-8 space-y-2">
          <h1 className="font-serif text-3xl tracking-tight italic">Finalize Order</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Review the required materials for {order.customer} and securely process the purchase
            order.
          </p>
        </div>

        {error && (
          <div className="animate-in fade-in slide-in-from-top-2 border-destructive/50 bg-destructive/10 text-destructive mb-6 flex items-start gap-3 rounded-sm border p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-mono text-xs font-bold tracking-wider uppercase">System Error</p>
              <p className="mt-1 text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Part Summary */}
          <div className="overflow-hidden rounded-sm border border-white/10 bg-white/5">
            <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.02] p-4">
              <Package className="text-accent h-5 w-5" />
              <h2 className="font-semibold tracking-wide">Required Parts</h2>
            </div>

            <div className="space-y-4 p-4">
              {order.recommendedParts.length > 0 ? (
                order.recommendedParts.map((p) => (
                  <div key={p.sku} className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-muted-foreground mt-0.5 font-mono text-xs">{p.sku}</p>
                    </div>
                    <span className="rounded-sm bg-white/10 px-2 py-1 font-mono text-xs">
                      Qty: {p.quantity}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">VAV Unit Controller</p>
                    <p className="text-muted-foreground mt-0.5 font-mono text-xs">VAV-CTRL-X1</p>
                  </div>
                  <span className="rounded-sm bg-white/10 px-2 py-1 font-mono text-xs">Qty: 1</span>
                </div>
              )}
            </div>
          </div>

          {/* Integration Info */}
          <div className="border-accent/20 bg-accent/5 space-y-3 rounded-sm border p-4">
            <div className="flex items-center gap-2">
              <Terminal className="text-accent h-4 w-4" />
              <p className="text-accent font-mono text-xs font-bold tracking-wider uppercase">
                Dust AI Integration
              </p>
            </div>
            <p className="text-foreground/80 text-xs leading-relaxed">
              This purchase order will be generated and filed automatically using our Dust app
              integration, extracting data directly from the diagnostic session context.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <BeamButton onClick={handlePlaceOrder} disabled={isOrdering}>
            {isOrdering ? (
              <span className="flex items-center gap-2">
                <div className="border-background h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                Processing via Dust...
              </span>
            ) : (
              'Place Purchase Order'
            )}
          </BeamButton>
        </div>
      </main>
    </div>
  );
}
