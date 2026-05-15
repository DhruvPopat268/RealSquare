import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

function calculate(principal, rate, tenure) {
  const p = Number(principal);
  const r = Number(rate) / 12 / 100;
  const n = Number(tenure) * 12;
  if (!p || !r || !n) return null;
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - p;
  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principalPct: Math.round((p / totalPayment) * 100),
  };
}

export default function EMICalculator() {
  const [principal, setPrincipal] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  // manual input drafts
  const [principalInput, setPrincipalInput] = useState("5000000");
  const [rateInput, setRateInput] = useState("8.5");
  const [tenureInput, setTenureInput] = useState("20");

  const [result, setResult] = useState(() => calculate(5000000, 8.5, 20));

  const handleSlider = (field, val) => {
    if (field === "principal") { setPrincipal(val); setPrincipalInput(String(val)); }
    if (field === "rate") { setRate(val); setRateInput(String(val)); }
    if (field === "tenure") { setTenure(val); setTenureInput(String(val)); }
  };

  const handleSubmit = () => {
    const p = Number(principalInput);
    const r = Number(rateInput);
    const t = Number(tenureInput);
    if (!p || !r || !t || p <= 0 || r <= 0 || t <= 0) return;
    setPrincipal(p);
    setRate(r);
    setTenure(t);
    setResult(calculate(p, r, t));
  };

  const pieData = result
    ? [
        { name: "Principal", value: Number(principal) },
        { name: "Interest", value: result.totalInterest },
      ]
    : [];

  return (
    <>
      <PageSpinner />
      <Navbar />

      <div className="bg-[#f7f8fa] min-h-screen py-12 px-6">
        <div className="max-w-[960px] mx-auto">

          <h1 className="text-2xl font-extrabold text-[#1a1a2e] mb-1">EMI Calculator</h1>
          <p className="text-sm text-gray-500 mb-8">Calculate your monthly home loan EMI instantly</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Inputs ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-6">

              {/* Loan Amount */}
              <div>
                <label className="text-sm font-semibold text-[#1a1a2e] block mb-2">Loan Amount</label>
                <input
                  type="number"
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7B2FFF] transition mb-3"
                  placeholder="e.g. 5000000"
                />
                <input type="range" min={100000} max={50000000} step={100000}
                  value={principal}
                  onChange={(e) => handleSlider("principal", Number(e.target.value))}
                  className="w-full accent-[#7B2FFF]" />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>₹1L</span><span>₹5Cr</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="text-sm font-semibold text-[#1a1a2e] block mb-2">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7B2FFF] transition mb-3"
                  placeholder="e.g. 8.5"
                  step="0.1"
                />
                <input type="range" min={5} max={20} step={0.1}
                  value={rate}
                  onChange={(e) => handleSlider("rate", Number(e.target.value))}
                  className="w-full accent-[#7B2FFF]" />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>5%</span><span>20%</span>
                </div>
              </div>

              {/* Tenure */}
              <div>
                <label className="text-sm font-semibold text-[#1a1a2e] block mb-2">Loan Tenure (Years)</label>
                <input
                  type="number"
                  value={tenureInput}
                  onChange={(e) => setTenureInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7B2FFF] transition mb-3"
                  placeholder="e.g. 20"
                />
                <input type="range" min={1} max={30} step={1}
                  value={tenure}
                  onChange={(e) => handleSlider("tenure", Number(e.target.value))}
                  className="w-full accent-[#7B2FFF]" />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>1 Yr</span><span>30 Yrs</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] text-white py-3 rounded-xl font-bold text-sm transition"
              >
                Calculate EMI
              </button>
            </div>

            {/* ── Results ── */}
            <div className="flex flex-col gap-5">

              {result && (
                <>
                  {/* EMI highlight */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <p className="text-sm text-gray-500 mb-1">Monthly EMI</p>
                    <p className="text-4xl font-extrabold text-[#7B2FFF]">{fmt(result.emi)}</p>
                  </div>

                  {/* Breakdown */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-0">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Principal Amount</span>
                      <span className="text-sm font-bold text-[#7B2FFF]">{fmt(principal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Total Interest</span>
                      <span className="text-sm font-bold text-[#f97316]">{fmt(result.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-gray-600">Total Payment</span>
                      <span className="text-sm font-bold text-[#1a1a2e]">{fmt(result.totalPayment)}</span>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-sm font-semibold text-[#1a1a2e] mb-4">Payment Breakdown</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          <Cell fill="#7B2FFF" />
                          <Cell fill="#f97316" />
                        </Pie>
                        <Tooltip formatter={(val) => fmt(val)} />
                        <Legend
                          formatter={(value, entry) => (
                            <span className="text-xs text-gray-600">
                              {value} ({entry.payload.value === Number(principal) ? result.principalPct : 100 - result.principalPct}%)
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
