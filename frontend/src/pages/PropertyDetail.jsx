import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiMapPin,
  FiHeart,
  FiShare2,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiUser,
  FiCalendar,
  FiEdit2,
  FiStar,
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

  const [lightbox, setLightbox] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [interested, setInterested] = useState(false);
  const [activeSection, setActiveSection] = useState("Overview");
  const { toast, showToast, setToast } = useWishlistToast();

  // API listing state
  const [apiListing, setApiListing] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Current logged-in user (to show edit button for owner)
  // isListedByCurrentUser is now returned directly from the listing API

  const handleWishlistToggle = () => {
    const newState = !wishlist;
    setWishlist(newState);
    showToast(newState, property?.title);
  };

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
    setLightbox(null);
    setApiListing(null);
    setApiError(null);
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const total = apiListing?.media?.images?.length ?? 0;
    const handleKeyDown = (e) => {
      if (e.key === "Escape")     { setLightbox(null); return; }
      if (e.key === "ArrowLeft")  setLightbox((i) => i !== null && total > 0 ? (i - 1 + total) % total : null);
      if (e.key === "ArrowRight") setLightbox((i) => i !== null && total > 0 ? (i + 1) % total : null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [apiListing]);

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

            {/* Address row */}
            <div className="flex items-start gap-2 text-gray-600 mt-1">
              <FiMapPin className="mt-0.5 flex-shrink-0" />
              <span>{property.location}</span>
            </div>

            {/* View on Map — pill button, only for API listings with coords */}
            {property._isApiListing && property.locality?.latitude && property.locality?.longitude && (
              <a
                href={`https://www.google.com/maps?q=${property.locality.latitude},${property.locality.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full border border-[#5E23DC] text-[#5E23DC] text-sm font-medium hover:bg-[#5E23DC] hover:text-white transition-colors w-fit"
              >
                <FiExternalLink size={13} />
                View on Map
              </a>
            )}
          </div>

          <div className="lg:text-right flex flex-col items-start lg:items-end gap-3">
            <h2 className="text-4xl font-bold text-black mt-[52px]">{property.price}</h2>
            {!property._isApiListing && property.emiStarts && (
              <p className="text-purple-700 font-medium">EMI starts at {property.emiStarts}</p>
            )}
            {/* Listed by + date — right-aligned card strip */}
            {property._isApiListing && (property.listedBy?.name || property.createdAt) && (
              <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                {property.listedBy?.name && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <FiUser size={13} className="text-[#5E23DC]" />
                    </span>
                    <div className="leading-tight text-left">
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide">Listed by</p>
                      <p className="font-semibold text-gray-800 text-sm">{property.listedBy.name}</p>
                    </div>
                  </div>
                )}
                {property.listedBy?.name && property.createdAt && (
                  <div className="w-px h-8 bg-gray-200" />
                )}
                {property.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <FiCalendar size={13} className="text-[#5E23DC]" />
                    </span>
                    <div className="leading-tight text-left">
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide">Listed on</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {new Date(property.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* IMAGE GALLERY — 4 images, 4th blurred with +N overlay */}
        {gallery.length > 0 && (
          <div className="mb-6">
            {/* Share / Save / Edit — above the gallery */}
            <div className="flex justify-end gap-2 mb-5" onClick={(e) => e.stopPropagation()}>
              <button className="bg-white shadow-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium border border-gray-100 hover:shadow-lg transition">
                <FiShare2 size={12} /> SHARE
              </button>
              {property._isApiListing && property.isListedByCurrentUser ? (
                <button
                  onClick={() => navigate(`/edit-property/${property._id}`)}
                  className="bg-[#7B2FFF] shadow-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium text-white hover:bg-[#6320d4] transition"
                >
                  <FiEdit2 size={12} /> EDIT
                </button>
              ) : (
                <>
                  <button onClick={handleWishlistToggle} className="bg-white shadow-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium border border-gray-100 hover:shadow-lg transition">
                    <FiHeart size={12} className={wishlist ? "text-red-500 fill-red-500" : ""} /> FAVOURITE
                  </button>
                  <button onClick={() => setInterested((v) => !v)} className="bg-white shadow-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium border border-gray-100 hover:shadow-lg transition">
                    <FiStar size={12} className={interested ? "text-yellow-500 fill-yellow-500" : ""} /> INTERESTED
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden">
              {gallery.slice(0, 4).map((url, i) => {
                const isLast     = i === 3;
                const remaining  = gallery.length - 4;
                const showOverlay = isLast && remaining > 0;

                return (
                  <div
                    key={i}
                    className="relative cursor-pointer overflow-hidden h-56 rounded-xl"
                    onClick={() => setLightbox(i)}
                  >
                    <img
                      src={url}
                      alt={`Property ${i + 1}`}
                      className={`w-full h-full object-cover transition
                        ${showOverlay ? "blur-sm brightness-50 scale-105" : "hover:brightness-95"}`}
                    />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#7B2FFF] text-white px-2 py-0.5 rounded-full z-10">
                        Cover
                      </span>
                    )}
                    {showOverlay && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <span className="text-white text-3xl font-bold drop-shadow">+{remaining}</span>
                        <span className="text-white/80 text-xs font-medium">more photos</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIGHTBOX */}
        {lightbox !== null && gallery[lightbox] && (
          <div
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            {/* Image */}
            <img
              src={gallery[lightbox]}
              alt=""
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-6 text-white text-2xl font-bold hover:opacity-70"
            >✕</button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {lightbox + 1} / {gallery.length}
            </div>

            {/* Left arrow */}
            {lightbox > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i - 1 + gallery.length) % gallery.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
              >
                <FiChevronLeft size={20} />
              </button>
            )}

            {/* Right arrow */}
            {lightbox < gallery.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + 1) % gallery.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
              >
                <FiChevronRight size={20} />
              </button>
            )}

            {/* Dot indicators */}
            {gallery.length > 1 && gallery.length <= 20 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                    className={`rounded-full transition-all ${i === lightbox ? "w-4 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
                  />
                ))}
              </div>
            )}
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
