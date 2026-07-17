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
import BrokerPage from "./pages/BrokerPage";
import DeveloperPage from "./pages/DeveloperPage";
import PropertyListPage from "./pages/PropertyListPage";
import PriceTrends from "./pages/PriceTrends";
import NewsPage from "./pages/NewsPage";
import OwnersPage from "./pages/OwnersPage";
import EMICalculator from "./pages/EMICalculator";
import PropertyValueCalculator from "./pages/PropertyValueCalculator";
import LoginPage from "./pages/LoginPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import ListPropertyPage from "./pages/ListPropertyPage";
import DepositCoinsPage from "./pages/DepositCoinsPage";
import PaymentTransactionsPage from "./pages/PaymentTransactionsPage";
import PlansPage from "./pages/PlansPage";
import PageSpinner from "./components/PageSpinner";
import "./App.css";

function HomePage({ activeTab, setActiveTab, searchQuery, setSearchQuery, handleSearch, listingsRef }) {
  return (
    <>
      <PageSpinner />
      <Navbar />
      <Hero activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
      <StatsBar />
      <TopPicks searchQuery={searchQuery} />
      <HighDemandProjects searchQuery={searchQuery} />
      <PropertyListings activeTab={activeTab} searchQuery={searchQuery} listingsRef={listingsRef} />
      <ExploreMoreSections />
      <RecommendedSellers activeTab={activeTab} searchQuery={searchQuery} />
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
      <Route path="/broker" element={<BrokerPage />} />
      <Route path="/developer-plans" element={<DeveloperPage />} />
      <Route path="/owners" element={<OwnersPage />} />
      <Route path="/emi-calculator" element={<EMICalculator />} />
      <Route path="/property-value-calculator" element={<PropertyValueCalculator />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/profile" element={<UpdateProfilePage />} />
      <Route path="/list-property" element={<ListPropertyPage />} />
      <Route path="/deposit-coins" element={<DepositCoinsPage />} />
      <Route path="/payment-transactions" element={<PaymentTransactionsPage />} />
      <Route path="/plans" element={<PlansPage />} />
    </Routes>
  );
}

export default App;
