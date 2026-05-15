import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiMapPin,
  FiHeart,
  FiShare2,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { properties, newlyAddedProperties, rentProperties, commercialProperties, pgProperties, plotProperties } from "../data/properties";
import ListingHeader from "../components/ListingHeader";
import ContactFlow from "../components/ContactFlow";
import PageSpinner from "../components/PageSpinner";
import WishlistToast, { useWishlistToast } from "../components/WishlistToast";

export default function PropertyDetail() {
  const { id } = useParams();

  const [activeImage, setActiveImage] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [activeSection, setActiveSection] = useState("Overview");
  const { toast, showToast, setToast } = useWishlistToast();

  const handleWishlistToggle = () => {
    const newState = !wishlist;
    setWishlist(newState);
    showToast(newState, property?.title);
  };

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
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

  const allProperties = [
    ...properties.map((p) => ({ ...p, name: p.title })),
    ...newlyAddedProperties.map((p) => ({ ...p, title: p.name })),
    ...rentProperties.map((p) => ({ ...p, name: p.title })),
    ...commercialProperties.map((p) => ({ ...p, name: p.title })),
    ...pgProperties.map((p) => ({ ...p, name: p.title })),
    ...plotProperties.map((p) => ({ ...p, name: p.title })),
  ];

  const property = allProperties.find(
    (p) => String(p.id) === String(id)
  );

  // Scroll spy to update active section
  useEffect(() => {
    const OFFSET = 160; // ListingHeader (62px) + sticky nav (~56px) + buffer
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
      const offsetTop = element.offsetTop - 130; // ListingHeader (62px) + sticky nav (~56px) + small gap
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  if (!property) {
    return (
      <div className="p-10 text-center">
        Property not found
      </div>
    );
  }

  const gallery =
    property.gallery?.length > 0
      ? property.gallery
      : [property.image];

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <PageSpinner key={id} />
      <ListingHeader />

      <div className="max-w-[1280px] mx-auto px-4 py-6">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
          {/* LEFT */}
          <div>
            <div className="text-sm text-gray-500 mb-4">
              Home / Hyderabad / Property
            </div>

            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">
                {property.title}
              </h1>
            </div>

            <p className="text-purple-700 font-medium mb-2">
              by {property.developer}
            </p>

            <div className="flex items-center gap-2 text-gray-600">
              <FiMapPin />
              {property.location}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:text-right">
            <h2 className="text-4xl font-bold text-black">
              {property.price}
            </h2>

            <p className="text-purple-700 font-medium mt-2">
              EMI starts at {property.emiStarts}
            </p>

            <p className="text-gray-500 text-sm mb-4">
              Basic Price
            </p>

            <button 
              className="bg-[#5E23DC] hover:bg-[#4d1fc2] text-white px-8 py-4 rounded-xl font-semibold transition"
              onClick={() => setShowContact(true)}
            >
              Contact Developer
            </button>
          </div>
        </div>

        {/* IMAGE GALLERY */}
        <div className="relative mb-6 rounded-2xl overflow-hidden group">
          <img
            src={gallery[activeImage]}
            alt=""
            className="w-full h-[520px] object-cover"
          />

          {/* Left arrow */}
          {gallery.length > 1 && (
            <button
              onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
            >
              <FiChevronLeft size={20} />
            </button>
          )}

          {/* Right arrow */}
          {gallery.length > 1 && (
            <button
              onClick={() => setActiveImage((activeImage + 1) % gallery.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
            >
              <FiChevronRight size={20} />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
            {activeImage + 1} / {gallery.length}
          </div>

          {/* Dot indicators */}
          {gallery.length > 1 && gallery.length <= 10 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeImage ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Top-right actions */}
          <div className="absolute top-5 right-5 flex gap-3">
            <button className="bg-white shadow-md px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
              <FiShare2 />
              SHARE
            </button>
            <button
              onClick={handleWishlistToggle}
              className="bg-white shadow-md px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
            >
              <FiHeart className={wishlist ? "text-red-500 fill-red-500" : ""} />
              SAVE
            </button>
          </div>
        </div>

        {/* QUICK INFO */}
        <div className="bg-white rounded-2xl grid grid-cols-2 md:grid-cols-4 overflow-hidden shadow-sm mb-8">
          <div className="p-6 border-r">
            <h3 className="font-semibold text-lg">
              {property.configurations}
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Configurations
            </p>
          </div>

          <div className="p-6 border-r">
            <h3 className="font-semibold text-lg">
              {property.possession}
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Possession Status
            </p>
          </div>

          <div className="p-6 border-r">
            <h3 className="font-semibold text-lg">
              {property.avgPrice}
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Avg. Price
            </p>
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-lg">
              {property.area}
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Sizes
            </p>
          </div>
        </div>

        {/* STICKY NAV */}
        <div className="sticky top-[62px] z-40 bg-white rounded-xl px-4 py-4 flex gap-8 overflow-auto border mb-8 shadow-sm">
          {sections.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveSection(item);
                scrollToSection(item);
              }}
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

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_360px] gap-6">
          {/* LEFT */}
          <div>
            {/* OVERVIEW */}
            <div id="overview" className="bg-white rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">
                  {property.title} Overview
                </h2>

                <button className="text-[#5E23DC] font-medium">
                  Download Brochure
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-gray-500 text-sm mb-2">
                    Project Units
                  </p>

                  <h3 className="font-semibold text-lg">
                    {property.projectUnits}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">
                    Project Area
                  </p>

                  <h3 className="font-semibold text-lg">
                    {property.projectArea}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">
                    Launch Date
                  </p>

                  <h3 className="font-semibold text-lg">
                    {property.launchDate}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">
                    Project Size
                  </p>

                  <h3 className="font-semibold text-lg">
                    {property.projectSize}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">
                    Configurations
                  </p>

                  <h3 className="font-semibold text-lg">
                    {property.configurations}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">
                    RERA ID
                  </p>

                  <h3 className="font-semibold text-lg">
                    {property.reraId}
                  </h3>
                </div>
              </div>
            </div>

            {/* HIGHLIGHTS */}
            <div id="highlights" className="bg-[#E8FFF5] border border-green-200 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-5">
                {property.title} Highlights
              </h2>

              <div className="space-y-4">
                {property.highlights?.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex gap-3"
                    >
                      <FiCheck className="text-green-600 mt-1" />

                      <p className="text-gray-700 leading-7">
                        {item}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* AROUND THIS PROJECT */}
            <div id="around-this-project" className="bg-white rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">
                Around This Project
              </h2>

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

              <button className="text-[#5E23DC] font-medium mt-4 hover:underline">
                View more on Maps
              </button>
            </div>

            {/* ABOUT PROJECT */}
            <div id="about-project" className="bg-white rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">
                About {property.title}
              </h2>
              <p className="text-gray-700 leading-7 mb-4">
                Residential project, {property.title} in {property.location.split(',').pop().trim()} is offering units for sale. Check out some Apartment that suit your lifestyle and liking. Possession date of {property.title} is {property.possession}. The property offers {property.configurations} units. As per the area plan, units are in the size range of {property.area}.
              </p>
              <button className="text-[#5E23DC] font-medium hover:underline">
                Show More About Project
              </button>
            </div>

            {/* FLOOR PLANS */}
            <div id="floor-plans" className="bg-white rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">
                {property.title} Floor Plans &
                Pricing
              </h2>

              <div className="space-y-5">
                {property.floorPlans?.map(
                  (plan, index) => (
                    <div
                      key={index}
                      className="border rounded-2xl p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {plan.type}
                          </h3>

                          <p className="text-[#5E23DC] font-medium mt-2">
                            {plan.price}
                          </p>
                        </div>

                        <button className="border border-[#5E23DC] text-[#5E23DC] px-5 py-2 rounded-xl font-medium">
                          View Floor Plan
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-5">
                        {plan.sizes.map(
                          (size, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 px-4 py-2 rounded-full text-sm"
                            >
                              {size}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* AMENITIES */}
            <div id="amenities" className="bg-white rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-8">
                {property.title} Top Amenities
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                {property.amenities?.map(
                  (amenity, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="text-4xl mb-3">
                        {amenity.icon}
                      </div>

                      <p className="font-medium text-sm">
                        {amenity.name}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* RATINGS */}
            <div id="ratings-&-reviews" className="bg-white rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-8">
                Ratings & Reviews
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
                {Object.entries(
                  property.ratings || {}
                )
                  .filter(
                    ([key]) =>
                      key !== "overall"
                  )
                  .map(([key, value], idx) => (
                    <div
                      key={idx}
                      className="text-center"
                    >
                      <div className="w-20 h-20 border-4 border-green-400 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                        {value}/5
                      </div>

                      <p className="capitalize text-sm text-gray-600">
                        {key}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-2xl p-5">
                  <h3 className="font-bold text-lg mb-5 text-green-600">
                    Good things here
                  </h3>

                  <div className="space-y-3">
                    {property.goodThings?.map(
                      (item, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-100 px-4 py-3 rounded-xl"
                        >
                          {item}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="border rounded-2xl p-5">
                  <h3 className="font-bold text-lg mb-5 text-red-500">
                    Things that need improvement
                  </h3>

                  <div className="space-y-3">
                    {property.improvements?.map(
                      (item, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-100 px-4 py-3 rounded-xl"
                        >
                          {item}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="sticky top-24 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-sm font-medium mb-5">
                ⚡ Awesome! Most viewed project in
                this area
              </div>

              <h3 className="text-2xl font-bold mb-2">
                Contact Seller
              </h3>

              <p className="font-semibold text-gray-800">
                {property.developer}
              </p>

              <p className="text-sm text-gray-500 mb-6">
                Developer
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full border rounded-xl px-4 py-4 outline-none focus:border-[#5E23DC]"
                />

                <input
                  type="text"
                  placeholder="Phone"
                  className="w-full border rounded-xl px-4 py-4 outline-none focus:border-[#5E23DC]"
                />

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border rounded-xl px-4 py-4 outline-none focus:border-[#5E23DC]"
                />
              </div>

              <label className="flex items-start gap-3 text-sm mt-5">
                <input type="checkbox" />

                <span>
                  I agree to be contacted by
                  Housing and agents via
                  WhatsApp, SMS, phone, email
                  etc
                </span>
              </label>

              <button 
                className="w-full bg-[#5E23DC] hover:bg-[#4d1fc2] text-white py-4 rounded-xl font-semibold mt-6 transition"
                onClick={() => setShowContact(true)}
              >
                Get Contact Details
              </button>

              <div className="mt-6 border-t pt-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    Still deciding?
                  </p>

                  <p className="text-sm text-gray-500">
                    Save this property for
                    later
                  </p>
                </div>

                <button onClick={handleWishlistToggle} className="w-12 h-12 rounded-full border flex items-center justify-center hover:border-red-300 transition">
                  <FiHeart className={wishlist ? "text-red-500 fill-red-500" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showContact && <ContactFlow onClose={() => setShowContact(false)} />}
      <WishlistToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}