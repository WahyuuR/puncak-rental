export default function ProductCard({ product, onBook }) {
    const isAvailable = product.stock > 0

    return (
        <div className="bg-stone-900 border border-stone-800 overflow-hidden hover:-translate-y-1 transition-transform duration-200">

            {/* Gambar atau fallback emoji */}
            <div className="h-48 relative overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        {product.emoji || '🎒'}
                    </div>
                )}

                {/* Overlay gelap di bawah gambar */}
                {product.image_url && (
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                )}

                {/* Badge status */}
                <span className={`absolute top-3 left-3 text-xs font-mono uppercase tracking-widest px-2 py-1
          ${isAvailable ? 'bg-green-700 text-white' : 'bg-stone-600 text-stone-300'}`}>
                    {isAvailable ? `● Tersedia (${product.stock})` : '● Habis'}
                </span>
            </div>

            <div className="p-4">
                <div className="text-orange-500 text-xs font-mono uppercase tracking-wider mb-1">
                    {product.category}
                </div>
                <h3 className="font-black text-lg leading-tight mb-2">{product.name}</h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-4">{product.description}</p>

                <div className="flex items-end justify-between border-t border-stone-800 pt-3">
                    <div>
                        <div className="text-xs text-stone-500 font-mono uppercase">Mulai dari</div>
                        <div className="text-yellow-400 font-black text-xl">
                            Rp {product.price_per_day.toLocaleString('id-ID')}
                        </div>
                        <div className="text-xs text-stone-500 font-mono">/ {product.unit}</div>
                    </div>
                    <button
                        onClick={onBook}
                        disabled={!isAvailable}
                        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors
              ${isAvailable
                                ? 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer'
                                : 'bg-stone-700 text-stone-500 cursor-not-allowed'
                            }`}
                    >
                        {isAvailable ? 'Sewa' : 'Habis'}
                    </button>
                </div>
            </div>
        </div>
    )
}