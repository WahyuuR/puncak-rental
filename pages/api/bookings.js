/**
 * pages/api/bookings.js
 *
 * Endpoint  : /api/bookings
 * Methods   : GET  — ambil semua/filter pesanan
 *             POST — buat pesanan baru
 *             PATCH — update status pesanan
 *             DELETE — hapus pesanan
 */

import { createClient } from '@supabase/supabase-js'

// Gunakan Service Role Key untuk operasi server-side (tidak exposed ke client)
// Tambahkan SUPABASE_SERVICE_ROLE_KEY di .env.local
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
    // CORS headers (opsional, untuk akses dari domain lain)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    try {
        switch (req.method) {

            // ────────────────────────────────────────────────
            // GET /api/bookings
            // Query params:
            //   ?status=pending|confirmed|returned|cancelled
            //   ?limit=20
            //   ?page=1
            // ────────────────────────────────────────────────
            case 'GET': {
                const { status, limit = 50, page = 1 } = req.query
                const offset = (parseInt(page) - 1) * parseInt(limit)

                let query = supabase
                    .from('bookings')
                    .select('*, products(name, emoji, category)', { count: 'exact' })
                    .order('created_at', { ascending: false })
                    .range(offset, offset + parseInt(limit) - 1)

                if (status && status !== 'semua') {
                    query = query.eq('status', status)
                }

                const { data, error, count } = await query

                if (error) throw error

                return res.status(200).json({
                    success: true,
                    data,
                    meta: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        pages: Math.ceil(count / parseInt(limit)),
                    }
                })
            }

            // ────────────────────────────────────────────────
            // POST /api/bookings
            // Body: { customer_name, customer_phone, product_id,
            //         product_name, start_date, end_date,
            //         pickup_method, notes }
            // ────────────────────────────────────────────────
            case 'POST': {
                const {
                    customer_name,
                    customer_phone,
                    product_id,
                    product_name,
                    start_date,
                    end_date,
                    pickup_method = 'Ambil di toko (gratis)',
                    notes = '',
                } = req.body

                // Validasi wajib
                if (!customer_name || !customer_phone || !product_id || !start_date || !end_date) {
                    return res.status(400).json({
                        success: false,
                        error: 'Field wajib: customer_name, customer_phone, product_id, start_date, end_date'
                    })
                }

                // Hitung durasi & harga
                const start = new Date(start_date)
                const end = new Date(end_date)
                const duration_days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))

                // Ambil harga produk
                const { data: product, error: prodError } = await supabase
                    .from('products')
                    .select('price_per_day, stock, is_active')
                    .eq('id', product_id)
                    .single()

                if (prodError || !product) {
                    return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' })
                }

                if (!product.is_active || product.stock < 1) {
                    return res.status(409).json({ success: false, error: 'Produk tidak tersedia atau stok habis' })
                }

                const total_price = duration_days * product.price_per_day

                // Insert booking
                const { data: booking, error: bookErr } = await supabase
                    .from('bookings')
                    .insert({
                        customer_name,
                        customer_phone,
                        product_id,
                        product_name,
                        start_date,
                        end_date,
                        duration_days,
                        pickup_method,
                        notes,
                        total_price,
                        status: 'pending',
                    })
                    .select()
                    .single()

                if (bookErr) throw bookErr

                // Generate WA link untuk response
                const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || '6281234567890'
                const waMessage = buildWAMessage({
                    customer_name,
                    customer_phone,
                    product_name,
                    duration_days,
                    start_date,
                    end_date,
                    total_price,
                    pickup_method,
                    notes,
                })
                const wa_link = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`

                return res.status(201).json({
                    success: true,
                    data: booking,
                    wa_link,
                    message: 'Pesanan berhasil dibuat'
                })
            }

            // ────────────────────────────────────────────────
            // PATCH /api/bookings
            // Body: { id, status }
            // ────────────────────────────────────────────────
            case 'PATCH': {
                const { id, status } = req.body
                const VALID_STATUS = ['pending', 'confirmed', 'returned', 'cancelled']

                if (!id || !status) {
                    return res.status(400).json({ success: false, error: 'id dan status wajib diisi' })
                }

                if (!VALID_STATUS.includes(status)) {
                    return res.status(400).json({ success: false, error: `Status tidak valid. Pilihan: ${VALID_STATUS.join(', ')}` })
                }

                const { data, error } = await supabase
                    .from('bookings')
                    .update({ status })
                    .eq('id', id)
                    .select()
                    .single()

                if (error) throw error

                return res.status(200).json({ success: true, data, message: `Status diubah ke ${status}` })
            }

            // ────────────────────────────────────────────────
            // DELETE /api/bookings?id=xxx
            // ────────────────────────────────────────────────
            case 'DELETE': {
                const { id } = req.query

                if (!id) {
                    return res.status(400).json({ success: false, error: 'id wajib diisi di query param' })
                }

                const { error } = await supabase.from('bookings').delete().eq('id', id)
                if (error) throw error

                return res.status(200).json({ success: true, message: 'Pesanan berhasil dihapus' })
            }

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE'])
                return res.status(405).json({ success: false, error: `Method ${req.method} tidak diizinkan` })
        }

    } catch (err) {
        console.error('[API /bookings]', err)
        return res.status(500).json({ success: false, error: 'Terjadi kesalahan server', detail: err.message })
    }
}

// ── HELPER ──────────────────────────────────────────
function formatDate(d) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
}

function buildWAMessage({ customer_name, customer_phone, product_name, duration_days, start_date, end_date, total_price, pickup_method, notes }) {
    return [
        `🏔 *PUNCAK RENTAL — PEMESANAN BARU*`,
        `━━━━━━━━━━━━━━━━━━━`,
        `👤 *Nama:* ${customer_name}`,
        `📱 *No. WA:* ${customer_phone}`,
        ``,
        `🎒 *Peralatan:* ${product_name}`,
        `⏱ *Durasi:* ${duration_days} hari`,
        `📅 *Ambil:* ${formatDate(start_date)}`,
        `📅 *Kembali:* ${formatDate(end_date)}`,
        `💰 *Total:* Rp ${total_price.toLocaleString('id-ID')}`,
        ``,
        `🚚 *Pengambilan:* ${pickup_method}`,
        notes ? `📝 *Catatan:* ${notes}` : '',
        ``,
        `━━━━━━━━━━━━━━━━━━━`,
        `Mohon konfirmasi ketersediaan. Terima kasih! 🙏`
    ].filter(Boolean).join('\n')
}