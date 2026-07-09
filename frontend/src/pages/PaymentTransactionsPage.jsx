import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";

const BASE_URL = import.meta.env.VITE_API_URL;
const LIMIT = 10;

const REASON_LABELS = {
  CoinsPurchase: "Coins Purchase",
  PropertyUnlock: "Property Unlock",
  Refund: "Refund",
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

const STATUS_CONFIG = {
  Success: { color: "text-green-500", bg: "bg-green-50", icon: <FiCheckCircle size={15} className="text-green-500" /> },
  Pending: { color: "text-amber-500", bg: "bg-amber-50", icon: <FiClock size={15} className="text-amber-500" /> },
  Failed:  { color: "text-red-400",   bg: "bg-red-50",   icon: <FiXCircle size={15} className="text-red-400" /> },
};

export default function PaymentTransactionsPage() {
  const navigate = useNavigate();
  const sentinelRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchTransactions = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/mixed/transactions?page=${pageNum}&limit=${LIMIT}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!data.success) return;
      if (pageNum === 1) {
        setStats(data.data.stats);
        setTransactions(data.data.transactions);
      } else {
        setTransactions((prev) => [...prev, ...data.data.transactions]);
      }
      setHasMore(data.data.transactions.length === LIMIT);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(1); }, [fetchTransactions]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPage((prev) => {
          const next = prev + 1;
          fetchTransactions(next);
          return next;
        });
      }
    }, { threshold: 1.0 });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchTransactions]);

  return (
    <>
      <PageSpinner />
      <Navbar />
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] px-4 py-10">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-7">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#1a1a2e]">Payment Transactions</h2>
              <p className="text-sm text-gray-400 mt-0.5">All your payment history</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <FiCheckCircle size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Success</p>
                <p className="text-lg font-extrabold text-green-500 leading-tight">{stats?.Success ?? "—"}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <FiClock size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Pending</p>
                <p className="text-lg font-extrabold text-amber-500 leading-tight">{stats?.Pending ?? "—"}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <FiXCircle size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Failed</p>
                <p className="text-lg font-extrabold text-red-400 leading-tight">{stats?.Failed ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-5">
            <p className="text-sm font-extrabold text-[#1a1a2e] mb-4">Transactions</p>

            {initialLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <FiCheckCircle size={36} />
                <p className="text-sm mt-3">No transactions yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {transactions.map((tx) => {
                  const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.Pending;
                  return (
                    <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafafa] transition">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a2e] leading-tight">
                          {REASON_LABELS[tx.reason] || tx.reason}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                        {tx.failureReason && (
                          <p className="text-[11px] text-red-400 mt-0.5">{tx.failureReason}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-extrabold text-[#1a1a2e]">₹{tx.amount.toLocaleString("en-IN")}</p>
                        <span className={`text-[11px] font-semibold ${cfg.color}`}>{tx.status}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Sentinel */}
                <div ref={sentinelRef} className="h-1" />

                {loading && !initialLoading && (
                  <div className="flex flex-col gap-3 mt-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                )}

                {!hasMore && (
                  <p className="text-center text-xs text-gray-400 py-3">No more transactions</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
