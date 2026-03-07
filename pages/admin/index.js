import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function AdminDashboard() {
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 })
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        const { data } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setBookings(data)
            setStats({
                total: data.length,
                pending: data.filter(b => b.status === 'pending').length,
                confirmed: data.filter(b => b.status === 'confirmed').length,
                revenue: data.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total_price || 0), 0)
            })
        }
        setLoading(false)
    }

    async function updateStatus(id, status) {
        await supabase.from('bookings').update({ status }).eq('id', id)
        fetchData()
    }

    const STATUS_COLOR = {
        pending: 'bg-yellow-900 text-yellow-300',
        confirmed: 'bg-green-900 text-green-300',
        returned: 'bg-blue-900 text-blue-300',
        cancelled: 'bg-stone-700 text-stone-400'
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100">
            {/* Admin Nav */}
            <nav className="bg-stone-900 border-b border-stone-800 px-6 py-4 flex justify-between items-center">
                <div className="font-black text-xl tracking-widest">
                    <span className="text-orange-500">P</span>UNCAK <span className="text-sm text-stone-500 font-normal ml-2">ADMIN</span>
                </div>
                <div className="flex gap-4 text-sm">
                    <Link href="/admin" className="text-orange-500">Dashboard</Link>
                    <Link href="/admin/products" className="text-stone-400 hover:text-white">Produk</Link>
                    <Link href="/" className="text-stone-400 hover:text-white">← Website</Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Booking', value: stats.total, color: 'text-white' },
                        { label: 'Menunggu', value: stats.pending, color: 'text-yellow-400' },
                        { label: 'Dikonfirmasi', value: stats.confirmed, color: 'text-green-400' },
                        { label: 'Total Pendapatan', value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, color: 'text-yellow-400' },
                    ].map(s => (
                        <div key={s.label} className="bg-stone-900 border border-stone-800 p-5">
                            <div className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">{s.label}</div>
                            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Tabel Booking */}
                <div className="bg-stone-900 border border-stone-800">
                    <div className="p-5 border-b border-stone-800 flex justify-between items-center">
                        <h2 className="font-black text-lg uppercase tracking-wider">Pesanan Masuk</h2>
                        <button onClick={fetchData} className="text-xs font-mono text-stone-400 hover:text-white uppercase tracking-wider">
                            ↻ Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center text-stone-500 py-12">Memuat data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-800 text-stone-500 text-xs font-mono uppercase tracking-wider">
                                        <th className="text-left p-4">Pemesan</th>
                                        <th className="text-left p-4">Alat</th>
                                        <th className="text-left p-4">Tanggal</th>
                                        <th className="text-left p-4">Total</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-left p-4">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold">{b.customer_name}</div>
                                                <a href={`https://wa.me/${b.customer_phone.replace(/\D/g, '').replace(/^0/, '62')}`}
                                                    target="_blank" className="text-green-500 text-xs hover:text-green-400">
                                                    💬 {b.customer_phone}
                                                </a>
                                            </td>
                                            <td className="p-4">
                                                <div>{b.product_name}</div>
                                                <div className="text-stone-500 text-xs">{b.duration_days} hari</div>
                                            </td>
                                            <td className="p-4 text-xs text-stone-400">
                                                <div>{b.start_date}</div>
                                                <div>→ {b.end_date}</div>
                                            </td>
                                            <td className="p-4 text-yellow-400 font-mono">
                                                Rp {(b.total_price || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs font-mono uppercase rounded ${STATUS_COLOR[b.status] || ''}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={b.status}
                                                    onChange={e => updateStatus(b.id, e.target.value)}
                                                    className="bg-stone-800 border border-stone-700 text-white text-xs px-2 py-1">
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="returned">Returned</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}