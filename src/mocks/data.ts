import type { SoaTableExtractionResultDto } from '@/features/requests/api/dto'
import type { Request } from '@/features/requests/schema'
import sample from '@/mocks/fixtures/soa-sample.json'

// A real record from the database, as returned by the extraction endpoint.
const sampleRecord = sample as SoaTableExtractionResultDto

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
  {
    id: 'REQ-1011',
    title: 'HEP-8120 Phase II Hepatitis B Protocol v1.0 (scanned copy)',
    description:
      'Scanned copy of the protocol received from the sponsor. A searchable PDF has been requested.',
    status: 'Failed',
    error:
      'No Schedule of Activities table could be detected in HEP-8120_Protocol_v1.0_scan.pdf. The document has no text layer; upload a searchable PDF and try again.',
    attachments: [{ name: 'HEP-8120_Protocol_v1.0_scan.pdf', size: 8734201 }],
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  },
]

/** How long the mock extraction keeps a request 'In Progress'. Tests shorten this. */
export const extractionTiming = {
  durationMs: 7000,
}

/** One extraction run, as the API stores it: a record per table. Returns the sample record. */
export function buildExtraction(
  requestId: string,
  extractedAt: string,
): SoaTableExtractionResultDto[] {
  return [
    {
      ...structuredClone(sampleRecord),
      id: `${requestId}-T1`,
      requestId,
      documentId: `${requestId}-D1`,
      extractedDate: extractedAt,
    },
  ]
}

/** Mock-only bookkeeping: when each running extraction started. The API exposes just the request status. */
export const extractionStarts = new Map<string, { startedAt: number }>()

export const extractions = new Map<string, SoaTableExtractionResultDto[]>([
  ['REQ-1001', buildExtraction('REQ-1001', daysAgo(3))],
])
