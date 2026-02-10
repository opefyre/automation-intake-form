import { z } from 'zod';

export const ideaSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
    problem: z.string().min(20, "Please describe the problem in more detail (min 20 chars)"),
    desiredOutcome: z.string().min(20, "Please describe the desired outcome (min 20 chars)"),
    categoryId: z.string().min(1, "Please select a category"),
    department: z.string().min(1, "Please select a department"),
    impactType: z.enum(['Time', 'Cost', 'Quality', 'Risk', 'Revenue', 'CX', 'Other']).optional(),
    aiAutomationFit: z.enum(['Automation', 'AI Assist', 'AI Agent', 'Unsure']).optional(),
    estimatedBenefit: z.string().optional(),
    processFrequency: z.enum(['Hourly', 'Daily', 'Weekly', 'Monthly', 'Ad-hoc']).optional(),
    timeSpentHoursPerWeek: z.number().min(0).optional(),
});

export type IdeaFormData = z.infer<typeof ideaSchema>;

export const CATEGORIES = [
    'Process & Policy Improvement',
    'Productivity & Collaboration',
    'Data Quality & Reporting',
    'Customer Experience',
    'Cost Optimization',
    'Risk, Compliance & Controls',
    'AI Adoption Opportunities',
    'Automation Candidates',
    'Knowledge Management',
    'Internal Tools',
    'Infrastructure & DevOps'
];

export const DEPARTMENTS = [
    'Customer Support & CX Ops',
    'Logistics & Fleet Operations',
    'Warehouse & Fulfillment',
    'Commercial / Sales',
    'Marketing & Growth',
    'Product / UX',
    'Finance & Accounting',
    'Procurement',
    'HR & People Operations',
    'Legal',
    'IT & Security',
    'Corporate Services'
];
