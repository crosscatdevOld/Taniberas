import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ArticleRecord } from '../types.ts';
import { ResilientImage } from '../components/ResilientImage.tsx';

interface ArticlesPageProps {
  articles: ArticleRecord[];
}

const ARTICLE_CATEGORIES = [
  'Semua',
  'Edukasi Kualitas',
  'Tips Memilih Beras',
  'Pertanian & Pascapanen',
  'Kabar Petani',
] as const;

export function ArticlesPage({ articles }: ArticlesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeArticle, setActiveArticle] = useState<ArticleRecord | null>(null);

  const filtered =
    selectedCategory === 'Semua'
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  if (activeArticle) {
    return (
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
        <button
          type="button"
          onClick={() => setActiveArticle(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#546158] hover:text-[#18231B] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Semua Artikel
        </button>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#546158]">
            <span className="font-semibold text-[#1B4D3E]">{activeArticle.category}</span>
            <span aria-hidden="true">·</span>
            <span>{activeArticle.publishedAt}</span>
            <span aria-hidden="true">·</span>
            <span>{activeArticle.readTime}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#18231B] leading-tight [text-wrap:balance]">
            {activeArticle.title}
          </h1>
          <p className="text-sm text-[#546158]">Ditulis oleh {activeArticle.author}</p>
        </header>

        <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[#E5E0D5]">
          <ResilientImage
            src={activeArticle.coverImage}
            alt={activeArticle.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-5 text-base text-[#2D3B32] leading-[1.75]">
          {activeArticle.content.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </article>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      <div className="space-y-2 max-w-2xl">
        <p className="text-xs font-semibold text-[#1B4D3E]">Jurnal Pertanian & Edukasi Beras</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#18231B] [text-wrap:balance]">
          Wawasan Mutu Pangan & Dunia Pertanian Indonesia
        </h1>
        <p className="text-sm sm:text-base text-[#546158]">
          Pelajari cara mengenali beras murni, teknologi penggilingan segar, hingga kabar terbaru
          dari petani mitra kami.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {ARTICLE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#1B4D3E] text-white'
                : 'bg-[#F2EFE9] text-[#546158] hover:text-[#18231B]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E0D5] rounded-2xl p-12 text-center space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#18231B]">
            Belum ada artikel pada kategori ini
          </h2>
          <button
            type="button"
            onClick={() => setSelectedCategory('Semua')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1B4D3E] rounded-lg cursor-pointer"
          >
            Lihat Semua Artikel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((article) => (
            <article
              key={article.id}
              className="group bg-white border border-[#E5E0D5] rounded-2xl overflow-hidden flex flex-col hover:-translate-y-0.5 transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => setActiveArticle(article)}
                className="aspect-[16/10] w-full overflow-hidden bg-[#F2EFE9] text-left cursor-pointer"
              >
                <ResilientImage
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </button>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#546158]">
                    <span className="font-semibold text-[#1B4D3E]">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveArticle(article)}
                    className="text-left cursor-pointer"
                  >
                    <h2 className="font-display text-xl font-semibold text-[#18231B] group-hover:text-[#1B4D3E] transition-colors leading-snug">
                      {article.title}
                    </h2>
                  </button>

                  <p className="text-sm text-[#546158] leading-relaxed">{article.excerpt}</p>
                </div>

                <div className="pt-3 border-t border-[#E5E0D5] flex items-center justify-between">
                  <span className="text-xs text-[#546158] truncate">{article.author}</span>
                  <button
                    type="button"
                    onClick={() => setActiveArticle(article)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4D3E] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
