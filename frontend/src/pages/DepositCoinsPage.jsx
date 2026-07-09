import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiZap, FiArrowUpCircle, FiArrowDownCircle } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CoinIcon from "../components/CoinIcon";
import PageSpinner from "../components/PageSpinner";

const BASE_URL = import.meta.env.VITE_API_URL;

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const REASON_LABELS = {
  CoinsPurchase: "Coins Purchase",
  PropertyUnlock: "Property Unlock",
  Refund: "Refund",
  Bonus: "Bonus",
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function DepositCoinsPage() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txPage, setTxPage] = useState(1);
  const [txHasMore, setTxHasMore] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [txInitialLoading, setTxInitialLoading] = useState(true);
  const sentinelRef = useRef(null);

  const fetchWalletData = useCallback(async (pageNum) => {
    setTxLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/mixed/coins-transactions?page=${pageNum}&limit=10`, { credentials: "include" });
      const d = await res.json();
      if (d.success) {
        setWallet(d.data.wallet);
        setTransactions((prev) => pageNum === 1 ? d.data.transactions : [...prev, ...d.data.transactions]);
        setTxHasMore(d.data.transactions.length === 10);
      }
    } finally {
      setTxLoading(false);
      setTxInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/mixed/purchase-coins/offers`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setOffers(d.data); })
      .catch(() => {});
    fetchWalletData(1);
  }, [fetchWalletData]);

  useEffect(() => {
    if (!txHasMore || txLoading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTxPage((prev) => {
          const next = prev + 1;
          fetchWalletData(next);
          return next;
        });
      }
    }, { threshold: 1.0 });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [txHasMore, txLoading, fetchWalletData]);

  const coinsCount = selectedOffer ? selectedOffer.coins : Number(coins) || 0;
  const amount = selectedOffer ? selectedOffer.amount : Number(coins) || 0;

  const handleSelectOffer = (offer) => { setSelectedOffer(offer); setCoins(""); setError(""); };
  const handleManualInput = (val) => { setCoins(val.replace(/[^0-9]/g, "")); setSelectedOffer(null); setError(""); };

  const handlePay = async () => {
    setError("");
    if (!selectedOffer && (!coins || amount < 1)) { setError("Enter at least 1 coin"); return; }
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const body = selectedOffer ? { coinsOfferId: selectedOffer._id } : { coins: amount };
      const res = await fetch(`${BASE_URL}/api/mixed/purchase-coins/create-order`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");

      const { orderId, amount: orderAmount, currency, transactionId } = data.data;
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount, currency: currency || "INR", order_id: orderId,
        name: "RealSquare", description: `Purchase ${coinsCount} coins`,
        theme: { color: "#7B2FFF" },
        handler: () => { setLoading(false); setTxPage(1); setTransactions([]); fetchWalletData(1); setCoins(""); setSelectedOffer(null); },
        modal: {
          ondismiss: async () => {
            await fetch(`${BASE_URL}/api/mixed/purchase-coins/cancel/${transactionId}`, {
              method: "PATCH", credentials: "include",
            });
            setLoading(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <PageSpinner />
      <Navbar />
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] px-4 py-10">
        <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <div className="flex items-center gap-3 mb-7">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#1a1a2e]">Coins Wallet</h2>
              <p className="text-sm text-gray-400 mt-0.5">1 coin = ₹1</p>
            </div>
          </div>

          {/* Wallet stats */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f0ff] flex items-center justify-center flex-shrink-0">
                <CoinIcon size={24} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Balance</p>
                <p className="text-lg font-extrabold text-[#7B2FFF] leading-tight">
                  {wallet ? wallet.currentBalance.toLocaleString("en-IN") : "—"}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <FiArrowUpCircle size={22} className="text-green-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Total Credited</p>
                <p className="text-lg font-extrabold text-green-500 leading-tight">
                  +{wallet ? wallet.totalCreditedCoins.toLocaleString("en-IN") : "—"}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <FiArrowDownCircle size={22} className="text-red-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Total Debited</p>
                <p className="text-lg font-extrabold text-red-400 leading-tight">
                  -{wallet ? wallet.totalDebitedCoins.toLocaleString("en-IN") : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left — Transactions */}
            <div className="flex-1 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-5">
              <p className="text-sm font-extrabold text-[#1a1a2e] mb-4">Transaction History</p>
              {txInitialLoading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                  <CoinIcon size={40} />
                  <p className="text-sm mt-3">No transactions yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {transactions.map((tx) => {
                    const isCredit = tx.type === "Credit";
                    return (
                      <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafafa] transition">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? "bg-green-50" : "bg-red-50"}`}>
                          {isCredit
                            ? <FiArrowUpCircle size={18} className="text-green-500" />
                            : <FiArrowDownCircle size={18} className="text-red-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a2e] leading-tight">
                            {REASON_LABELS[tx.reason] || tx.reason}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-extrabold ${isCredit ? "text-green-500" : "text-red-400"}`}>
                            {isCredit ? "+" : "-"}{tx.coins.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={sentinelRef} className="h-1" />
                  {txLoading && !txInitialLoading && (
                    <div className="flex flex-col gap-3 mt-2">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
                    </div>
                  )}
                  {!txHasMore && (
                    <p className="text-center text-xs text-gray-400 py-3">No more transactions</p>
                  )}
                </div>
              )}
            </div>

            {/* Right — Deposit form */}
            <div className="w-full lg:w-[400px] bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-6 flex-shrink-0">
              <p className="text-sm font-extrabold text-[#1a1a2e] mb-5">Deposit Coins</p>

              {/* Offers */}
              {offers.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Special Offers</p>
                  <div className="grid grid-cols-2 gap-2">
                    {offers.map((offer) => {
                      const bonus = offer.coins - offer.amount;
                      const isSelected = selectedOffer?._id === offer._id;
                      return (
                        <button
                          key={offer._id}
                          onClick={() => handleSelectOffer(offer)}
                          className={`rounded-xl border-2 p-3 text-left transition cursor-pointer ${isSelected ? "border-[#7B2FFF] bg-[#f5f0ff]" : "border-gray-200 bg-white hover:border-[#c4a8ff]"}`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <CoinIcon size={16} />
                            <span className="text-sm font-extrabold text-[#1a1a2e]">{offer.coins.toLocaleString("en-IN")}</span>
                            <span className="text-xs text-gray-400">coins</span>
                          </div>
                          <div className="text-xs font-bold text-[#7B2FFF]">₹{offer.amount.toLocaleString("en-IN")}</div>
                          {bonus > 0 && (
                            <div className="mt-1 inline-block bg-amber-100 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              +{bonus} bonus
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Divider */}
              {offers.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or enter manually</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}

              {/* Coin input */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Number of Coins</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition">
                  <span className="px-3 py-3 bg-gray-50 border-r border-gray-200 flex items-center"><CoinIcon size={20} /></span>
                  <input
                    type="number" min="1" value={coins}
                    onChange={(e) => handleManualInput(e.target.value)}
                    placeholder="e.g. 100"
                    className="flex-1 px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Amount summary */}
              <div className="bg-[#f5f0ff] border border-[#e0d4ff] rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Amount to pay</span>
                  {selectedOffer && coinsCount !== amount && (
                    <div className="text-xs text-gray-400 mt-0.5">{coinsCount.toLocaleString("en-IN")} coins</div>
                  )}
                </div>
                <span className="text-base font-extrabold text-[#7B2FFF]">
                  ₹{amount > 0 ? amount.toLocaleString("en-IN") : "0"}
                </span>
              </div>

              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

              <button
                onClick={handlePay}
                disabled={loading || amount < 1}
                className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <FiZap size={15} />
                {loading ? "Processing..." : `Pay ₹${amount > 0 ? amount.toLocaleString("en-IN") : 0}`}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Secured by Razorpay · Coins are non-refundable
              </p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
