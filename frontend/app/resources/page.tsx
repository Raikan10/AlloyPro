'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { TechLabel } from '@/components/alloypro/IndustrialAtoms';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { KNOWLEDGE_RESOURCES } from '@/data/knowledgeResources';

export default function Resources() {
  const router = useRouter();

  return (
    <div className="bg-background flex min-h-screen flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <TechLabel>Knowledge Base</TechLabel>
          <h1 className="text-foreground mt-1 font-serif text-2xl italic">Resources</h1>
        </div>
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[10px] tracking-wider uppercase transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>
      </div>

      {/* Resource hierarchy */}
      <Accordion type="multiple" defaultValue={['system-0']} className="flex flex-col gap-2">
        {KNOWLEDGE_RESOURCES.map((sys, si) => (
          <AccordionItem
            key={si}
            value={`system-${si}`}
            className="overflow-hidden rounded-sm border border-white/5 bg-white/[0.02]"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-white/[0.02] hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="text-accent text-[10px] font-semibold tracking-wider uppercase">
                  System
                </span>
                <span className="text-foreground text-sm font-semibold">{sys.system}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex flex-col gap-3">
                {sys.oems.map((oem, oi) => (
                  <div
                    key={oi}
                    className="overflow-hidden rounded-sm border border-white/5 bg-white/[0.02]"
                  >
                    {/* OEM header */}
                    <div className="border-b border-white/5 px-4 py-3">
                      <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        OEM
                      </span>
                      <p className="text-foreground mt-0.5 text-sm font-semibold">{oem.oem}</p>
                    </div>

                    {/* Sub-systems */}
                    <div className="flex flex-col gap-4 p-4">
                      {oem.subSystems.map((sub, ssi) => (
                        <div key={ssi} className="flex flex-col gap-3">
                          {/* Sub-system info */}
                          <div>
                            <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                              Sub-system
                            </span>
                            <p className="text-foreground mt-0.5 text-sm font-semibold">
                              {sub.name}
                            </p>
                            <p className="text-foreground/60 mt-1 text-xs leading-relaxed">
                              {sub.description}
                            </p>
                            <a
                              href={sub.overviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent/80 mt-2 inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Overview Page
                            </a>
                          </div>

                          {/* Components */}
                          <div className="flex flex-col gap-2">
                            <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                              Components
                            </span>
                            {sub.components.map((comp, ci) => (
                              <div
                                key={ci}
                                className="flex items-center justify-between rounded-sm border border-white/5 bg-white/[0.02] p-3"
                              >
                                <span className="text-foreground font-mono text-sm font-semibold">
                                  {comp.name}
                                </span>
                                <a
                                  href={comp.datasheetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-foreground flex items-center gap-1.5 border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] tracking-wider uppercase transition-colors hover:bg-white/10"
                                >
                                  <FileText className="h-3 w-3" />
                                  Data Sheet
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
