import type { OemBrand, SystemType } from '@/hooks/useCopilotStore';

export interface ComponentResource {
  name: string;
  datasheetUrl: string;
}

export interface SubSystem {
  name: string;
  description: string;
  overviewUrl: string;
  components: ComponentResource[];
}

export interface OemResources {
  oem: OemBrand;
  subSystems: SubSystem[];
}

export interface SystemResources {
  system: SystemType;
  oems: OemResources[];
}

export const KNOWLEDGE_RESOURCES: SystemResources[] = [
  {
    system: 'HVAC',
    oems: [
      {
        oem: 'Trox Technik',
        subSystems: [
          {
            name: 'Variable Air Volume (VAV) Terminal Unit',
            description:
              'Controls airflow to specific rooms or zones to maintain temperature. Regulates air supply using a damper, actuator, and airflow sensor, often combined with optional heating coils for perimeter zones.',
            overviewUrl:
              'https://www.troxuk.co.uk/vav-terminal-units/tve-vav-terminal-units-3216b8eb8255b54f',
            components: [
              {
                name: 'XB0',
                datasheetUrl:
                  'https://cdn.trox.de/ac1530f499bc6922/5501fb4248ef/XB0_PD_2025_02_28_DE_en.pdf',
              },
              {
                name: 'XS0-J6',
                datasheetUrl:
                  'https://cdn.trox.de/f885dcbc7138d6ba/a321bf673418/XS0-J6_PD_2025_03_11_DE_en.pdf',
              },
            ],
          },
        ],
      },
    ],
  },
];
