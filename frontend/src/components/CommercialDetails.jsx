import { FiMaximize2, FiLayers, FiCalendar } from "react-icons/fi";

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

function formatOwnership(val) {
  const map = {
    Freehold: "Freehold",
    Leasehold: "Leasehold",
    CooperativeSociety: "Cooperative Society",
    PowerOfAttorney: "Power of Attorney",
  };
  return map[val] ?? val;
}

function formatZone(val) {
  const map = {
    Industrial: "Industrial",
    Commercial: "Commercial",
    Residential: "Residential",
    SEZ: "Special Economic Zone (SEZ)",
    OpenSpaces: "Open Spaces",
    Agricultural: "Agricultural",
    Others: "Others",
  };
  return map[val] ?? val;
}

export default function CommercialDetails({ data, listing }) {
  if (!data) return null;

  const sellInfo = listing.sellInfo;
  const rentInfo = listing.rentInfo;
  const propTypeName = listing.propertyType?.name ?? "";

  // Determine if this is office type (has seats/cabin fields)
  const isOffice =
    propTypeName.toLowerCase().includes("office") ||
    data.minSeats != null ||
    data.minCabins != null ||
    data.minMeetingRooms != null;

  return (
    <div className="flex flex-col gap-6">

      {/* Property Overview */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FiMaximize2 className="text-[#5E23DC]" />
          Property Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.societyName && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Building / Project</p>
              <p className="font-semibold text-lg">{data.societyName}</p>
            </div>
          )}

          {data.builtUpArea && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Built-up Area</p>
              <p className="font-semibold text-lg">{formatArea(data.builtUpArea)}</p>
            </div>
          )}

          {data.carpetArea && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Carpet Area</p>
              <p className="font-semibold text-lg">{formatArea(data.carpetArea)}</p>
            </div>
          )}

          {data.plotArea && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Plot Area</p>
              <p className="font-semibold text-lg">{formatArea(data.plotArea)}</p>
            </div>
          )}

          {data.ownership && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Ownership</p>
              <p className="font-semibold text-lg">{formatOwnership(data.ownership)}</p>
            </div>
          )}

          {data.zoneType && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Zone Type</p>
              <p className="font-semibold text-lg">{formatZone(data.zoneType)}</p>
            </div>
          )}

          {data.locationHub && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Location Hub</p>
              <p className="font-semibold text-lg">{data.locationHub}</p>
            </div>
          )}

          {sellInfo?.constructionStatus && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Status</p>
              <p className="font-semibold text-lg">
                {sellInfo.constructionStatus === "ReadyToMove" ? "Ready to Move" : "Under Construction"}
              </p>
            </div>
          )}

          {sellInfo?.ageOfProperty && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Age of Property</p>
              <p className="font-semibold text-lg">
                {sellInfo.ageOfProperty} year{sellInfo.ageOfProperty > 1 ? "s" : ""}
              </p>
            </div>
          )}

          {(sellInfo?.availableFrom || rentInfo?.availableFrom) && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Available From</p>
              <p className="font-semibold text-lg">
                {formatDate(sellInfo?.availableFrom ?? rentInfo?.availableFrom)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floor Information */}
      {(data.totalFloors != null || data.yourFloor) && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FiLayers className="text-[#5E23DC]" />
            Floor Information
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.totalFloors != null && (
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Floors</p>
                <p className="font-semibold text-lg">{data.totalFloors}</p>
              </div>
            )}

            {data.yourFloor && (
              <div>
                <p className="text-gray-500 text-sm mb-1">Unit Floor</p>
                <p className="font-semibold text-lg">{data.yourFloor}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Office Specifications — only for office type */}
      {isOffice && (data.minSeats != null || data.minCabins != null || data.minMeetingRooms != null) && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Office Facilities</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {data.minSeats != null && (
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-[#5E23DC]">{data.minSeats}+</p>
                <p className="text-gray-600 text-sm mt-1">Workstations / Seats</p>
              </div>
            )}

            {data.minCabins != null && (
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-blue-600">{data.minCabins}+</p>
                <p className="text-gray-600 text-sm mt-1">Private Cabins</p>
              </div>
            )}

            {data.minMeetingRooms != null && (
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-green-600">{data.minMeetingRooms}+</p>
                <p className="text-gray-600 text-sm mt-1">Meeting Rooms</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
