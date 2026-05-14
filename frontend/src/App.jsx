import { useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import TopPicks from "./components/TopPicks";
import HighDemandProjects from "./components/HighDemandProjects";
import PropertyListings from "./components/PropertyListings";
import RecommendedSellers from "./components/RecommendedSellers";
import NewlyAdded from "./components/NewlyAdded";
import PropertyOwnerCTA from "./components/PropertyOwnerCTA";
import ExploreMoreSections from "./components/ExploreMoreSections";
import ResearchInsights from "./components/ResearchInsights";
import NewsArticles from "./components/NewsArticles";
import Footer from "./components/Footer";
import PropertyDetail from "./pages/PropertyDetail";
import BuyersPage from "./pages/BuyersPage";
import DeveloperProjects from "./pages/DeveloperProjects";
import PropertyListPage from "./pages/PropertyListPage";
import PriceTrends from "./pages/PriceTrends";
import NewsPage from "./pages/NewsPage";
import PageSpinner from "./components/PageSpinner";
import "./App.css";

function HomePage({ activeTab, setActiveTab, searchQuery, setSearchQuery, handleSearch, listingsRef }) {
  return (
    <>
      <PageSpinner />
      <Navbar />
      <Hero activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
      <StatsBar />
      <TopPicks />
      <HighDemandProjects />
      <PropertyListings activeTab={activeTab} searchQuery={searchQuery} listingsRef={listingsRef} />
      <ExploreMoreSections />
      <RecommendedSellers activeTab={activeTab} />
      <NewlyAdded searchQuery={searchQuery} activeTab={activeTab} />
      <PropertyOwnerCTA activeTab={activeTab} />
      <ResearchInsights />
      <NewsArticles searchQuery={searchQuery} />
      <Footer />
    </>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("BUY");
  const [searchQuery, setSearchQuery] = useState("");
  const listingsRef = useRef(null);

  const handleSearch = () => {
    setTimeout(() => {
      listingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <Routes>
      <Route path="/" element={
        <HomePage
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          listingsRef={listingsRef}
        />
      } />
      <Route path="/property/:id" element={<PropertyDetail />} />
      <Route path="/buy" element={<BuyersPage />} />
      <Route path="/listings" element={<PropertyListPage />} />
      <Route path="/developer/:developerId" element={<DeveloperProjects />} />
      <Route path="/price-trends/:city" element={<PriceTrends />} />
      <Route path="/price-trends" element={<PriceTrends />} />
      <Route path="/news" element={<NewsPage />} />
    </Routes>
  );
}

export default App;
