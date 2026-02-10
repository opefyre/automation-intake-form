export interface Idea {
    id: string;
    title: string;
    problem: string;
    desiredOutcome: string;
    categoryId: string;
    department: string;
    impactType?: 'Time' | 'Cost' | 'Quality' | 'Risk' | 'Revenue' | 'CX' | 'Other' | string;
    aiAutomationFit?: 'Automation' | 'AI Assist' | 'AI Agent' | 'Unsure' | string;
    status: 'Submitted' | 'In Progress' | 'Approved' | 'Rejected' | 'Done';
    voteCount: number;
    authorName?: string;
    authorId?: string;
    authorPhoto?: string;
    createdAt?: any; // Firestore Timestamp
    // New fields
    processFrequency?: string;
    timeSpentHoursPerWeek?: number;
    estimatedBenefit?: string;
    // Voting
    score?: number; // upvotes - downvotes
    userVote?: 'up' | 'down' | null; // Virtual field for UI state
    // Attachments
    attachments?: { name: string; url: string; type: string; size: number }[];
}

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    role?: 'user' | 'admin';
}
