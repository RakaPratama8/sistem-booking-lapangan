import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const input = "w-full rounded border border-zinc-300 p-2";
  return (
    <main className="mx-auto w-full max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Login Admin</h1>
      <form action={login} className="space-y-3">
        <input name="email" type="email" required placeholder="Email" className={input} />
        <input name="password" type="password" required placeholder="Password" className={input} />
        {error && <p role="alert" className="text-sm text-red-700">Email atau password salah.</p>}
        <button className="rounded bg-zinc-800 px-4 py-2 text-white">Masuk</button>
      </form>
    </main>
  );
}
