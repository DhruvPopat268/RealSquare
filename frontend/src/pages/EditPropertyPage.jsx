import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiCheck, FiAlertCircle } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";
import ImageEditor from "../components/editForms/ImageEditor";
import PropertyTypeEditForm from "../components/editForms/PropertyTypeEditForm";
import LocationAutocomplete from "../components/LocationAutocomplete";
import CityAutocomplete from "../components/CityAutocomplete";
import { Section, Grid, FormField, TextInput, SelectField } from "../components/editForms/EditFormShared";

const API = import.meta.env.VITE_API_URL;

// Plot IDs — used to decide whether to show furnishings section
const RESIDENTIAL_PLOT_IDS = (import.meta.env.VITE_RESIDENTIAL_PROPERTY_TYPE_PLOT_IDS ?? "").split(",").filter(Boolean);
const COMMERCIAL_PLOT_IDS  = (import.meta.env.VITE_COMMERCIAL_PROPERTY_TYPE_PLOT_IDS  ?? "").split(",").filter(Boolean);
const LISTING_TYPE_PG_ID   = import.meta.env.VITE_LISTING_TYPE_PG_ID;
const CATEGORY_RESIDENTIAL_ID = import.meta.env.VITE_CATEGORY_RESIDENTIAL_ID;
const CATEGORY_COMMERCIAL_ID  = import.meta.env.VITE_CATEGORY_COMMERCIAL_ID;

/** Returns true when the listing type/category/propertyType should show furnishings */
function computeShowFurnishings(listing) {
  if (!listing) return false;
  const listingTypeId  = listing.listingType?.id?.toString();
  const categoryId     = listing.category?.id?.toString();
  const propertyTypeId = listing.propertyType?.id?.toString();

  // PG always shows furnishings
  if (listingTypeId === LISTING_TYPE_PG_ID) return true;

  // Residential — hide only for plots
  if (categoryId === CATEGORY_RESIDENTIAL_ID) {
    return !RESIDENTIAL_PLOT_IDS.includes(propertyTypeId);
  }

  // Commercial — hide only for commercial plots
  if (categoryId === CATEGORY_COMMERCIAL_ID) {
    return !COMMERCIAL_PLOT_IDS.includes(propertyTypeId);
  }

  return false;
}

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({});
  const [originalForm, setOriginalForm] = useState({}); // Track original for diff
  const [images, setImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Furnishings & amenities
  const [furnishingsAmenities, setFurnishingsAmenities] = useState({ furnishings: [], amenities: [] });

  // Dropdown options
  const [purposes, setPurposes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Fetch listing on mount
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get(`${API}/api/mixed/property-listings/${id}`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          const data = res.data.data;
          setListing(data);
          setImages(data.media?.images ?? []);
          // Initialize form with existing data
          const initialForm = {
            listingTypeId: data.listingType?.id ?? "",
            categoryId: data.category?.id ?? "",
            propertyTypeId: data.propertyType?.id ?? "",
            cityName: data.cityName ?? "",
            locality: data.locality ?? {},
            residentialDetails: data.residentialDetails ?? {},
            plotDetails: data.plotDetails ?? {},
            commercialDetails: data.commercialDetails ?? {},
            pgDetails: data.pgDetails ?? {},
            sellInfo: data.sellInfo ?? {},
            rentInfo: data.rentInfo ?? {},
          };
          setForm(initialForm);
          setOriginalForm(JSON.parse(JSON.stringify(initialForm))); // Deep copy
        } else {
          setError(res.data.message ?? "Listing not found");
        }
      })
      .catch(() => setError("Failed to load listing"))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch purposes, categories, property types
  useEffect(() => {
    setOptionsLoading(true);
    Promise.all([
      axios.get(`${API}/api/mixed/property-listings/active-purposes`, { withCredentials: true }),
      axios.get(`${API}/api/mixed/property-listings/active-categories`, { withCredentials: true }),
    ])
      .then(([purposesRes, categoriesRes]) => {
        setPurposes(purposesRes.data.data ?? []);
        setCategories(categoriesRes.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => setOptionsLoading(false));
  }, []);

  // Fetch furnishings & amenities once listing is loaded (only when applicable)
  useEffect(() => {
    if (!listing) return;
    if (!computeShowFurnishings(listing)) return;
    axios
      .get(`${API}/api/mixed/property-listings/active-furnishings-amenities`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setFurnishingsAmenities(res.data.data);
      })
      .catch(() => {}); // non-critical — form still works without the list
  }, [listing]);

  // Fetch property types when category changes
  useEffect(() => {
    if (!form.categoryId) {
      setPropertyTypes([]);
      return;
    }
    axios
      .get(`${API}/api/mixed/property-listings/active-property-types?categoryId=${form.categoryId}`, { withCredentials: true })
      .then((res) => setPropertyTypes(res.data.data ?? []))
      .catch(() => setPropertyTypes([]));
  }, [form.categoryId]);

  // Handle form field changes (deep merge)
  const handleFormChange = (path, value) => {
    setForm((prev) => ({ ...prev, [path]: value }));
  };

  // Build payload with only changed fields
  const buildDiffPayload = () => {
    const payload = {
      propertyListingId: id,
    };

    // Helper to deep compare values
    const hasChanged = (newVal, oldVal) => {
      return JSON.stringify(newVal) !== JSON.stringify(oldVal);
    };

    // Helper to filter only changed fields in nested objects
    const getChangedFields = (newObj, oldObj) => {
      if (!newObj || typeof newObj !== "object") return newObj;
      
      const changed = {};
      let hasAnyChange = false;

      for (const key in newObj) {
        if (newObj.hasOwnProperty(key)) {
          const newValue = newObj[key];
          const oldValue = oldObj?.[key];
          
          if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
            changed[key] = newValue;
            hasAnyChange = true;
          }
        }
      }

      return hasAnyChange ? changed : undefined;
    };

    // Check each field for changes
    if (hasChanged(form.cityName, originalForm.cityName)) {
      payload.cityName = form.cityName === "" ? undefined : form.cityName;
    }

    if (hasChanged(form.locality, originalForm.locality)) {
      // For locality, only send if it has changed
      if (Object.keys(form.locality).length > 0 && hasChanged(form.locality, originalForm.locality)) {
        payload.locality = form.locality;
      }
    }

    // Only send detail objects if they have changed fields
    if (hasChanged(form.residentialDetails, originalForm.residentialDetails)) {
      const changed = getChangedFields(form.residentialDetails, originalForm.residentialDetails);
      if (changed && Object.keys(changed).length > 0) {
        payload.residentialDetails = changed;
      }
    }

    if (hasChanged(form.plotDetails, originalForm.plotDetails)) {
      const changed = getChangedFields(form.plotDetails, originalForm.plotDetails);
      if (changed && Object.keys(changed).length > 0) {
        payload.plotDetails = changed;
      }
    }

    if (hasChanged(form.commercialDetails, originalForm.commercialDetails)) {
      const changed = getChangedFields(form.commercialDetails, originalForm.commercialDetails);
      if (changed && Object.keys(changed).length > 0) {
        payload.commercialDetails = changed;
      }
    }

    if (hasChanged(form.pgDetails, originalForm.pgDetails)) {
      const changed = getChangedFields(form.pgDetails, originalForm.pgDetails);
      if (changed && Object.keys(changed).length > 0) {
        payload.pgDetails = changed;
      }
    }

    if (hasChanged(form.sellInfo, originalForm.sellInfo)) {
      const changed = getChangedFields(form.sellInfo, originalForm.sellInfo);
      if (changed && Object.keys(changed).length > 0) {
        payload.sellInfo = changed;
      }
    }

    if (hasChanged(form.rentInfo, originalForm.rentInfo)) {
      const changed = getChangedFields(form.rentInfo, originalForm.rentInfo);
      if (changed && Object.keys(changed).length > 0) {
        payload.rentInfo = changed;
      }
    }

    // NOTE: images intentionally excluded — sent via PATCH /media instead

    console.log("Final PATCH payload (only changed fields):", payload);
    return payload;
  };

  // Handle image reorder/delete
  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  // Handle new file selection
  const handleNewFiles = (files) => {
    setNewFiles((prev) => [...prev, ...files]);
  };

  // Remove queued file
  const handleRemoveNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle reordering of new files (for setting cover image)
  const handleNewFilesReorder = (reorderedFiles) => {
    setNewFiles(reorderedFiles);
  };

  // Submit
  const handleSubmit = async () => {
    if (saving) return;

    // ── Frontend validation ───────────────────────────────────────────────────
    if (!form.cityName?.trim()) {
      setToast({ type: "error", message: "City is required. Please select a city." });
      return;
    }
    if (!form.locality?.address?.trim()) {
      setToast({ type: "error", message: "Address is required. Please select a locality." });
      return;
    }

    // ── Commercial carpet area validation ─────────────────────────────────────
    const com = form.commercialDetails;
    if (com?.builtUpArea?.value && com?.carpetArea?.value) {
      if (Number(com.carpetArea.value) > Number(com.builtUpArea.value)) {
        setToast({ type: "error", message: `Carpet area (${com.carpetArea.value}) cannot be greater than built-up area (${com.builtUpArea.value}).` });
        return;
      }
    }

    setSaving(true);

    try {
      // 1. PATCH property fields (no images here)
      const patchPayload = buildDiffPayload();
      const patchRes = await axios.patch(
        `${API}/api/mixed/property-listings`,
        patchPayload,
        { withCredentials: true }
      );
      if (!patchRes.data.success) {
        throw new Error(patchRes.data.message ?? "Update failed");
      }
      // 2. Only call media API if images actually changed:
      //    - new files were added, OR
      //    - existing images were reordered or deleted
      const originalImages = listing.media?.images ?? [];
      const imagesChanged =
        newFiles.length > 0 ||
        images.length !== originalImages.length ||
        images.some((url, i) => url !== originalImages[i]);

      let finalMessage = patchRes.data.message ?? "Property updated successfully!";

      if (imagesChanged) {
        const formData = new FormData();
        formData.append("propertyListingId", id);
        formData.append("existingImages", JSON.stringify(images));

        if (newFiles.length > 0) {
          formData.append("isPrimary", JSON.stringify(newFiles.map((_, idx) => idx === 0)));
          newFiles.forEach((file) => formData.append("images", file));
        }

        const mediaRes = await axios.patch(
          `${API}/api/mixed/property-listings/media`,
          formData,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
        if (!mediaRes.data.success) {
          throw new Error(mediaRes.data.message ?? "Image update failed");
        }
        // Prefer the media API message if images changed (it mentions review status)
        finalMessage = mediaRes.data.message ?? finalMessage;
      }

      setToast({ type: "success", message: finalMessage });
      setTimeout(() => navigate("/my-property-listings"), 2000);
    } catch (err) {
      const message = err.response?.data?.message ?? err.message ?? "Failed to update property";
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen">
        <PageSpinner />
        <div className="mx-auto px-4 py-12 max-w-4xl flex flex-col gap-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}</div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <FiAlertCircle size={40} className="text-red-500" />
            <p className="text-lg font-bold text-gray-800">{error ?? "Listing not found"}</p>
            <button
              onClick={() => navigate("/my-property-listings")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:text-[#7B2FFF] hover:border-[#7B2FFF] transition"
            >
              <FiArrowLeft size={14} />
              Back to Listings
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen flex flex-col">
      <PageSpinner />
      <Navbar />

      <div className="flex-1 mx-auto px-4 py-8 max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/my-property-listings")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#7B2FFF] transition mb-3"
          >
            <FiArrowLeft size={14} /> Back to My Property Listings
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Edit Property</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-xs text-gray-400">{listing.title}</p>
              {listing.status && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full
                  ${listing.status === "Active" ? "bg-green-100 text-green-700" : 
                    listing.status === "UnderReview" ? "bg-amber-100 text-amber-700" : 
                    listing.status === "Rejected" ? "bg-red-100 text-red-600" : 
                    listing.status === "Sold" ? "bg-blue-100 text-blue-600" : 
                    listing.status === "Rented" ? "bg-blue-100 text-blue-600" : 
                    "bg-gray-100 text-gray-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full
                    ${listing.status === "Active" ? "bg-green-500" : 
                      listing.status === "UnderReview" ? "bg-amber-400" : 
                      listing.status === "Rejected" ? "bg-red-500" : 
                      listing.status === "Sold" ? "bg-blue-500" : 
                      listing.status === "Rented" ? "bg-blue-500" : 
                      "bg-gray-400"}`} />
                  {listing.status === "UnderReview" ? "Under Review" : listing.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`fixed top-20 left-4 right-4 max-w-md mx-auto px-4 py-3 rounded-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 ${toast.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {toast.type === "success" ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        )}

        {/* Rejected Status Warning */}
        {listing.status === "Rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <FiAlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-700 mb-1">Property Rejected</h3>
                <p className="text-xs text-red-600 mb-2">Your property was rejected by admin. Please review the reasons below and update your listing accordingly.</p>
              </div>
            </div>

            {listing.rejectedReasons && listing.rejectedReasons.length > 0 && (
              <div className="bg-red-100/50 rounded-lg p-3 border-l-4 border-red-500">
                <p className="text-xs font-semibold text-red-700 mb-2">Rejection Reasons:</p>
                <ul className="flex flex-col gap-1.5">
                  {listing.rejectedReasons.map((reason, i) => (
                    <li key={i} className="text-xs text-red-600 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Images Section */}
        <Section title="Photos">
          <ImageEditor
            images={images}
            onChange={handleImagesChange}
            newFiles={newFiles}
            onNewFiles={handleNewFiles}
            onRemoveNew={handleRemoveNewFile}
            onNewFilesReorder={handleNewFilesReorder}
            disabled={saving}
          />
        </Section>

        {/* Listing Identity */}
        <Section title="Listing Details">
          <Grid>
            <FormField label="Listing Purpose">
              <SelectField
                value={form.listingTypeId ?? ""}
                onChange={() => {}}
                options={purposes.map((p) => ({ value: p._id, label: p.name }))}
                placeholder="Select purpose"
                disabled={true}
              />
            </FormField>

            <FormField label="Property Category">
              <SelectField
                value={form.categoryId ?? ""}
                onChange={() => {}}
                options={categories.map((c) => ({ value: c._id, label: c.name }))}
                placeholder="Select category"
                disabled={true}
              />
            </FormField>

            {form.categoryId && form.listingTypeId !== LISTING_TYPE_PG_ID && (
              <FormField label="Property Type">
                <SelectField
                  value={form.propertyTypeId ?? ""}
                  onChange={() => {}}
                  options={propertyTypes.map((t) => ({ value: t._id, label: t.name }))}
                  placeholder="Select property type"
                  disabled={true}
                />
              </FormField>
            )}
          </Grid>
        </Section>

        {/* Basic Info */}
        <Section title="Basic Information">
          <Grid>
            <FormField label="City">
              <CityAutocomplete
                value={form.cityName ?? ""}
                onChange={(v) => handleFormChange("cityName", v)}
                onSelect={({ city }) => {
                  // When city changes, clear locality so user re-picks it
                  setForm((prev) => ({
                    ...prev,
                    cityName: city,
                    locality: {},
                  }));
                }}
                placeholder="Search city..."
                disabled={saving}
              />
            </FormField>
            <FormField label="Address" hint={!form.cityName ? "Select a city first" : ""}>
              <LocationAutocomplete
                value={form.locality?.address ?? ""}
                onChange={(v) => handleFormChange("locality", { ...form.locality, address: v })}
                onSelect={(location) => {
                  handleFormChange("locality", {
                    address: location.address,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  });
                }}
                placeholder={form.cityName ? "Search location..." : "Select city first"}
                disabled={saving || !form.cityName}
                cityName={form.cityName}
              />
            </FormField>
          </Grid>
        </Section>

        {/* Type-specific form */}
        <PropertyTypeEditForm
          listing={listing}
          form={form}
          onChange={handleFormChange}
          furnishingsAmenities={furnishingsAmenities}
          showFurnishings={computeShowFurnishings(listing)}
        />

        {/* Save button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 mt-8 rounded-t-2xl shadow-lg flex gap-3 justify-end">
          <button
            onClick={() => navigate("/my-property-listings")}
            disabled={saving}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:border-[#7B2FFF] hover:text-[#7B2FFF] transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#7B2FFF] text-white rounded-xl text-sm font-bold hover:bg-[#6320d4] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
