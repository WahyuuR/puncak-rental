import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/AdminLayout'

const STATUS_OPTIONS = ['pending', 'confirmed', 'returned', 'cancelled']

const STATUS_STYLE = {
    pending: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
    confirmed: 'bg-green-900/50 text-green-300 border border-green-700',
    returned: 'bg-blue-900/50 text-blue-300 border border-blue-700',
    cancelled: 'bg-stone-800 text-stone-400 border border-stone-700',
}

export default function AdminBookings() {
    const [bookings, setBookings] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('semua')
    const [search, setSearch] = useState('')
    const [updating, setUpdating] = useState(null) // id yang sedang diupdate
    const [pendingCount, setPendingCount] = useState(0)

    useEffect(() => { fetchBookings() }, [])

    useEffect(() => {
        let result = bookings
        if (statusFilter !== 'semua') result = result.filter(b => b.status === statusFilter)
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(b =>
                b.customer_name.toLowerCase().includes(q) ||
                b.product_name.toLowerCase().includes(q) ||
                b.customer_phone.includes(q)
            )
        }
        setFiltered(result)
    }, [bookings, statusFilter, search])

    async function fetchBookings() {
        setLoading(true)
        const { data } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })
        if (data) {
            setBookings(data)
            setPendingCount(data.filter(b => b.status === 'pending').length)
        }
        setLoading(false)
    }

    async function updateStatus(id, status) {
        setUpdating(id)

        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id)

        if (error) {
            console.error('Error update status:', error)
            alert('Gagal update status: ' + error.message)
        }

        await fetchBookings()
        setUpdating(null)
    }

    async function deleteBooking(id) {
        if (!confirm('Yakin hapus pesanan ini?')) return
        await supabase.from('bookings').delete().eq('id', id)
        fetchBookings()
    }

    function openWA(phone, name, productName) {
        const no = phone.replace(/\D/g, '').replace(/^0/, '62')
        const msg = `Halo *${name}*, pesanan kamu untuk *${productName}* sudah kami konfirmasi! Silakan ambil sesuai jadwal. Terima kasih 🏔`
        window.open(`https://wa.me/${no}?text=${encodeURIComponent(msg)}`, '_blank')
    }

    function formatDate(d) {
        if (!d) return '-'
        return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    // Summary stats
    const stats = {
        semua: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        returned: bookings.filter(b => b.status === 'returned').length,
        revenue: bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total_price || 0), 0),
    }

    return (
        <AdminLayout title="Pesanan" pendingCount={pendingCount}>

            {/* STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Total Pesanan', value: stats.semua, color: 'text-white' },
                    { label: 'Menunggu', value: stats.pending, color: 'text-yellow-400' },
                    { label: 'Dikonfirmasi', value: stats.confirmed, color: 'text-green-400' },
                    { label: 'Pendapatan', value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, color: 'text-yellow-400' },
                ].map(s => (
                    <div key={s.label} className="bg-stone-900 border border-stone-800 p-4">
                        <div className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-1">{s.label}</div>
                        <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                {/* Search */}
                <div className="relative flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        className="w-full bg-stone-900 border border-stone-700 text-white pl-9 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Cari nama, alat, nomor..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Status filter */}
                <div className="flex gap-2 flex-wrap">
                    {['semua', ...STATUS_OPTIONS].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 text-xs font-mono uppercase tracking-wider border transition-all
                ${statusFilter === s
                                    ? 'bg-orange-600 border-orange-600 text-white'
                                    : 'border-stone-700 text-stone-400 hover:border-orange-500 hover:text-orange-400'
                                }`}
                        >
                            {s} {s !== 'semua' && stats[s] > 0 && `(${stats[s]})`}
                        </button>
                    ))}
                </div>

                {/* Refresh */}
                <button
                    onClick={fetchBookings}
                    className="px-4 py-2 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                    ↻ Refresh
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-stone-900 border border-stone-800 overflow-hidden">
                {loading ? (
                    <div className="text-center text-stone-500 py-16 font-mono text-sm">Memuat data pesanan...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-stone-500 py-16 font-mono text-sm">
                        {search || statusFilter !== 'semua' ? 'Tidak ada hasil yang cocok.' : 'Belum ada pesanan masuk.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-800 text-stone-500 text-xs font-mono uppercase tracking-wider">
                                    <th className="text-left px-4 py-3">Pemesan</th>
                                    <th className="text-left px-4 py-3">Peralatan</th>
                                    <th className="text-left px-4 py-3 hidden md:table-cell">Tanggal</th>
                                    <th className="text-left px-4 py-3 hidden lg:table-cell">Pengambilan</th>
                                    <th className="text-left px-4 py-3">Total</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-left px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(b => (
                                    <tr key={b.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">

                                        {/* Pemesan */}
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-white">{b.customer_name}</div>
                                            <button
                                                onClick={() => openWA(b.customer_phone, b.customer_name, b.product_name)}
                                                className="text-green-500 hover:text-green-400 text-xs transition-colors flex items-center gap-1 mt-0.5"
                                            >
                                                💬 {b.customer_phone}
                                            </button>
                                            <div className="text-stone-600 text-xs mt-0.5">{formatDate(b.created_at)}</div>
                                        </td>

                                        {/* Peralatan */}
                                        <td className="px-4 py-3">
                                            <div className="text-white">{b.product_name}</div>
                                            <div className="text-stone-500 text-xs">{b.duration_days} hari</div>
                                            {b.notes && <div className="text-stone-500 text-xs italic mt-0.5">"{b.notes}"</div>}
                                        </td>

                                        {/* Tanggal */}
                                        <td className="px-4 py-3 hidden md:table-cell text-stone-400 text-xs">
                                            <div>📅 {formatDate(b.start_date)}</div>
                                            <div>↩ {formatDate(b.end_date)}</div>
                                        </td>

                                        {/* Pengambilan */}
                                        <td className="px-4 py-3 hidden lg:table-cell text-stone-400 text-xs">
                                            {b.pickup_method}
                                        </td>

                                        {/* Total */}
                                        <td className="px-4 py-3 text-yellow-400 font-mono font-bold">
                                            Rp {(b.total_price || 0).toLocaleString('id-ID')}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-mono uppercase rounded-sm ${STATUS_STYLE[b.status] || ''}`}>
                                                {b.status}
                                            </span>
                                        </td>

                                        {/* Aksi */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1.5">
                                                <select
                                                    value={b.status}
                                                    disabled={updating === b.id}
                                                    onChange={e => updateStatus(b.id, e.target.value)}
                                                    className="bg-stone-800 border border-stone-700 text-white text-xs px-2 py-1 font-mono focus:outline-none focus:border-orange-500 disabled:opacity-50"
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => openWA(b.customer_phone, b.customer_name, b.product_name)}
                                                    className="text-xs font-mono bg-green-800 hover:bg-green-700 text-green-200 px-2 py-1 transition-colors text-left"
                                                >
                                                    💬 WA
                                                </button>
                                                <button
                                                    onClick={() => deleteBooking(b.id)}
                                                    className="text-xs font-mono bg-stone-800 hover:bg-red-900 text-stone-400 hover:text-red-300 px-2 py-1 transition-colors text-left"
                                                >
                                                    🗑 Hapus
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-3 text-xs font-mono text-stone-600">
                Menampilkan {filtered.length} dari {bookings.length} pesanan
            </div>

        </AdminLayout>
    )
}