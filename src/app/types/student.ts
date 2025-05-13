export interface StudentUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'student';
    phone?: string;
    location?: string;
    bio?: string;
    education?: string;
    skills?: string;
    resume_url?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    applied: number;
    responses: number;
    rejections: number;
    interviews: number;
}

export interface Company {
    id: string;
    name: string;
    logo_url?: string;
    website?: string;
}

export interface InternshipOpportunity {
    id: string;
    title: string;
    description: string;
    company?: Company;
    location: string;
    salary_min?: number;
    salary_max?: number;
    application_deadline: string;
    status: 'open' | 'closed' | 'draft';
    accepts_opt: boolean;
    accepts_cpt: boolean;
    offers_certificate: boolean;
    created_at: string;
    updated_at: string;
} 