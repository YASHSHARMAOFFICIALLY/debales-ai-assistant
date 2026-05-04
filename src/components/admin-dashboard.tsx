"use client";

import { AlertCircle, CheckCircle2, CirclePause, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ProjectNav } from "@/components/shell";
import { useDashboard, useUpdateDashboard, useWorkspace } from "@/lib/client/hooks";
import type { DashboardConfigDTO, DashboardSectionDTO, DashboardWidgetDTO } from "@/lib/schemas";
import { clsx } from "clsx";

export function AdminDashboard({ projectSlug }: { projectSlug: string }) {
  const workspace = useWorkspace(projectSlug);
  const dashboard = useDashboard(projectSlug);

  if (workspace.isLoading || dashboard.isLoading) {
    return (
      <section className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-8 text-sm text-neutral-600">
        <Loader2 className="animate-spin" size={16} /> Loading admin dashboard
      </section>
    );
  }

  if (workspace.isError || dashboard.isError) {
    const error = workspace.error ?? dashboard.error;
    return (
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-moss">{projectSlug}</p>
            <h1 className="mt-1 text-3xl font-semibold">Admin Dashboard</h1>
          </div>
          <ProjectNav projectSlug={projectSlug} active="admin" />
        </div>
        <div className="rounded-md border border-tomato/30 bg-tomato/10 p-5 text-sm text-tomato" data-testid="admin-error">
          {error?.message}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-6" data-testid="admin-dashboard">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">{workspace.data?.project.name}</p>
          <h1 className="mt-1 text-3xl font-semibold">{dashboard.data?.dashboard.title}</h1>
          {dashboard.data?.dashboard.subtitle ? <p className="mt-2 max-w-3xl text-sm text-neutral-600">{dashboard.data.dashboard.subtitle}</p> : null}
        </div>
        <ProjectNav projectSlug={projectSlug} active="admin" />
      </div>
      {dashboard.data ? <DashboardRenderer dashboard={dashboard.data.dashboard} /> : null}
      {dashboard.data ? <DashboardConfigEditor projectSlug={projectSlug} dashboard={dashboard.data.dashboard} /> : null}
    </section>
  );
}

function DashboardRenderer({ dashboard }: { dashboard: DashboardConfigDTO }) {
  return (
    <div className="space-y-5">
      {dashboard.sections.map((section) => (
        <section key={section.id} className="border-t border-line pt-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            {section.description ? <p className="mt-1 text-sm text-neutral-600">{section.description}</p> : null}
          </div>
          <div
            className={clsx(
              "grid gap-4",
              section.columns === 1 && "md:grid-cols-1",
              section.columns === 2 && "md:grid-cols-2",
              section.columns === 3 && "md:grid-cols-3",
            )}
          >
            {section.widgets.map((widget) => {
              if (widget.type === "metric") {
                return (
                  <article key={widget.id} className="rounded-md border border-line bg-white p-5 shadow-soft">
                    <p className="text-sm font-medium text-neutral-600">{widget.label}</p>
                    <p
                      className={clsx(
                        "mt-3 break-words text-4xl font-semibold",
                        widget.tone === "moss" && "text-moss",
                        widget.tone === "tomato" && "text-tomato",
                        widget.tone === "gold" && "text-gold",
                      )}
                    >
                      {widget.value}
                    </p>
                    {widget.helper ? <p className="mt-2 text-sm text-neutral-500">{widget.helper}</p> : null}
                  </article>
                );
              }

              if (widget.type === "list") {
                return (
                  <article key={widget.id} className="rounded-md border border-line bg-white p-5 shadow-soft">
                    <h3 className="break-words font-semibold">{widget.label}</h3>
                    <ul className="mt-4 space-y-3 text-sm text-neutral-700">
                      {widget.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tomato" />
                          <span className="break-words">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              }

              const StatusIcon = widget.status === "healthy" ? CheckCircle2 : widget.status === "paused" ? CirclePause : AlertCircle;
              return (
                <article key={widget.id} className="rounded-md border border-line bg-white p-5 shadow-soft">
                  <div className="flex items-start gap-3">
                    <span
                      className={clsx(
                        "flex h-10 w-10 items-center justify-center rounded-md",
                        widget.status === "healthy" && "bg-moss/10 text-moss",
                        widget.status === "attention" && "bg-gold/10 text-gold",
                        widget.status === "paused" && "bg-neutral-100 text-neutral-500",
                      )}
                    >
                      <StatusIcon size={20} />
                    </span>
                    <div>
                      <h3 className="break-words font-semibold">{widget.label}</h3>
                      <p className="mt-1 text-sm capitalize text-neutral-500">{widget.status}</p>
                    </div>
                  </div>
                  <p className="mt-4 break-words text-sm text-neutral-700">{widget.detail}</p>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function DashboardConfigEditor({ projectSlug, dashboard }: { projectSlug: string; dashboard: DashboardConfigDTO }) {
  const updateDashboard = useUpdateDashboard(projectSlug);
  const [draft, setDraft] = useState<Pick<DashboardConfigDTO, "title" | "subtitle" | "sections">>({
    title: dashboard.title,
    subtitle: dashboard.subtitle,
    sections: dashboard.sections,
  });

  useEffect(() => {
    setDraft({
      title: dashboard.title,
      subtitle: dashboard.subtitle,
      sections: dashboard.sections,
    });
  }, [dashboard]);

  function updateSection(sectionIndex: number, patch: Partial<DashboardSectionDTO>) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, index) => (index === sectionIndex ? { ...section, ...patch } : section)),
    }));
  }

  function updateWidget(sectionIndex: number, widgetIndex: number, widget: DashboardWidgetDTO) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;
        return {
          ...section,
          widgets: section.widgets.map((existing, existingIndex) => (existingIndex === widgetIndex ? widget : existing)),
        };
      }),
    }));
  }

  function addSection() {
    const next = draft.sections.length + 1;
    setDraft((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          id: `section-${Date.now()}`,
          title: `New Section ${next}`,
          description: "Configurable section added from the admin UI.",
          columns: 2,
          widgets: [{ id: `metric-${Date.now()}`, type: "metric", label: "New metric", value: "0", helper: "Edit me", tone: "moss" }],
        },
      ],
    }));
  }

  function removeSection(sectionIndex: number) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.filter((_, index) => index !== sectionIndex),
    }));
  }

  function addMetric(sectionIndex: number) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;
        return {
          ...section,
          widgets: [
            ...section.widgets,
            { id: `metric-${Date.now()}`, type: "metric", label: "New metric", value: "0", helper: "Added from admin UI", tone: "moss" },
          ],
        };
      }),
    }));
  }

  function removeWidget(sectionIndex: number, widgetIndex: number) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;
        return { ...section, widgets: section.widgets.filter((_, existingIndex) => existingIndex !== widgetIndex) };
      }),
    }));
  }

  async function handleSave() {
    await updateDashboard.mutateAsync(draft);
  }

  return (
    <section className="mt-8 border-t border-line pt-6" data-testid="dashboard-config-editor">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Dashboard Config Editor</h2>
          <p className="mt-1 text-sm text-neutral-600">Changes are saved to MongoDB and immediately re-render the admin dashboard.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={addSection} className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm">
            <Plus size={16} /> Section
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateDashboard.isPending || draft.sections.length === 0}
            className="flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {updateDashboard.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save config
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-md border border-line bg-white p-4 shadow-soft">
        <label className="block text-sm font-medium">
          Dashboard title
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm font-normal outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm font-medium">
          Subtitle
          <input
            value={draft.subtitle ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, subtitle: event.target.value }))}
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm font-normal outline-none focus:border-ink"
          />
        </label>

        {draft.sections.map((section, sectionIndex) => (
          <div key={section.id} className="rounded-md border border-line bg-panel p-4">
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="grid flex-1 gap-2 md:grid-cols-[1fr_110px]">
                <input
                  value={section.title}
                  onChange={(event) => updateSection(sectionIndex, { title: event.target.value })}
                  className="rounded-md border border-line bg-white px-3 py-2 text-sm font-medium outline-none focus:border-ink"
                />
                <select
                  value={section.columns}
                  onChange={(event) => updateSection(sectionIndex, { columns: Number(event.target.value) as 1 | 2 | 3 })}
                  className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
                >
                  <option value={1}>1 col</option>
                  <option value={2}>2 cols</option>
                  <option value={3}>3 cols</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => addMetric(sectionIndex)} className="rounded-md border border-line bg-white px-3 py-2 text-sm">
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(sectionIndex)}
                  disabled={draft.sections.length === 1}
                  className="rounded-md border border-line bg-white px-3 py-2 text-sm text-tomato disabled:opacity-40"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <input
              value={section.description ?? ""}
              onChange={(event) => updateSection(sectionIndex, { description: event.target.value })}
              placeholder="Section description"
              className="mb-3 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <div className="grid gap-3 lg:grid-cols-2">
              {section.widgets.map((widget, widgetIndex) => (
                <WidgetEditor
                  key={widget.id}
                  widget={widget}
                  onChange={(nextWidget) => updateWidget(sectionIndex, widgetIndex, nextWidget)}
                  onRemove={() => removeWidget(sectionIndex, widgetIndex)}
                />
              ))}
            </div>
          </div>
        ))}
        {updateDashboard.isError ? <p className="text-sm text-tomato">{updateDashboard.error.message}</p> : null}
      </div>
    </section>
  );
}

function WidgetEditor({
  widget,
  onChange,
  onRemove,
}: {
  widget: DashboardWidgetDTO;
  onChange: (widget: DashboardWidgetDTO) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-md bg-panel px-2 py-1 text-xs font-medium uppercase tracking-wide text-neutral-500">{widget.type}</span>
        <button type="button" onClick={onRemove} className="rounded-md border border-line px-2 py-1 text-tomato">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="space-y-2">
        <input
          value={widget.label}
          onChange={(event) => onChange({ ...widget, label: event.target.value })}
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
        />
        {widget.type === "metric" ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              value={widget.value}
              onChange={(event) => onChange({ ...widget, value: event.target.value })}
              className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <input
              value={widget.helper ?? ""}
              onChange={(event) => onChange({ ...widget, helper: event.target.value })}
              className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink sm:col-span-2"
            />
          </div>
        ) : null}
        {widget.type === "status" ? (
          <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
            <select
              value={widget.status}
              onChange={(event) => onChange({ ...widget, status: event.target.value as "healthy" | "attention" | "paused" })}
              className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            >
              <option value="healthy">Healthy</option>
              <option value="attention">Attention</option>
              <option value="paused">Paused</option>
            </select>
            <input
              value={widget.detail}
              onChange={(event) => onChange({ ...widget, detail: event.target.value })}
              className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>
        ) : null}
        {widget.type === "list" ? (
          <textarea
            value={widget.items.join("\n")}
            onChange={(event) =>
              onChange({
                ...widget,
                items: event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            className="min-h-24 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
        ) : null}
      </div>
    </div>
  );
}
