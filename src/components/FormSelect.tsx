import { SelectHTMLAttributes } from "react";

type Option = { label: string; value: string };
type Props = {
  label: string;
  options: Option[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function FormSelect({ label, options, ...props }: Props) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-slate-600">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
