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
  const [selected, setSelected] = useState(null)  // produk yang dipilih untuk booking
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setFiltered(
      category === 'semua' ? products : products.filter(p => p.category === category)
    )
  }, [category, products])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('category')
    setProducts(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center">
        <p className="text-orange-500 text-sm tracking-widest uppercase mb-3">
          Rental Alat Outdoor Terpercaya
        </p>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
          SIAP<br />
          <span className="text-orange-500">MENAKLUKKAN</span><br />
          PUNCAK?
        </h1>
        <p className="text-stone-400 text-lg max-w-xl mx-auto">
          Sewa peralatan hiking & outdoor berkualitas. Ringan di kantong, berat di kualitas.
        </p>
      </section>

      {/* FILTER */}
      <section className="px-6 max-w-6xl mx-auto">
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

        {/* GRID PRODUK */}
        {loading ? (
          <div className="text-center text-stone-500 py-20">Memuat katalog...</div>
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

      {/* BOOKING MODAL */}
      {selected && (
        <BookingModal
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}