import type {
  Request,
  SoaExtraction,
  SoaFootnote,
  SoaTable,
} from '@/features/requests/schema'
import { footnoteMarker } from '@/features/requests/utils/footnotes'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export const requests: Request[] = [
  {
    id: 'REQ-1001',
    title: 'ONC-2041 Phase II NSCLC Protocol v3.0',
    description:
      'Final approved protocol for the Phase II non-small cell lung cancer study. Schedule of Activities extracted and verified against the visit windows in Section 6.',
    status: 'Approved',
    attachments: [{ name: 'ONC-2041_Protocol_v3.0.pdf', size: 2841320 }],
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
  },
  {
    id: 'REQ-1002',
    title: 'CARD-7788 Phase III Heart Failure Protocol Amendment 2',
    description:
      'Amendment 2 revises the eligibility criteria and adds an additional echocardiogram at Week 12. Needs Schedule of Activities re-extraction and a summary of changes.',
    status: 'Submitted',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'REQ-1003',
    title: "NEURO-1120 Phase I Alzheimer's First-in-Human Protocol v1.1",
    description:
      'First-in-human single ascending dose study. Processing is underway for the dosing schedule, PK sampling timepoints and safety monitoring assessments.',
    status: 'In Progress',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
  },
  {
    id: 'REQ-1004',
    title: 'DIAB-3305 Phase III Type 2 Diabetes Protocol v2.0',
    description:
      'Long-term cardiovascular outcomes study with quarterly visits over 36 months. Please extract the full visit schedule and laboratory assessments.',
    status: 'Submitted',
    attachments: [{ name: 'DIAB-3305_Protocol_v2.0.pdf', size: 3120458 }],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: 'REQ-1005',
    title: 'IMMU-5512 Phase IIb Psoriasis Protocol Synopsis',
    description:
      'Synopsis for the dose-ranging psoriasis study. Extraction of endpoints and PASI assessment timepoints is in progress ahead of the feasibility review.',
    status: 'In Progress',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(8),
  },
  {
    id: 'REQ-1006',
    title: 'VACC-9001 Phase III Vaccine Efficacy Protocol v4.0',
    description:
      'Multi-site randomised, observer-blind vaccine efficacy study. Schedule of Activities has been reviewed by clinical operations and signed off.',
    status: 'Approved',
    attachments: [{ name: 'VACC-9001_Protocol_v4.0.pdf', size: 4502117 }],
    createdAt: daysAgo(20),
    updatedAt: daysAgo(15),
  },
  {
    id: 'REQ-1007',
    title: 'RESP-2276 Phase II Asthma Protocol Amendment 1',
    description:
      'Amendment 1 adds spirometry at Day 3 and updates rescue medication rules. Awaiting processing of the updated Schedule of Activities.',
    status: 'Submitted',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'REQ-1008',
    title: 'ONC-2099 Phase I Dose-Escalation Protocol v1.0',
    description:
      'Phase I 3+3 dose-escalation study in advanced solid tumours. Extraction complete and ready for clinical review of the DLT observation window and PK schedule.',
    status: 'Ready',
    attachments: [{ name: 'ONC-2099_Protocol_v1.0.pdf', size: 1987654 }],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(2),
  },
  {
    id: 'REQ-1009',
    title: 'PED-4410 Pediatric Epilepsy Protocol v2.1 - urgent IRB resubmission',
    description:
      'Revised protocol must be processed today for IRB resubmission. Key change is the updated weight-based dosing table and additional EEG monitoring visits.',
    status: 'Submitted',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: 'REQ-1010',
    title: 'RARE-6003 Phase II Rare Disease Protocol v1.2',
    description:
      'Open-label study in a rare metabolic disorder with a small enrolment target. Extraction is complete and awaiting reviewer sign-off.',
    status: 'Ready',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]

/** How long the mock extraction keeps a request 'In Progress'. Tests shorten this. */
export const extractionTiming = {
  durationMs: 7000,
}

const SAMPLE_TABLES: Omit<SoaTable, 'id' | 'index'>[] = [
  {
    title: 'Screening and Baseline',
    pageRange: '38–39',
    rowCount: 18,
    columnCount: 4,
    footnotes: [
      { id: '', marker: '', text: 'Screening assessments must be completed within 28 days prior to Day 1.' },
      { id: '', marker: '', text: 'Informed consent must be obtained before any study-specific procedure.' },
      { id: '', marker: '', text: 'Pregnancy test for women of childbearing potential only.' },
    ],
  },
  {
    title: 'Treatment Period',
    pageRange: '40–43',
    rowCount: 24,
    columnCount: 12,
    footnotes: [
      { id: '', marker: '', text: 'Visit window of ±3 days applies to all treatment visits after Day 1.' },
      { id: '', marker: '', text: 'Vital signs collected pre-dose and 30 minutes post-dose.' },
      { id: '', marker: '', text: 'ECG in triplicate, at least 1 minute apart.' },
      { id: '', marker: '', text: 'Tumour assessment every 6 weeks (±7 days) regardless of dose delays.' },
    ],
  },
  {
    title: 'Pharmacokinetic Sampling',
    pageRange: '44',
    rowCount: 9,
    columnCount: 8,
    footnotes: [
      { id: '', marker: '', text: 'Pre-dose sample to be taken within 60 minutes before dosing.' },
      { id: '', marker: '', text: 'Record actual sampling times in the eCRF.' },
    ],
  },
  {
    title: 'End of Treatment and Follow-up',
    pageRange: '45–46',
    rowCount: 14,
    columnCount: 5,
    footnotes: [
      { id: '', marker: '', text: 'Safety follow-up visit 30 days (±7 days) after the last dose.' },
      { id: '', marker: '', text: 'Survival follow-up by telephone every 12 weeks.' },
    ],
  },
]

export function buildExtraction(requestId: string, jobId: string, extractedAt: string): SoaExtraction {
  return {
    requestId,
    jobId,
    extractedAt,
    tables: SAMPLE_TABLES.map((table, i) => {
      const tableId = `${requestId}-T${i + 1}`
      return {
        ...table,
        id: tableId,
        index: i + 1,
        footnotes: table.footnotes.map<SoaFootnote>((f, j) => ({
          ...f,
          id: `${tableId}-F${j + 1}`,
          marker: footnoteMarker(j),
        })),
      }
    }),
  }
}

/** Mock-only bookkeeping: when each running extraction started. The API exposes just the request status. */
export const extractionStarts = new Map<string, { runId: string; startedAt: number }>()

export const extractions = new Map<string, SoaExtraction>([
  ['REQ-1001', buildExtraction('REQ-1001', 'JOB-1001-1', daysAgo(3))],
])
