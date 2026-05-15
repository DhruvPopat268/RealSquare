import { useState } from "react";
import { FiX, FiCheck, FiCalendar, FiClock } from "react-icons/fi";

const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
];

function getNext7Days() {
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: dayNames[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
      full: d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      value: d.toISOString().split("T")[0],
    });
  }
  return days;
}

export default function ScheduleVisit({ onClose }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState("");

  const days = getNext7Days();

  const handleSubmit = () => {
    if (!selectedDate) { setError("Please select a date."); return; }
    if (!selectedSlot) { setError("Please select a time slot."); return; }
    setError("");
    setStep(2);
  };

  return (
    <div
      className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-5"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[480px] overflow-hidden relative shadow-[0_24px_64px_rgba(0,0,0,0.22)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-3.5 right-3.5 bg-transparent border-none cursor-pointer text-[#888] hover:text-[#111] transition-colors z-10"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>

        {/* Step 1 — Select date & slot */}
        {step === 1 && (
          <>
            <div className="px-6 pt-6">
              <h3 className="text-lg font-extrabold text-[#111] mb-1.5">Schedule a Visit</h3>
              <p className="text-[13px] text-[#888]">Pick a date and time that works for you</p>
            </div>

            <div className="px-6 pt-5 pb-2">
              {/* Date label */}
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#444] uppercase tracking-[0.4px] mb-3">
                <FiCalendar size={14} /> Select Date
              </div>

              {/* Date strip */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {days.map((d) => {
                  const active = selectedDate?.value === d.value;
                  return (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDate(d)}
                      className={`flex flex-col items-center gap-0.5 min-w-[56px] px-2 py-2.5 rounded-xl border-[1.5px] flex-shrink-0 cursor-pointer transition-all
                        ${active
                          ? "border-[#7B2FFF] bg-[#7B2FFF]"
                          : "border-[#e8e8e8] bg-[#fafafa] hover:border-[#7B2FFF] hover:bg-[#f5f0ff]"
                        }`}
                    >
                      <span className={`text-[11px] font-semibold uppercase ${active ? "text-white" : "text-[#888]"}`}>{d.label}</span>
                      <span className={`text-xl font-extrabold leading-none ${active ? "text-white" : "text-[#111]"}`}>{d.date}</span>
                      <span className={`text-[11px] ${active ? "text-white" : "text-[#888]"}`}>{d.month}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time slot label */}
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#444] uppercase tracking-[0.4px] mt-5 mb-3">
                <FiClock size={14} /> Select Time Slot
              </div>

              {/* Slots grid */}
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => {
                  const active = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-lg border-[1.5px] text-[13px] font-medium cursor-pointer transition-all text-center
                        ${active
                          ? "border-[#7B2FFF] bg-[#7B2FFF] text-white"
                          : "border-[#e8e8e8] bg-[#fafafa] text-[#444] hover:border-[#7B2FFF] hover:text-[#7B2FFF] hover:bg-[#f5f0ff]"
                        }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              {error && <p className="text-[12px] text-red-500 font-medium mt-3">{error}</p>}
            </div>

            <button
              className="block w-full py-4 bg-[#7B2FFF] hover:bg-[#5a1fd1] text-white text-[15px] font-bold border-none cursor-pointer transition-colors mt-4"
              onClick={handleSubmit}
            >
              Confirm Visit
            </button>
          </>
        )}

        {/* Step 2 — Confirmed */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center px-7 py-10 gap-2.5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
              <FiCheck size={32} />
            </div>
            <h3 className="text-lg font-extrabold text-[#111]">Your visit has been booked!</h3>
            <p className="text-[14px] text-[#666]">You can visit on</p>
            <div className="text-xl font-extrabold text-[#7B2FFF]">{selectedDate.full}</div>
            <div className="text-[15px] text-[#444]">between <strong>{selectedSlot}</strong></div>
            <p className="text-[12px] text-[#aaa] mt-1">Our team will send you a reminder before your visit.</p>
            <button
              className="mt-2 px-10 py-3 bg-[#7B2FFF] hover:bg-[#5a1fd1] text-white text-[15px] font-bold rounded-lg border-none cursor-pointer transition-colors"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
