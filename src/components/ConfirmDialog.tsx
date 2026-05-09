"use client";

type Props = {
  title: string;
  open: boolean;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="advanced-panel w-full max-w-md p-5">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-3 py-2 text-sm text-white transition hover:from-rose-500 hover:to-pink-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
