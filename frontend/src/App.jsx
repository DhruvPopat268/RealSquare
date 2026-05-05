import { useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import PropertyListings from "./components/PropertyListings";
import RecommendedSellers from "./components/RecommendedSellers";
import NewlyAdded from "./components/NewlyAdded";
import NewsArticles from "./components/NewsArticles";
import Footer from "./components/Footer";
import PropertyDetail from "./pages/PropertyDetail";
import BuyersPage from "./pages/BuyersPage";
import "./App.css";

function HomePage({ activeTab, setActiveTab, searchQuery, setSearchQuery, handleSearch, listingsRef }) {
  return (
    <>
      <Navbar />
      <Hero activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
      <StatsBar />
      <PropertyListings activeTab={activeTab} searchQuery={searchQuery} listingsRef={listingsRef} />
      <RecommendedSellers activeTab={activeTab} />
      <NewlyAdded searchQuery={searchQuery} />
      <NewsArticles />
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
    </Routes>
  );
}

export default App;
