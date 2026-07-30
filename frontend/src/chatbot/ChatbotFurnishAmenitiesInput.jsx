import { useState } from "react";
import { FiX, FiPlus, FiMinus, FiCheck } from "react-icons/fi";

export default function ChatbotFurnishAmenitiesInput({ furnishings, amenities, furnishType, onSubmit }) {
  const showFurnishings = furnishType !== "Unfurnished";

  const [open, setOpen]             = useState(false);
  const [selFurnish, setSelFurnish] = useState({}); // { id: count } — count=1 for no-count, n for hasCount
  const [selAmenity, setSelAmenity] = useState({}); // { id: true }

  const toggleFurnish = (item) => {
    setSelFurnish((prev) => {
      if (prev[item._id]) {
        const next = { ...prev };
        delete next[item._id];
        return next;
      }
      return { ...prev, [item._id]: item.hasCount ? 1 : 1 };
    });
  };

  const changeCount = (id, delta) => {
    setSelFurnish((prev) => {
      const next = (prev[id] ?? 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const toggleAmenity = (item) => {
    setSelAmenity((prev) => {
      if (prev[item._id]) {
        const next = { ...prev };
        delete next[item._id];
        return next;
      }
      return { ...prev, [item._id]: true };
    });
  };

  const handleConfirm = () => {
    const furnishingsPayload = Object.entries(selFurnish).map(([furnishingId, count]) => ({ furnishingId, count }));
    const amenitiesPayload   = Object.keys(selAmenity).map((amenityId) => ({ amenityId, count: 1 }));

    const furnishLines = furnishingsPayload.map(({ furnishingId, count }, i) => {
      const item = furnishings.find((f) => f._id === furnishingId);
      return item?.hasCount ? `${i + 1}). ${item.name} ( ${count} )` : `${i + 1}). ${item?.name}`;
    });
    const amenityLines = amenitiesPayload.map(({ amenityId }, i) => {
      return `${i + 1}). ${amenities.find((a) => a._id === amenityId)?.name}`;
    });

    const parts = [];
    if (furnishLines.length > 0) parts.push(`Furnishings :\n\n${furnishLines.join("\n")}`);
    if (amenityLines.length > 0) parts.push(`Amenities :\n\n${amenityLines.join("\n")}`);
    const displayText = parts.length > 0 ? parts.join("\n\n") : "None selected";

    onSubmit({ furnishings: furnishingsPayload, amenities: amenitiesPayload, displayText });
    setOpen(false);
  };

  const totalSelected = Object.keys(selFurnish).length + Object.keys(selAmenity).length;

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-xl bg-[#7B2FFF] text-white text-sm font-medium hover:bg-[#6320d4] transition border-none cursor-pointer"
      >
        {totalSelected > 0 ? `Edit Selection (${totalSelected} selected)` : showFurnishings ? "Select Furnishings & Amenities" : "Select Amenities"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-[#1a1a2e]">{showFurnishings ? "Select Furnishings & Amenities" : "Select Amenities"}</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent">
                <FiX size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">

              {/* Furnishings */}
              {showFurnishings && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Furnishings</p>
                  <div className="grid grid-cols-6 gap-2">
                    {furnishings.map((item) => {
                      const selected = !!selFurnish[item._id];
                      const count    = selFurnish[item._id] ?? 0;
                      return (
                        <div
                          key={item._id}
                          onClick={() => !item.hasCount && toggleFurnish(item)}
                          className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition
                            ${selected ? "border-[#7B2FFF] bg-[#f5f0ff]" : "border-gray-200 bg-white"}
                            ${!item.hasCount ? "cursor-pointer hover:border-[#7B2FFF]" : "cursor-default"}`}
                        >
                          {selected && !item.hasCount && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#7B2FFF] flex items-center justify-center">
                              <FiCheck size={9} className="text-white" />
                            </span>
                          )}
                          <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain" />
                          <p className="text-xs text-center text-gray-700 font-medium leading-tight">{item.name}</p>
                          {item.hasCount && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); changeCount(item._id, -1); }}
                                className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] cursor-pointer bg-white"
                              >
                                <FiMinus size={9} />
                              </button>
                              <span className="text-xs font-semibold text-[#7B2FFF] w-4 text-center">{count}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); changeCount(item._id, 1); }}
                                className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#7B2FFF] hover:text-[#7B2FFF] cursor-pointer bg-white"
                              >
                                <FiPlus size={9} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Amenities */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Amenities</p>
<div className="grid grid-cols-6 gap-2">
                  {amenities.map((item) => {
                    const selected = !!selAmenity[item._id];
                    return (
                      <div
                        key={item._id}
                        onClick={() => toggleAmenity(item)}
                        className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 cursor-pointer transition
                          ${selected ? "border-[#7B2FFF] bg-[#f5f0ff]" : "border-gray-200 bg-white hover:border-[#7B2FFF]"}`}
                      >
                        {selected && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#7B2FFF] flex items-center justify-center">
                            <FiCheck size={9} className="text-white" />
                          </span>
                        )}
                        <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain" />
                        <p className="text-xs text-center text-gray-700 font-medium leading-tight">{item.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl bg-[#7B2FFF] text-white text-sm font-medium hover:bg-[#6320d4] transition border-none cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
