import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/AdminLayout'

const CATEGORIES = ['tenda', 'carrier', 'pakaian', 'alas', 'masak', 'navigasi', 'penerangan']

const EMPTY_FORM = {
    name: '', category: 'tenda', description: '',
    price_per_day: '', unit: 'hari', stock: 1,
    emoji: '🎒', is_active: true,
}

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState('semua')
    const [pendingCount, setPendingCount] = useState(0)

    // Modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [editId, setEditId] = useState(null) // null = tambah baru
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')

    useEffect(() => { fetchProducts(); fetchPending() }, [])

    useEffect(() => {
        let result = products
        if (catFilter !== 'semua') result = result.filter(p => p.category === catFilter)
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(p => p.name.toLowerCase().includes(q))
        }
        setFiltered(result)
    }, [products, catFilter, search])

    async function fetchProducts() {
        setLoading(true)
        const { data } = await supabase.from('products').select('*').order('category').order('name')
        setProducts(data || [])
        setLoading(false)
    }

    async function fetchPending() {
        const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        setPendingCount(count || 0)
    }

    // Buka modal tambah
    function openAdd() {
        setEditId(null)
        setForm(EMPTY_FORM)
        setFormError('')
        setModalOpen(true)
    }

    // Buka modal edit
    function openEdit(product) {
        setEditId(product.id)
        setForm({
            name: product.name,
            category: product.category,
            description: product.description || '',
            price_per_day: product.price_per_day,
            unit: product.unit,
            stock: product.stock,
            emoji: product.emoji || '🎒',
            is_active: product.is_active,
        })
        setFormError('')
        setModalOpen(true)
    }

    async function handleSave() {
        if (!form.name || !form.price_per_day) {
            setFormError('Nama dan harga wajib diisi.'); return
        }
        setSaving(true); setFormError('')

        const payload = {
            ...form,
            price_per_day: parseInt(form.price_per_day),
            stock: parseInt(form.stock),
        }

        if (editId) {
            await supabase.from('products').update(payload).eq('id', editId)
        } else {
            await supabase.from('products').insert(payload)
        }

        setSaving(false)
        setModalOpen(false)
        fetchProducts()
    }

    async function toggleActive(id, current) {
        await supabase.from('products').update({ is_active: !current }).eq('id', id)
        fetchProducts()
    }

    async function updateStock(id, delta) {
        const product = products.find(p => p.id === id)
        if (!product) return
        const newStock = Math.max(0, product.stock + delta)
        await supabase.from('products').update({ stock: newStock }).eq('id', id)
        fetchProducts()
    }

    async function deleteProduct(id) {
        if (!confirm('Yakin hapus produk ini? Data booking terkait tidak ikut terhapus.')) return
        await supabase.from('products').delete().eq('id', id)
        fetchProducts()
    }

    const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

    return (
        <AdminLayout title="Produk" pendingCount={pendingCount}>

            {/* HEADER ROW */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                {/* Search */}
                <div className="relative flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        className="w-full bg-stone-900 border border-stone-700 text-white pl-9 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Cari nama produk..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <button
                    onClick={openAdd}
                    className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono uppercase tracking-widest px-5 py-2.5 transition-colors whitespace-nowrap"
                >
                    + Tambah Produk
                </button>
            </div>

            {/* CATEGORY FILTER */}
            <div className="flex gap-2 flex-wrap mb-5">
                {['semua', ...CATEGORIES].map(c => (
                    <button
                        key={c}
                        onClick={() => setCatFilter(c)}
                        className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all
              ${catFilter === c
                                ? 'bg-orange-600 border-orange-600 text-white'
                                : 'border-stone-700 text-stone-400 hover:border-orange-500 hover:text-orange-400'
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* PRODUCT GRID */}
            {loading ? (
                <div className="text-center text-stone-500 py-16 font-mono text-sm">Memuat produk...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center text-stone-500 py-16 font-mono text-sm">Tidak ada produk ditemukan.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(p => (
                        <div key={p.id} className={`bg-stone-900 border transition-all ${p.is_active ? 'border-stone-800' : 'border-stone-800 opacity-50'}`}>

                            {/* Emoji header */}
                            <div className="h-28 bg-linear-to-br from-stone-800 to-stone-900 flex items-center justify-center text-5xl relative">
                                {p.emoji}
                                <span className={`absolute top-2 left-2 text-xs font-mono uppercase px-2 py-0.5
                  ${p.stock > 0 ? 'bg-green-800 text-green-300' : 'bg-stone-700 text-stone-400'}`}>
                                    Stok: {p.stock}
                                </span>
                                {!p.is_active && (
                                    <span className="absolute top-2 right-2 text-xs font-mono uppercase px-2 py-0.5 bg-red-900 text-red-300">
                                        Nonaktif
                                    </span>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="text-orange-500 text-xs font-mono uppercase tracking-wider mb-1">{p.category}</div>
                                <div className="font-black text-base leading-tight mb-1">{p.name}</div>
                                <div className="text-yellow-400 font-mono text-sm mb-3">
                                    Rp {p.price_per_day.toLocaleString('id-ID')} <span className="text-stone-500 text-xs">/ {p.unit}</span>
                                </div>

                                {/* Stok kontrol */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">Stok:</span>
                                    <button onClick={() => updateStock(p.id, -1)} className="w-6 h-6 bg-stone-800 hover:bg-stone-700 text-white text-sm font-bold flex items-center justify-center transition-colors">−</button>
                                    <span className="text-white font-mono text-sm w-6 text-center">{p.stock}</span>
                                    <button onClick={() => updateStock(p.id, +1)} className="w-6 h-6 bg-stone-800 hover:bg-stone-700 text-white text-sm font-bold flex items-center justify-center transition-colors">+</button>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="flex-1 text-xs font-mono uppercase tracking-wider bg-stone-800 hover:bg-stone-700 text-white px-2 py-1.5 transition-colors"
                                    >
                                        ✏ Edit
                                    </button>
                                    <button
                                        onClick={() => toggleActive(p.id, p.is_active)}
                                        className={`flex-1 text-xs font-mono uppercase tracking-wider px-2 py-1.5 transition-colors
                      ${p.is_active
                                                ? 'bg-stone-800 hover:bg-red-900 text-stone-400 hover:text-red-300'
                                                : 'bg-green-900 hover:bg-green-800 text-green-400'
                                            }`}
                                    >
                                        {p.is_active ? '⊘ Nonaktif' : '✓ Aktifkan'}
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(p.id)}
                                        className="text-xs font-mono uppercase px-2 py-1.5 bg-stone-800 hover:bg-red-900 text-stone-500 hover:text-red-300 transition-colors"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 text-xs font-mono text-stone-600">
                {filtered.length} produk ditampilkan · {products.filter(p => p.stock === 0).length} kehabisan stok
            </div>

            {/* ── MODAL TAMBAH / EDIT ── */}
            {modalOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={e => e.target === e.currentTarget && setModalOpen(false)}
                >
                    <div className="bg-stone-900 border border-stone-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">

                        {/* Modal header */}
                        <div className="flex justify-between items-center p-5 border-b border-stone-800">
                            <div className="font-black text-lg uppercase tracking-wider">
                                {editId ? '✏ Edit Produk' : '+ Tambah Produk'}
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-white text-xl">✕</button>
                        </div>

                        <div className="p-5 space-y-4">

                            {/* Emoji + Nama */}
                            <div className="flex gap-3">
                                <div className="w-20">
                                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Emoji</label>
                                    <input
                                        className="w-full bg-stone-800 border border-stone-700 text-white px-3 py-3 text-center text-2xl focus:outline-none focus:border-orange-500"
                                        value={form.emoji}
                                        onChange={e => f('emoji', e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Nama Produk *</label>
                                    <input
                                        className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                                        placeholder="Nama alat outdoor"
                                        value={form.name}
                                        onChange={e => f('name', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Kategori */}
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Kategori</label>
                                <select
                                    className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500"
                                    value={form.category}
                                    onChange={e => f('category', e.target.value)}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Deskripsi</label>
                                <textarea
                                    className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                                    rows={3}
                                    placeholder="Spesifikasi singkat alat..."
                                    value={form.description}
                                    onChange={e => f('description', e.target.value)}
                                />
                            </div>

                            {/* Harga + Unit */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Harga (Rp) *</label>
                                    <input
                                        className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                                        type="number" min="0" placeholder="50000"
                                        value={form.price_per_day}
                                        onChange={e => f('price_per_day', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Satuan</label>
                                    <select
                                        className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500"
                                        value={form.unit}
                                        onChange={e => f('unit', e.target.value)}
                                    >
                                        <option value="hari">hari</option>
                                        <option value="malam">malam</option>
                                    </select>
                                </div>
                            </div>

                            {/* Stok + Aktif */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Jumlah Stok</label>
                                    <input
                                        className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                                        type="number" min="0"
                                        value={form.stock}
                                        onChange={e => f('stock', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">Status</label>
                                    <select
                                        className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500"
                                        value={form.is_active ? 'aktif' : 'nonaktif'}
                                        onChange={e => f('is_active', e.target.value === 'aktif')}
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            {/* Error */}
                            {formError && (
                                <div className="border border-orange-700 bg-orange-900/30 text-orange-400 text-xs font-mono p-3 uppercase tracking-wider">
                                    ⚠ {formError}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 py-3 text-xs font-mono uppercase tracking-widest transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 disabled:cursor-not-allowed text-white py-3 text-xs font-mono uppercase tracking-widest transition-colors"
                                >
                                    {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Produk'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    )
}