import SubmitButton from "@/components/SubmitButton";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-12">
      <form action={login} className="space-y-4">
        <div className="space-y-1">
          <h1 className="title">Login Admin</h1>
          <p className="muted">Khusus pengelola lapangan.</p>
        </div>
        <label className="block space-y-1 text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" className="input" />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="input" />
        </label>
        {error && <p role="alert" className="alert-error text-sm">Email atau password salah.</p>}
        <SubmitButton className="btn-primary w-full">Masuk</SubmitButton>
      </form>
    </main>
  );
}
