import Link from 'next/link'

export default function ReportsNotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
          📁
        </div>
        <h2 className="text-lg font-semibold text-white">Report nicht gefunden</h2>
        <p className="mt-2 text-sm text-gray-400 leading-relaxed">
          Dieser Report existiert nicht oder wurde gelöscht.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/reports"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
          >
            Alle Reports
          </Link>
          <Link
            href="/analyze"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10"
          >
            Neue Analyse
          </Link>
        </div>
      </div>
    </div>
  )
}
