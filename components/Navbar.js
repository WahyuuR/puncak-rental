import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobile] = useState(false)
    const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '6281234567890'
    const waLink = `https://wa.me/${WA}?text=${encodeURIComponent('Halo Puncak Rental, saya ingin tanya ketersediaan alat outdoor 🏔')}`

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Tutup mobile menu saat resize ke desktop
    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMobile(false) }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const navLinks = [
        { label: 'Katalog', href: '/#katalog' },
        { label: 'Cara Sewa', href: '/#cara-sewa' },
        { label: 'Ulasan', href: '/#ulasan' },
        { label: 'Kontak', href: '/#kontak' },
    ]

    return (
        <>
            {/* ── NAVBAR ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
                    ? 'bg-stone-950/95 backdrop-blur-md border-b border-stone-800 py-3'
                    : 'bg-linear-to-b from-stone-950/90 to-transparent py-5'
                }`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="font-black text-2xl tracking-widest select-none">
                        <span className="text-orange-500">P</span>UNCAK
                    </Link>

                    {/* Desktop links */}
                    <ul className="hidden md:flex items-center gap-8">
                        {navLinks.map(l => (
                            <li key={l.label}>
                                <Link
                                    href={l.href}
                                    className="text-stone-400 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors duration-200"
                                >
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Desktop right actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-mono uppercase tracking-widest px-4 py-2 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.25a.75.75 0 00.916.916l5.388-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5a10.44 10.44 0 01-5.337-1.463l-.383-.228-3.965 1.088 1.088-3.965-.228-.383A10.44 10.44 0 011.5 12C1.5 6.21 6.21 1.5 12 1.5S22.5 6.21 22.5 12 17.79 22.5 12 22.5z" />
                            </svg>
                            Chat WA
                        </a>
                        <Link
                            href="/admin"
                            className="text-stone-500 hover:text-stone-300 text-xs font-mono uppercase tracking-widest px-3 py-2 border border-stone-800 hover:border-stone-600 transition-colors duration-200"
                        >
                            Admin
                        </Link>
                    </div>

                    {/* Hamburger (mobile) */}
                    <button
                        onClick={() => setMobile(!mobileOpen)}
                        aria-label="Toggle menu"
                        className="md:hidden flex flex-col gap-1.5 p-2 group"
                    >
                        <span className={`block w-6 h-0.5 bg-stone-300 transition-all duration-300 origin-center
              ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-stone-300 transition-all duration-300
              ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-stone-300 transition-all duration-300 origin-center
              ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>

                </div>
            </nav>

            {/* ── MOBILE DRAWER ── */}
            <div className={`fixed inset-0 z-40 flex flex-col justify-center items-center gap-8
        bg-stone-950 transition-all duration-300
        ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

                {/* Logo di drawer */}
                <div className="font-black text-4xl tracking-widest mb-4">
                    <span className="text-orange-500">P</span>UNCAK
                </div>

                {navLinks.map((l, i) => (
                    <Link
                        key={l.label}
                        href={l.href}
                        onClick={() => setMobile(false)}
                        style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : '0ms' }}
                        className={`font-black text-4xl tracking-tight hover:text-orange-500 transition-all duration-300
              ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        {l.label}
                    </Link>
                ))}

                <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobile(false)}
                    className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-mono text-sm uppercase tracking-widest px-6 py-3 transition-colors"
                >
                    💬 Chat WhatsApp
                </a>
            </div>

            {/* Spacer supaya konten tidak tertutup navbar */}
            <div className="h-16" />
        </>
    )
}
