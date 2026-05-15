import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";
import PlacesAutocomplete from "../components/PlacesAutocomplete";
import { getPricePerSqft } from "../data/propertyPrices";

const fmt = (n) => "\u20b9" + Number(Math.round(n)).toLocaleString("en-IN");

function calculate(form) {
  const base = getPricePerSqft(form.city, form.area);
  let pricePerSqft = base;

  // Age factor
  const age = Number(form.age);
  if (age <= 1) pricePerSqft *= 1.10;
  else if (age <= 5) pricePerSqft *= 1.05;
  else if (age <= 10) pricePerSqft *= 1.0;
  else if (age <= 20) pricePerSqft *= 0.92;
  else pricePerSqft *= 0.82;

  // BHK factor
  const bhkMap = { "1 BHK": 0.95, "2 BHK": 1.0, "3 BHK": 1.05, "4 BHK+": 1.10 };
  pricePerSqft *= bhkMap[form.bhk] || 1;

  // Floor factor
  const floor = Number(form.floor);
  if (floor >= 10) pricePerSqft *= 1.08;
  else if (floor >= 5) pricePerSqft *= 1.04;
  else if (floor === 0) pricePerSqft *= 0.95;

  // Furnishing
  const furnMap = { Unfurnished: 1.0, "Semi-Furnished": 1.10, "Fully Furnished": 1.18 };
  pricePerSqft *= furnMap[form.furnishing] || 1;

  // Amenities
  const amenMap = { Basic: 1.0, Standard: 1.08, Premium: 1.18 };
  pricePerSqft *= amenMap[form.amenities] || 1;

  // Condition
  const condMap = { Poor: 0.88, Good: 1.0, Excellent: 1.08 };
  pricePerSqft *= condMap[form.condition] || 1;

  // Parking
  if (form.parking === "Yes") pricePerSqft *= 1.04;

  // Property type
  const typeMap = { Apartment: 1.0, Villa: 1.20, Plot: 0.85, Commercial: 1.15 };
  pricePerSqft *= typeMap[form.propertyType] || 1;

  const area = Number(form.area);
  const estimated = pricePerSqft * area;
  const low = estimated * 0.92;
  const high = estimated * 1.08;

  const breakdown = [
    { label: "Base (City)", value: base * area },
    { label: "Age Adjustment", value: (pricePerSqft - base) * area * 0.2 },
    { label: "Furnishing & Amenities", value: estimated * 0.15 },
    { label: "Other Factors", value: estimated * 0.05 },
  ];

  return { estimated, low, high, pricePerSqft: Math.round(pricePerSqft), breakdown };
}

const FIELD = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-[#1a1a2e]">{label}</label>
    {children}
  </div>
);

const SELECT = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7B2FFF] transition bg-white"
  >
    {options.map((o) => <option key={o}>{o}</option>)}
  </select>
);

const INPUT = ({ value, onChange, placeholder, type = "number" }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7B2FFF] transition"
  />
);

export default function PropertyValueCalculator() {
  const [form, setForm] = useState({
    propertyType: "Apartment",
    city: "",
    area: "",
    builtupArea: "",
    bhk: "2 BHK",
    age: "",
    floor: "",
    furnishing: "Semi-Furnished",
    amenities: "Standard",
    condition: "Good",
    parking: "Yes",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleCalculate = () => {
    if (!form.city.trim()) { setError("Please enter a city."); return; }
    if (!form.builtupArea || Number(form.builtupArea) <= 0) { setError("Please enter a valid built-up area."); return; }
    if (!form.age || Number(form.age) < 0) { setError("Please enter property age."); return; }
    if (form.floor === "") { setError("Please enter floor number."); return; }
    setError("");
    setResult(calculate({ ...form, area: form.builtupArea }));
  };

  const pieData = result
    ? [
        { name: "Base Value", value: Math.round(result.low) },
        { name: "Premium", value: Math.round(result.estimated - result.low) },
      ]
    : [];

  return (
    <>
      <PageSpinner />
      <Navbar />

      <div className="bg-[#f7f8fa] min-h-screen py-12 px-6">
        <div className="max-w-[1000px] mx-auto">

          <h1 className="text-2xl font-extrabold text-[#1a1a2e] mb-1">Property Value Calculator</h1>
          <p className="text-sm text-gray-500 mb-8">Get an estimated market value of your property instantly</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Form ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-5">

              <div className="grid grid-cols-2 gap-4">
                <FIELD label="Property Type">
                  <SELECT value={form.propertyType} onChange={set("propertyType")}
                    options={["Apartment", "Villa", "Plot", "Commercial"]} />
                </FIELD>
                {["Apartment", "Villa"].includes(form.propertyType) && (
                  <FIELD label="BHK">
                    <SELECT value={form.bhk} onChange={set("bhk")}
                      options={["1 BHK", "2 BHK", "3 BHK", "4 BHK+"]} />
                  </FIELD>
                )}
              </div>

              <FIELD label="City">
                <PlacesAutocomplete
                  value={form.city}
                  onChange={set("city")}
                  placeholder="Search city e.g. Mumbai"
                  types={["(cities)"]}
                />
              </FIELD>

              <FIELD label="Locality / Area">
                <PlacesAutocomplete
                  value={form.area}
                  onChange={set("area")}
                  placeholder="Search locality e.g. Bandra West"
                  types={["geocode"]}
                  cityBias={form.city}
                />
              </FIELD>

              <div className="grid grid-cols-2 gap-4">
                <FIELD label="Built-up Area (sq ft)">
                  <INPUT value={form.builtupArea} onChange={set("builtupArea")} placeholder="e.g. 1200" />
                </FIELD>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FIELD label="Property Age (years)">
                  <INPUT value={form.age} onChange={set("age")} placeholder="e.g. 5" />
                </FIELD>
                <FIELD label="Floor Number">
                  <INPUT value={form.floor} onChange={set("floor")} placeholder="e.g. 3 (0 = Ground)" />
                </FIELD>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FIELD label="Furnishing Status">
                  <SELECT value={form.furnishing} onChange={set("furnishing")}
                    options={["Unfurnished", "Semi-Furnished", "Fully Furnished"]} />
                </FIELD>
                <FIELD label="Amenities">
                  <SELECT value={form.amenities} onChange={set("amenities")}
                    options={["Basic", "Standard", "Premium"]} />
                </FIELD>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FIELD label="Property Condition">
                  <SELECT value={form.condition} onChange={set("condition")}
                    options={["Poor", "Good", "Excellent"]} />
                </FIELD>
                <FIELD label="Parking Available">
                  <SELECT value={form.parking} onChange={set("parking")} options={["Yes", "No"]} />
                </FIELD>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                onClick={handleCalculate}
                className="w-full bg-[#7B2FFF] hover:bg-[#6320d4] text-white py-3 rounded-xl font-bold text-sm transition mt-1"
              >
                Calculate Property Value
              </button>
            </div>

            {/* ── Results ── */}
            <div className="flex flex-col gap-5">
              {result ? (
                <>
                  {/* Estimated value */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <p className="text-sm text-gray-500 mb-1">Estimated Property Value</p>
                    <p className="text-4xl font-extrabold text-[#7B2FFF]">{fmt(result.estimated)}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Range: <strong>{fmt(result.low)}</strong> – <strong>{fmt(result.high)}</strong>
                    </p>
                    <div className="mt-3 inline-block bg-[#f0ebff] text-[#7B2FFF] text-xs font-semibold px-4 py-1.5 rounded-full">
                      ₹{result.pricePerSqft.toLocaleString("en-IN")} / sq ft
                    </div>
                  </div>

                  {/* Factor breakdown */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-sm font-semibold text-[#1a1a2e] mb-4">Value Factors</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "City Base Rate", impact: "Neutral", color: "bg-gray-200" },
                        { label: "Property Age", impact: Number(form.age) <= 5 ? "Positive" : Number(form.age) <= 10 ? "Neutral" : "Negative", color: Number(form.age) <= 5 ? "bg-green-400" : Number(form.age) <= 10 ? "bg-gray-200" : "bg-red-400" },
                        { label: "Furnishing", impact: form.furnishing === "Fully Furnished" ? "Positive" : form.furnishing === "Unfurnished" ? "Neutral" : "Positive", color: form.furnishing === "Unfurnished" ? "bg-gray-200" : "bg-green-400" },
                        { label: "Amenities", impact: form.amenities === "Premium" ? "High Positive" : form.amenities === "Standard" ? "Positive" : "Neutral", color: form.amenities === "Basic" ? "bg-gray-200" : "bg-green-400" },
                        { label: "Condition", impact: form.condition === "Excellent" ? "Positive" : form.condition === "Poor" ? "Negative" : "Neutral", color: form.condition === "Excellent" ? "bg-green-400" : form.condition === "Poor" ? "bg-red-400" : "bg-gray-200" },
                        { label: "Parking", impact: form.parking === "Yes" ? "Positive" : "Neutral", color: form.parking === "Yes" ? "bg-green-400" : "bg-gray-200" },
                      ].map((f) => (
                        <div key={f.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-600">{f.label}</span>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white ${f.color}`}>
                            {f.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pie chart */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-sm font-semibold text-[#1a1a2e] mb-4">Value Breakdown</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                          paddingAngle={3} dataKey="value">
                          <Cell fill="#7B2FFF" />
                          <Cell fill="#22c55e" />
                        </Pie>
                        <Tooltip formatter={(val) => fmt(val)} />
                        <Legend formatter={(value) => <span className="text-xs text-gray-600">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                  <div className="text-5xl mb-4">🏠</div>
                  <p className="text-base font-semibold text-[#1a1a2e] mb-1">Fill in the details</p>
                  <p className="text-sm text-gray-400">Enter your property details on the left and click Calculate to get an estimated value.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
