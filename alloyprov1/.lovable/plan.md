

# Service Order Detail Briefing Page

## What Changes

When a technician taps a service order card on the `/orders` page, instead of going straight to the HUD, they land on a new **Order Detail / Briefing** page at `/orders/:id`. This page gives the junior technician everything they need to prepare before attempting the repair.

The `ServiceOrder` data model gets significantly enriched with reporter info, service history, diagnostic hypothesis, prior work, recommended spare parts, and required tools. The new service request form also captures these additional fields.

---

## New Flow

```text
[/orders] --tap card--> [/orders/:id — Briefing Page] --"Begin Inspection"--> [/ — HUD]
```

---

## Briefing Page Sections (`/orders/:id`)

Full-screen scrollable page with collapsible sections:

### 1. Issue Summary
- Short summary of the reported problem (the existing `description` field, expanded)
- "View Full Report" button that opens a collapsible with the full detail text, plus any attached media thumbnails
- Reported date and exact location (floor, room, address)

### 2. Reporter Contact
- Name of who reported the issue (e.g., "Sarah Chen, Facilities Manager")
- Email address (tap to compose)
- Phone number (tap to call)

### 3. When and Where
- Date and time the issue was reported (e.g., "14 Feb 2026, 09:32")
- Exact location: building, floor, room/zone, full address
- Displayed with MapPin icon and formatted clearly

### 4. Service History
- List of recent service events for this equipment/location
- Each entry: date, work order ID, summary, outcome
- A flag if the issue appears to be recurring (highlighted in amber)
- If no history, shows "No prior service history for this equipment"

### 5. Diagnostic Hypothesis
- AI-generated chain-of-thought reasoning that walks through likely root causes
- Structured as: Symptom -> Possible sub-system failures -> Most likely root cause
- Identifies specific sub-systems (e.g., "VAV damper actuator", "pressure sensor") rather than generic descriptions
- Confidence level indicator (High / Medium / Low)

### 6. Prior Work Done
- Summary of any diagnostic or repair work already attempted
- Who did it and when
- What was the outcome (e.g., "Replaced filter, issue persisted")
- If none, shows "No prior work recorded"

### 7. Recommended Spare Parts
- List of parts the technician should bring
- Each part: name, SKU, quantity needed
- Availability indicator (in stock / order required)

### 8. Required Tools
- Checklist of tools needed for this job
- Each tool: name and purpose (e.g., "Manometer -- verify duct static pressure")

At the bottom: **"Begin Inspection"** BeamButton (same behavior as current IdleView) and a "Back to Orders" link.

---

## Technical Details

### 1. Expand `ServiceOrder` Interface (`useCopilotStore.ts`)

```typescript
interface IssueReporter {
  name: string;
  email: string;
  phone: string;
}

interface ServiceHistoryEntry {
  date: string;
  workOrderId: string;
  summary: string;
  outcome: string;
}

interface DiagnosticHypothesis {
  symptom: string;
  subSystemAnalysis: string[];
  likelyRootCause: string;
  confidence: "high" | "medium" | "low";
}

interface RecommendedPart {
  name: string;
  sku: string;
  quantity: number;
  inStock: boolean;
}

interface RequiredTool {
  name: string;
  purpose: string;
}

interface ServiceOrder {
  id: string;
  customer: string;
  system: SystemType;
  oemBrand: OemBrand;
  status: WorkStatus;
  description: string;           // short summary
  fullDetail: string;            // NEW -- full report text
  location: string;
  locationDetail: string;        // NEW -- floor, room, zone
  reportedAt: string;            // NEW -- ISO date string
  reporter: IssueReporter;       // NEW
  serviceHistory: ServiceHistoryEntry[];  // NEW
  isRecurring: boolean;          // NEW
  hypothesis: DiagnosticHypothesis;       // NEW
  priorWork: string;             // NEW -- summary of work done
  recommendedParts: RecommendedPart[];    // NEW
  requiredTools: RequiredTool[];          // NEW
  media?: string[];              // NEW -- captured photo/video URLs
}
```

### 2. Expand Mock Data

Each of the 6 existing mock orders gets populated with realistic data for all new fields. For example, WO-1042 (Dawn Capital, HVAC bearing noise):

```typescript
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
}
```

### 3. New Briefing Page (`src/pages/OrderDetail.tsx`)

A new full-screen page component:
- Uses `useParams()` to get `:id` from the URL
- Finds the matching order from the store's `serviceOrders` array
- Renders all 8 sections using Radix Collapsible components for expandable detail
- "Begin Inspection" button at the bottom calls `selectOrder` then `beginInspection` and navigates to `/`
- "Back to Orders" link
- Redirects to `/orders` if order ID not found

### 4. Update Routing (`src/App.tsx`)

Add: `<Route path="/orders/:id" element={<OrderDetail />} />`

### 5. Update Service Orders Navigation (`ServiceOrders.tsx`)

Change `handleSelect` to navigate to `/orders/${order.id}` instead of selecting and going to `/`.

### 6. Update New Service Request Form (`NewServiceRequest.tsx`)

Add fields for the new data:
- **Reporter section**: name, email, phone inputs
- **Location detail**: additional input for floor/room/zone
- **Full detail**: the existing description textarea becomes `fullDetail`; add a short summary input for `description`

The other new fields (service history, hypothesis, parts, tools) are auto-generated or left empty for new requests since they would typically be populated by a dispatcher or AI system, not the field technician creating the request.

Default values for new service requests:
```typescript
reportedAt: new Date().toISOString(),
reporter: { name, email, phone },  // from form inputs
serviceHistory: [],
isRecurring: false,
hypothesis: { symptom: "", subSystemAnalysis: [], likelyRootCause: "", confidence: "low" },
priorWork: "",
recommendedParts: [],
requiredTools: [],
locationDetail: "",  // from form input
fullDetail: "",      // from form input
```

### 7. Simplify IdleView

IdleView becomes minimal -- if no order is selected, redirect to `/orders`. Otherwise it can remain as-is since the briefing page now handles the detailed view.

### 8. Files Changed/Created

| File | Action |
|------|--------|
| `src/store/useCopilotStore.ts` | Expand interfaces, update mock data, update `addServiceOrder` |
| `src/pages/OrderDetail.tsx` | **New** -- full briefing page with all 8 sections |
| `src/App.tsx` | Add `/orders/:id` route |
| `src/pages/ServiceOrders.tsx` | Update navigation to go to `/orders/:id` |
| `src/pages/NewServiceRequest.tsx` | Add reporter, location detail, and full detail fields |

### 9. No New Dependencies

Uses existing Radix Collapsible, Lucide icons (User, Mail, Phone, Clock, MapPin, Wrench, Package, AlertTriangle, ChevronDown, Brain), and Tailwind.

