import { randomUUID } from "node:crypto";
import { z } from "zod";
import { validateConfig, validateUnits } from "./schemas";
import { schedule, reschedule } from "./scheduler";
import { progress } from "./progress";
import { AppError } from "./errors";
import type { Repository } from "./repository";
import type {
  Material,
  Plan,
  PlanConfig,
  StudyMaterialAnalyzer,
  Status,
} from "./types";
export class PlanService {
  constructor(
    private repo: Repository,
    private analyzer: StudyMaterialAnalyzer,
    private provider: "fake" | "gemini" = "fake",
  ) {}
  async create(input: PlanConfig, material: Material) {
    const config = validateConfig(input);
    const units = validateUnits(await this.analyzer.analyze(material));
    const result = schedule(units, config);
    const plan: Plan = {
      id: randomUUID(),
      config,
      units,
      ...result,
      provider: this.provider,
      createdAt: new Date().toISOString(),
      progress: progress(units, result.sessions),
    };
    await this.repo.save(plan);
    return plan;
  }
  async get(id: string) {
    const plan = await this.repo.get(id);
    if (!plan) throw new AppError("NOT_FOUND", "Study plan not found.", 404);
    return plan;
  }
  async list() {
    return this.repo.list();
  }
  async setStatus(id: string, sessionId: string, status: Status) {
    const parsed = z
      .enum(["not_started", "in_progress", "completed"])
      .parse(status);
    return this.repo.mutate(id, (plan) => {
      const session = plan.sessions.find((s) => s.id === sessionId);
      if (!session)
        throw new AppError("NOT_FOUND", "Study session not found.", 404);
      session.status = parsed;
      return { ...plan, progress: progress(plan.units, plan.sessions) };
    });
  }
  async update(id: string, input: PlanConfig) {
    return this.reschedule(id, input.startDate, input);
  }
  async reschedule(id: string, fromDate: string, input?: PlanConfig) {
    return this.repo.mutate(id, (plan) => {
      const config = validateConfig(input ?? plan.config);
      const result = reschedule(plan.units, config, plan.sessions, fromDate);
      return {
        ...plan,
        config,
        ...result,
        progress: progress(plan.units, result.sessions),
      };
    });
  }
}
