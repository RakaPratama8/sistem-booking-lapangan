"use client";

// A form whose submit asks "OK?" first. Used for destructive admin actions.
export default function ConfirmForm({
  action,
  message,
  className,
  children,
}: {
  action: (form: FormData) => void | Promise<void>;
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
