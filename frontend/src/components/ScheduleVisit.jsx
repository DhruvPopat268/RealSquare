import { useState } from "react";
import { FiX, FiCheck, FiCalendar, FiClock } from "react-icons/fi";
import "./ScheduleVisit.css";

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
  const [step, setStep] = useState(1); // 1=select, 2=confirmed
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
    <div className="sv-overlay" onMouseDown={onClose}>
      <div className="sv-box" onMouseDown={(e) => e.stopPropagation()}>
        <button className="sv-close" onClick={onClose}><FiX size={20} /></button>

        {step === 1 && (
          <>
            <div className="sv-header">
              <h3>Schedule a Visit</h3>
              <p>Pick a date and time that works for you</p>
            </div>

            <div className="sv-body">
              {/* Date selection */}
              <div className="sv-section-label"><FiCalendar size={14} /> Select Date</div>
              <div className="sv-dates">
                {days.map((d) => (
                  <button
                    key={d.value}
                    className={`sv-date-btn ${selectedDate?.value === d.value ? "active" : ""}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    <span className="sv-day">{d.label}</span>
                    <span className="sv-num">{d.date}</span>
                    <span className="sv-month">{d.month}</span>
                  </button>
                ))}
              </div>

              {/* Time slot selection */}
              <div className="sv-section-label" style={{ marginTop: 20 }}><FiClock size={14} /> Select Time Slot</div>
              <div className="sv-slots">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`sv-slot-btn ${selectedSlot === slot ? "active" : ""}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              {error && <p className="sv-error">{error}</p>}
            </div>

            <button className="sv-cta" onClick={handleSubmit}>Confirm Visit</button>
          </>
        )}

        {step === 2 && (
          <div className="sv-confirmed">
            <div className="sv-confirmed-icon"><FiCheck size={32} /></div>
            <h3>Your visit has been booked!</h3>
            <p>You can visit on</p>
            <div className="sv-confirmed-date">{selectedDate.full}</div>
            <div className="sv-confirmed-slot">between <strong>{selectedSlot}</strong></div>
            <p className="sv-confirmed-note">Our team will send you a reminder before your visit.</p>
            <button className="sv-cta sv-cta-done" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
