import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-12">
      <form action={login} className="card space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Login Admin</h1>
          <p className="text-sm text-zinc-600">Khusus pengelola lapangan.</p>
        </div>
        <label className="block space-y-1 text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" className="input" />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="input" />
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Email atau password salah.</p>}
        <button className="btn-primary w-full">Masuk</button>
      </form>
    </main>
  );
}
