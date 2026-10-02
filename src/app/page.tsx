"use client";

import Link from "next/link";
import Image from "next/image";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Config = {
  name: string;
  subject: string;
  startDate: string;
  endDate: string;
  dailyMinutes: number;
  weekdayMinutes?: Record<string, number>;
  unavailableDates?: string[];
};
type Session = {
  id: string;
  unitId: string;
  title: string;
  date: string;
  minutes: number;
  status: "not_started" | "in_progress" | "completed";
  sourceReference: string;
};
type Plan = {
  id: string;
  config: Config;
  sessions: Session[];
  units: { id: string; title: string }[];
  unscheduledMinutes: number;
  warnings: string[];
  provider: "fake" | "gemini";
  createdAt: string;
  progress: {
    completedMinutes: number;
    remainingMinutes: number;
    totalMinutes: number;
    percent: number;
  };
};

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function plusDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
function dateLabel(
  date: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) {
  return new Intl.DateTimeFormat(undefined, {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
function duration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`;
}
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const statuses = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.error?.message ?? "Something went wrong. Please try again.",
    );
  return result;
}

function Icon({
  kind,
  size = 20,
}: {
  kind: "book" | "grid" | "clock" | "arrow" | "check" | "calendar" | "spark";
  size?: number;
}) {
  const paths = {
    book: (
      <>
        <path d="M3 4h7a2 2 0 0 1 2 2v15a3 3 0 0 0-3-3H3z" />
        <path d="M21 4h-7a2 2 0 0 0-2 2v15a3 3 0 0 1 3-3h6z" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    arrow: <path d="m8 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind]}
    </svg>
  );
}

export default function Dashboard() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [fromDate, setFromDate] = useState(todayISO);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("all");
  const [today, setToday] = useState(todayISO);
  const [provider, setProvider] = useState<"fake" | "gemini" | null>(null);
  const busyRef = useRef(busy);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    const timer = window.setInterval(() => setToday(todayISO()), 60000);
    request<Plan[]>("/api/plans")
      .then((items) => {
        setPlans(items);
        setPlan(items[0] ?? null);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
    request<{ provider: "fake" | "gemini" }>("/api/config")
      .then((value) => setProvider(value.provider))
      .catch(() => setProvider(null));
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!formMode && !rescheduling) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href]",
        ) ?? [],
      );
    (
      dialog?.querySelector<HTMLElement>("[data-initial-focus]") ??
      focusable()[0]
    )?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyRef.current) {
        setFormMode(null);
        setRescheduling(false);
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    }
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [formMode, rescheduling]);

  function accept(next: Plan) {
    setPlan(next);
    setPlans((previous) => [
      next,
      ...previous.filter((item) => item.id !== next.id),
    ]);
  }
  async function mutate(action: () => Promise<Plan>, message: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      accept(await action());
      setNotice(message);
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function selectPlan(id: string) {
    setBusy(true);
    setError("");
    try {
      setPlan(await request<Plan>(`/api/plans/${encodeURIComponent(id)}`));
      setFilter("all");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not load plan.",
      );
    } finally {
      setBusy(false);
    }
  }
  const sessions =
    plan?.sessions.filter(
      (session) =>
        filter === "all" ||
        (filter === "today" ? session.date === today : session.date > today),
    ) ?? [];
  const dates = [...new Set(sessions.map((session) => session.date))].sort();
  const todaySessions =
    plan?.sessions.filter(
      (session) => session.date === today && session.status !== "completed",
    ) ?? [];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Image src="/study-budy-logo.png" width={52} height={52} alt="" />
          </span>
          <span>
            Study Budy
            <span className="brand-sub">
              A little structure. A lot of progress.
            </span>
          </span>
        </Link>
        <div className="nav-caption">YOUR WORKSPACE</div>
        <a className="nav-item active" href="#main">
          <Icon kind="grid" />
          Overview
        </a>
        <button
          className="nav-item"
          onClick={() => setFormMode("create")}
          disabled={busy}
        >
          <Icon kind="spark" />
          Create a study plan<span className="plus">+</span>
        </button>
        <div className="nav-caption plans-caption">
          STUDY PLANS <span>{plans.length}</span>
        </div>
        <div className="plan-nav">
          {plans.map((item) => (
            <button
              key={item.id}
              className={`plan-link ${item.id === plan?.id ? "selected" : ""}`}
              onClick={() => void selectPlan(item.id)}
              disabled={busy}
            >
              <span className="plan-dot" />
              <span>
                {item.config.name}
                <small>{item.config.subject}</small>
              </span>
            </button>
          ))}
          {!loading && plans.length === 0 && (
            <p className="sidebar-empty">Your first plan starts here.</p>
          )}
        </div>
        <div className="sidebar-note">
          <span className="note-icon">
            <Icon kind="book" />
          </span>
          <strong>Small steps add up.</strong>
          <p>
            You don&apos;t have to study everything today. Just the next thing.
          </p>
        </div>
        <div className="local-label">
          <span />
          Local study workspace
        </div>
      </aside>

      <main id="main" className="main-area">
        <header className="topbar">
          <span>
            Workspace <span className="crumb">/</span> <strong>Overview</strong>
          </span>
          <span className="top-date">
            <Icon kind="calendar" size={16} />
            {dateLabel(today, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">A CLEARER PATH TO YOUR DEADLINE</div>
              <h1>Make today count.</h1>
              <p>Your materials, your time, one manageable plan.</p>
            </div>
            <button
              className="primary"
              onClick={() => setFormMode("create")}
              disabled={busy}
            >
              <span aria-hidden="true">+</span> New study plan
            </button>
          </div>
          {error && (
            <div className="alert error" role="alert">
              <strong>We couldn&apos;t complete that.</strong> {error}
              <button onClick={() => setError("")} aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}
          {notice && (
            <div className="alert success" role="status">
              {notice}
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}
          {loading ? (
            <div className="empty-card" role="status">
              Loading your workspace…
            </div>
          ) : !plan ? (
            <section className="empty-card">
              <div className="empty-icon">
                <Icon kind="book" size={42} />
              </div>
              <div className="eyebrow">START WITH WHAT YOU HAVE</div>
              <h2>A good plan makes room for you.</h2>
              <p>
                Bring your notes or textbook. Set your deadline and available
                time.
                <br />
                Study Budy will turn them into a day-by-day study schedule.
              </p>
              <button className="primary" onClick={() => setFormMode("create")}>
                Create your first plan <Icon kind="arrow" size={16} />
              </button>
              <div className="empty-features">
                <span>PDF & TXT materials</span>
                <span>Flexible daily availability</span>
                <span>Progress that stays with you</span>
              </div>
            </section>
          ) : (
            <>
              <section className="plan-hero">
                <div className="hero-copy">
                  <div className="hero-label">
                    <span className="subject-tag">{plan.config.subject}</span>
                    <span className={`provider ${plan.provider}`}>
                      {plan.provider === "fake"
                        ? "Demo · simulated analysis"
                        : "Gemini analysis"}
                    </span>
                  </div>
                  <h2>{plan.config.name}</h2>
                  <p>
                    <Icon kind="calendar" size={16} />
                    {dateLabel(plan.config.startDate)} –{" "}
                    {dateLabel(plan.config.endDate, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    <span className="hero-divider">·</span>
                    {plan.units.length} study topics
                  </p>
                  <button
                    className="hero-link"
                    onClick={() => setFormMode("edit")}
                    disabled={busy}
                  >
                    Edit availability & plan <Icon kind="arrow" size={15} />
                  </button>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="art-circle" />
                  <div className="art-book book-one" />
                  <div className="art-book book-two" />
                  <div className="art-book book-three" />
                  <span className="art-spark">✦</span>
                </div>
              </section>
              {plan.provider === "fake" && (
                <p className="provider-note">
                  Demo mode samples the first 12 nonempty lines, assigning 45
                  minutes per line and limiting titles to 160 characters. It
                  does not semantically analyze the whole material. Select
                  Gemini on the server with an API key for live analysis.
                </p>
              )}
              <div className="stats-grid">
                <section className="stat-card">
                  <div className="stat-heading">
                    Overall progress
                    <span className="stat-icon mint">
                      <Icon kind="check" />
                    </span>
                  </div>
                  <strong>
                    {Math.round(plan.progress.percent)}
                    <span>%</span>
                  </strong>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-label="Study completion"
                    aria-valuenow={plan.progress.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span
                      style={{
                        width: `${Math.max(0, Math.min(100, plan.progress.percent))}%`,
                      }}
                    />
                  </div>
                  <p>{duration(plan.progress.completedMinutes)} completed</p>
                </section>
                <section className="stat-card">
                  <div className="stat-heading">
                    Workload remaining
                    <span className="stat-icon lavender">
                      <Icon kind="clock" />
                    </span>
                  </div>
                  <strong>{duration(plan.progress.remainingMinutes)}</strong>
                  <p>
                    Of {duration(plan.progress.totalMinutes)} total study time
                  </p>
                  <small>Includes any unscheduled workload</small>
                </section>
                <section className="stat-card">
                  <div className="stat-heading">
                    Today&apos;s focus
                    <span className="stat-icon peach">
                      <Icon kind="book" />
                    </span>
                  </div>
                  <strong>
                    {todaySessions.length}
                    <span> sessions</span>
                  </strong>
                  <p>
                    {duration(
                      todaySessions.reduce(
                        (sum, session) => sum + session.minutes,
                        0,
                      ),
                    )}{" "}
                    left on today&apos;s schedule
                  </p>
                  <small>One session at a time.</small>
                </section>
              </div>
              {(plan.warnings.length > 0 || plan.unscheduledMinutes > 0) && (
                <div className="alert warning" role="status">
                  <strong>
                    {duration(plan.unscheduledMinutes)} unscheduled.
                  </strong>{" "}
                  {plan.warnings.join(" ")} Increase availability or extend the
                  deadline to make room for remaining work.
                </div>
              )}
              <section className="schedule-section">
                <div className="section-heading">
                  <div>
                    <h2>Your study schedule</h2>
                    <p>A little progress, planned day by day.</p>
                  </div>
                  <button
                    className="secondary"
                    onClick={() => {
                      setFromDate(today);
                      setRescheduling(true);
                    }}
                    disabled={busy}
                  >
                    ↻ Reschedule remaining work
                  </button>
                </div>
                <div className="schedule-tabs" aria-label="Schedule filters">
                  {(["all", "today", "upcoming"] as const).map((value) => (
                    <button
                      key={value}
                      aria-pressed={filter === value}
                      className={filter === value ? "chosen" : ""}
                      onClick={() => setFilter(value)}
                    >
                      {value === "all"
                        ? "All days"
                        : value === "today"
                          ? "Today"
                          : "Upcoming"}
                    </button>
                  ))}
                </div>
                {dates.length === 0 && (
                  <div className="schedule-empty">
                    {filter === "today"
                      ? "No sessions scheduled for today. Enjoy a little breathing room."
                      : "No sessions in this view. Try All days or adjust your availability."}
                  </div>
                )}
                {dates.map((date) => {
                  const daySessions = sessions.filter(
                    (session) => session.date === date,
                  );
                  const completed = daySessions.filter(
                    (session) => session.status === "completed",
                  ).length;
                  return (
                    <article className="day-card" key={date}>
                      <div className="day-heading">
                        <div className="date-tile">
                          <span>{dateLabel(date, { month: "short" })}</span>
                          <strong>{dateLabel(date, { day: "numeric" })}</strong>
                        </div>
                        <div>
                          <h3>
                            {dateLabel(date, { weekday: "long" })}
                            {date === today && (
                              <span className="today-tag">Today</span>
                            )}
                          </h3>
                          <p>
                            {duration(
                              daySessions.reduce(
                                (sum, session) => sum + session.minutes,
                                0,
                              ),
                            )}{" "}
                            planned · {completed}/{daySessions.length} complete
                          </p>
                        </div>
                        <span className="day-line" />
                      </div>
                      <div className="session-list">
                        {daySessions.map((session) => (
                          <div
                            className={`session-row ${session.status === "completed" ? "is-complete" : ""}`}
                            key={session.id}
                          >
                            <span
                              className={`session-state ${session.status}`}
                              aria-hidden="true"
                            >
                              {session.status === "completed" ? (
                                <Icon kind="check" size={15} />
                              ) : session.status === "in_progress" ? (
                                <span />
                              ) : null}
                            </span>
                            <div className="session-copy">
                              <h4>{session.title}</h4>
                              <p>
                                {session.sourceReference ||
                                  "Source reference unavailable"}
                              </p>
                            </div>
                            <span className="session-duration">
                              <Icon kind="clock" size={14} />
                              {duration(session.minutes)}
                            </span>
                            <label
                              className="sr-only"
                              htmlFor={`status-${session.id}`}
                            >
                              Status for {session.title} on {date}
                            </label>
                            <select
                              id={`status-${session.id}`}
                              className={`status-select ${session.status}`}
                              value={session.status}
                              disabled={busy}
                              onChange={(event) => {
                                const status = event.target.value;
                                void mutate(
                                  () =>
                                    request<Plan>(
                                      `/api/plans/${encodeURIComponent(plan.id)}/sessions`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          sessionId: session.id,
                                          status,
                                        }),
                                      },
                                    ),
                                  "Progress saved. Keep going!",
                                );
                              }}
                            >
                              {Object.entries(statuses).map(
                                ([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </section>
              <p className="schedule-footnote">
                <Icon kind="spark" size={15} />
                Topics follow prerequisite, importance and difficulty order.
                Sessions split to fit your available time. Reserve revision time
                by reducing your daily minutes.
              </p>
            </>
          )}
          <footer className="page-footer">
            <span>Study Budy</span>
            <span>A plan for your studies. Space for your life.</span>
          </footer>
        </div>
      </main>
      {formMode && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-form-title"
          >
            <button
              className="modal-close"
              onClick={() => !busy && setFormMode(null)}
              disabled={busy}
              aria-label="Close plan form"
            >
              ×
            </button>
            <div className="eyebrow">
              {formMode === "create"
                ? "LET’S MAKE A PLAN"
                : "MAKE YOUR PLAN FIT"}
            </div>
            <h2 id="plan-form-title">
              {formMode === "create"
                ? "A fresh start."
                : "Update your availability."}
            </h2>
            <p className="modal-intro">
              {formMode === "create"
                ? "Add your material and make room for steady progress."
                : "Completed sessions stay completed. Remaining work is regenerated."}
            </p>
            <PlanForm
              provider={provider}
              initial={formMode === "edit" ? plan?.config : undefined}
              busy={busy}
              onSubmit={async (config, file) => {
                const success = await mutate(
                  () => {
                    if (formMode === "edit" && plan)
                      return request<Plan>(
                        `/api/plans/${encodeURIComponent(plan.id)}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ config }),
                        },
                      );
                    const body = new FormData();
                    if (file) body.set("file", file);
                    body.set("config", JSON.stringify(config));
                    return request<Plan>("/api/plans", {
                      method: "POST",
                      body,
                    });
                  },
                  formMode === "edit"
                    ? "Your plan has been updated."
                    : "Your study plan is ready. Let’s get started.",
                );
                if (success) {
                  setFormMode(null);
                  setFilter("all");
                }
              }}
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </section>
        </div>
      )}
      {rescheduling && plan && (
        <div className="modal-backdrop">
          <section
            className="modal small-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reschedule-title"
          >
            <button
              className="modal-close"
              onClick={() => !busy && setRescheduling(false)}
              disabled={busy}
              aria-label="Close reschedule dialog"
            >
              ×
            </button>
            <div className="eyebrow">A PLAN THAT ADAPTS</div>
            <h2 id="reschedule-title">Pick up where you left off.</h2>
            <p className="modal-intro">
              Completed sessions stay exactly as they are. Unfinished work is
              distributed from this date through your deadline using your
              current availability.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void mutate(
                  () =>
                    request<Plan>(
                      `/api/plans/${encodeURIComponent(plan.id)}/reschedule`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ fromDate }),
                      },
                    ),
                  "Remaining work rescheduled.",
                ).then((success) => {
                  if (success) setRescheduling(false);
                });
              }}
            >
              <label className="field">
                Start remaining work from
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  required
                  disabled={busy}
                  data-initial-focus
                />
              </label>
              <p className="form-help">
                Deadline: {dateLabel(plan.config.endDate)}. Work that cannot fit
                remains visibly unscheduled.
              </p>
              <button className="primary full-width" disabled={busy}>
                {busy ? "Rescheduling…" : "Reschedule remaining work"}
              </button>
            </form>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </section>
        </div>
      )}
      <span className="sr-only" role="status">
        {busy ? "Saving changes. Please wait." : ""}
      </span>
    </div>
  );
}

function PlanForm({
  initial,
  busy,
  onSubmit,
  provider,
}: {
  initial?: Config;
  busy: boolean;
  provider: "fake" | "gemini" | null;
  onSubmit: (config: Config, file?: File) => Promise<void>;
}) {
  const [weekdayOverrides, setWeekdayOverrides] = useState(
    Boolean(
      initial?.weekdayMinutes && Object.keys(initial.weekdayMinutes).length,
    ),
  );
  const [file, setFile] = useState<File>();
  const [validationError, setValidationError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");
    const data = new FormData(event.currentTarget);
    const unavailableDates = String(data.get("unavailableDates") ?? "")
      .split(/[\s,]+/)
      .filter(Boolean);
    const config: Config = {
      name: String(data.get("name")).trim(),
      subject: String(data.get("subject")).trim(),
      startDate: String(data.get("startDate")),
      endDate: String(data.get("endDate")),
      dailyMinutes: Number(data.get("dailyMinutes")),
      unavailableDates,
    };
    if (weekdayOverrides) {
      config.weekdayMinutes = {};
      weekdays.forEach((_, index) => {
        const value = data.get(`weekday-${index}`);
        if (value !== null && value !== "")
          config.weekdayMinutes![index] = Number(value);
      });
    }
    if (config.endDate < config.startDate) {
      setValidationError("The deadline must be on or after the start date.");
      return;
    }
    if (!initial && !file) {
      setValidationError("Choose a PDF or TXT study material first.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setValidationError("Please choose a file smaller than 5 MiB.");
      return;
    }
    await onSubmit(config, file);
  }
  return (
    <form onSubmit={(event) => void submit(event)}>
      <fieldset disabled={busy} className="form-fields">
        <div className="form-grid">
          <label className="field">
            Plan name
            <input
              name="name"
              required
              maxLength={120}
              defaultValue={initial?.name}
              placeholder="e.g. Finals, one day at a time"
              data-initial-focus
            />
          </label>
          <label className="field">
            Course / subject
            <input
              name="subject"
              required
              maxLength={120}
              defaultValue={initial?.subject}
              placeholder="e.g. Computer Networks"
            />
          </label>
        </div>
        {!initial && (
          <label className="upload-field">
            <span className="upload-symbol">
              <Icon kind="book" size={24} />
            </span>
            <strong>{file ? file.name : "Add your study material"}</strong>
            <span>Text-based PDF or TXT · up to 5 MiB</span>
            <input
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              required
              aria-label="Study material upload"
              onChange={(event) => setFile(event.target.files?.[0])}
            />
            <small>
              Scanned or encrypted PDFs need to be converted to text first.
            </small>
          </label>
        )}
        <div className="form-grid">
          <label className="field">
            Start date
            <input
              name="startDate"
              type="date"
              required
              defaultValue={initial?.startDate ?? todayISO()}
            />
          </label>
          <label className="field">
            Deadline
            <input
              name="endDate"
              type="date"
              required
              defaultValue={initial?.endDate ?? plusDays(todayISO(), 14)}
            />
          </label>
        </div>
        <label className="field">
          Daily study time <span className="label-hint">minutes</span>
          <input
            name="dailyMinutes"
            type="number"
            required
            min={0}
            max={720}
            step={1}
            defaultValue={initial?.dailyMinutes ?? 120}
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={weekdayOverrides}
            onChange={(event) => setWeekdayOverrides(event.target.checked)}
          />
          Different availability by weekday
        </label>
        {weekdayOverrides && (
          <div className="weekday-grid">
            {weekdays.map((day, index) => (
              <label className="field" key={day}>
                {day.slice(0, 3)}
                <input
                  name={`weekday-${index}`}
                  type="number"
                  min={0}
                  max={720}
                  step={1}
                  placeholder="Default"
                  aria-label={`${day} study minutes`}
                  defaultValue={initial?.weekdayMinutes?.[index]}
                />
              </label>
            ))}
          </div>
        )}
        <label className="field">
          Unavailable dates <span className="label-hint">optional</span>
          <textarea
            name="unavailableDates"
            rows={2}
            placeholder="YYYY-MM-DD, YYYY-MM-DD"
            defaultValue={initial?.unavailableDates?.join(", ")}
          />
          <span className="form-help">
            Separate dates with commas. Use 0 minutes for regular rest days.
            Maximum plan length: 365 days.
          </span>
        </label>
        {!initial && (
          <p className="privacy-note">
            {provider === "fake"
              ? "Demo mode: first 12 nonempty lines only, 45 minutes per line, titles limited to 160 characters. No whole-document semantic analysis or Gemini request. "
              : provider === "gemini"
                ? "Gemini mode: your extracted material will be sent to Google. "
                : "Server analysis mode could not be determined. "}
            Your plan is saved on this computer. Original files are processed
            temporarily. If the server uses Gemini, extracted text is sent to
            Google for analysis; demo mode uses simulated analysis. Large
            documents above 100,000 extracted characters should be split into
            smaller sections.
          </p>
        )}
        <button className="primary full-width" disabled={busy}>
          {busy
            ? "Preparing your plan…"
            : initial
              ? "Save plan & availability"
              : "Analyze material & create plan"}
          <Icon kind="arrow" size={16} />
        </button>
        {validationError && (
          <p className="form-error" role="alert">
            {validationError}
          </p>
        )}
      </fieldset>
    </form>
  );
}
