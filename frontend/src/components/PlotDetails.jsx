import { FiCheck, FiMaximize2, FiMap, FiCalendar } from "react-icons/fi";

function formatArea(area) {
  if (!area?.value) return null;
  return `${area.value} ${area.unit || 'sqft'}`;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  });
}

export default function PlotDetails({ data, listing }) {
  if (!data) return null;

  const sellInfo = listing.sellInfo;
  const commercialDetails = listing.commercialDetails; // For commercial plots
  
  return (
    <div className="flex flex-col gap-6">
      
      {/* Plot Overview */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FiMaximize2 className="text-[#5E23DC]" />
          Plot Overview
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.plotArea && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Plot Area</p>
              <p className="font-semibold text-lg">{formatArea(data.plotArea)}</p>
            </div>
          )}
          
          {(data.length && data.width) && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Dimensions</p>
              <p className="font-semibold text-lg">{data.length} × {data.width} ft</p>
            </div>
          )}
          
          {data.societyName && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Society/Layout</p>
              <p className="font-semibold text-lg">{data.societyName}</p>
            </div>
          )}
          
          {commercialDetails?.ownership && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Ownership</p>
              <p className="font-semibold text-lg">
                {commercialDetails.ownership === "CooperativeSociety" ? "Cooperative Society" :
                 commercialDetails.ownership === "PowerOfAttorney" ? "Power of Attorney" :
                 commercialDetails.ownership}
              </p>
            </div>
          )}
          
          {commercialDetails?.zoneType && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Zone Type</p>
              <p className="font-semibold text-lg">{commercialDetails.zoneType}</p>
            </div>
          )}
          
          {sellInfo?.constructionStatus && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Status</p>
              <p className="font-semibold text-lg">
                {sellInfo.constructionStatus === "ReadyToMove" ? "Ready for Construction" : "Approved for Development"}
              </p>
            </div>
          )}
          
          {sellInfo?.availableFrom && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Available From</p>
              <p className="font-semibold text-lg">{formatDate(sellInfo.availableFrom)}</p>
            </div>
          )}
          
          {commercialDetails?.locationHub && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Location Hub</p>
              <p className="font-semibold text-lg">{commercialDetails.locationHub}</p>
            </div>
          )}
        </div>
      </div>

      {/* Plot Specifications */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FiMap className="text-[#5E23DC]" />
          Plot Specifications
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.plotArea && (
            <div className="p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-green-800 mb-2">Total Area</h3>
              <p className="text-2xl font-bold text-green-600">{formatArea(data.plotArea)}</p>
            </div>
          )}
          
          {(data.length && data.width) && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-2">Plot Dimensions</h3>
              <p className="text-xl font-bold text-blue-600">{data.length} ft × {data.width} ft</p>
              <p className="text-sm text-blue-500 mt-1">
                Perimeter: {2 * (data.length + data.width)} ft
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legal & Compliance */}
      {(commercialDetails?.ownership || commercialDetails?.zoneType) && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Legal & Compliance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commercialDetails.ownership && (
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
                <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Ownership Type</p>
                  <p className="text-gray-600 text-sm">
                    {commercialDetails.ownership === "CooperativeSociety" ? "Cooperative Society" :
                     commercialDetails.ownership === "PowerOfAttorney" ? "Power of Attorney" :
                     commercialDetails.ownership} ownership
                  </p>
                </div>
              </div>
            )}
            
            {commercialDetails.zoneType && (
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
                <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Zoning</p>
                  <p className="text-gray-600 text-sm">{commercialDetails.zoneType} zone approved</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
}