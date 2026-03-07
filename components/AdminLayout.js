import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href: '/admin',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        label: 'Pesanan',
        href: '/admin/bookings',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        badge: 'pending', // akan diisi jumlah pending
    },
    {
        label: 'Produk',
        href: '/admin/products',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
    },
]

export default function AdminLayout({ children, title = 'Dashboard', pendingCount = 0 }) {
    const router = useRouter()
    const [sidebarOpen, setSidebar] = useState(false)
    const [time, setTime] = useState('')

    // Jam realtime
    useEffect(() => {
        const tick = () => {
            setTime(new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }))
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])

    // Tutup sidebar saat navigasi (mobile)
    useEffect(() => {
        setSidebar(false)
    }, [router.pathname])

    const isActive = (href) => {
        if (href === '/admin') return router.pathname === '/admin'
        return router.pathname.startsWith(href)
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex">

            {/* ── OVERLAY MOBILE ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                    onClick={() => setSidebar(false)}
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={`
        fixed top-0 left-0 h-full z-40 w-64 bg-stone-900 border-r border-stone-800
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>

                {/* Brand */}
                <div className="px-6 py-5 border-b border-stone-800">
                    <Link href="/" className="font-black text-2xl tracking-widest">
                        <span className="text-orange-500">P</span>UNCAK
                    </Link>
                    <div className="text-xs font-mono text-stone-500 tracking-widest uppercase mt-0.5">
                        Admin Panel
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-5 space-y-1">
                    <div className="text-xs font-mono uppercase tracking-widest text-stone-600 px-3 mb-3">
                        Menu
                    </div>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-mono uppercase tracking-wider transition-all duration-150 group
                ${isActive(item.href)
                                    ? 'bg-orange-600/20 text-orange-400 border-l-2 border-orange-500'
                                    : 'text-stone-400 hover:text-white hover:bg-stone-800 border-l-2 border-transparent'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                {item.icon}
                                {item.label}
                            </span>
                            {item.badge === 'pending' && pendingCount > 0 && (
                                <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="px-6 py-4 border-t border-stone-800 space-y-3">
                    {/* Jam */}
                    <div className="text-center font-mono text-sm text-stone-400 tracking-widest">
                        {time}
                    </div>

                    {/* Lihat website */}
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-2 w-full text-xs font-mono uppercase tracking-widest text-stone-500 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Lihat Website
                    </Link>

                    {/* WA */}
                    <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '6281234567890'}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 w-full text-xs font-mono uppercase tracking-widest text-green-600 hover:text-green-400 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.25a.75.75 0 00.916.916l5.388-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5a10.44 10.44 0 01-5.337-1.463l-.383-.228-3.965 1.088 1.088-3.965-.228-.383A10.44 10.44 0 011.5 12C1.5 6.21 6.21 1.5 12 1.5S22.5 6.21 22.5 12 17.79 22.5 12 22.5z" />
                        </svg>
                        WhatsApp Aktif
                    </a>
                </div>
            </aside>

            {/* ── MAIN AREA ── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Topbar */}
                <header className="sticky top-0 z-20 bg-stone-900/95 backdrop-blur border-b border-stone-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Hamburger mobile */}
                        <button
                            onClick={() => setSidebar(true)}
                            className="md:hidden text-stone-400 hover:text-white p-1"
                            aria-label="Open sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500">
                            <span>Admin</span>
                            {router.pathname !== '/admin' && (
                                <>
                                    <span>/</span>
                                    <span className="text-stone-300">{title}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Badge pending */}
                        {pendingCount > 0 && (
                            <Link
                                href="/admin/bookings"
                                className="flex items-center gap-2 bg-orange-600/20 border border-orange-700 text-orange-400 text-xs font-mono uppercase tracking-wider px-3 py-1.5 hover:bg-orange-600/30 transition-colors"
                            >
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                {pendingCount} Pending
                            </Link>
                        )}

                        {/* Tanggal */}
                        <div className="hidden sm:block text-xs font-mono text-stone-500 tracking-wider">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">
                    {/* Page title */}
                    <div className="mb-6">
                        <h1 className="font-black text-2xl uppercase tracking-wider">{title}</h1>
                        <div className="w-12 h-0.5 bg-orange-500 mt-2" />
                    </div>

                    {children}
                </main>

                {/* Footer admin */}
                <footer className="px-6 py-3 border-t border-stone-800 text-xs font-mono text-stone-600 flex justify-between">
                    <span>PUNCAK RENTAL — ADMIN</span>
                    <span>v1.0.0</span>
                </footer>
            </div>
        </div>
    )
}