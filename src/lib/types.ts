export interface StudyUnit {
  id: string;
  title: string;
  estimatedMinutes: number;
  difficulty: number;
  importance: number;
  prerequisites: string[];
  sourceReference: string;
  chapter?: string;
  section?: string;
  description?: string;
  pageStart?: number;
  pageEnd?: number;
}
export interface PlanConfig {
  name: string;
  subject: string;
  startDate: string;
  endDate: string;
  dailyMinutes: number;
  weekdayMinutes?: Record<string, number>;
  unavailableDates?: string[];
}
export type Status = "not_started" | "in_progress" | "completed";
export interface Session {
  id: string;
  unitId: string;
  title: string;
  date: string;
  minutes: number;
  status: Status;
  sourceReference: string;
  chapter?: string;
  section?: string;
  pageStart?: number;
  pageEnd?: number;
}
export interface ScheduleResult {
  sessions: Session[];
  unscheduledMinutes: number;
  warnings: string[];
}
export interface Progress {
  totalMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  percent: number;
}
export interface Plan extends ScheduleResult {
  id: string;
  config: PlanConfig;
  units: StudyUnit[];
  provider: "fake" | "gemini";
  createdAt: string;
  progress: Progress;
}
export interface Material {
  text: string;
  fileName: string;
}
export interface StudyMaterialAnalyzer {
  analyze(input: Material): Promise<StudyUnit[]>;
}
