"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Native <dialog> bound to the URL: it exists only while ?slot= is valid, and every way of closing
// it (Esc, backdrop, Batal, Selesai) ends at closeHref, so Back and shared links behave.
export default function BookingDialog({
  closeHref,
  children,
}: {
  closeHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    // Strict mode runs effects twice in dev; showModal() throws if already open.
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="booking-title"
      onClose={() => router.replace(closeHref, { scroll: false })}
      onClick={(e) => {
        // A click on the backdrop targets the dialog element itself (its content sits in the inner div).
        if (e.target !== e.currentTarget) return;
        const typed = [...e.currentTarget.querySelectorAll<HTMLInputElement>("input[name=name], input[name=phone]")].some(
          (input) => input.value,
        );
        if (!typed) e.currentTarget.close();
      }}
    >
      <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
    </dialog>
  );
}
