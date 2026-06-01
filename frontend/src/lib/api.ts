// Capa de acceso a la API de ATOM — centraliza todas las llamadas HTTP

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('atom_token');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Error en la solicitud');
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ── Finance ───────────────────────────────────────────────────────────────────
export const finance = {
  dashboard: () => request<FinanceDashboard>('/finance/dashboard'),
  createRecord: (data: Partial<FinanceRecord>) =>
    request<FinanceRecord>('/finance/record', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Social Media ─────────────────────────────────────────────────────────────
export const social = {
  metrics:         () => request<{ metrics: SocialMetric[] }>('/social/metrics'),
  addMetrics:      (data: Partial<SocialMetric>) =>
    request('/social/metrics', { method: 'POST', body: JSON.stringify(data) }),
  campaigns:       () => request<{ data: Campaign[] }>('/social/campaigns'),
  weeklyContent:   () => request<WeeklyContent[]>('/social/content'),
  generateContent: () => request<WeeklyContent>('/social/content/generate', { method: 'POST' }),
};

// ── Professor ─────────────────────────────────────────────────────────────────
export const professor = {
  courses:       () => request<Course[]>('/professor/courses'),
  createCourse:  (data: Partial<Course>) =>
    request<Course>('/professor/courses', { method: 'POST', body: JSON.stringify(data) }),
  calculateGrade: (scores: GradeScore[]) =>
    request<{ finalGrade: number }>('/professor/grades/calculate', {
      method: 'POST', body: JSON.stringify({ scores }),
    }),
  grades:        (courseId: string) => request<Grade[]>(`/professor/courses/${courseId}/grades`),
  attendanceSummary: (courseId: string) =>
    request<AttendanceSummary[]>(`/professor/courses/${courseId}/attendance/summary`),
};

// ── Mercado Público ───────────────────────────────────────────────────────────
export const tenders = {
  list:   (status?: string) =>
    request<Tender[]>(`/tenders${status ? `?status=${status}` : ''}`),
  run:    () => request<{ found: number }>('/tenders/run', { method: 'POST' }),
  export: () => `${BASE}/tenders/export`,
};

// ── Lobbyistas ────────────────────────────────────────────────────────────────
export const lobby = {
  minutes:  () => request<Minute[]>('/lobby/minutes'),
  create:   (data: Partial<Minute>) =>
    request<Minute>('/lobby/minutes', { method: 'POST', body: JSON.stringify(data) }),
  tracking: () => request<TrackingRow[]>('/lobby/tracking'),
  updateStatus: (id: string, status: string) =>
    request(`/lobby/minutes/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    }),
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User { id: string; email: string; name: string; role: string; }
export interface FinanceDashboard {
  summary: { totalRevenue: number; totalExpenses: number; netProfit: number; avgNetMargin: number };
  records: FinanceRecord[];
}
export interface FinanceRecord {
  id: string; period: string; revenue: number; expenses: number; netMargin: number;
  description?: string; generatedBy: string; createdAt: string;
}
export interface SocialMetric {
  id: string; platform: string; followers: number; followersLastWeek: number;
  percentageGrowth: number; reach: number; engagement: number; createdAt: string;
}
export interface Campaign {
  id: string; name: string; platform: string; startDate: string;
  endDate?: string; budget?: number; status: string; impressions: number; clicks: number;
}
export interface WeeklyContent {
  id: string; week: string; theme: string; slogan: string;
  phrases: string[]; topics: TopicPost[];
}
export interface TopicPost { dia: string; plataforma: string; titulo: string; descripcion_breve: string; }
export interface Course { id: string; name: string; program?: string; totalHours: number; }
export interface GradeScore { label: string; score: number; weight: number; }
export interface Grade { id: string; studentName: string; finalGrade: number; scores: GradeScore[]; }
export interface AttendanceSummary {
  studentId: string; studentName: string; totalClasses: number; attended: number; percentage: number;
}
export interface Tender {
  id: string; externalId: string; name: string; entity: string; type?: string;
  status: string; amount?: number; publishDate?: string; closeDate?: string; url?: string;
}
export interface Minute {
  id: string; entity: string; subject: string; date: string;
  status: string; alertDate?: string; agreements: Agreement[];
  participants?: string[];
}
export interface Agreement { text: string; responsible: string; deadline?: string; completed?: boolean; }
export interface TrackingRow extends Minute {
  daysToAlert: number | null; urgent: boolean; agreementCount: number;
  pendingAgreements: number; lobbyist: string;
}
