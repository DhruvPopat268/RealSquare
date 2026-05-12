import { useSearchParams } from "react-router-dom";
import { articles } from "../data/articles";
import { ArticleCard } from "../components/NewsArticles";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";

export default function NewsPage() {
  const [searchParams] = useSearchParams();
  const activeCity = searchParams.get("city") || null;

  const filtered = activeCity
    ? articles.filter((a) => !a.city || a.city.toLowerCase() === activeCity.toLowerCase())
    : articles;

  return (
    <>
      <PageSpinner key={activeCity || "all"} />
      <Navbar />
      <div className="bg-[#f7f8fa] min-h-screen py-10 px-5">
        <div className="max-w-[1200px] mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#1a1a2e]">
              {activeCity ? `News and Articles for ${activeCity}` : "News and Articles"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {activeCity ? `Real estate news and insights for ${activeCity}` : "All real estate news across India"}
            </p>
          </div>

          {/* Articles grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
