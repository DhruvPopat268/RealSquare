import { useState, useRef, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
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
import ChatbotPage from "./pages/ChatbotPage";
import ProjectListingPage from "./pages/ProjectListingPage";
import CreateInquiryPage from "./pages/CreateInquiryPage";
import DepositCoinsPage from "./pages/DepositCoinsPage";
import EditPropertyPage from "./pages/EditPropertyPage";
import EditProjectPage from "./pages/EditProjectPage";
import PaymentTransactionsPage from "./pages/PaymentTransactionsPage";
import PlansPage from "./pages/PlansPage";
import EnquiryPlansPage from "./pages/EnquiryPlansPage";
import MyListingsPage from "./pages/MyListingsPage";
import MyInquiriesPage from "./pages/MyInquiriesPage";
import AssignedInquiriesPage from "./pages/AssignedInquiriesPage";
import PageSpinner from "./components/PageSpinner";
import "./App.css";

const SELL_ID = import.meta.env.VITE_LISTING_TYPE_SELL_ID;

async function loadPurposeTabs() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/mixed/unprotected/active-purposes`,
    { withCredentials: true }
  );
  return data.data
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      id:    p._id,
      label: p._id === SELL_ID ? "BUY" : p.name,
    }));
}

function HomePage({ activeTab, setActiveTab, searchQuery, setSearchQuery, handleSearch, listingsRef, tabs, tabsLoading }) {
  return (
    <>
      <PageSpinner />
      <Navbar />
      <Hero
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        tabs={tabs}
        tabsLoading={tabsLoading}
      />
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
  const [tabs, setTabs]             = useState([]);
  const [tabsLoading, setTabsLoading] = useState(true);
  const [activeTab, setActiveTab]   = useState(null); // set after fetch
  const [searchQuery, setSearchQuery] = useState("");
  const listingsRef = useRef(null);

  useEffect(() => {
    loadPurposeTabs()
      .then((loaded) => {
        setTabs(loaded);
        setActiveTab(loaded[0]?.label ?? "BUY");
      })
      .catch(() => {
        // fallback to hardcoded if API fails
        const fallback = [
          { id: import.meta.env.VITE_LISTING_TYPE_SELL_ID, label: "BUY"         },
          { id: import.meta.env.VITE_LISTING_TYPE_RENT_ID, label: "Rent"        },
          { id: import.meta.env.VITE_LISTING_TYPE_PG_ID,   label: "PG/Co-Living" },
        ];
        setTabs(fallback);
        setActiveTab("BUY");
      })
      .finally(() => setTabsLoading(false));
  }, []);

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
          tabs={tabs}
          tabsLoading={tabsLoading}
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
      <Route path="/chatbot" element={<ChatbotPage />} />
      <Route path="/project-listing" element={<ProjectListingPage />} />
      <Route path="/create-inquiry" element={<CreateInquiryPage />} />
      <Route path="/deposit-coins" element={<DepositCoinsPage />} />
      <Route path="/payment-transactions" element={<PaymentTransactionsPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/enquiry-plans" element={<EnquiryPlansPage />} />
      <Route path="/edit-property/:id" element={<EditPropertyPage />} />
      <Route path="/edit-project/:id" element={<EditProjectPage />} />
      <Route path="/my-property-listings" element={<MyListingsPage />} />
      <Route path="/my-inquiries" element={<MyInquiriesPage />} />
      <Route path="/assigned-inquiries" element={<AssignedInquiriesPage />} />
      <Route path="/edit-property/:id" element={<EditPropertyPage />} />
    </Routes>
  );
}

export default App;
