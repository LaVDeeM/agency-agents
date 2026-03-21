'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AccountContext } from '@/lib/types'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { href: '/analyze', label: 'Account Analysis', icon: '📱' },
  { href: '/review', label: 'Video Review', icon: '🎬' },
  { href: '/reports', label: 'Reports', icon: '📁' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [reportCount, setReportCount] = useState(0)
  const [accountCtx, setAccountCtx] = useState<AccountContext | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [analyzeOpen, setAnalyzeOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('influencer_reports')
      if (saved) setReportCount(JSON.parse(saved).length)
    } catch {}
    try {
      const ctx = localStorage.getItem('account_context')
      if (ctx) setAccountCtx(JSON.parse(ctx))
    } catch {}
  }, [pathname]) // re-read when navigating

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Top Navbar ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-white/8 bg-gray-950/94 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4 lg:px-6 max-w-7xl mx-auto">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-base shadow-lg shadow-indigo-500/25">
              🌟
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Growth<span className="text-indigo-400">Suite</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-white/8 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              Dashboard
            </Link>

            {/* Analyze Dropdown */}
            <div className="relative" onMouseEnter={() => setAnalyzeOpen(true)} onMouseLeave={() => setAnalyzeOpen(false)}>
              <button
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive('/analyze') || isActive('/review')
                    ? 'bg-white/8 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                Analyse
                <svg className={`h-3 w-3 transition-transform ${analyzeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {analyzeOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 rounded-xl border border-white/10 bg-gray-900 py-1.5 shadow-2xl shadow-black/40">
                  <Link
                    href="/analyze"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <span className="text-base">📱</span>
                    <div>
                      <div className="font-medium">Account Analysis</div>
                      <div className="text-xs text-gray-500">5 Spezialisten · Metriken</div>
                    </div>
                  </Link>
                  <Link
                    href="/analyze?tab=insights"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <span className="text-base">📊</span>
                    <div>
                      <div className="font-medium">Insights Upload</div>
                      <div className="text-xs text-gray-500">Screenshots hochladen</div>
                    </div>
                  </Link>
                  <div className="my-1 border-t border-white/8" />
                  <Link
                    href="/review"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <span className="text-base">🎬</span>
                    <div>
                      <div className="font-medium">Video Review</div>
                      <div className="text-xs text-gray-500">Reel · TikTok · Shorts</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Reports */}
            <Link
              href="/reports"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                isActive('/reports')
                  ? 'bg-white/8 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              Reports
              {reportCount > 0 && (
                <span className="rounded-full bg-indigo-500/20 px-1.5 text-xs font-semibold text-indigo-300 tabular-nums">
                  {reportCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Right: account context + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {accountCtx && (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-gray-300">@{accountCtx.handle}</span>
                <span className="text-xs text-gray-600">·</span>
                <span className="text-xs text-gray-500">{accountCtx.niche}</span>
              </div>
            )}
            <Link
              href="/review"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:opacity-90 hover:shadow-indigo-500/30"
            >
              + Neue Analyse
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile Menu ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-x-0 top-14 z-40 border-b border-white/8 bg-gray-950/98 backdrop-blur-xl md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <nav className="flex flex-col gap-0.5 p-3">
            <Link href="/dashboard" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-white/8 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
              ⬡ Dashboard
            </Link>
            <Link href="/analyze" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive('/analyze') ? 'bg-white/8 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
              📱 Account Analysis
            </Link>
            <Link href="/analyze?tab=insights" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all pl-10">
              📊 Insights Upload
            </Link>
            <Link href="/review" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive('/review') ? 'bg-white/8 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
              🎬 Video Review
            </Link>
            <Link href="/reports" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive('/reports') ? 'bg-white/8 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
              📁 Reports
              {reportCount > 0 && (
                <span className="ml-auto rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">{reportCount}</span>
              )}
            </Link>

            <div className="border-t border-white/8 pt-2 mt-1">
              {accountCtx && (
                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-gray-300">@{accountCtx.handle} · {accountCtx.niche}</span>
                </div>
              )}
              <Link
                href="/review"
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                + Neue Analyse starten
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
