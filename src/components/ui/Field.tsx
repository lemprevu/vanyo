import type { ComponentProps, ReactNode } from "react";

const base =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-vanyo-500/70 focus:bg-white/[0.05]";

export function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-white/75">
      {children} {required && <span className="text-vanyo-400">*</span>}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${base} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${base} resize-y ${props.className ?? ""}`} />;
}

export function Select({ children, ...props }: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={`${base} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%239a7dff%22><path stroke-linecap=%22round%22 stroke-width=%222%22 d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_0.9rem_center] bg-no-repeat pr-10 ${props.className ?? ""}`}
    >
      {children}
    </select>
  );
}

export function FieldGroup({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}
