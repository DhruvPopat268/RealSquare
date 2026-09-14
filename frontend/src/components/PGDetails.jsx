import { FiCheck, FiHome, FiUsers, FiCalendar, FiClock } from "react-icons/fi";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  });
}

export default function PGDetails({ data, listing }) {
  if (!data) return null;

  const rentInfo = listing.rentInfo;
  
  return (
    <div className="flex flex-col gap-6">
      
      {/* PG Overview */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FiHome className="text-[#5E23DC]" />
          PG Overview
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.pgName && (
            <div>
              <p className="text-gray-500 text-sm mb-1">PG Name</p>
              <p className="font-semibold text-lg">{data.pgName}</p>
            </div>
          )}
          
          {data.totalBedsAvailable && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Beds</p>
              <p className="font-semibold text-lg">{data.totalBedsAvailable} beds</p>
            </div>
          )}
          
          {data.pgFor && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Accommodation For</p>
              <p className="font-semibold text-lg">{data.pgFor}</p>
            </div>
          )}
          
          {data.bestSuitedFor?.length > 0 && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Best Suited For</p>
              <p className="font-semibold text-lg">{data.bestSuitedFor.join(", ")}</p>
            </div>
          )}
          
          {data.noticePeriod && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Notice Period</p>
              <p className="font-semibold text-lg">{data.noticePeriod} days</p>
            </div>
          )}
          
          {data.lockInPeriod && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Lock-in Period</p>
              <p className="font-semibold text-lg">{data.lockInPeriod} days</p>
            </div>
          )}
          
          {rentInfo?.availableFrom && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Available From</p>
              <p className="font-semibold text-lg">{formatDate(rentInfo.availableFrom)}</p>
            </div>
          )}
          
          {data.mealsAvailable && data.meals?.length > 0 && (
            <div>
              <p className="text-gray-500 text-sm mb-1">Meals Included</p>
              <p className="font-semibold text-lg">{data.meals.join(", ")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Room Types & Pricing */}
      {data.rooms?.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FiUsers className="text-[#5E23DC]" />
            Room Options & Pricing
          </h2>
          
          <div className="space-y-4">
            {data.rooms.map((room, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-[#5E23DC] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{room.roomType}</h3>
                    <p className="text-sm text-gray-500">
                      {room.bedsAvailable} bed{room.bedsAvailable > 1 ? 's' : ''} available
                    </p>
                  </div>
                  <div className="text-right">
                    {room.rent && (
                      <p className="text-xl font-bold text-[#5E23DC]">
                        ₹{room.rent.toLocaleString("en-IN")}/month
                      </p>
                    )}
                    {room.securityDeposit && (
                      <p className="text-sm text-gray-500">
                        Security: ₹{room.securityDeposit.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meals & Services */}
      {(data.mealsAvailable || data.meals?.length > 0) && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Food & Meals</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 rounded-xl">
              <h3 className="font-semibold text-orange-800 mb-2">Meal Service</h3>
              <p className="text-orange-700">
                {data.mealsAvailable ? "Available" : "Not Available"}
              </p>
            </div>
            
            {data.meals?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-2">Available Meals</h3>
                <div className="flex flex-wrap gap-2">
                  {data.meals.map((meal, index) => (
                    <span key={index} className="px-2 py-1 bg-green-200 text-green-800 text-sm rounded-full">
                      {meal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Common Areas */}
      {data.commonAreas?.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Common Areas & Facilities</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.commonAreas.map((area, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <FiCheck size={16} className="text-purple-600 flex-shrink-0" />
                <p className="font-medium text-gray-900">{area}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules & Policies */}
      {(data.noticePeriod || data.lockInPeriod || data.bestSuitedFor?.length > 0) && (
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FiClock className="text-[#5E23DC]" />
            Rules & Policies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.noticePeriod && (
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
                <FiCalendar className="text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Notice Period</p>
                  <p className="text-gray-600 text-sm">{data.noticePeriod} days advance notice required</p>
                </div>
              </div>
            )}
            
            {data.lockInPeriod && (
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
                <FiClock className="text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Lock-in Period</p>
                  <p className="text-gray-600 text-sm">Minimum {data.lockInPeriod} days stay required</p>
                </div>
              </div>
            )}
            
            {data.bestSuitedFor?.length > 0 && (
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
                <FiUsers className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Preferred Tenants</p>
                  <p className="text-gray-600 text-sm">Best suited for {data.bestSuitedFor.join(" and ")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}