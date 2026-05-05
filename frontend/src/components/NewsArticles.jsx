import { useRef } from "react";
import "./NewsArticles.css";

const articles = [
  {
    id: 1,
    title: "How are emerging micro markets shaping Mumbai's next set of luxury pincodes?",
    excerpt: "Mumbai's next luxury pin codes are not waiting to be discovered. They are in the process of becoming.",
    author: "Ram Raheja",
    date: "Apr 2026",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&h=280&fit=crop",
  },
  {
    id: 2,
    title: "From connectivity to capital appreciation: How is infrastructure transforming...",
    excerpt: "Luxury housing is no longer confined to a narrow set of traditional addresses. It is spreading across infrastructure-led corridors.",
    author: "Rohan Khatau",
    date: "Apr 2026",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&h=280&fit=crop",
  },
  {
    id: 3,
    title: "Delhi Mumbai Expressway: Route, completion date and status",
    excerpt: "The 1,380-km Delhi-Mumbai Expressway project is expected to be completed in 2027.",
    author: "Harini Balasubramanian",
    date: "Mar 2026",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=500&h=280&fit=crop",
  },
  {
    id: 4,
    title: "Top localities in Pune for first-time homebuyers in 2026",
    excerpt: "Pune's real estate market continues to attract first-time buyers with affordable options in emerging corridors.",
    author: "Priya Mehta",
    date: "Mar 2026",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&h=280&fit=crop",
  },
];

export default function NewsArticles() {
  const scrollRef = useRef(null);

  const scroll = () => {
    scrollRef.current?.scrollBy({ left: 440, behavior: "smooth" });
  };

  return (
    <section className="news-articles">
      <div className="news-header">
        <div>
          <h2>News and Articles</h2>
          <p>Read what's happening in Real Estate</p>
        </div>
        <button className="news-see-all">See all news and articles &gt;</button>
      </div>

      <div className="news-scroll-wrap">
        <div className="news-cards" ref={scrollRef}>
          {articles.map((a) => (
            <div className="news-card" key={a.id}>
              <div className="news-img-wrap">
                <img src={a.image} alt={a.title} />
              </div>
              <div className="news-body">
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                <div className="news-meta">
                  <span>{a.author}</span>
                  <span>{a.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="news-arrow" onClick={scroll} aria-label="Scroll right">›</button>
      </div>
    </section>
  );
}
