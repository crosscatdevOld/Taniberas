import { ShoppingBag } from 'lucide-react';
import type { RiceProduct } from '../types.ts';
import { formatRupiah } from '../utils/format.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface ProductCardProps {
  product: RiceProduct;
  onViewDetail: (slug: string) => void;
  onQuickAdd: (product: RiceProduct) => void;
}

export function ProductCard({
  product,
  onViewDetail,
  onQuickAdd,
}: ProductCardProps) {
  const defaultVariant =
    product.variants.find((v) => v.weightKg === 5) || product.variants[0];
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <article className="group bg-white border border-[#E5E0D5] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => onViewDetail(product.slug)}
        className="block relative aspect-[4/3] w-full overflow-hidden bg-[#F2EFE9] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E]"
      >
        <ResilientImage
          src={product.images[0]}
          alt={product.name}
          fallbackTitle={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </button>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 text-xs text-[#546158] mb-1.5">
          <span className="truncate">{product.variety}</span>
          {product.isFeatured && (
            <span className="text-[#1B4D3E] font-semibold whitespace-nowrap shrink-0">
              Produk Unggulan
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onViewDetail(product.slug)}
          className="text-left cursor-pointer"
        >
          <h3 className="text-base font-semibold text-[#18231B] group-hover:text-[#1B4D3E] transition-colors leading-snug">
            {product.name}
          </h3>
        </button>

        <p className="text-xs text-[#546158] mt-1">
          {product.origin} · Kemasan {defaultVariant?.label || '5 kg'}
        </p>

        <p className="text-sm text-[#3F4E44] mt-2.5 line-clamp-2 leading-relaxed flex-1">
          {product.shortDescription}
        </p>

        <div className="mt-4 pt-4 border-t border-[#E5E0D5] flex items-center justify-between gap-3">
          <div>
            <div className="text-base font-bold text-[#18231B] tabular-nums">
              {defaultVariant ? formatRupiah(defaultVariant.price) : '-'}
            </div>
            <div className="text-[11px] text-[#546158] tabular-nums">
              {totalStock > 0 ? `Tersedia ${totalStock} kemasan` : 'Stok habis'}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onViewDetail(product.slug)}
              className="px-3 py-2 text-xs font-semibold text-[#18231B] border border-[#E5E0D5] hover:border-[#1B4D3E] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Detail
            </button>
            <button
              type="button"
              disabled={!defaultVariant || defaultVariant.stock <= 0}
              onClick={() => onQuickAdd(product)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] disabled:opacity-45 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Beli
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
