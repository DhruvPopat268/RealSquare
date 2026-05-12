import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { articles } from "../data/articles";

function ArticleCard({ article }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col">
      <div className="h-[180px] overflow-hidden flex-shrink-0">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        {article.city && (
          <span className="text-[10px] font-semibold text-[#7B2FFF] bg-[#f0ebff] px-2 py-0.5 rounded-full w-fit mb-2">{article.city}</span>
        )}
        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2 flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
          <span className="font-medium text-gray-600">{article.author}</span>
          <span>{article.date}</span>
        </div>
      </div>
    </div>
  );
}

export { ArticleCard };

export default function NewsArticles({ searchQuery }) {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const activeCity = searchQuery ? searchQuery.split(",")[0].trim() : null;

  const filtered = activeCity
    ? articles.filter((a) => !a.city || a.city.toLowerCase() === activeCity.toLowerCase())
    : articles;

  const displayed = filtered.slice(0, 3);

  const scroll = () => scrollRef.current?.scrollBy({ left: 420, behavior: "smooth" });

  const handleSeeAll = () => {
    if (activeCity) {
      navigate(`/news?city=${encodeURIComponent(activeCity)}`);
    } else {
      navigate("/news");
    }
  };

  return (
    <section className="bg-[#f7f8fa] py-14 px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1a1a2e]">News and Articles</h2>
            <p className="text-sm text-gray-400 mt-1">
              {activeCity ? `News and Articles for ${activeCity}` : "Read what's happening in Real Estate"}
            </p>
          </div>
          <button
            onClick={handleSeeAll}
            className="text-sm font-semibold text-[#7B2FFF] hover:underline whitespace-nowrap"
          >
            See all ›
          </button>
        </div>

        <div className="relative">
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-none pb-2">
            {displayed.map((a) => (
              <div key={a.id} className="min-w-[380px] max-w-[380px] flex-shrink-0">
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
          {displayed.length > 2 && (
            <button
              onClick={scroll}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:shadow-lg text-xl z-10"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
