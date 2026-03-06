import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard.js'
import BookingModal from '../components/BookingModal.js'
import Navbar from '../components/Navbar.js'

const CATEGORIES = ['semua', 'tenda', 'carrier', 'pakaian', 'alas', 'masak', 'navigasi', 'penerangan']

export default function Home() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState('semua')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('category')
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setFiltered(
      category === 'semua' ? products : products.filter(p => p.category === category)
    )
  }, [category, products])

  const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '6281234567890'

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <Navbar />

      {/* ── HERO ── */}
      <section className="pt-36 pb-24 px-6 text-center">
        <p className="text-orange-500 text-xs font-mono tracking-widest uppercase mb-4">
          Rental Alat Outdoor Terpercaya
        </p>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-none">
          SIAP<br />
          <span className="text-orange-500">MENAKLUKKAN</span><br />
          PUNCAK?
        </h1>
        <p className="text-stone-400 text-lg max-w-xl mx-auto mb-10">
          Sewa peralatan hiking & outdoor berkualitas. Ringan di kantong, berat di kualitas.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="#katalog"
            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 text-xs font-mono uppercase tracking-widest transition-colors">
            Lihat Katalog
          </a>
          <a href="#cara-sewa"
            className="border border-stone-600 hover:border-orange-500 text-stone-300 hover:text-orange-400 px-8 py-3 text-xs font-mono uppercase tracking-widest transition-colors">
            Cara Sewa
          </a>
        </div>
      </section>

      {/* ── KATALOG ── */}
      <section id="katalog" className="px-6 max-w-6xl mx-auto py-16 scroll-mt-20">
        <p className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-2">Katalog Alat</p>
        <h2 className="text-4xl font-black uppercase tracking-tight mb-10">Semua yang Kamu Butuhkan</h2>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all
                ${category === cat
                  ? 'bg-orange-600 border-orange-600 text-white'
                  : 'border-stone-700 text-stone-400 hover:border-orange-500 hover:text-orange-400'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Produk */}
        {loading ? (
          <div className="text-center text-stone-500 py-20 font-mono text-sm">Memuat katalog...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-stone-500 py-20 font-mono text-sm">Tidak ada produk ditemukan.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onBook={() => setSelected(product)}
              />
            ))}
              </div>
        )}
      </section>

      {/* ── CARA SEWA ── */}
      <section id="cara-sewa" className="py-20 px-6 bg-stone-900 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-2">Cara Kerja</p>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-14">Sewa itu Mudah</h2>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-orange-600 to-transparent" />
            {[
              { num: '01', title: 'Pilih Alat', desc: 'Browse katalog, pilih peralatan yang dibutuhkan, cek ketersediaan tanggal.' },
              { num: '02', title: 'Pesan Online', desc: 'Isi form pemesanan dan konfirmasi via WhatsApp dalam hitungan menit.' },
              { num: '03', title: 'Bayar & Ambil', desc: 'Transfer DP 50%, ambil alat di toko atau request antar ke basecamp.' },
              { num: '04', title: 'Kembalikan', desc: 'Kembalikan dalam kondisi baik sesuai tanggal. Deposit kembali penuh.' },
            ].map((s, i) => (
              <div key={i} className="text-center px-4 py-6 relative z-10">
                <div className="w-16 h-16 rounded-full border-2 border-orange-600 bg-stone-900 flex items-center justify-center mx-auto mb-4">
                  <span className="font-black text-orange-500 text-xl">{s.num}</span>
                </div>
                <h3 className="font-black text-base uppercase tracking-wider mb-2">{s.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
            {[
              { icon: '🕐', title: 'Buka Setiap Hari', desc: '08.00 – 20.00 WIB termasuk hari libur nasional' },
              { icon: '🚚', title: 'Antar ke Basecamp', desc: 'Layanan antar tersedia untuk area Malang & sekitarnya' },
              { icon: '🔒', title: 'Deposit Aman', desc: 'Deposit dikembalikan penuh jika alat kembali dalam kondisi baik' },
            ].map((item, i) => (
              <div key={i} className="bg-stone-950 border border-stone-800 p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="font-black text-sm uppercase tracking-wider mb-1">{item.title}</div>
                <div className="text-stone-400 text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ULASAN ── */}
      <section id="ulasan" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-2">Kata Mereka</p>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-12">Ulasan Pendaki</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { nama: 'Rizky Pratama', lokasi: 'Pendaki Rinjani · Lombok', rating: 5, text: 'Alat-alatnya lengkap banget dan kondisinya bersih. Tenda yang aku sewa anti bocor padahal hujan deras di Rinjani. Recommended banget!' },
              { nama: 'Sari Dewi', lokasi: 'Pendaki Semeru · Malang', rating: 5, text: 'Carrier 60L yang aku sewa sangat nyaman, frame-nya bagus dan suspensinya enak. Harga juga sangat terjangkau dibanding beli sendiri.' },
              { nama: 'Andi Firmansyah', lokasi: 'Pendaki Merbabu · Solo', rating: 4, text: 'Proses pesan via WhatsApp cepet banget responnya. Sleeping bag-nya hangat banget, cocok untuk suhu 0°C di Merbabu.' },
            ].map((r, i) => (
              <div key={i} className="bg-stone-900 border border-stone-800 p-6 relative overflow-hidden">
                <div className="text-orange-500/10 font-black text-9xl absolute -top-4 left-2 leading-none select-none pointer-events-none">"</div>
                <div className="text-yellow-400 text-sm mb-3 relative z-10">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
                <p className="text-stone-300 text-sm leading-relaxed mb-6 relative z-10 italic">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-700 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {r.nama.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-sm">{r.nama}</div>
                    <div className="text-stone-500 text-xs">{r.lokasi}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KONTAK ── */}
      <section id="kontak" className="py-20 px-6 bg-stone-900 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-2">Hubungi Kami</p>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-12">Kontak</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Info Kontak */}
            <div className="space-y-6">
              {[
                { icon: '📍', label: 'Alamat', value: 'Jl. Raya Pandanwangi No.1, Malang, Jawa Timur' },
                { icon: '📞', label: 'Telepon / WhatsApp', value: '0812-3456-7890' },
                { icon: '✉️', label: 'Email', value: 'halo@puncak.id' },
                { icon: '⏰', label: 'Jam Operasional', value: 'Senin – Minggu, 08.00 – 20.00 WIB' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="text-2xl mt-0.5 flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-0.5">{item.label}</div>
                    <div className="text-stone-200">{item.value}</div>
                  </div>
                </div>
              ))}

              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent('Halo Puncak Rental, saya ingin tanya informasi sewa alat outdoor 🏔')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 text-xs font-mono uppercase tracking-widest transition-colors"
              >
                💬 Chat WhatsApp Sekarang
              </a>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-black text-base uppercase tracking-wider mb-6 text-stone-300">FAQ</h3>
              <div className="space-y-5">
                {[
                  { q: 'Berapa deposit yang diperlukan?', a: 'Deposit Rp 100.000–300.000 tergantung alat. Dikembalikan penuh saat alat kembali dalam kondisi baik.' },
                  { q: 'Apakah bisa pesan H-1?', a: 'Bisa, selama stok tersedia. Disarankan pesan minimal 2 hari sebelum berangkat.' },
                  { q: 'Bagaimana jika alat rusak?', a: 'Kerusakan ringan tidak dikenakan biaya. Kerusakan berat dikenakan biaya perbaikan sesuai kondisi.' },
                  { q: 'Apakah ada layanan antar?', a: 'Ada! Antar ke basecamp Rp 25.000, antar ke alamat Rp 50.000 untuk area Malang Raya.' },
                ].map((faq, i) => (
                  <div key={i} className="border-b border-stone-800 pb-4">
                    <div className="font-black text-sm text-orange-400 mb-1">Q: {faq.q}</div>
                    <div className="text-stone-400 text-sm leading-relaxed">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6 text-center bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border-t border-stone-800">
        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4 leading-tight">
          Gunung Menunggu.<br />
          <span className="text-orange-500">Kamu Siap?</span>
        </h2>
        <p className="text-stone-400 mb-10 max-w-md mx-auto">
          Jangan biarkan mahalnya peralatan menghalangi petualanganmu. Sewa dari kami, summit bersama kami.
        </p>
        <button
          onClick={() => document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-4 text-sm font-mono uppercase tracking-widest transition-colors"
        >
          Sewa Sekarang — Gratis Konsultasi!
        </button>
      </section>

      {/* BOOKING MODAL */}
      {selected && (
        <BookingModal
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* WA Float Button */}
      <a
        href={`https://wa.me/${WA}?text=${encodeURIComponent('Halo Puncak Rental! 🏔')}`}
        target="_blank"
        rel="noreferrer"
        title="Chat WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-green-900/50 transition-all hover:scale-110"
      >
        💬
      </a>
    </div>
  )
}