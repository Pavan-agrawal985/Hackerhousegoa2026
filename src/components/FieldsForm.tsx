"use client";

import { randomBuilderTitle, STACK_SUGGESTIONS } from "@/lib/builderTitles";
import type { CardFields } from "@/lib/drawCard";

interface Props {
  fields: CardFields;
  onChange: (fields: CardFields) => void;
}

export function FieldsForm({ fields, onChange }: Props) {
  const set = (patch: Partial<CardFields>) => onChange({ ...fields, ...patch });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fieldName" className="text-xs font-semibold uppercase tracking-wider text-goa-sand/60">
          Your name
        </label>
        <input
          id="fieldName"
          value={fields.name}
          onChange={(e) => set({ name: e.target.value })}
          maxLength={28}
          placeholder="e.g. Pavan Kumar"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-goa-teal focus:bg-white/10"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fieldStack" className="text-xs font-semibold uppercase tracking-wider text-goa-sand/60">
          Stack / role
        </label>
        <input
          id="fieldStack"
          value={fields.stack}
          onChange={(e) => set({ stack: e.target.value })}
          maxLength={44}
          placeholder="e.g. Fullstack · Builder"
          list="stack-suggestions"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-goa-teal focus:bg-white/10"
        />
        <datalist id="stack-suggestions">
          {STACK_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fieldTitle" className="text-xs font-semibold uppercase tracking-wider text-goa-sand/60">
          Builder title
        </label>
        <div className="flex gap-2">
          <input
            id="fieldTitle"
            value={fields.title}
            onChange={(e) => set({ title: e.target.value })}
            maxLength={36}
            placeholder="e.g. The Wave Rider"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-goa-teal focus:bg-white/10"
          />
          <button
            type="button"
            onClick={() => set({ title: randomBuilderTitle(fields.name) })}
            title="Generate a random builder title"
            className="shrink-0 rounded-xl border border-goa-sunset1/40 bg-goa-sunset1/10 px-4 py-3 text-sm font-semibold text-goa-sunset2 transition hover:bg-goa-sunset1/20 active:scale-95"
          >
            🎲 Shuffle
          </button>
        </div>
      </div>
    </div>
  );
}
