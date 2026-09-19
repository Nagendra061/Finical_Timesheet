/**
 * Staffing Financial & Timesheet Management System
 * Realistic Initial Data & Seed Store
 */

import {
  Employee,
  Client,
  Job,
  Placement,
  Timesheet,
  IncomeRecord,
  Invoice,
  ARPayment,
  APBill,
  APPayment,
  TransactionLedgerEntry,
  AuditLog,
  ImportBatch,
  OrganizationConfig
} from '../types';

export const INITIAL_CONFIG: OrganizationConfig = {
  id: 'ORG-001',
  name: 'Apex Staffing Solutions LLC',
  currency: 'USD',
  timezone: 'America/Chicago',
  fiscalYearStart: 'January',
  numbering: {
    employeePrefix: 'EMP',
    clientPrefix: 'CLI',
    jobPrefix: 'JOB',
    placementPrefix: 'PLC',
    timesheetPrefix: 'TS',
    incomePrefix: 'INC',
    invoicePrefix: 'INV',
    paymentPrefix: 'PAY',
    billPrefix: 'BIL',
    nextNumbers: {
      EMP: 132,
      CLI: 125,
      JOB: 52,
      PLC: 130,
      TS: 110,
      INC: 108,
      INV: 106,
      PAY: 105,
      BIL: 108,
    }
  }
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP00125',
    organizationId: 'ORG-001',
    employeeType: 'W2',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '(214) 555-0142',
    status: 'Active',
    hireDate: '2026-08-01',
    department: 'Healthcare Staffing',
    currentPlacementId: 'PLC20260125',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    version: 1
  },
  {
    id: 'EMP00126',
    organizationId: 'ORG-001',
    employeeType: '1099',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    email: 'elena.rodriguez@cloudtech.io',
    phone: '(415) 555-8391',
    status: 'Active',
    hireDate: '2026-07-15',
    department: 'Information Technology',
    currentPlacementId: 'PLC20260126',
    createdAt: '2026-07-15T08:30:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
    version: 1
  },
  {
    id: 'EMP00127',
    organizationId: 'ORG-001',
    employeeType: 'W2',
    firstName: 'Marcus',
    lastName: 'Chen',
    email: 'marcus.chen@example.com',
    phone: '(312) 555-4920',
    status: 'Active',
    hireDate: '2026-06-10',
    department: 'Information Technology',
    currentPlacementId: 'PLC20260127',
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-08-15T14:20:00Z',
    version: 1
  },
  {
    id: 'EMP00128',
    organizationId: 'ORG-001',
    employeeType: 'W2',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '(469) 555-7104',
    status: 'Active',
    hireDate: '2026-08-15',
    department: 'Healthcare Staffing',
    currentPlacementId: 'PLC20260128',
    createdAt: '2026-08-15T09:30:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
    version: 1
  },
  {
    id: 'EMP00129',
    organizationId: 'ORG-001',
    employeeType: '1099',
    firstName: 'David',
    lastName: 'Miller',
    email: 'dave.miller@contractornet.com',
    phone: '(206) 555-3382',
    status: 'Active',
    hireDate: '2026-05-20',
    department: 'Engineering',
    currentPlacementId: 'PLC20260129',
    createdAt: '2026-05-20T11:15:00Z',
    updatedAt: '2026-08-30T16:00:00Z',
    version: 1
  },
  {
    id: 'EMP00130',
    organizationId: 'ORG-001',
    employeeType: 'W2',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@example.com',
    phone: '(617) 555-9201',
    status: 'Active',
    hireDate: '2026-08-25',
    department: 'Healthcare Staffing',
    createdAt: '2026-08-25T14:00:00Z',
    updatedAt: '2026-08-25T14:00:00Z',
    version: 1
  },
  {
    id: 'EMP00131',
    organizationId: 'ORG-001',
    employeeType: '1099',
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@bizarch.org',
    phone: '(512) 555-6677',
    status: 'Inactive',
    hireDate: '2026-01-10',
    department: 'Finance & Accounting',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-08-01T17:00:00Z',
    version: 1
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'CLI00120',
    organizationId: 'ORG-001',
    name: 'ABC Healthcare System',
    status: 'Active',
    paymentTerms: '30 days',
    contacts: [
      {
        id: 'CON-1',
        name: 'Dr. Amanda Vance',
        email: 'amanda.vance@abchealth.org',
        phone: '(214) 555-7001',
        title: 'Director of Clinical Operations',
        isPrimary: true
      },
      {
        id: 'CON-2',
        name: 'Carlos Mendez',
        email: 'cmendez@abchealth.org',
        phone: '(214) 555-7002',
        title: 'AP & Vendor Relations Manager',
        isPrimary: false
      }
    ],
    primaryContactName: 'Dr. Amanda Vance',
    primaryContactEmail: 'amanda.vance@abchealth.org',
    billingAddress: '4200 Medical Parkway, Suite 500, Dallas, TX 75201',
    industry: 'Hospital & Healthcare',
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    version: 1
  },
  {
    id: 'CLI00121',
    organizationId: 'ORG-001',
    name: 'Apex Fintech Solutions',
    status: 'Active',
    paymentTerms: '45 days',
    contacts: [
      {
        id: 'CON-3',
        name: 'Geoffrey Barnes',
        email: 'gbarnes@apexfintech.com',
        phone: '(212) 555-9800',
        title: 'VP of Engineering',
        isPrimary: true
      }
    ],
    primaryContactName: 'Geoffrey Barnes',
    primaryContactEmail: 'gbarnes@apexfintech.com',
    billingAddress: '100 Wall Street, 18th Floor, New York, NY 10005',
    industry: 'Financial Technology',
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z',
    version: 1
  },
  {
    id: 'CLI00122',
    organizationId: 'ORG-001',
    name: 'Metro Health Systems',
    status: 'Active',
    paymentTerms: '30 days',
    contacts: [
      {
        id: 'CON-4',
        name: 'Rachel Sterling',
        email: 'rsterling@metrohealth.net',
        phone: '(312) 555-1199',
        title: 'Talent Acquisition Partner',
        isPrimary: true
      }
    ],
    primaryContactName: 'Rachel Sterling',
    primaryContactEmail: 'rsterling@metrohealth.net',
    billingAddress: '880 North Michigan Ave, Chicago, IL 60611',
    industry: 'Healthcare & Life Sciences',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-09-05T14:30:00Z',
    version: 1
  },
  {
    id: 'CLI00123',
    organizationId: 'ORG-001',
    name: 'Global Cloud Systems',
    status: 'Active',
    paymentTerms: '15 days',
    contacts: [
      {
        id: 'CON-5',
        name: 'Lisa Wang',
        email: 'lwang@globalcloud.io',
        phone: '(415) 555-4321',
        title: 'Procurement Specialist',
        isPrimary: true
      }
    ],
    primaryContactName: 'Lisa Wang',
    primaryContactEmail: 'lwang@globalcloud.io',
    billingAddress: '500 Howard Street, San Francisco, CA 94105',
    industry: 'Enterprise Software',
    createdAt: '2026-04-10T08:00:00Z',
    updatedAt: '2026-08-28T09:15:00Z',
    version: 1
  },
  {
    id: 'CLI00124',
    organizationId: 'ORG-001',
    name: 'Horizon Biotech Laboratories',
    status: 'Inactive',
    paymentTerms: '60 days',
    contacts: [
      {
        id: 'CON-6',
        name: 'Simon Davis',
        email: 'sdavis@horizonbio.com',
        phone: '(617) 555-6789',
        title: 'Operations Director',
        isPrimary: true
      }
    ],
    primaryContactName: 'Simon Davis',
    primaryContactEmail: 'sdavis@horizonbio.com',
    billingAddress: '200 Technology Square, Cambridge, MA 02139',
    industry: 'Biotechnology',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-07-30T16:00:00Z',
    version: 1
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'JOB20260045',
    organizationId: 'ORG-001',
    clientId: 'CLI00120',
    title: 'Registered Nurse (ICU/Med-Surg)',
    department: 'Nursing',
    location: 'Dallas, TX',
    employmentType: 'Contract',
    status: 'Active',
    description: 'Provide acute critical patient care across 12-hour rotating clinical shifts.',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
    version: 1
  },
  {
    id: 'JOB20260046',
    organizationId: 'ORG-001',
    clientId: 'CLI00121',
    title: 'Principal Cloud Solutions Architect',
    department: 'Infrastructure',
    location: 'New York, NY (Hybrid)',
    employmentType: 'Contract',
    status: 'Active',
    description: 'Design multi-region cloud resilience architectures and zero-trust security mesh.',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-15T11:00:00Z',
    version: 1
  },
  {
    id: 'JOB20260047',
    organizationId: 'ORG-001',
    clientId: 'CLI00121',
    title: 'Senior Full Stack Java Engineer',
    department: 'Core Banking',
    location: 'New York, NY (Remote)',
    employmentType: 'Contract',
    status: 'Active',
    description: 'Build high-throughput transaction routing services using Spring Boot and Kafka.',
    createdAt: '2026-06-05T09:30:00Z',
    updatedAt: '2026-06-10T14:00:00Z',
    version: 1
  },
  {
    id: 'JOB20260048',
    organizationId: 'ORG-001',
    clientId: 'CLI00122',
    title: 'ER Nurse Specialist',
    department: 'Emergency Care',
    location: 'Chicago, IL',
    employmentType: 'Contract',
    status: 'Active',
    description: 'Trauma triage and rapid stabilization nurse support.',
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-08-12T09:00:00Z',
    version: 1
  },
  {
    id: 'JOB20260049',
    organizationId: 'ORG-001',
    clientId: 'CLI00123',
    title: 'Site Reliability DevOps Lead',
    department: 'Platform Engineering',
    location: 'San Francisco, CA (Remote)',
    employmentType: 'Contract',
    status: 'Active',
    description: 'Kubernetes cluster scaling, GitOps CI/CD delivery pipelines, and observability.',
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-20T16:00:00Z',
    version: 1
  }
];

export const INITIAL_PLACEMENTS: Placement[] = [
  {
    id: 'PLC20260125',
    organizationId: 'ORG-001',
    employeeId: 'EMP00125', // John Smith
    clientId: 'CLI00120',   // ABC Healthcare
    jobId: 'JOB20260045',   // Registered Nurse
    startDate: '2026-09-01',
    endDate: '', // Active / ongoing
    billingRate: 72.00,
    payRate: 48.00,
    overtimeBillingRate: 108.00,
    overtimePayRate: 72.00,
    billingUnit: 'Hour',
    payUnit: 'Hour',
    status: 'Active',
    notes: 'Primary hospital placement. Overtime requires charge nurse authorization.',
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
    version: 1
  },
  {
    id: 'PLC20260126',
    organizationId: 'ORG-001',
    employeeId: 'EMP00126', // Elena Rodriguez
    clientId: 'CLI00121',   // Apex Fintech
    jobId: 'JOB20260046',   // Cloud Architect
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    billingRate: 145.00,
    payRate: 105.00,
    overtimeBillingRate: 217.50,
    overtimePayRate: 157.50,
    billingUnit: 'Hour',
    payUnit: 'Hour',
    status: 'Active',
    notes: '1099 Specialist engagement. 40 hours cap per week.',
    createdAt: '2026-07-28T14:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
    version: 1
  },
  {
    id: 'PLC20260127',
    organizationId: 'ORG-001',
    employeeId: 'EMP00127', // Marcus Chen
    clientId: 'CLI00121',   // Apex Fintech
    jobId: 'JOB20260047',   // Senior Java Engineer
    startDate: '2026-07-01',
    endDate: '2027-01-15',
    billingRate: 110.00,
    payRate: 78.00,
    overtimeBillingRate: 165.00,
    overtimePayRate: 117.00,
    billingUnit: 'Hour',
    payUnit: 'Hour',
    status: 'Active',
    notes: 'Dedicated core banking services developer.',
    createdAt: '2026-06-25T11:00:00Z',
    updatedAt: '2026-07-01T08:30:00Z',
    version: 1
  },
  {
    id: 'PLC20260128',
    organizationId: 'ORG-001',
    employeeId: 'EMP00128', // Sarah Jenkins
    clientId: 'CLI00122',   // Metro Health
    jobId: 'JOB20260048',   // ER Nurse Specialist
    startDate: '2026-08-20',
    endDate: '',
    billingRate: 78.00,
    payRate: 52.00,
    overtimeBillingRate: 117.00,
    overtimePayRate: 78.00,
    billingUnit: 'Hour',
    payUnit: 'Hour',
    status: 'Active',
    notes: 'Night shift differential included in billing package.',
    createdAt: '2026-08-18T09:00:00Z',
    updatedAt: '2026-08-20T08:00:00Z',
    version: 1
  },
  {
    id: 'PLC20260129',
    organizationId: 'ORG-001',
    employeeId: 'EMP00129', // David Miller
    clientId: 'CLI00123',   // Global Cloud
    jobId: 'JOB20260049',   // DevOps Lead
    startDate: '2026-06-01',
    endDate: '2026-11-30',
    billingRate: 130.00,
    payRate: 92.00,
    overtimeBillingRate: 195.00,
    overtimePayRate: 138.00,
    billingUnit: 'Hour',
    payUnit: 'Hour',
    status: 'Active',
    notes: 'Infrastructure reliability contractor.',
    createdAt: '2026-05-28T15:00:00Z',
    updatedAt: '2026-06-01T09:00:00Z',
    version: 1
  }
];

export const INITIAL_TIMESHEETS: Timesheet[] = [
  // John Smith Approved Timesheet (matches specification example: Sept 8: 8h, Sept 9: 8h = 16h total)
  {
    id: 'TS20260901',
    organizationId: 'ORG-001',
    placementId: 'PLC20260125',
    employeeId: 'EMP00125',
    clientId: 'CLI00120',
    jobId: 'JOB20260045',
    periodStartDate: '2026-09-07',
    periodEndDate: '2026-09-13',
    dailyEntries: [
      { date: '2026-09-07', dayOfWeek: 'Mon', regularHours: 0, overtimeHours: 0, holidayHours: 0, notes: 'Off' },
      { date: '2026-09-08', dayOfWeek: 'Tue', regularHours: 8, overtimeHours: 0, holidayHours: 0, notes: 'Med-Surg Ward Shift' },
      { date: '2026-09-09', dayOfWeek: 'Wed', regularHours: 8, overtimeHours: 0, holidayHours: 0, notes: 'Med-Surg Ward Shift' },
      { date: '2026-09-10', dayOfWeek: 'Thu', regularHours: 0, overtimeHours: 0, holidayHours: 0, notes: 'Off' },
      { date: '2026-09-11', dayOfWeek: 'Fri', regularHours: 0, overtimeHours: 0, holidayHours: 0, notes: 'Off' },
      { date: '2026-09-12', dayOfWeek: 'Sat', regularHours: 0, overtimeHours: 0, holidayHours: 0, notes: 'Off' },
      { date: '2026-09-13', dayOfWeek: 'Sun', regularHours: 0, overtimeHours: 0, holidayHours: 0, notes: 'Off' }
    ],
    regularHours: 16,
    overtimeHours: 0,
    holidayHours: 0,
    totalHours: 16,
    status: 'Approved',
    approvedBy: 'Sarah Connor (Staffing Director)',
    approvalDate: '2026-09-14T09:15:00Z',
    submittedAt: '2026-09-13T19:00:00Z',
    incomeId: 'INC2026001',
    billId: 'BIL20260088',
    createdAt: '2026-09-13T18:45:00Z',
    updatedAt: '2026-09-14T09:15:00Z',
    version: 2
  },
  // Elena Rodriguez Approved Timesheet (40 hours)
  {
    id: 'TS20260902',
    organizationId: 'ORG-001',
    placementId: 'PLC20260126',
    employeeId: 'EMP00126',
    clientId: 'CLI00121',
    jobId: 'JOB20260046',
    periodStartDate: '2026-09-07',
    periodEndDate: '2026-09-13',
    dailyEntries: [
      { date: '2026-09-07', dayOfWeek: 'Mon', regularHours: 8, overtimeHours: 0, holidayHours: 0, notes: 'Architecture workshop' },
      { date: '2026-09-08', dayOfWeek: 'Tue', regularHours: 8, overtimeHours: 0, holidayHours: 0, notes: 'Cloud migration plan' },
      { date: '2026-09-09', dayOfWeek: 'Wed', regularHours: 8, overtimeHours: 2, holidayHours: 0, notes: 'Late incident response drill' },
      { date: '2026-09-10', dayOfWeek: 'Thu', regularHours: 8, overtimeHours: 0, holidayHours: 0, notes: 'Terraform blueprint review' },
      { date: '2026-09-11', dayOfWeek: 'Fri', regularHours: 8, overtimeHours: 0, holidayHours: 0, notes: 'Security audit sprint' },
      { date: '2026-09-12', dayOfWeek: 'Sat', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-13', dayOfWeek: 'Sun', regularHours: 0, overtimeHours: 0, holidayHours: 0 }
    ],
    regularHours: 40,
    overtimeHours: 2,
    holidayHours: 0,
    totalHours: 42,
    status: 'Approved',
    approvedBy: 'Geoffrey Barnes (VP Eng)',
    approvalDate: '2026-09-14T10:30:00Z',
    submittedAt: '2026-09-13T20:00:00Z',
    incomeId: 'INC2026002',
    billId: 'BIL20260089',
    createdAt: '2026-09-13T19:30:00Z',
    updatedAt: '2026-09-14T10:30:00Z',
    version: 2
  },
  // Marcus Chen Submitted Timesheet (awaiting approval)
  {
    id: 'TS20260903',
    organizationId: 'ORG-001',
    placementId: 'PLC20260127',
    employeeId: 'EMP00127',
    clientId: 'CLI00121',
    jobId: 'JOB20260047',
    periodStartDate: '2026-09-07',
    periodEndDate: '2026-09-13',
    dailyEntries: [
      { date: '2026-09-07', dayOfWeek: 'Mon', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-08', dayOfWeek: 'Tue', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-09', dayOfWeek: 'Wed', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-10', dayOfWeek: 'Thu', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-11', dayOfWeek: 'Fri', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-12', dayOfWeek: 'Sat', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-13', dayOfWeek: 'Sun', regularHours: 0, overtimeHours: 0, holidayHours: 0 }
    ],
    regularHours: 40,
    overtimeHours: 0,
    holidayHours: 0,
    totalHours: 40,
    status: 'Submitted',
    submittedAt: '2026-09-14T08:00:00Z',
    createdAt: '2026-09-14T07:45:00Z',
    updatedAt: '2026-09-14T08:00:00Z',
    version: 1
  },
  // Sarah Jenkins Draft Timesheet (in progress)
  {
    id: 'TS20260904',
    organizationId: 'ORG-001',
    placementId: 'PLC20260128',
    employeeId: 'EMP00128',
    clientId: 'CLI00122',
    jobId: 'JOB20260048',
    periodStartDate: '2026-09-14',
    periodEndDate: '2026-09-20',
    dailyEntries: [
      { date: '2026-09-14', dayOfWeek: 'Mon', regularHours: 12, overtimeHours: 0, holidayHours: 0, notes: 'ER 12h shift' },
      { date: '2026-09-15', dayOfWeek: 'Tue', regularHours: 12, overtimeHours: 0, holidayHours: 0, notes: 'ER 12h shift' },
      { date: '2026-09-16', dayOfWeek: 'Wed', regularHours: 12, overtimeHours: 0, holidayHours: 0, notes: 'ER 12h shift' },
      { date: '2026-09-17', dayOfWeek: 'Thu', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-18', dayOfWeek: 'Fri', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-19', dayOfWeek: 'Sat', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-20', dayOfWeek: 'Sun', regularHours: 0, overtimeHours: 0, holidayHours: 0 }
    ],
    regularHours: 36,
    overtimeHours: 0,
    holidayHours: 0,
    totalHours: 36,
    status: 'Draft',
    createdAt: '2026-09-16T18:00:00Z',
    updatedAt: '2026-09-17T09:00:00Z',
    version: 1
  },
  // David Miller Rejected Timesheet (requires correction)
  {
    id: 'TS20260905',
    organizationId: 'ORG-001',
    placementId: 'PLC20260129',
    employeeId: 'EMP00129',
    clientId: 'CLI00123',
    jobId: 'JOB20260049',
    periodStartDate: '2026-08-31',
    periodEndDate: '2026-09-06',
    dailyEntries: [
      { date: '2026-08-31', dayOfWeek: 'Mon', regularHours: 8, overtimeHours: 4, holidayHours: 0 },
      { date: '2026-09-01', dayOfWeek: 'Tue', regularHours: 8, overtimeHours: 4, holidayHours: 0 },
      { date: '2026-09-02', dayOfWeek: 'Wed', regularHours: 8, overtimeHours: 2, holidayHours: 0 },
      { date: '2026-09-03', dayOfWeek: 'Thu', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-04', dayOfWeek: 'Fri', regularHours: 8, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-05', dayOfWeek: 'Sat', regularHours: 0, overtimeHours: 0, holidayHours: 0 },
      { date: '2026-09-06', dayOfWeek: 'Sun', regularHours: 0, overtimeHours: 0, holidayHours: 0 }
    ],
    regularHours: 40,
    overtimeHours: 10,
    holidayHours: 0,
    totalHours: 50,
    status: 'Rejected',
    rejectionReason: 'Overtime hours for Aug 31 and Sept 01 exceeded pre-approved client project budget. Please attach approval ticket.',
    submittedAt: '2026-09-07T08:30:00Z',
    createdAt: '2026-09-06T20:00:00Z',
    updatedAt: '2026-09-08T11:20:00Z',
    version: 2
  }
];

export const INITIAL_INCOME: IncomeRecord[] = [
  // John Smith Approved Timesheet Income (matches spec: 16 hrs x $72 = $1,152)
  {
    id: 'INC2026001',
    organizationId: 'ORG-001',
    sourceType: 'Timesheet',
    sourceId: 'TS20260901',
    employeeId: 'EMP00125',
    clientId: 'CLI00120',
    placementId: 'PLC20260125',
    timesheetId: 'TS20260901',
    periodStartDate: '2026-09-07',
    periodEndDate: '2026-09-13',
    regularHours: 16,
    overtimeHours: 0,
    holidayHours: 0,
    billingRate: 72.00,
    overtimeBillingRate: 108.00,
    totalIncome: 1152.00,
    invoiceId: 'INV20260012',
    status: 'Billed',
    createdAt: '2026-09-14T09:15:00Z',
    updatedAt: '2026-09-14T11:00:00Z',
    version: 2
  },
  // Elena Rodriguez Approved Timesheet Income (40 hrs x $145 = $5,800 + 2 hrs OT x $217.50 = $435 => $6,235.00)
  {
    id: 'INC2026002',
    organizationId: 'ORG-001',
    sourceType: 'Timesheet',
    sourceId: 'TS20260902',
    employeeId: 'EMP00126',
    clientId: 'CLI00121',
    placementId: 'PLC20260126',
    timesheetId: 'TS20260902',
    periodStartDate: '2026-09-07',
    periodEndDate: '2026-09-13',
    regularHours: 40,
    overtimeHours: 2,
    holidayHours: 0,
    billingRate: 145.00,
    overtimeBillingRate: 217.50,
    totalIncome: 6235.00,
    invoiceId: 'INV20260013',
    status: 'Billed',
    createdAt: '2026-09-14T10:30:00Z',
    updatedAt: '2026-09-14T14:00:00Z',
    version: 2
  },
  // An unbilled income record from previous approved timesheet
  {
    id: 'INC2026003',
    organizationId: 'ORG-001',
    sourceType: 'Timesheet',
    sourceId: 'TS20260825',
    employeeId: 'EMP00127',
    clientId: 'CLI00121',
    placementId: 'PLC20260127',
    timesheetId: 'TS20260825',
    periodStartDate: '2026-08-24',
    periodEndDate: '2026-08-30',
    regularHours: 40,
    overtimeHours: 0,
    holidayHours: 0,
    billingRate: 110.00,
    overtimeBillingRate: 165.00,
    totalIncome: 4400.00,
    status: 'Unbilled',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
    version: 1
  },
  // Another unbilled record for ABC Healthcare
  {
    id: 'INC2026004',
    organizationId: 'ORG-001',
    sourceType: 'Timesheet',
    sourceId: 'TS20260826',
    employeeId: 'EMP00125',
    clientId: 'CLI00120',
    placementId: 'PLC20260125',
    timesheetId: 'TS20260826',
    periodStartDate: '2026-08-31',
    periodEndDate: '2026-09-06',
    regularHours: 32,
    overtimeHours: 4,
    holidayHours: 0,
    billingRate: 72.00,
    overtimeBillingRate: 108.00,
    totalIncome: 2736.00, // 32*72 + 4*108 = 2304 + 432 = 2736
    status: 'Unbilled',
    createdAt: '2026-09-07T09:00:00Z',
    updatedAt: '2026-09-07T09:00:00Z',
    version: 1
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  // John Smith Invoiced (matches spec example: $1,152 total, fully paid)
  {
    id: 'INV20260012',
    organizationId: 'ORG-001',
    clientId: 'CLI00120', // ABC Healthcare
    invoiceNumber: 'INV-2026-0012',
    invoiceDate: '2026-09-14',
    dueDate: '2026-10-14', // 30 days
    paymentTerms: '30 days',
    lineItems: [
      {
        id: 'L-1',
        incomeId: 'INC2026001',
        description: 'Registered Nurse - September Week 1 (John Smith)',
        quantity: 16,
        rate: 72.00,
        amount: 1152.00
      }
    ],
    subtotal: 1152.00,
    tax: 0.00,
    total: 1152.00,
    amountPaid: 1152.00,
    balance: 0.00,
    status: 'Paid',
    notes: 'Paid in full via ACH wire reference #ACH-983210.',
    createdAt: '2026-09-14T11:00:00Z',
    updatedAt: '2026-09-16T14:30:00Z',
    version: 2
  },
  // Elena Rodriguez Invoice (Apex Fintech Solutions, $6,235.00 Open / Current)
  {
    id: 'INV20260013',
    organizationId: 'ORG-001',
    clientId: 'CLI00121', // Apex Fintech
    invoiceNumber: 'INV-2026-0013',
    invoiceDate: '2026-09-14',
    dueDate: '2026-10-29', // 45 days
    paymentTerms: '45 days',
    lineItems: [
      {
        id: 'L-2',
        incomeId: 'INC2026002',
        description: 'Principal Cloud Solutions Architect (Elena Rodriguez) - Reg Hours',
        quantity: 40,
        rate: 145.00,
        amount: 5800.00
      },
      {
        id: 'L-3',
        incomeId: 'INC2026002',
        description: 'Principal Cloud Solutions Architect (Elena Rodriguez) - Approved Overtime',
        quantity: 2,
        rate: 217.50,
        amount: 435.00
      }
    ],
    subtotal: 6235.00,
    tax: 0.00,
    total: 6235.00,
    amountPaid: 0.00,
    balance: 6235.00,
    status: 'Open',
    notes: 'Submitted through Apex automated vendor portal.',
    createdAt: '2026-09-14T14:00:00Z',
    updatedAt: '2026-09-14T14:00:00Z',
    version: 1
  },
  // An older partially paid invoice for Metro Health (Overdue / Aging 31-60 days)
  {
    id: 'INV20260009',
    organizationId: 'ORG-001',
    clientId: 'CLI00122', // Metro Health Systems
    invoiceNumber: 'INV-2026-0009',
    invoiceDate: '2026-07-20',
    dueDate: '2026-08-19', // Past due (40+ days overdue relative to mid-Sept)
    paymentTerms: '30 days',
    lineItems: [
      {
        id: 'L-4',
        description: 'Clinical Nursing Staffing - July Cycle',
        quantity: 80,
        rate: 78.00,
        amount: 6240.00
      }
    ],
    subtotal: 6240.00,
    tax: 0.00,
    total: 6240.00,
    amountPaid: 3000.00,
    balance: 3240.00,
    status: 'Partially Paid',
    notes: 'First installment received. Followed up with AP contact Rachel Sterling.',
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-08-10T15:00:00Z',
    version: 2
  },
  // Overdue 61-90 Days invoice for Global Cloud
  {
    id: 'INV20260006',
    organizationId: 'ORG-001',
    clientId: 'CLI00123',
    invoiceNumber: 'INV-2026-0006',
    invoiceDate: '2026-06-25',
    dueDate: '2026-07-10', // Net 15
    paymentTerms: '15 days',
    lineItems: [
      {
        id: 'L-5',
        description: 'DevOps & SRE Engineering Support - June Cycle',
        quantity: 40,
        rate: 130.00,
        amount: 5200.00
      }
    ],
    subtotal: 5200.00,
    tax: 0.00,
    total: 5200.00,
    amountPaid: 0.00,
    balance: 5200.00,
    status: 'Overdue',
    notes: 'Escalated to VP Finance.',
    createdAt: '2026-06-25T10:00:00Z',
    updatedAt: '2026-07-15T09:00:00Z',
    version: 1
  }
];

export const INITIAL_AR_PAYMENTS: ARPayment[] = [
  {
    id: 'PAY20260042',
    organizationId: 'ORG-001',
    invoiceId: 'INV20260012',
    clientId: 'CLI00120',
    paymentDate: '2026-09-16',
    amount: 1152.00,
    paymentMethod: 'ACH',
    referenceNumber: 'ACH-983210',
    status: 'Completed',
    notes: 'Full payment received for John Smith placement timesheet TS20260901.',
    createdAt: '2026-09-16T14:30:00Z',
    updatedAt: '2026-09-16T14:30:00Z'
  },
  {
    id: 'PAY20260040',
    organizationId: 'ORG-001',
    invoiceId: 'INV20260009',
    clientId: 'CLI00122',
    paymentDate: '2026-08-10',
    amount: 3000.00,
    paymentMethod: 'Wire',
    referenceNumber: 'WIRE-88421',
    status: 'Completed',
    notes: 'Partial payment received.',
    createdAt: '2026-08-10T15:00:00Z',
    updatedAt: '2026-08-10T15:00:00Z'
  }
];

export const INITIAL_AP_BILLS: APBill[] = [
  // John Smith AP Bill (matches spec: 16 hrs x $48 = $768, Paid in full)
  {
    id: 'BIL20260088',
    organizationId: 'ORG-001',
    sourceType: 'Timesheet',
    sourceId: 'TS20260901',
    timesheetId: 'TS20260901',
    employeeId: 'EMP00125', // John Smith
    placementId: 'PLC20260125',
    periodStartDate: '2026-09-07',
    periodEndDate: '2026-09-13',
    regularHours: 16,
    regularRate: 48.00,
    regularAmount: 768.00,
    overtimeHours: 0,
    overtimeRate: 72.00,
    overtimeAmount: 0.00,
    holidayHours: 0,
    holidayAmount: 0.00,
    totalPayable: 768.00,
    amountPaid: 768.00,
    balance: 0.00,
    dueDate: '2026-09-18', // Payroll Friday
    status: 'Paid',
    createdAt: '2026-09-14T09:15:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
    version: 2
  },
  // Elena Rodriguez AP Bill (40 hrs x $105 = $4,200 + 2 hrs OT x $157.50 = $315 => $4,515.00 Unpaid, Due This Week)
  {
    id: 'BIL20260089',
    organizationId: 'ORG-001',
    sourceType: 'Timesheet',
    sourceId: 'TS20260902',
    timesheetId: 'TS20260902',
    employeeId: 'EMP00126', // Elena Rodriguez (1099)
    placementId: 'PLC20260126',
    periodStartDate: '2026-09-07',
    periodEndDate: '2026-09-13',
    regularHours: 40,
    regularRate: 105.00,
    regularAmount: 4200.00,
    overtimeHours: 2,
    overtimeRate: 157.50,
    overtimeAmount: 315.00,
    holidayHours: 0,
    holidayAmount: 0.00,
    totalPayable: 4515.00,
    amountPaid: 0.00,
    balance: 4515.00,
    dueDate: '2026-09-22', // Due Next Week
    status: 'Unpaid',
    createdAt: '2026-09-14T10:30:00Z',
    updatedAt: '2026-09-14T10:30:00Z',
    version: 1
  },
  // Marcus Chen AP Bill from previous cycle (Partially Paid)
  {
    id: 'BIL20260085',
    organizationId: 'ORG-001',
    sourceType: 'Timesheet',
    sourceId: 'TS20260825',
    timesheetId: 'TS20260825',
    employeeId: 'EMP00127',
    placementId: 'PLC20260127',
    periodStartDate: '2026-08-24',
    periodEndDate: '2026-08-30',
    regularHours: 40,
    regularRate: 78.00,
    regularAmount: 3120.00,
    overtimeHours: 0,
    overtimeRate: 117.00,
    overtimeAmount: 0.00,
    holidayHours: 0,
    holidayAmount: 0.00,
    totalPayable: 3120.00,
    amountPaid: 1560.00,
    balance: 1560.00,
    dueDate: '2026-09-15', // Overdue relative to current date
    status: 'Overdue',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-15T16:00:00Z',
    version: 2
  }
];

export const INITIAL_AP_PAYMENTS: APPayment[] = [
  {
    id: 'APPAY20260050',
    organizationId: 'ORG-001',
    billId: 'BIL20260088',
    employeeId: 'EMP00125',
    paymentDate: '2026-09-18',
    amount: 768.00,
    paymentMethod: 'Direct Deposit',
    referenceNumber: 'DD-2026-904',
    status: 'Completed',
    notes: 'Bi-weekly W2 clinical payroll deposit.',
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z'
  },
  {
    id: 'APPAY20260048',
    organizationId: 'ORG-001',
    billId: 'BIL20260085',
    employeeId: 'EMP00127',
    paymentDate: '2026-09-08',
    amount: 1560.00,
    paymentMethod: 'Direct Deposit',
    referenceNumber: 'DD-2026-891',
    status: 'Completed',
    notes: 'Advance payroll installment.',
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-08T11:00:00Z'
  }
];

export const INITIAL_TRANSACTIONS: TransactionLedgerEntry[] = [
  {
    id: 'TXN-1001',
    organizationId: 'ORG-001',
    transactionType: 'Income Accrual',
    sourceType: 'Timesheet',
    sourceId: 'TS20260901',
    date: '2026-09-14',
    debit: 1152.00,
    credit: 0.00,
    account: '1200 - Unbilled Accounts Receivable',
    currency: 'USD',
    description: 'Income accrued from Approved Timesheet TS20260901 (John Smith @ ABC Healthcare - 16 hrs)',
    createdAt: '2026-09-14T09:15:00Z'
  },
  {
    id: 'TXN-1002',
    organizationId: 'ORG-001',
    transactionType: 'AP Accrual',
    sourceType: 'Timesheet',
    sourceId: 'TS20260901',
    date: '2026-09-14',
    debit: 0.00,
    credit: 768.00,
    account: '2100 - Accounts Payable (W2 Payroll)',
    currency: 'USD',
    description: 'Direct worker labor obligation from Approved Timesheet TS20260901 (John Smith - 16 hrs @ $48/hr)',
    createdAt: '2026-09-14T09:15:00Z'
  },
  {
    id: 'TXN-1003',
    organizationId: 'ORG-001',
    transactionType: 'Invoice Generation',
    sourceType: 'Invoice',
    sourceId: 'INV20260012',
    date: '2026-09-14',
    debit: 1152.00,
    credit: 1152.00,
    account: '1100 - Accounts Receivable / 4000 - Billed Staffing Revenue',
    currency: 'USD',
    description: 'Generated Invoice INV-2026-0012 for ABC Healthcare System (John Smith 16 hrs)',
    createdAt: '2026-09-14T11:00:00Z'
  },
  {
    id: 'TXN-1004',
    organizationId: 'ORG-001',
    transactionType: 'AR Payment',
    sourceType: 'Payment',
    sourceId: 'PAY20260042',
    date: '2026-09-16',
    debit: 1152.00,
    credit: 1152.00,
    account: '1010 - Operating Cash / 1100 - Accounts Receivable',
    currency: 'USD',
    description: 'Client payment received via ACH from ABC Healthcare System for INV-2026-0012',
    createdAt: '2026-09-16T14:30:00Z'
  },
  {
    id: 'TXN-1005',
    organizationId: 'ORG-001',
    transactionType: 'AP Payment',
    sourceType: 'Bill',
    sourceId: 'APPAY20260050',
    date: '2026-09-18',
    debit: 768.00,
    credit: 768.00,
    account: '2100 - Accounts Payable / 1010 - Operating Cash',
    currency: 'USD',
    description: 'Disbursed Direct Deposit to John Smith for AP Bill BIL20260088',
    createdAt: '2026-09-18T10:00:00Z'
  },
  {
    id: 'TXN-1006',
    organizationId: 'ORG-001',
    transactionType: 'Income Accrual',
    sourceType: 'Timesheet',
    sourceId: 'TS20260902',
    date: '2026-09-14',
    debit: 6235.00,
    credit: 0.00,
    account: '1200 - Unbilled Accounts Receivable',
    currency: 'USD',
    description: 'Income accrued from Approved Timesheet TS20260902 (Elena Rodriguez @ Apex Fintech - 42 hrs)',
    createdAt: '2026-09-14T10:30:00Z'
  },
  {
    id: 'TXN-1007',
    organizationId: 'ORG-001',
    transactionType: 'AP Accrual',
    sourceType: 'Timesheet',
    sourceId: 'TS20260902',
    date: '2026-09-14',
    debit: 0.00,
    credit: 4515.00,
    account: '2110 - Accounts Payable (1099 Contractors)',
    currency: 'USD',
    description: 'Contractor liability accrued for Elena Rodriguez (42 hrs, $4,515.00)',
    createdAt: '2026-09-14T10:30:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-501',
    organizationId: 'ORG-001',
    action: 'APPROVE',
    entity: 'Timesheet',
    entityId: 'TS20260901',
    user: 'Sarah Connor (Staffing Director)',
    timestamp: '2026-09-14T09:15:00Z',
    previousValue: 'Submitted',
    newValue: 'Approved',
    details: 'Approved 16 regular clinical hours for John Smith. Auto-generated Income INC2026001 ($1,152) and AP Bill BIL20260088 ($768).'
  },
  {
    id: 'AUD-502',
    organizationId: 'ORG-001',
    action: 'GENERATE_INVOICE',
    entity: 'Invoice',
    entityId: 'INV20260012',
    user: 'Finance Operations Admin',
    timestamp: '2026-09-14T11:00:00Z',
    previousValue: 'Unbilled',
    newValue: 'Billed',
    details: 'Compiled approved income INC2026001 into Invoice INV-2026-0012 ($1,152.00) for ABC Healthcare.'
  },
  {
    id: 'AUD-503',
    organizationId: 'ORG-001',
    action: 'RECORD_PAYMENT',
    entity: 'ARPayment',
    entityId: 'PAY20260042',
    user: 'Billing Specialist',
    timestamp: '2026-09-16T14:30:00Z',
    previousValue: 'Balance $1,152.00 (Open)',
    newValue: 'Balance $0.00 (Paid)',
    details: 'Processed client remittance ACH-983210 ($1,152.00) from ABC Healthcare.'
  },
  {
    id: 'AUD-504',
    organizationId: 'ORG-001',
    action: 'RECORD_PAYMENT',
    entity: 'APPayment',
    entityId: 'APPAY20260050',
    user: 'Payroll Specialist',
    timestamp: '2026-09-18T10:00:00Z',
    previousValue: 'Balance $768.00 (Unpaid)',
    newValue: 'Balance $0.00 (Paid)',
    details: 'Disbursed worker compensation direct deposit DD-2026-904 ($768.00) to John Smith.'
  },
  {
    id: 'AUD-505',
    organizationId: 'ORG-001',
    action: 'REJECT',
    entity: 'Timesheet',
    entityId: 'TS20260905',
    user: 'Finance Operations Admin',
    timestamp: '2026-09-08T11:20:00Z',
    previousValue: 'Submitted',
    newValue: 'Rejected',
    details: 'Rejected David Miller timesheet due to exceeding unapproved overtime thresholds.'
  }
];

export const INITIAL_IMPORT_BATCHES: ImportBatch[] = [
  {
    id: 'IMP-2026-001',
    fileName: 'employees_q3_onboarding.csv',
    fileType: 'employees',
    receivedDate: '2026-09-01T08:00:00Z',
    recordsRead: 25,
    recordsImported: 24,
    recordsRejected: 1,
    status: 'Completed with Errors',
    errors: [
      {
        row: 18,
        field: 'email',
        error: 'Invalid email address format: "johndoe@@domain"',
        rawData: { employee_id: 'EMP00199', first_name: 'John', last_name: 'Doe', email: 'johndoe@@domain' }
      }
    ],
    rawContent: 'employee_id,employee_type,first_name,last_name,email,status,hire_date\nEMP00125,W2,John,Smith,john.smith@example.com,Active,2026-08-01\nEMP00126,1099,Elena,Rodriguez,elena.rodriguez@cloudtech.io,Active,2026-07-15'
  },
  {
    id: 'IMP-2026-002',
    fileName: 'clients_master_2026.csv',
    fileType: 'clients',
    receivedDate: '2026-08-20T10:15:00Z',
    recordsRead: 12,
    recordsImported: 12,
    recordsRejected: 0,
    status: 'Completed',
    errors: [],
    rawContent: 'client_id,name,status,payment_terms,contact_name,contact_email\nCLI00120,ABC Healthcare System,Active,30 days,Dr. Amanda Vance,amanda.vance@abchealth.org\nCLI00121,Apex Fintech Solutions,Active,45 days,Geoffrey Barnes,gbarnes@apexfintech.com'
  }
];

export const SAMPLE_CSV_TEMPLATES: Record<string, string> = {
  employees: `employee_id,employee_type,first_name,last_name,email,status,hire_date,department
EMP00140,W2,Alex,Turner,alex.turner@example.com,Active,2026-09-01,Clinical Care
EMP00141,1099,Samantha,Lee,sam.lee@cyberops.net,Active,2026-09-05,Cybersecurity
EMP00142,W2,Daniel,Kim,daniel.kim@example.com,Active,2026-09-10,Software Engineering`,

  clients: `client_id,name,status,payment_terms,contact_name,contact_email,industry
CLI00130,St. Jude Memorial Hospital,Active,30 days,Karen Miller,kmiller@stjude-hospital.org,Healthcare
CLI00131,Quantum Analytics Inc,Active,15 days,Trevor Noah,trevor@quantumanalytics.ai,Artificial Intelligence`,

  placements: `placement_id,employee_id,client_id,job_id,start_date,end_date,billing_rate,pay_rate,billing_unit,pay_unit,status
PLC20260140,EMP00125,CLI00120,JOB20260045,2026-10-01,,85.00,55.00,Hour,Hour,Active
PLC20260141,EMP00127,CLI00121,JOB20260047,2026-10-01,2027-04-01,120.00,85.00,Hour,Hour,Active`,

  timesheets: `timesheet_id,placement_id,employee_id,client_id,period_start_date,period_end_date,regular_hours,overtime_hours,holiday_hours,status
TS20261001,PLC20260125,EMP00125,CLI00120,2026-09-14,2026-09-20,32,0,0,Submitted
TS20261002,PLC20260126,EMP00126,CLI00121,2026-09-14,2026-09-20,40,4,0,Submitted`,

  payments: `payment_id,invoice_id,client_id,payment_date,amount,payment_method,reference_number
PAY20260055,INV20260013,CLI00121,2026-09-25,6235.00,Wire,WIRE-992014`,

  vendors: `vendor_id,vendor_name,contact_name,email,phone,payment_terms,tax_id
VEN0010,Apex IT Consulting,Laura Croft,laura@apexconsult.com,(415) 555-1020,30 days,XX-XXXXXXX`
};
