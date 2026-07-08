import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiZap } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

export default function DepositCoinsPage() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const amount = Number(coins) || 0;

  const handlePay = async () => {
    setError("");
    if (!coins || amount < 1) { setError("Enter at least 1 coin"); return; }

    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const res = await fetch(`${BASE_URL}/api/mixed/purchase-coins/create-order`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");

      const { orderId, amount: orderAmount, currency, transactionId } = data.data;

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: currency || "INR",
        order_id: orderId,
        name: "RealSquare",
        description: `Purchase ${amount} coins`,
        theme: { color: "#7B2FFF" },
        handler: () => {
          setSuccess(true);
          setLoading(false);
        },
        modal: {
          ondismiss: async () => {
            await fetch(`${BASE_URL}/api/mixed/purchase-coins/cancel/${transactionId}`, {
              method: "PATCH",
              credentials: "include",
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

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] w-full max-w-[420px] p-8 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🪙</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#1a1a2e] mb-2">Coins Added!</h2>
            <p className="text-sm text-gray-400 mb-6">
              <span className="font-bold text-amber-500">{amount} coins</span> have been added to your account.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] text-white py-3 rounded-xl font-semibold text-sm transition"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] w-full max-w-[420px] p-8">

          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#1a1a2e]">Deposit Coins</h2>
              <p className="text-sm text-gray-400 mt-0.5">1 coin = ₹1</p>
            </div>
          </div>

          {/* Coin input */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
              Number of Coins
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B2FFF] transition">
              <span className="px-3 text-lg py-3 bg-gray-50 border-r border-gray-200">🪙</span>
              <input
                type="number"
                min="1"
                value={coins}
                onChange={(e) => { setCoins(e.target.value.replace(/[^0-9]/g, "")); setError(""); }}
                placeholder="e.g. 100"
                className="flex-1 px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* Amount summary */}
          <div className="bg-[#f5f0ff] border border-[#e0d4ff] rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
            <span className="text-sm text-gray-500">Amount to pay</span>
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
      <Footer />
    </>
  );
}
