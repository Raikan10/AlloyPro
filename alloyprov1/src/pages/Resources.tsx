import React from "react";
import { useNavigate } from "react-router-dom";
import { TechLabel } from "@/components/UI/IndustrialAtoms";
import { KNOWLEDGE_RESOURCES } from "@/data/knowledgeResources";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, ExternalLink, ArrowLeft } from "lucide-react";

const Resources: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <TechLabel>Knowledge Base</TechLabel>
          <h1 className="font-serif italic text-2xl text-foreground mt-1">
            Resources
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
      </div>

      {/* Resource hierarchy */}
      <Accordion type="multiple" defaultValue={["system-0"]} className="flex flex-col gap-2">
        {KNOWLEDGE_RESOURCES.map((sys, si) => (
          <AccordionItem
            key={si}
            value={`system-${si}`}
            className="border-0 bg-white/[0.02] border border-white/5 rounded-sm overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-accent">
                  System
                </span>
                <span className="text-foreground font-semibold text-sm">
                  {sys.system}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex flex-col gap-3">
                {sys.oems.map((oem, oi) => (
                  <div
                    key={oi}
                    className="bg-white/[0.02] border border-white/5 rounded-sm overflow-hidden"
                  >
                    {/* OEM header */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        OEM
                      </span>
                      <p className="text-foreground font-semibold text-sm mt-0.5">
                        {oem.oem}
                      </p>
                    </div>

                    {/* Sub-systems */}
                    <div className="p-4 flex flex-col gap-4">
                      {oem.subSystems.map((sub, ssi) => (
                        <div key={ssi} className="flex flex-col gap-3">
                          {/* Sub-system info */}
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Sub-system
                            </span>
                            <p className="text-foreground font-semibold text-sm mt-0.5">
                              {sub.name}
                            </p>
                            <p className="text-foreground/60 text-xs leading-relaxed mt-1">
                              {sub.description}
                            </p>
                            <a
                              href={sub.overviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2 text-[10px] uppercase tracking-wider text-accent hover:text-accent/80 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Overview Page
                            </a>
                          </div>

                          {/* Components */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Components
                            </span>
                            {sub.components.map((comp, ci) => (
                              <div
                                key={ci}
                                className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-sm"
                              >
                                <span className="text-foreground font-mono text-sm font-semibold">
                                  {comp.name}
                                </span>
                                <a
                                  href={comp.datasheetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground text-[10px] uppercase tracking-wider hover:bg-white/10 transition-colors"
                                >
                                  <FileText className="w-3 h-3" />
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
};

export default Resources;
