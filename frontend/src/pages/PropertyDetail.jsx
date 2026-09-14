import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiMapPin,
  FiHeart,
  FiShare2,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { properties, newlyAddedProperties, rentProperties, commercialProperties, pgProperties, plotProperties } from "../data/properties";
import PageSpinner from "../components/PageSpinner";
import WishlistToast, { useWishlistToast } from "../components/WishlistToast";
import PropertyTypeDetails from "../components/PropertyTypeDetails";

const API = import.meta.env.VITE_API_URL;

// 24-char hex = MongoDB ObjectId
const isMongoId = (id) => /^[a-f\d]{24}$/i.test(id);

// ── Build a display-friendly object from a raw API listing ───────────────────
function adaptApiListing(listing) {
  // title and price come directly from the backend (normalizeListingCard)
  const title = listing.title ?? "Property";
  const price = listing.price ?? "Price on request";

  // Gallery
  const gallery = listing.media?.images?.length ? listing.media.images : [];

  // Location string
  const addr = listing.locality?.address ?? "";
  const city = listing.cityName ?? "";
  const location = [addr, city].filter(Boolean).join(", ");

  return { ...listing, title, price, gallery, location, _isApiListing: true };
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [activeSection, setActiveSection] = useState("Overview");
  const { toast, showToast, setToast } = useWishlistToast();

  // API listing state
  const [apiListing, setApiListing] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleWishlistToggle = () => {
    const newState = !wishlist;
    setWishlist(newState);
    showToast(newState, property?.title);
  };

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
    setApiListing(null);
    setApiError(null);
  }, [id]);

  // Fetch from API if MongoDB ObjectId
  useEffect(() => {
    if (!isMongoId(id)) return;
    setApiLoading(true);
    fetch(`${API}/api/mixed/property-listings/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setApiListing(adaptApiListing(data.data));
        else setApiError(data.message ?? "Property not found");
      })
      .catch(() => setApiError("Failed to load property"))
      .finally(() => setApiLoading(false));
  }, [id]);

  const sections = [
    "Overview",
    "Highlights",
    "Around This Project",
    "About Project",
    "Floor Plans",
    "Amenities",
    "Ratings & Reviews"
  ];

  // ── Resolve property: API listing or static ────────────────────────────────
  const allProperties = [
    ...properties.map((p) => ({ ...p, name: p.title })),
    ...newlyAddedProperties.map((p) => ({ ...p, title: p.name })),
    ...rentProperties.map((p) => ({ ...p, name: p.title })),
    ...commercialProperties.map((p) => ({ ...p, name: p.title })),
    ...pgProperties.map((p) => ({ ...p, name: p.title })),
    ...plotProperties.map((p) => ({ ...p, name: p.title })),
  ];

  const property = isMongoId(id) ? apiListing : allProperties.find((p) => String(p.id) === String(id));

  // Scroll spy
  useEffect(() => {
    const OFFSET = 160;
    const handleScroll = () => {
      const scrollPosition = window.scrollY + OFFSET;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].toLowerCase().replace(/\s+/g, '-'));
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionName) => {
    const element = document.getElementById(sectionName.toLowerCase().replace(/\s+/g, '-'));
    if (element) {
      window.scrollTo({ top: element.offsetTop - 130, behavior: 'smooth' });
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (apiLoading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen">
        <PageSpinner key={id} />
        <div className="max-w-[1280px] mx-auto px-4 py-12 flex flex-col gap-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-[520px] bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if ((!property && !apiLoading) || apiError) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen">
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <p className="text-2xl font-bold text-gray-700">Property not found</p>
          <p className="text-sm text-gray-400">{apiError ?? "The property you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  const gallery = property.gallery?.length > 0 ? property.gallery : [property.image].filter(Boolean);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <PageSpinner key={id} />

      <div className="max-w-[1280px] mx-auto px-4 py-6">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
          <div>
            <button
              onClick={() => navigate("/my-property-listings")}
              className="flex items-center gap-2 text-gray-500 hover:text-[#5E23DC] text-sm font-medium mb-4 transition-colors"
            >
              <FiArrowLeft size={16} /> Back to My Property Listings
            </button>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">
                {property.title}
                {property._isApiListing && property.listingType?.name && (() => {
                  const n = property.listingType.name;
                  const label = n === "Sell" ? "For Sale" : n === "Rent" ? "For Rent" : `For ${n}`;
                  return <span className="text-2xl font-medium text-[#5E23DC]"> ({label})</span>;
                })()}
              </h1>
            </div>
            {!property._isApiListing && (
              <p className="text-purple-700 font-medium mb-2">by {property.developer}</p>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <FiMapPin />
              {property.location}
              {property._isApiListing && property.locality?.latitude && property.locality?.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${property.locality.latitude},${property.locality.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-[#5E23DC] text-sm font-medium hover:underline flex-shrink-0"
                >
                  View on Map →
                </a>
              )}
            </div>
            {property._isApiListing && (
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                {property.listedBy?.name && (
                  <span>Listed by <span className="text-purple-700 font-medium">{property.listedBy.name}</span></span>
                )}
                {property.listedBy?.name && property.createdAt && <span>·</span>}
                {property.createdAt && (
                  <span>{new Date(property.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                )}
              </div>
            )}
          </div>

          <div className="lg:text-right">
            <h2 className="text-4xl font-bold text-black mt-[52px]">{property.price}</h2>
            {!property._isApiListing && property.emiStarts && (
              <p className="text-purple-700 font-medium mt-2">EMI starts at {property.emiStarts}</p>
            )}
          </div>
        </div>

        {/* IMAGE GALLERY */}
        {gallery.length > 0 && (
          <div className="relative mb-6 rounded-2xl overflow-hidden group">
            <img src={gallery[activeImage]} alt="" className="w-full h-[520px] object-cover" />

            {gallery.length > 1 && (
              <button
                onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
              >
                <FiChevronLeft size={20} />
              </button>
            )}
            {gallery.length > 1 && (
              <button
                onClick={() => setActiveImage((activeImage + 1) % gallery.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
              >
                <FiChevronRight size={20} />
              </button>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {activeImage + 1} / {gallery.length}
            </div>
            {gallery.length > 1 && gallery.length <= 10 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {gallery.map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? "bg-white w-4" : "bg-white/50"}`} />
                ))}
              </div>
            )}
            <div className="absolute top-5 right-5 flex gap-3">
              <button className="bg-white shadow-md px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
                <FiShare2 /> SHARE
              </button>
              <button onClick={handleWishlistToggle} className="bg-white shadow-md px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
                <FiHeart className={wishlist ? "text-red-500 fill-red-500" : ""} /> SAVE
              </button>
            </div>
          </div>
        )}

        {/* QUICK INFO */}
        {property._isApiListing ? (
          // ── API listing: purpose / category / type ────────────────────────
          <div className="bg-white rounded-2xl grid grid-cols-3 overflow-hidden shadow-sm mb-8">
            <div className="p-6 border-r">
              <p className="text-gray-500 text-sm mb-1">Purpose</p>
              <h3 className="font-semibold text-lg">{property.listingType?.name ?? "—"}</h3>
            </div>
            <div className="p-6 border-r">
              <p className="text-gray-500 text-sm mb-1">Category</p>
              <h3 className="font-semibold text-lg">{property.category?.name ?? "—"}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-1">Property Type</p>
              <h3 className="font-semibold text-lg">{property.propertyType?.name ?? "—"}</h3>
            </div>
          </div>
        ) : (
          // ── Static listing: original quick-info grid ──────────────────────
          <div className="bg-white rounded-2xl grid grid-cols-2 md:grid-cols-4 overflow-hidden shadow-sm mb-8">
            <div className="p-6 border-r">
              <h3 className="font-semibold text-lg">{property.configurations}</h3>
              <p className="text-gray-500 text-sm mt-1">Configurations</p>
            </div>
            <div className="p-6 border-r">
              <h3 className="font-semibold text-lg">{property.possession}</h3>
              <p className="text-gray-500 text-sm mt-1">Possession Status</p>
            </div>
            <div className="p-6 border-r">
              <h3 className="font-semibold text-lg">{property.avgPrice}</h3>
              <p className="text-gray-500 text-sm mt-1">Avg. Price</p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg">{property.area}</h3>
              <p className="text-gray-500 text-sm mt-1">Sizes</p>
            </div>
          </div>
        )}

        {/* STICKY NAV — only for static listings which have the full sections */}
        {!property._isApiListing && (
          <div className="sticky top-[62px] z-40 bg-white rounded-xl px-4 py-4 flex gap-8 overflow-auto border mb-8 shadow-sm">
            {sections.map((item, index) => (
              <button
                key={index}
                onClick={() => { setActiveSection(item); scrollToSection(item); }}
                className={`whitespace-nowrap font-medium transition-colors ${
                  activeSection === item
                    ? "text-[#5E23DC] border-b-2 border-[#5E23DC] pb-2"
                    : "text-gray-700 hover:text-[#5E23DC]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div>
          <div>
            {property._isApiListing ? (
              // ── API listing: dynamic type-aware detail components ────────
              <div className="flex flex-col gap-6">
                <PropertyTypeDetails listing={property} />

              </div>
            ) : (
              // ── Static listing: full original sections ───────────────────
              <>
                <div id="overview" className="bg-white rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">{property.title} Overview</h2>
                    <button className="text-[#5E23DC] font-medium">Download Brochure</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div><p className="text-gray-500 text-sm mb-2">Project Units</p><h3 className="font-semibold text-lg">{property.projectUnits}</h3></div>
                    <div><p className="text-gray-500 text-sm mb-2">Project Area</p><h3 className="font-semibold text-lg">{property.projectArea}</h3></div>
                    <div><p className="text-gray-500 text-sm mb-2">Launch Date</p><h3 className="font-semibold text-lg">{property.launchDate}</h3></div>
                    <div><p className="text-gray-500 text-sm mb-2">Project Size</p><h3 className="font-semibold text-lg">{property.projectSize}</h3></div>
                    <div><p className="text-gray-500 text-sm mb-2">Configurations</p><h3 className="font-semibold text-lg">{property.configurations}</h3></div>
                    <div><p className="text-gray-500 text-sm mb-2">RERA ID</p><h3 className="font-semibold text-lg">{property.reraId}</h3></div>
                  </div>
                </div>

                <div id="highlights" className="bg-[#E8FFF5] border border-green-200 rounded-2xl p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-5">{property.title} Highlights</h2>
                  <div className="space-y-4">
                    {property.highlights?.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <FiCheck className="text-green-600 mt-1" />
                        <p className="text-gray-700 leading-7">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div id="around-this-project" className="bg-white rounded-2xl p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6">Around This Project</h2>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiMapPin className="text-[#5E23DC]" />
                      <h3 className="font-semibold text-lg">Property Location</h3>
                    </div>
                    <p className="text-gray-600 ml-6">{property.location}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.nearbyPlaces?.map((place, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{place.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{place.name}</p>
                            <p className="text-sm text-gray-500">{place.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#5E23DC]">{place.distance}</p>
                          <p className="text-sm text-gray-500">({place.distanceKm})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="text-[#5E23DC] font-medium mt-4 hover:underline">View more on Maps</button>
                </div>

                <div id="about-project" className="bg-white rounded-2xl p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6">About {property.title}</h2>
                  <p className="text-gray-700 leading-7 mb-4">
                    Residential project, {property.title} in {property.location?.split(',').pop().trim()} is offering units for sale. Possession date is {property.possession}. The property offers {property.configurations} units in the size range of {property.area}.
                  </p>
                  <button className="text-[#5E23DC] font-medium hover:underline">Show More About Project</button>
                </div>

                <div id="floor-plans" className="bg-white rounded-2xl p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6">{property.title} Floor Plans & Pricing</h2>
                  <div className="space-y-5">
                    {property.floorPlans?.map((plan, index) => (
                      <div key={index} className="border rounded-2xl p-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold">{plan.type}</h3>
                            <p className="text-[#5E23DC] font-medium mt-2">{plan.price}</p>
                          </div>
                          <button className="border border-[#5E23DC] text-[#5E23DC] px-5 py-2 rounded-xl font-medium">View Floor Plan</button>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-5">
                          {plan.sizes.map((size, idx) => (
                            <span key={idx} className="bg-gray-100 px-4 py-2 rounded-full text-sm">{size}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div id="amenities" className="bg-white rounded-2xl p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-8">{property.title} Top Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {property.amenities?.map((amenity, index) => (
                      <div key={index} className="flex flex-col items-center text-center">
                        <div className="text-4xl mb-3">{amenity.icon}</div>
                        <p className="font-medium text-sm">{amenity.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div id="ratings-&-reviews" className="bg-white rounded-2xl p-6">
                  <h2 className="text-2xl font-bold mb-8">Ratings & Reviews</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
                    {Object.entries(property.ratings || {}).filter(([key]) => key !== "overall")
                      .map(([key, value], idx) => (
                        <div key={idx} className="text-center">
                          <div className="w-20 h-20 border-4 border-green-400 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">{value}/5</div>
                          <p className="capitalize text-sm text-gray-600">{key}</p>
                        </div>
                      ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border rounded-2xl p-5">
                      <h3 className="font-bold text-lg mb-5 text-green-600">Good things here</h3>
                      <div className="space-y-3">
                        {property.goodThings?.map((item, idx) => <div key={idx} className="bg-gray-100 px-4 py-3 rounded-xl">{item}</div>)}
                      </div>
                    </div>
                    <div className="border rounded-2xl p-5">
                      <h3 className="font-bold text-lg mb-5 text-red-500">Things that need improvement</h3>
                      <div className="space-y-3">
                        {property.improvements?.map((item, idx) => <div key={idx} className="bg-gray-100 px-4 py-3 rounded-xl">{item}</div>)}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <WishlistToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
