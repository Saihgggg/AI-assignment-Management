import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold tracking-tight text-amber-400 mb-2">
        Assignment Evaluation Platform
      </h1>
      <p className="text-slate-400 mb-10">
        AI-powered feedback and plagiarism risk analysis
      </p>
      <div className="flex gap-6">
        <Link
          href="/student"
          className="px-6 py-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition"
        >
          Student Dashboard
        </Link>
        <Link
          href="/instructor"
          className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition"
        >
          Instructor Dashboard
        </Link>
      </div>
    </main>
  );
}
