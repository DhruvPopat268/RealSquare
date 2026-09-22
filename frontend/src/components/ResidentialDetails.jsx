import { FiHome } from "react-icons/fi";
import FurnishingsAmenitiesDisplay from "./FurnishingsAmenitiesDisplay";

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

export default function ResidentialDetails({ data, listing }) {
  if (!data) return null;

  const sellInfo = listing.sellInfo;
  const rentInfo = listing.rentInfo;

  return (
    <div className="flex flex-col gap-6">

      {/* Property Overview */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FiHome className="text-[#5E23DC]" />
          Property Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.bhk != null && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Configuration</p>
              <p className="font-semibold text-lg">{data.bhk === 0 ? "1 RK" : `${data.bhk} BHK`}</p>
            </div>
          )}

          {data.builtUpArea && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Built-up Area</p>
              <p className="font-semibold text-lg">{formatArea(data.builtUpArea)}</p>
            </div>
          )}

          {data.societyName && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Society / Building</p>
              <p className="font-semibold text-lg">{data.societyName}</p>
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

          {rentInfo?.securityDeposit && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Security Deposit</p>
              <p className="font-semibold text-lg">
                {rentInfo.securityDeposit.type === "None"     ? "None" :
                 rentInfo.securityDeposit.type === "1Month"   ? "1 Month" :
                 rentInfo.securityDeposit.type === "2Month"   ? "2 Months" :
                 rentInfo.securityDeposit.amount
                   ? `₹${rentInfo.securityDeposit.amount.toLocaleString("en-IN")}`
                   : "As per agreement"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Furnishings & Amenities — card grid display */}
      <FurnishingsAmenitiesDisplay
        furnishType={data.furnishType}
        furnishings={data.furnishings ?? []}
        amenities={data.amenities ?? []}
      />

    </div>
  );
}
