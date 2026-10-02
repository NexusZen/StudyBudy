import initSqlJs, { type Database } from "sql.js";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { AppError } from "./errors";
import type { Plan } from "./types";
import { validatePlan } from "./persisted";
export interface Repository {
  list(): Promise<Plan[]>;
  get(id: string): Promise<Plan | undefined>;
  save(plan: Plan): Promise<void>;
  mutate(id: string, fn: (plan: Plan) => Plan): Promise<Plan>;
}
export class MemoryRepository implements Repository {
  private plans = new Map<string, Plan>();
  async list() {
    return structuredClone([...this.plans.values()]);
  }
  async get(id: string) {
    return structuredClone(this.plans.get(id));
  }
  async save(plan: Plan) {
    this.plans.set(plan.id, structuredClone(plan));
  }
  async mutate(id: string, fn: (plan: Plan) => Plan) {
    const plan = await this.get(id);
    if (!plan) throw new AppError("NOT_FOUND", "Study plan not found.", 404);
    const updated = fn(plan);
    await this.save(updated);
    return updated;
  }
}
export class SqliteRepository implements Repository {
  private database: Promise<Database>;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(
    private path = process.env.DATABASE_PATH || "./data/study-budy.sqlite",
  ) {
    this.database = this.load();
  }
  private async load() {
    const SQL = await initSqlJs({
      locateFile: () => resolve("node_modules/sql.js/dist/sql-wasm.wasm"),
    });
    let data: Uint8Array | undefined;
    try {
      data = await readFile(this.path);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
    const db = new SQL.Database(data);
    db.run(
      "CREATE TABLE IF NOT EXISTS plans (id TEXT PRIMARY KEY, payload TEXT NOT NULL)",
    );
    return db;
  }
  private exclusive<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn);
    this.queue = next.catch(() => {});
    return next;
  }
  private read(db: Database, id: string) {
    const statement = db.prepare("SELECT payload FROM plans WHERE id = ?");
    try {
      statement.bind([id]);
      return statement.step()
        ? validatePlan(JSON.parse(statement.getAsObject().payload as string))
        : undefined;
    } finally {
      statement.free();
    }
  }
  private async persist(db: Database, plan: Plan) {
    validatePlan(plan);
    const before = db.export();
    const temp = this.path + "." + randomUUID() + ".tmp";
    try {
      db.run("INSERT OR REPLACE INTO plans (id,payload) VALUES (?,?)", [
        plan.id,
        JSON.stringify(plan),
      ]);
      await mkdir(dirname(this.path), { recursive: true });
      await writeFile(temp, db.export());
      await rename(temp, this.path);
    } catch (error) {
      const SQL = await initSqlJs({
        locateFile: () => resolve("node_modules/sql.js/dist/sql-wasm.wasm"),
      });
      this.database = Promise.resolve(new SQL.Database(before));
      throw error;
    }
  }
  async get(id: string) {
    await this.queue;
    return this.read(await this.database, id);
  }
  async list() {
    await this.queue;
    const db = await this.database;
    const result = db.exec("SELECT payload FROM plans ORDER BY rowid DESC");
    return (result[0]?.values ?? []).map((row) =>
      validatePlan(JSON.parse(row[0] as string)),
    );
  }
  async save(plan: Plan) {
    await this.exclusive(async () => this.persist(await this.database, plan));
  }
  async mutate(id: string, fn: (plan: Plan) => Plan) {
    return this.exclusive(async () => {
      const db = await this.database;
      const current = this.read(db, id);
      if (!current)
        throw new AppError("NOT_FOUND", "Study plan not found.", 404);
      const updated = fn(current);
      await this.persist(db, updated);
      return updated;
    });
  }
}
