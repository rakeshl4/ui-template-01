import type { Request } from '@/features/requests/schema'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export const requests: Request[] = [
  {
    id: 'REQ-1001',
    title: 'Laptop replacement for finance team',
    description:
      'Current laptop is over 5 years old and struggles to run the finance reporting suite. Requesting a standard-issue replacement before quarter-end close.',
    status: 'Approved',
    requestedBy: 'Priya Nathan',
    dueDate: daysFromNow(5),
    attachments: [{ name: 'quote-dell-latitude.pdf', size: 84213 }],
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
  },
  {
    id: 'REQ-1002',
    title: 'Update emergency contact details',
    description:
      'Need to update my emergency contact on file following a recent house move and change of next-of-kin phone number.',
    status: 'Draft',
    requestedBy: 'Sam Okafor',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'REQ-1003',
    title: 'Broken air conditioning in Level 3 office',
    description:
      'The AC unit on Level 3 has stopped cooling entirely and the office temperature is well above a comfortable working range. Several staff have raised concerns.',
    status: 'In Review',
    requestedBy: 'Marcus Chen',
    dueDate: daysFromNow(2),
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
  },
  {
    id: 'REQ-1004',
    title: 'Reimbursement for client travel expenses',
    description:
      'Requesting reimbursement for flights, accommodation and meals incurred during the client site visit in Melbourne last week. Receipts attached.',
    status: 'Submitted',
    requestedBy: 'Aisha Rahman',
    attachments: [
      { name: 'flight-receipt.pdf', size: 52140 },
      { name: 'hotel-invoice.pdf', size: 71032 },
    ],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: 'REQ-1005',
    title: 'VPN access request for new contractor',
    description:
      'New contractor starting on the data migration project requires VPN access to the staging environment for the duration of the engagement.',
    status: 'Rejected',
    requestedBy: 'Liam Fitzgerald',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(8),
  },
  {
    id: 'REQ-1006',
    title: 'Parental leave application',
    description:
      'Submitting my parental leave application ahead of the expected due date, along with the required supporting documentation from my GP.',
    status: 'Approved',
    requestedBy: 'Grace Thompson',
    dueDate: daysFromNow(30),
    createdAt: daysAgo(20),
    updatedAt: daysAgo(15),
  },
  {
    id: 'REQ-1007',
    title: 'Request additional standing desks',
    description:
      'Our team has grown by three people this quarter and we are short on standing desks. Requesting three additional units for the north wing.',
    status: 'Submitted',
    requestedBy: 'Noah Kim',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'REQ-1008',
    title: 'Purchase order approval for new software licence',
    description:
      'Requesting approval for an annual licence for the new design collaboration tool the product team trialled last month. Quote and vendor comparison attached.',
    status: 'In Review',
    requestedBy: 'Priya Nathan',
    attachments: [{ name: 'vendor-comparison.xlsx', size: 39812 }],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(2),
  },
  {
    id: 'REQ-1009',
    title: 'Password reset lockout - urgent',
    description:
      'Locked out of my account after a failed multi-factor authentication re-enrolment. Need an urgent reset to access payroll systems before the pay run cutoff today.',
    status: 'Submitted',
    requestedBy: 'Marcus Chen',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: 'REQ-1010',
    title: 'Workplace accommodation request',
    description:
      'Requesting an ergonomic chair and monitor arm as a workplace accommodation, per the recommendation from my physiotherapist assessment.',
    status: 'Draft',
    requestedBy: 'Aisha Rahman',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]
