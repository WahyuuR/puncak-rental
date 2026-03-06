import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function BookingModal({ product, onClose }) {
    const [form, setForm] = useState({
        customer_name: '', customer_phone: '',
        start_date: '', end_date: '',
        pickup_method: 'Ambil di toko (gratis)',
        notes: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '6281234567890'

    function getDays() {
        if (!form.start_date || !form.end_date) return 0
        const diff = new Date(form.end_date) - new Date(form.start_date)
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    function getTotalPrice() {
        return getDays() * product.price_per_day
    }

    function fmt(d) {
        if (!d) return '-'
        return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    async function handleSubmit() {
        if (!form.customer_name || !form.customer_phone || !form.start_date || !form.end_date) {
            setError('Harap isi semua field yang wajib (*)'); return
        }
        if (new Date(form.end_date) <= new Date(form.start_date)) {
            setError('Tanggal kembali harus setelah tanggal ambil'); return
        }

        setLoading(true); setError('')

        // Simpan ke Supabase
        const { error: dbError } = await supabase.from('bookings').insert({
            customer_name: form.customer_name,
            customer_phone: form.customer_phone,
            product_id: product.id,
            product_name: product.name,
            start_date: form.start_date,
            end_date: form.end_date,
            duration_days: getDays(),
            pickup_method: form.pickup_method,
            notes: form.notes,
            total_price: getTotalPrice(),
            status: 'pending'
        })

        if (dbError) { setError('Gagal menyimpan. Coba lagi.'); setLoading(false); return }

        // Buka WhatsApp
        const pesan = [
            `🏔 *PUNCAK RENTAL — PEMESANAN BARU*`,
            `━━━━━━━━━━━━━━━━━━━`,
            `👤 *Nama:* ${form.customer_name}`,
            `📱 *No. WA:* ${form.customer_phone}`,
            ``,
            `🎒 *Peralatan:* ${product.name}`,
            `⏱ *Durasi:* ${getDays()} ${product.unit}`,
            `📅 *Ambil:* ${fmt(form.start_date)}`,
            `📅 *Kembali:* ${fmt(form.end_date)}`,
            `💰 *Total:* Rp ${getTotalPrice().toLocaleString('id-ID')}`,
            ``,
            `🚚 *Pengambilan:* ${form.pickup_method}`,
            form.notes ? `📝 *Catatan:* ${form.notes}` : '',
            ``,
            `━━━━━━━━━━━━━━━━━━━`,
            `Mohon konfirmasi ketersediaan. Terima kasih! 🙏`
        ].filter(Boolean).join('\n')

        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank')
        setLoading(false)
        onClose()
    }

    const days = getDays()

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-stone-900 border border-stone-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-stone-800">
                    <div>
                        <div className="font-black text-2xl uppercase tracking-wider">Form Sewa</div>
                        <div className="text-orange-500 text-sm mt-1">{product.emoji} {product.name}</div>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-white text-2xl leading-none">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Nama */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Nama Lengkap *</label>
                        <input className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                            placeholder="Nama lengkap kamu"
                            value={form.customer_name}
                            onChange={e => setForm({ ...form, customer_name: e.target.value })} />
                    </div>

                    {/* WA */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Nomor WhatsApp *</label>
                        <input className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                            type="tel" placeholder="08xxxxxxxxxx"
                            value={form.customer_phone}
                            onChange={e => setForm({ ...form, customer_phone: e.target.value })} />
                    </div>

                    {/* Tanggal */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Tanggal Ambil *</label>
                            <input className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                                type="date" min={new Date().toISOString().split('T')[0]}
                                value={form.start_date}
                                onChange={e => setForm({ ...form, start_date: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Tanggal Kembali *</label>
                            <input className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                                type="date" min={form.start_date || new Date().toISOString().split('T')[0]}
                                value={form.end_date}
                                onChange={e => setForm({ ...form, end_date: e.target.value })} />
                        </div>
                    </div>

                    {/* Preview harga */}
                    {days > 0 && (
                        <div className="bg-stone-800 border border-orange-900 p-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-stone-400">Rp {product.price_per_day.toLocaleString('id-ID')} × {days} {product.unit}</span>
                                <span className="text-yellow-400 font-black">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    )}

                    {/* Metode */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Metode Pengambilan</label>
                        <select className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500"
                            value={form.pickup_method}
                            onChange={e => setForm({ ...form, pickup_method: e.target.value })}>
                            <option>Ambil di toko (gratis)</option>
                            <option>Antar ke basecamp (+Rp 25.000)</option>
                            <option>Antar ke alamat (+Rp 50.000)</option>
                        </select>
                    </div>

                    {/* Catatan */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Destinasi / Catatan</label>
                        <input className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                            placeholder="Contoh: Semeru, 4 orang, butuh raincover"
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="border border-orange-700 bg-orange-900/30 text-orange-400 text-xs font-mono p-3 uppercase tracking-wider">
                            ⚠ {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button onClick={handleSubmit} disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 disabled:cursor-not-allowed text-white py-4 text-sm font-mono uppercase tracking-widest transition-colors">
                        {loading ? 'Memproses...' : '💬 Kirim via WhatsApp'}
                    </button>

                    <p className="text-center text-xs text-stone-500 font-mono">
                        Pesanan tersimpan otomatis · Kamu diarahkan ke WhatsApp
                    </p>
                </div>
            </div>
        </div>
    )
}