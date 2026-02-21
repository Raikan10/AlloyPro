import { create } from "zustand";

export type WorkflowState = "idle" | "procedure" | "part_identification" | "reporting";
export type WorkStatus = "new" | "in_progress" | "pending_parts" | "pending_approval" | "completed";
export type SystemType = "HVAC" | "Projector";
export type OemBrand = "Trox Technik" | "Fuji" | "Panasonic";

export interface IssueReporter {
  name: string;
  email: string;
  phone: string;
}

export interface ServiceHistoryEntry {
  date: string;
  workOrderId: string;
  summary: string;
  outcome: string;
}

export interface DiagnosticHypothesis {
  symptom: string;
  subSystemAnalysis: string[];
  likelyRootCause: string;
  confidence: "high" | "medium" | "low";
}

export interface RecommendedPart {
  name: string;
  sku: string;
  quantity: number;
  inStock: boolean;
}

export interface RequiredTool {
  name: string;
  purpose: string;
}

export interface ServiceOrder {
  id: string;
  customer: string;
  system: SystemType;
  oemBrand: OemBrand;
  status: WorkStatus;
  description: string;
  fullDetail: string;
  location: string;
  locationDetail: string;
  reportedAt: string;
  reporter: IssueReporter;
  serviceHistory: ServiceHistoryEntry[];
  isRecurring: boolean;
  hypothesis: DiagnosticHypothesis;
  priorWork: string;
  recommendedParts: RecommendedPart[];
  requiredTools: RequiredTool[];
  media?: string[];
}

const MOCK_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: "WO-1042",
    customer: "Dawn Capital",
    system: "HVAC",
    oemBrand: "Trox Technik",
    status: "new",
    description: "AHU-3 supply fan bearing noise",
    fullDetail: "Loud grinding noise from AHU-3 supply fan during peak load. Noise increases with fan speed. First noticed Monday morning after weekend shutdown. Building occupants on Level 7 reporting vibration.",
    location: "Level 7, Ilona Rose House, Manette St, London W1D 4AL",
    locationDetail: "Plant Room 7B, AHU-3 enclosure",
    reportedAt: "2026-02-14T09:32:00Z",
    reporter: { name: "Sarah Chen", email: "s.chen@dawncapital.com", phone: "+44 20 7946 0123" },
    serviceHistory: [
      { date: "2025-11-20", workOrderId: "WO-0987", summary: "Belt tension adjustment on AHU-3", outcome: "Resolved — noise eliminated" },
      { date: "2025-06-15", workOrderId: "WO-0812", summary: "AHU-3 bearing lubrication", outcome: "Preventive maintenance completed" },
    ],
    isRecurring: true,
    hypothesis: {
      symptom: "Grinding noise increasing with fan speed",
      subSystemAnalysis: [
        "Supply fan drive bearing (SKF 6205) — likely worn due to recurring history; previous belt tension issue may have caused misalignment leading to premature bearing wear",
        "Fan belt — less likely as belt was adjusted 3 months ago, but check for glazing",
        "Motor mount — vibration could indicate loose motor mounting bolts",
      ],
      likelyRootCause: "Supply fan drive bearing failure due to misalignment from prior belt tension issue",
      confidence: "high",
    },
    priorWork: "",
    recommendedParts: [
      { name: "SKF 6205-2RS Bearing", sku: "BRG-6205", quantity: 2, inStock: true },
      { name: "Drive belt Gates 3VX-500", sku: "BLT-3VX500", quantity: 1, inStock: true },
    ],
    requiredTools: [
      { name: "Bearing puller set", purpose: "Remove worn bearing from fan shaft" },
      { name: "Vibration analyzer", purpose: "Confirm bearing as vibration source" },
      { name: "Laser alignment tool", purpose: "Verify motor-fan shaft alignment" },
      { name: "Torque wrench", purpose: "Tighten motor mount bolts to spec" },
    ],
  },
  {
    id: "WO-1038",
    customer: "Huckletree Shoreditch",
    system: "Projector",
    oemBrand: "Panasonic",
    status: "in_progress",
    description: "PT-RZ120 laser module dim output",
    fullDetail: "Projector in main event space producing noticeably dimmer image over past two weeks. Colours appear washed out, especially reds. Lamp hours at 4,200. Client has important presentation next Thursday.",
    location: "18 Finsbury Square, London EC2A 1AH",
    locationDetail: "Event Space, ceiling-mounted bracket C2",
    reportedAt: "2026-02-10T14:15:00Z",
    reporter: { name: "James Okafor", email: "j.okafor@huckletree.com", phone: "+44 20 7946 0456" },
    serviceHistory: [
      { date: "2025-09-01", workOrderId: "WO-0901", summary: "Lens cleaning and filter replacement", outcome: "Brightness restored to spec" },
    ],
    isRecurring: false,
    hypothesis: {
      symptom: "Progressive dimming with colour washout after 4,200 lamp hours",
      subSystemAnalysis: [
        "Laser diode module — nearing end of rated life at 4,200h; progressive dimming is characteristic of phosphor wheel or diode degradation",
        "Polarisation filter — colour washout could indicate filter coating deterioration",
        "Dust accumulation on optical path — less likely given recent filter service, but inspect light tunnel",
      ],
      likelyRootCause: "Laser diode phosphor wheel degradation at 4,200h requiring module replacement",
      confidence: "medium",
    },
    priorWork: "Lens cleaning performed on-site by building maintenance — no improvement noted.",
    recommendedParts: [
      { name: "PT-RZ120 Laser Module Assembly", sku: "PAN-LM120", quantity: 1, inStock: false },
      { name: "Polarisation filter set", sku: "PAN-PF120", quantity: 1, inStock: true },
    ],
    requiredTools: [
      { name: "Projector service key set", purpose: "Open chassis and optical assembly" },
      { name: "Lux meter", purpose: "Measure output before and after service" },
      { name: "Anti-static wrist strap", purpose: "Protect laser module during replacement" },
    ],
  },
  {
    id: "WO-1045",
    customer: "WeWork Waterloo",
    system: "HVAC",
    oemBrand: "Fuji",
    status: "pending_parts",
    description: "VRF outdoor unit E3 error code",
    fullDetail: "Outdoor VRF unit displaying E3 high-pressure fault. System locks out after 15 minutes of operation. Three floors affected — tenants reporting no cooling since yesterday morning. Ambient temp 28°C.",
    location: "Waterloo Station, York Rd, London SE1 7ND",
    locationDetail: "Roof level, VRF condenser bank — Unit ODU-2",
    reportedAt: "2026-02-12T08:45:00Z",
    reporter: { name: "Priya Kapoor", email: "p.kapoor@wework.com", phone: "+44 20 7946 0789" },
    serviceHistory: [
      { date: "2026-01-05", workOrderId: "WO-1001", summary: "Refrigerant top-up on ODU-2", outcome: "System recharged — ran for 6 weeks before re-fault" },
      { date: "2025-08-22", workOrderId: "WO-0855", summary: "E3 fault investigation", outcome: "Found low refrigerant — topped up and monitored" },
    ],
    isRecurring: true,
    hypothesis: {
      symptom: "Recurring E3 high-pressure fault with short intervals between top-ups",
      subSystemAnalysis: [
        "Refrigerant leak — recurring top-ups strongly suggest an active leak; check flare joints and service valves on ODU-2 using electronic leak detector",
        "Condenser coil blockage — high ambient + blocked coil would cause high pressure, but wouldn't explain refrigerant loss",
        "Expansion valve malfunction — stuck EXV could cause high-side pressure spike, but pattern better fits leak scenario",
      ],
      likelyRootCause: "Active refrigerant leak at flare joint or service valve causing repeated high-pressure lockout",
      confidence: "high",
    },
    priorWork: "Two previous refrigerant top-ups (Jan 2026, Aug 2025). Leak detection not yet performed — previous visits addressed symptom only.",
    recommendedParts: [
      { name: "Flare nut set 1/4\" – 3/4\"", sku: "FLR-SET-01", quantity: 1, inStock: true },
      { name: "R410A refrigerant 11.3kg", sku: "REF-R410A", quantity: 1, inStock: true },
      { name: "Schrader valve core kit", sku: "VLV-SCH-01", quantity: 1, inStock: true },
    ],
    requiredTools: [
      { name: "Electronic leak detector", purpose: "Locate refrigerant leak source" },
      { name: "Manifold gauge set", purpose: "Verify system pressures" },
      { name: "Nitrogen pressure test kit", purpose: "Confirm leak repair holds" },
      { name: "Vacuum pump", purpose: "Evacuate system before recharge" },
    ],
  },
  {
    id: "WO-1039",
    customer: "Second Home",
    system: "Projector",
    oemBrand: "Fuji",
    status: "pending_approval",
    description: "FP-Z8000 lens shift calibration",
    fullDetail: "Ultra-short-throw projector image drifting upward over past week. Keystone correction maxed out. Image now 15cm off-screen at top edge. Suspected lens shift motor or encoder fault.",
    location: "68-80 Hanbury St, London E1 5JL",
    locationDetail: "Studio 4, wall-mounted UST bracket",
    reportedAt: "2026-02-11T11:20:00Z",
    reporter: { name: "Tom Bradley", email: "t.bradley@secondhome.io", phone: "+44 20 7946 0321" },
    serviceHistory: [],
    isRecurring: false,
    hypothesis: {
      symptom: "Progressive upward image drift with maxed keystone correction",
      subSystemAnalysis: [
        "Lens shift stepper motor — encoder drift or micro-step loss could cause gradual positional error; most likely given progressive nature",
        "Mounting bracket — thermal cycling could cause bracket to shift, but 15cm drift is excessive for mechanical movement",
        "Main board firmware — unlikely but a factory reset should be attempted before hardware replacement",
      ],
      likelyRootCause: "Lens shift stepper motor encoder fault causing positional drift",
      confidence: "medium",
    },
    priorWork: "",
    recommendedParts: [
      { name: "FP-Z8000 Lens Shift Motor Assembly", sku: "FUJI-LSM-8K", quantity: 1, inStock: false },
    ],
    requiredTools: [
      { name: "Micro screwdriver set", purpose: "Access lens shift assembly" },
      { name: "Laser level", purpose: "Verify projected image geometry" },
      { name: "Service laptop with Fuji diagnostic software", purpose: "Run motor calibration and firmware check" },
    ],
  },
  {
    id: "WO-1051",
    customer: "The Office Group",
    system: "HVAC",
    oemBrand: "Panasonic",
    status: "completed",
    description: "Condensate pump overflow alarm",
    fullDetail: "BMS triggered condensate pump high-level alarm on FCU-12. Water detected in drip tray. No visible overflow yet but alarm persistent. FCU serving boardroom — client wants resolved before Monday board meeting.",
    location: "20 Eastbourne Terrace, London W2 6LG",
    locationDetail: "Floor 3, Boardroom ceiling void, FCU-12",
    reportedAt: "2026-02-07T16:00:00Z",
    reporter: { name: "Lisa Morgan", email: "l.morgan@theofficegroup.com", phone: "+44 20 7946 0654" },
    serviceHistory: [
      { date: "2025-12-10", workOrderId: "WO-0965", summary: "Condensate drain flush on Floor 3 FCUs", outcome: "All drains cleared — preventive maintenance" },
    ],
    isRecurring: false,
    hypothesis: {
      symptom: "High-level condensate alarm with water in drip tray",
      subSystemAnalysis: [
        "Condensate pump float switch — stuck float would prevent pump activation; most common cause of high-level alarms",
        "Blocked condensate drain line — possible re-blockage since Dec flush, but only 2 months elapsed",
        "Pump motor failure — would prevent drainage; check pump runs when manually triggered",
      ],
      likelyRootCause: "Condensate pump float switch stuck or failed, preventing automatic pump activation",
      confidence: "high",
    },
    priorWork: "Resolved — float switch was stuck with biofilm. Cleaned float mechanism and flushed drain line. Pump tested and operating normally.",
    recommendedParts: [
      { name: "Replacement float switch", sku: "PMP-FLT-01", quantity: 1, inStock: true },
    ],
    requiredTools: [
      { name: "Wet/dry vacuum", purpose: "Remove standing water from drip tray" },
      { name: "Condensate drain cleaning kit", purpose: "Flush drain line" },
    ],
  },
  {
    id: "WO-1053",
    customer: "Fora Clerkenwell",
    system: "HVAC",
    oemBrand: "Trox Technik",
    status: "new",
    description: "Chiller plant glycol loop pressure drop",
    fullDetail: "BMS showing 0.8 bar pressure in glycol loop — should be 2.5 bar. Pressure dropping ~0.1 bar per day. No visible leaks in plant room. Chiller cycling on low-flow protection. Two floors losing cooling.",
    location: "31-33 Oval Rd, London NW1 7EA",
    locationDetail: "Basement Plant Room, Chiller 1 glycol circuit",
    reportedAt: "2026-02-13T07:10:00Z",
    reporter: { name: "David Osei", email: "d.osei@fora.co", phone: "+44 20 7946 0987" },
    serviceHistory: [
      { date: "2025-10-02", workOrderId: "WO-0932", summary: "Annual glycol concentration test", outcome: "Glycol at 32% — within spec" },
    ],
    isRecurring: false,
    hypothesis: {
      symptom: "Gradual glycol loop pressure drop at 0.1 bar/day with no visible leaks",
      subSystemAnalysis: [
        "Hidden pipe leak — most likely in ceiling void runs between plant room and risers; slow drip rate consistent with 0.1 bar/day loss",
        "Expansion vessel pre-charge — failed bladder or incorrect pre-charge would cause apparent pressure loss; check vessel with tyre gauge",
        "Air separator malfunction — excessive air ingress from faulty auto-air vent could mimic pressure loss",
      ],
      likelyRootCause: "Hidden glycol leak in ceiling void pipework runs, or failed expansion vessel bladder",
      confidence: "medium",
    },
    priorWork: "",
    recommendedParts: [
      { name: "Glycol premix 30% 20L", sku: "GLY-30-20L", quantity: 2, inStock: true },
      { name: "Expansion vessel 50L", sku: "EXP-50L", quantity: 1, inStock: false },
      { name: "Press-fit repair coupling 28mm", sku: "PFC-28", quantity: 4, inStock: true },
    ],
    requiredTools: [
      { name: "Thermal imaging camera", purpose: "Locate hidden leak via temperature differential" },
      { name: "Pressure test pump", purpose: "Isolate and pressure-test loop sections" },
      { name: "Refractometer", purpose: "Check glycol concentration after top-up" },
      { name: "Press-fit tool", purpose: "Install repair couplings if leak found" },
    ],
  },
];

interface IdentifiedPart {
  sku: string;
  name: string;
  leadTime: string;
  cost: string;
  stock: number;
}

const PROCEDURE_STEPS = [
  "Rotate primary isolation valve 90° clockwise",
  "Verify pressure gauge reads below 2.5 bar",
  "Inspect flange gasket for thermal degradation",
  "Disengage lock-out tag-out mechanism",
  "Confirm bypass line is sealed and capped",
];

interface CopilotStore {
  workflowState: WorkflowState;
  activeStep: number;
  isMicActive: boolean;
  identifiedPart: IdentifiedPart | null;
  procedureSteps: string[];
  hasPermissions: boolean;
  voiceTranscript: string;
  serviceOrders: ServiceOrder[];
  selectedOrder: ServiceOrder | null;

  setPermissions: (granted: boolean) => void;
  beginInspection: () => void;
  advanceStep: () => void;
  triggerPartIdentification: () => void;
  completeJob: () => void;
  resetWorkflow: () => void;
  toggleMic: () => void;
  appendTranscript: (text: string) => void;
  clearTranscript: () => void;
  selectOrder: (order: ServiceOrder) => void;
  addServiceOrder: (order: Omit<ServiceOrder, "id" | "status">) => void;
}

export const useCopilotStore = create<CopilotStore>((set, get) => ({
  workflowState: "idle",
  activeStep: 0,
  isMicActive: false,
  identifiedPart: null,
  procedureSteps: PROCEDURE_STEPS,
  hasPermissions: false,
  voiceTranscript: "",
  serviceOrders: MOCK_SERVICE_ORDERS,
  selectedOrder: null,

  setPermissions: (granted) => set({ hasPermissions: granted }),

  beginInspection: () => {
    const { selectedOrder } = get();
    if (!selectedOrder) return;
    set((s) => ({
      workflowState: "procedure",
      activeStep: 0,
      isMicActive: true,
      voiceTranscript: "",
      serviceOrders: s.serviceOrders.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: "in_progress" as WorkStatus } : o
      ),
    }));
  },

  advanceStep: () => {
    const { activeStep, procedureSteps } = get();
    if (activeStep < procedureSteps.length - 1) {
      set({ activeStep: activeStep + 1 });
    } else {
      get().triggerPartIdentification();
    }
  },

  triggerPartIdentification: () =>
    set({
      workflowState: "part_identification",
      isMicActive: false,
      identifiedPart: {
        sku: "SKU-992",
        name: "VALVE_ARRAY_04",
        leadTime: "48h",
        cost: "$1,240.00",
        stock: 4,
      },
    }),

  completeJob: () => set({ workflowState: "reporting", isMicActive: false }),

  resetWorkflow: () =>
    set({
      workflowState: "idle",
      activeStep: 0,
      isMicActive: false,
      identifiedPart: null,
      voiceTranscript: "",
      selectedOrder: null,
    }),

  toggleMic: () => set((s) => ({ isMicActive: !s.isMicActive })),

  appendTranscript: (text) =>
    set((s) => ({
      voiceTranscript: s.voiceTranscript ? `${s.voiceTranscript} ${text}` : text,
    })),

  clearTranscript: () => set({ voiceTranscript: "" }),

  selectOrder: (order) => set({ selectedOrder: order }),

  addServiceOrder: (order) => {
    const { serviceOrders } = get();
    const maxNum = serviceOrders.reduce((max, o) => {
      const num = parseInt(o.id.replace("WO-", ""), 10);
      return num > max ? num : max;
    }, 0);
    const newOrder: ServiceOrder = {
      ...order,
      id: `WO-${maxNum + 1}`,
      status: "new",
    };
    set({ serviceOrders: [newOrder, ...serviceOrders] });
  },
}));
