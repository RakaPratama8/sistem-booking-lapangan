"use client";

import { useFormStatus } from "react-dom";

// Disables itself and shows progress while its parent form's action runs (slow phone networks, double taps).
export default function SubmitButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={className}>
      {pending ? "Memproses…" : children}
    </button>
  );
}
