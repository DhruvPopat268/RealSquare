import { FiCheck, FiInfo, FiMapPin } from "react-icons/fi";

function formatArea(area) {
  if (!area?.value) return null;
  const unitLabels = { sqft: "sq.ft", sqyd: "sq.yd", sqmt: "sq.m" };
  return `${area.value} ${unitLabels[area.unit] ?? area.unit ?? "sqft"}`;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * GenericDetails — fallback for unknown / unsupported property types.
 * Scrapes all known top-level detail fields from the listing and renders
 * whatever is present, so no property ever shows a completely blank detail section.
 */
export default function GenericDetails({ listing }) {
  if (!listing) return null;

  const res  = listing.residentialDetails  ?? {};
  const plot = listing.plotDetails         ?? {};
  const pg   = listing.pgDetails           ?? {};
  const com  = listing.commercialDetails   ?? {};
  const sell = listing.sellInfo            ?? {};
  const rent = listing.rentInfo            ?? {};

  // Build a flat key→value list from whatever fields exist
  const rows = [];

  const push = (label, value) => {
    if (value != null && value !== "" && value !== false) rows.push({ label, value });
  };

  // Residential fields
  if (res.bhk)                 push("Configuration",     `${res.bhk} BHK`);
  if (res.builtUpArea)         push("Built-up Area",     formatArea(res.builtUpArea));
  if (res.furnishType)         push("Furnishing",        res.furnishType);
  if (res.societyName)         push("Society / Project", res.societyName);

  // Plot fields
  if (plot.plotArea)           push("Plot Area",         formatArea(plot.plotArea));
  if (plot.length && plot.width) push("Dimensions",      `${plot.length} × ${plot.width} ft`);

  // Commercial fields
  if (com.builtUpArea)         push("Built-up Area",     formatArea(com.builtUpArea));
  if (com.carpetArea)          push("Carpet Area",       formatArea(com.carpetArea));
  if (com.zoneType)            push("Zone",              com.zoneType);
  if (com.locationHub)         push("Location Hub",      com.locationHub);
  if (com.ownership)           push("Ownership",         com.ownership.replace(/([A-Z])/g, " $1").trim());
  if (com.totalFloors != null) push("Total Floors",      com.totalFloors);
  if (com.yourFloor)           push("Floor",             com.yourFloor);

  // PG fields
  if (pg.pgName)               push("PG Name",           pg.pgName);
  if (pg.pgFor)                push("PG For",            pg.pgFor);
  if (pg.totalBedsAvailable)   push("Total Beds",        pg.totalBedsAvailable);

  // Sell / Rent info
  if (sell.constructionStatus) push("Status", sell.constructionStatus === "ReadyToMove" ? "Ready to Move" : "Under Construction");
  if (sell.ageOfProperty)      push("Age",               `${sell.ageOfProperty} year${sell.ageOfProperty > 1 ? "s" : ""}`);
  if (sell.availableFrom)      push("Available From",    formatDate(sell.availableFrom));
  if (rent.availableFrom)      push("Available From",    formatDate(rent.availableFrom));

  // Deduplicate (keep first occurrence per label)
  const seen = new Set();
  const uniqueRows = rows.filter(({ label }) => {
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });

  // Collect amenities / furnishings if present
  const furnishings = res.furnishings ?? [];
  const amenities   = res.amenities   ?? [];

  // PG rooms
  const rooms = pg.rooms ?? [];

  return (
    <div className="flex flex-col gap-6">

      {/* Basic info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
        <p className="text-sm text-blue-700">
          Detailed breakdown for this property type is coming soon. Below is all available
          information for this listing.
        </p>
      </div>

      {/* Property Details grid */}
      {uniqueRows.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Property Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {uniqueRows.map((row, i) => (
              <div key={i}>
                <p className="text-gray-500 text-sm mb-1">{row.label}</p>
                <p className="font-semibold text-gray-900">{String(row.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Furnishings */}
      {furnishings.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Furnishings</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {furnishings.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <FiCheck size={14} className="text-blue-600 flex-shrink-0" />
                <p className="font-medium text-gray-900">
                  {f.name}{f.count > 1 ? ` ×${f.count}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <FiCheck size={14} className="text-green-600 flex-shrink-0" />
                <p className="font-medium text-gray-900">{a.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PG Rooms */}
      {rooms.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Room Options</h2>
          <div className="space-y-3">
            {rooms.map((room, i) => (
              <div key={i} className="flex items-center justify-between border rounded-xl px-4 py-3">
                <div>
                  <p className="font-semibold text-gray-900">{room.roomType}</p>
                  <p className="text-sm text-gray-500">
                    {room.bedsAvailable} bed{room.bedsAvailable > 1 ? "s" : ""} available
                  </p>
                </div>
                <div className="text-right">
                  {room.rent && (
                    <p className="font-bold text-[#5E23DC]">
                      ₹{room.rent.toLocaleString("en-IN")}/mo
                    </p>
                  )}
                  {room.securityDeposit && (
                    <p className="text-xs text-gray-400">
                      Deposit: ₹{room.securityDeposit.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      {listing.location && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Location</h2>
          <div className="flex items-center gap-2 text-gray-700">
            <FiMapPin className="text-[#5E23DC] flex-shrink-0" />
            <span>{listing.location}</span>
          </div>
        </div>
      )}

    </div>
  );
}
