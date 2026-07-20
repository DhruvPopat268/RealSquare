import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiZap } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CoinIcon from "../components/CoinIcon";
import PageSpinner from "../components/PageSpinner";

const BASE_URL = import.meta.env.VITE_API_URL;
const EXPIRY_TABS = ["Weekly", "Monthly", "Yearly"];

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

export default function PlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(undefined); // undefined = loading, null = no plan
  const [activeTab, setActiveTab] = useState("Monthly");
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [purchasing, setPurchasing] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/api/system-users/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const ap = d.success ? (d.data.activePlan ?? null) : null;
        setActivePlan(ap);
        const url = ap !== null
          ? `${BASE_URL}/api/mixed/purchased-plans/active-plans?userWantToUpgrade=true`
          : `${BASE_URL}/api/mixed/purchased-plans/active-plans`;
        return fetch(url, { credentials: "include" });
      })
      .then((r) => r.json())
      .then((d) => { if (d.success) setPlans(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter((p) => {
    if (p.expiryType !== activeTab) return false;
    if (activePlan !== null && p.planType === "Free" && !p.currentPlan) return false;
    return true;
  });

  const handleFree = async (plan) => {
    setPurchasing(`${plan._id}-free`);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/mixed/purchased-plans/purchase`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan._id }),
      });
      const data = await res.json();
      if (res.status === 201) {
        sessionStorage.setItem("openProfile", "1");
        navigate("/");
        return;
      }
      throw new Error(data.message || "Failed to activate plan");
    } catch (err) {
      setError(err.message);
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchaseWithCoins = async (plan) => {
    setPurchasing(`${plan._id}-coins`);
    setError("");
    try {
      const endpoint = activePlan !== null
        ? `${BASE_URL}/api/mixed/purchased-plans/change-plan`
        : `${BASE_URL}/api/mixed/purchased-plans/purchase`;
      const res = await fetch(endpoint, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan._id }),
      });
      const data = await res.json();
      if (res.status === 201) {
        sessionStorage.setItem("openProfile", "1");
        setConfirmPlan(null);
        navigate("/");
        return;
      }
      throw new Error(data.message || "Insufficient coins or failed to purchase");
    } catch (err) {
      setError(err.message);
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchaseOnline = async (plan) => {
    setPurchasing(`${plan._id}-online`);
    setError("");
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const orderEndpoint = activePlan !== null
        ? `${BASE_URL}/api/mixed/purchased-plans/change-plan-order`
        : `${BASE_URL}/api/mixed/purchased-plans/create-order`;
      const res = await fetch(orderEndpoint, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");

      const { orderId, amount, currency, transactionId } = data.data;
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount, currency: currency || "INR", order_id: orderId,
        name: "RealSquare", description: `${plan.name} Plan`,
        theme: { color: "#7B2FFF" },
        handler: () => {
          setPurchasing(null);
          sessionStorage.setItem("openProfile", "1");
          navigate("/");
        },
        modal: {
          ondismiss: async () => {
            await fetch(`${BASE_URL}/api/mixed/purchased-plans/cancel/${transactionId}`, {
              method: "PATCH", credentials: "include",
            });
            setPurchasing(null);
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setPurchasing(null);
    }
  };

  return (
    <>
      <PageSpinner />
      <Navbar />
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa] px-4 py-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#1a1a2e]">{activePlan !== null ? "Change Plan" : "Choose a Plan"}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{activePlan !== null ? "Switch to a different plan" : "Select the plan that fits your needs"}</p>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 mb-4 mt-2">{error}</p>}

          {/* Upgrade notice */}
          {!loading && activePlan !== null && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4 mb-2">
              <p className="text-[11px] font-bold text-red-500 uppercase tracking-wide mb-2">⚠️ Keep in mind</p>
              <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
                <li className="flex items-start gap-2 text-xs text-red-600">
                  <span className="mt-0.5 flex-shrink-0">1.</span>
                  If you change your plan, your current active plan will be completely removed — no benefits, unused listings, or leads will be carried forward.
                </li>
                <li className="flex items-start gap-2 text-xs text-red-600">
                  <span className="mt-0.5 flex-shrink-0">2.</span>
                  You can change your plan using coins from your wallet or via online payment.
                </li>
              </ul>
            </div>
          )}

          {/* Tabs */}
          {!loading && (
            <div className="flex justify-center gap-2 mb-8 mt-6">
              {EXPIRY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border transition cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#7B2FFF] text-white border-[#7B2FFF]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#7B2FFF] hover:text-[#7B2FFF]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Plans grid */}
          {(loading || activePlan === undefined) ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <FiZap size={40} />
              <p className="text-sm mt-3 text-gray-400">No plans available for {activeTab}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filtered.map((plan) => {
                const isFree = plan.planType === "Free";
                const isCurrent = plan.currentPlan === true;
                return (
                  <div key={plan._id} className="relative">
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-[#1a1a2e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                          Current Plan
                        </span>
                      </div>
                    )}
                    <div
                      className={`bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-6 flex flex-col relative overflow-hidden h-full ${
                        isCurrent ? "border-2 border-[#1a1a2e]" : ""
                      }`}
                    >
                    {isFree && (
                      <span className="absolute top-4 right-4 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Free
                      </span>
                    )}

                    <p className="text-base font-extrabold text-[#1a1a2e] mb-1">{plan.name}</p>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">{plan.description}</p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-5">
                      {isFree ? (
                        <span className="text-2xl font-extrabold text-green-500">Free</span>
                      ) : (
                        <>
                          {plan.coins != null && (
                            <div className="flex items-center gap-1">
                              <CoinIcon size={18} />
                              <span className="text-2xl font-extrabold text-[#7B2FFF]">{plan.coins.toLocaleString("en-IN")}</span>
                              <span className="text-xs text-gray-400 self-end mb-1">coins</span>
                            </div>
                          )}
                          {plan.coins != null && plan.amount != null && (
                            <span className="text-xs text-gray-400">or</span>
                          )}
                          {plan.amount != null && (
                            <span className="text-2xl font-extrabold text-[#1a1a2e]">₹{plan.amount.toLocaleString("en-IN")}</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="flex flex-col gap-2 mb-6 flex-1">
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <FiCheck size={13} className="text-[#7B2FFF] flex-shrink-0" />
                        {plan.numberOfPropertiesGiven} propert{plan.numberOfPropertiesGiven === 1 ? "y" : "ies"} listing
                      </li>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <FiCheck size={13} className="text-[#7B2FFF] flex-shrink-0" />
                        {plan.leadsPerDay} leads / day
                      </li>
                      <li className="flex items-center gap-2 text-xs text-gray-600">
                        <FiCheck size={13} className="text-[#7B2FFF] flex-shrink-0" />
                        Valid for 1 {plan.expiryType.replace("ly", "").toLowerCase()}
                      </li>
                    </ul>

                    {isFree ? (
                      !isCurrent && (
                        <button
                          onClick={() => handleFree(plan)}
                          disabled={purchasing === `${plan._id}-free`}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition disabled:opacity-60 bg-green-500 hover:bg-green-600 text-white"
                        >
                          {purchasing === `${plan._id}-free` ? "Activating..." : "Activate Free Plan"}
                        </button>
                      )
                    ) : isCurrent ? null : (
                      <div className="flex flex-col gap-2">
                        {plan.coins != null && (
                          <button
                            onClick={() => setConfirmPlan(plan)}
                            disabled={!!purchasing}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-[#7B2FFF] text-[#7B2FFF] bg-white hover:bg-[#f3eeff] cursor-pointer transition disabled:opacity-60 flex items-center justify-center gap-1.5"
                          >
                            <CoinIcon size={15} />
                            {purchasing === `${plan._id}-coins` ? "Processing..." : "Pay with Coins"}
                          </button>
                        )}
                        {plan.amount != null && (
                          <button
                            onClick={() => handlePurchaseOnline(plan)}
                            disabled={!!purchasing}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition disabled:opacity-60 bg-[#7B2FFF] hover:bg-[#6320d4] text-white flex items-center justify-center gap-1.5"
                          >
                            <FiZap size={14} />
                            {purchasing === `${plan._id}-online` ? "Processing..." : `Pay ₹${plan.amount.toLocaleString("en-IN")} Online`}
                          </button>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Coins purchase confirmation modal */}
      {confirmPlan && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center px-4" onClick={() => setConfirmPlan(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.18)] w-full max-w-[380px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-[#f3eeff] flex items-center justify-center mb-3">
                <CoinIcon size={26} />
              </div>
              <h3 className="text-base font-extrabold text-[#1a1a2e] mb-1">Confirm Purchase</h3>
              <p className="text-sm text-gray-400">
                You are about to purchase the <span className="font-bold text-[#1a1a2e]">{confirmPlan.name}</span> plan using
              </p>
              <p className="text-2xl font-extrabold text-[#7B2FFF] mt-2">{(confirmPlan.coins ?? 0).toLocaleString("en-IN")} coins</p>
              <p className="text-xs text-gray-400 mt-1">This will be deducted from your wallet balance.</p>
            </div>
            {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmPlan(null); setError(""); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 bg-transparent cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurchaseWithCoins(confirmPlan)}
                disabled={!!purchasing}
                className="flex-1 py-2.5 rounded-xl bg-[#7B2FFF] hover:bg-[#6320d4] disabled:opacity-60 text-white text-sm font-semibold cursor-pointer transition border-none flex items-center justify-center gap-1.5"
              >
                <CoinIcon size={14} />
                {purchasing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
