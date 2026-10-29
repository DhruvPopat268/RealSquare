import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiAlertCircle, FiCheck, FiPlus, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";
import ImageEditor from "../components/editForms/ImageEditor";
import { Section, Grid, FormField, TextInput, NumberInput, SelectField } from "../components/editForms/EditFormShared";
import FurnishingsAmenitiesSection from "../components/editForms/FurnishingsAmenitiesSection";
import CityAutocomplete from "../components/CityAutocomplete";
import LocationAutocomplete from "../components/LocationAutocomplete";
import Interactive3DModel from "../components/Interactive3DModel";
import { fetchProjectListingById } from "../utils/myListingsApi";

const API = import.meta.env.VITE_API_URL;
const BHK_OPTIONS = ["1 RK", ...Array.from({ length: 12 }, (_, index) => `${index + 1} BHK`)];
const PROJECT_STATUS_OPTIONS = ["Ready to Move", "Under Construction", "New Launch"];
const AREA_UNITS = [{ value: "sqft", label: "sq.ft" }, { value: "sqyd", label: "sq.yd" }, { value: "sqmt", label: "sq.m" }];
const ZONE_TYPE_OPTIONS     = ["Industrial", "Commercial", "Residential", "SEZ", "OpenSpaces", "Agricultural", "Others"];
const LOCATION_HUB_OPTIONS  = ["IT Park", "Business Park", "Mall", "Commercial Project", "Residential Project", "Retail Complex/Building", "Market/High Street", "Others"];
const FURNISHING_TYPES = ["Unfurnished", "Semi-Furnished", "Fully-Furnished"];
const newConfigId = () => `cfg-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function residentialBhkFields(value) {
  if (value === "1 RK") return { bhkType: "RK", bhkCount: 1 };
  const match = String(value ?? "").match(/^(\d+)\s*BHK$/i);
  return match ? { bhkType: "BHK", bhkCount: Number(match[1]) } : { bhkType: "", bhkCount: "" };
}

function toResidentialConfiguration(item) {
  const bhk = typeof item === "string" ? item : item.bhk ?? "";
  return {
    _clientId: newConfigId(),
    bhk,
    ...residentialBhkFields(bhk),
    ...(typeof item !== "string" && item.carpetArea != null ? { carpetArea: item.carpetArea } : {}),
    furnishingOptions: typeof item === "string" ? [] : (item.furnishingOptions ?? []).filter((option) => typeof option === "string"),
    price: typeof item === "string" ? "" : item.price ?? "",
    image2DUrl: typeof item === "string" ? "" : item.image2DUrl ?? "",
    model3DUrl: typeof item === "string" ? "" : item.model3DUrl ?? "",
  };
}

const EMPTY = { projectName: "", developerName: "", projectDescription: "", launchDate: "", projectStatus: "", possessionDate: "", reraId: "", cityName: "", locality: { address: "", latitude: null, longitude: null }, totalUnits: "", availableUnits: "", towerCount: "", minPrice: "", maxPrice: "", furnishings: [], amenities: [], idealFor: [], residentialDetails: { areaUnit: "sqft", configurations: [] }, commercialDetails: { areaUnit: "sqft", configurations: [], zoneType: "", locationHub: "" } };

function dateInput(value, kind) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return kind === "month" ? date.toISOString().slice(0, 7) : date.toISOString().slice(0, 10);
}

function equal(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function changedFields(current, original) {
  const result = {};
  for (const key of Object.keys(current ?? {})) {
    const value = current[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = changedFields(value, original?.[key] ?? {});
      if (Object.keys(nested).length) result[key] = nested;
    } else if (!equal(value, original?.[key])) result[key] = value;
  }
  return result;
}

function toForm(project) {
  return {
    projectName:        project.projectName ?? "",
    developerName:      project.developerName ?? "",
    projectDescription: project.projectDescription ?? "",
    launchDate:         dateInput(project.launchDate, "date"),
    projectStatus:      project.projectStatus ?? "",
    possessionDate:     dateInput(project.possessionDate, "month"),
    reraId:             project.rera?.reraId ?? "",
    cityName:           project.cityName ?? "",
    locality: {
      address:   project.locality?.address   ?? "",
      latitude:  project.locality?.latitude  ?? null,
      longitude: project.locality?.longitude ?? null,
    },
    totalUnits:     project.totalUnits     ?? "",
    availableUnits: project.availableUnits ?? "",
    towerCount:     project.towerCount     ?? "",
    minPrice:       project.minPrice       ?? "",
    maxPrice:       project.maxPrice       ?? "",
    furnishings:    (project.furnishings ?? []).map((item) => ({ furnishingId: String(item.id ?? item._id), count: item.count ?? 1 })),
    amenities:      (project.amenities   ?? []).map((item) => ({ amenityId: String(item.id ?? item._id), count: item.count ?? 1 })),
    idealFor: (project.idealFor ?? []).map((item) => String(item.id ?? item._id)),
    residentialDetails: {
      areaUnit:       project.residentialDetails?.areaUnit ?? "sqft",
      configurations: (project.residentialDetails?.configurations ?? []).map(toResidentialConfiguration),
    },
    commercialDetails: {
      areaUnit:       project.commercialDetails?.areaUnit    ?? "sqft",
      zoneType:       project.commercialDetails?.zoneType    ?? "",
      locationHub:    project.commercialDetails?.locationHub ?? "",
      configurations: (project.commercialDetails?.configurations ?? []).map((item) => ({
        _clientId: newConfigId(), carpetArea: item.carpetArea,
        furnishingOptions: (item.furnishingOptions ?? []).filter((option) => typeof option === "string"),
        price: item.price ?? "",
        image2DUrl: item.image2DUrl ?? "", model3DUrl: item.model3DUrl ?? "",
      })),
    },
  };
}

export default function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [original, setOriginal] = useState(EMPTY);
  const [idealForOptions, setIdealForOptions] = useState([]);
  const [images, setImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [configurationImageFiles, setConfigurationImageFiles] = useState({});
  const [videoLinks, setVideoLinks] = useState({ videoUrl: "", ytVideoUrl: "", reelUrl: "", ytReelUrl: "" });
  const [originalVideoLinks, setOriginalVideoLinks] = useState({ videoUrl: "", ytVideoUrl: "", reelUrl: "", ytReelUrl: "" });
  const [videoFiles, setVideoFiles] = useState({ video: null, reelVideo: null });
  const [clearUploads, setClearUploads] = useState({ video: false, reelVideo: false });
  const [brochureFile, setBrochureFile] = useState(null);
  const [clearBrochure, setClearBrochure] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [furnishingsAmenities, setFurnishingsAmenities] = useState({ furnishings: [], amenities: [] });
  const [addedConfigurationMessage, setAddedConfigurationMessage] = useState("");
  const configurationCardRefs = useRef({});

  useEffect(() => {
    // Fetch furnishings & amenities options (reuses the property listing endpoint — same FurnishingAmenity collection)
    axios
      .get(`${API}/api/mixed/property-listings/active-furnishings-amenities`, { withCredentials: true })
      .then((res) => { if (res.data.success) setFurnishingsAmenities(res.data.data); })
      .catch(() => {}); // non-critical
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchProjectListingById(id),
      axios.get(`${API}/api/mixed/project-listings/ideal-for`, { withCredentials: true }),
    ]).then(([data, optionsResponse]) => {
      if (!alive) return;
      const initial = toForm(data);
      setProject(data);
      setForm(initial);
      setOriginal(JSON.parse(JSON.stringify(initial)));
      setImages(data.media?.images ?? []);
      const links = { videoUrl: data.media?.videos?.videoUrl ?? "", ytVideoUrl: data.media?.videos?.ytVideoUrl ?? "", reelUrl: data.media?.reelVideo?.reelUrl ?? "", ytReelUrl: data.media?.reelVideo?.ytReelUrl ?? "" };
      setVideoLinks(links);
      setOriginalVideoLinks(links);
      setIdealForOptions(optionsResponse.data.data ?? []);
    }).catch((error) => setToast({ type: "error", message: error.response?.data?.message ?? error.message ?? "Failed to load project" }))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  const categoryName = project?.category?.name ?? "";
  const isCommercial = useMemo(() => categoryName.toLowerCase() === "commercial", [categoryName]);
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setDetail = (section, key, value) => setForm((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
  const setConfiguration = (section, index, key, value) => {
    setForm((current) => ({ ...current, [section]: { ...current[section], configurations: current[section].configurations.map((item, i) => i === index ? { ...item, [key]: value } : item) } }));
  };
  const setResidentialUnitType = (index, unitType) => {
    setForm((current) => ({
      ...current,
      residentialDetails: {
        ...current.residentialDetails,
        configurations: current.residentialDetails.configurations.map((item, i) => i !== index ? item : unitType === "RK"
          ? { ...item, bhkType: "RK", bhkCount: 1, bhk: "1 RK" }
          : unitType === "BHK"
            ? { ...item, bhkType: "BHK", bhkCount: "", bhk: "" }
            : { ...item, bhkType: "", bhkCount: "", bhk: "" }),
      },
    }));
  };
  const setResidentialBhkCount = (index, count) => {
    setForm((current) => ({
      ...current,
      residentialDetails: {
        ...current.residentialDetails,
        configurations: current.residentialDetails.configurations.map((item, i) => i === index
          ? { ...item, bhkCount: count, bhk: count === "" ? "" : `${count} BHK` }
          : item),
      },
    }));
  };
  const addResidentialConfiguration = () => {
    const configuration = { _clientId: newConfigId(), bhk: "", bhkType: "", bhkCount: "", carpetArea: "", furnishingOptions: [], price: "", image2DUrl: "", model3DUrl: "" };
    const configurationNumber = form.residentialDetails.configurations.length + 1;
    setDetail("residentialDetails", "configurations", [...form.residentialDetails.configurations, configuration]);
    setAddedConfigurationMessage(`Configuration ${configurationNumber} has been added below. Fill in its details.`);
    window.setTimeout(() => configurationCardRefs.current[configuration._clientId]?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };
  const addCommercialConfiguration = () => {
    const configuration = { _clientId: newConfigId(), carpetArea: "", furnishingOptions: [], price: "", image2DUrl: "", model3DUrl: "" };
    const configurationNumber = form.commercialDetails.configurations.length + 1;
    setDetail("commercialDetails", "configurations", [...form.commercialDetails.configurations, configuration]);
    setAddedConfigurationMessage(`Area configuration ${configurationNumber} has been added below. Fill in its details.`);
    window.setTimeout(() => configurationCardRefs.current[configuration._clientId]?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };
  const configImageKey = (configuration, slot) => `${configuration._clientId}:${slot}`;
  const renderConfigurationMedia = (section, configuration) => (
    <div className="mt-4 grid items-start gap-3 sm:grid-cols-2">
      {[{ slot: "image2DUrl", label: "2D image" }, { slot: "model3DUrl", label: "3D model" }].map(({ slot, label }) => {
        const key = configImageKey(configuration, slot);
        const file = configurationImageFiles[key];
        return <div key={slot} className="flex min-h-[132px] items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs font-semibold text-gray-600">{label}</p>
            {file && <div className="mb-2 flex items-center gap-1 text-xs text-violet-700"><span className="min-w-0 truncate">{file.name}</span><button type="button" aria-label={`Remove selected ${label.toLowerCase()}`} disabled={saving} onClick={() => setConfigurationImageFiles((current) => { const next = { ...current }; delete next[key]; return next; })}><FiX /></button></div>}
            <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[var(--primary-color)]"><FiUpload />{file || configuration[slot] ? `Replace ${label.toLowerCase()}` : `Choose ${label.toLowerCase()}`}<input type="file" accept={slot === "model3DUrl" ? ".glb,.gltf,model/gltf-binary,model/gltf+json,application/json,application/octet-stream" : "image/jpeg,image/png,image/webp"} disabled={saving} className="hidden" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) setConfigurationImageFiles((current) => ({ ...current, [key]: selected })); event.target.value = ""; }} /></label>
            {configuration[slot] && <button type="button" disabled={saving} onClick={() => setConfiguration(section, form[section].configurations.indexOf(configuration), slot, "")} className="mt-2 block text-xs text-red-600">Remove current {label.toLowerCase()}</button>}
            {slot === "model3DUrl" && <p className="mt-2 text-[10px] text-gray-400">GLB or self-contained glTF, up to 100 MB</p>}
          </div>
          <div className="w-[48%] max-w-[220px] min-w-[120px] shrink-0">
            {configuration[slot]
              ? slot === "model3DUrl"
                ? <Interactive3DModel src={configuration[slot]} alt="Interactive 3D project configuration" height={100} />
                : <img src={configuration[slot]} alt={label} className="h-[100px] w-full rounded object-contain" />
              : <div className="flex h-[100px] items-center justify-center rounded border border-dashed border-gray-200 text-center text-[10px] text-gray-400">No {label.toLowerCase()} selected</div>}
          </div>
        </div>;
      })}
    </div>
  );
  const renderFurnishingOptions = (section, configuration, index) => (
    <div className="mt-3 w-full">
      <FormField label="Starting price (₹)">
        <NumberInput value={configuration.price} min={1} disabled={saving} onChange={(value) => setConfiguration(section, index, "price", value)} />
      </FormField>
      <p className="mb-2 text-xs font-semibold text-gray-600">Furnishing options <span className="font-normal">(optional)</span></p>
      <div className="grid gap-2 sm:grid-cols-3">{FURNISHING_TYPES.map((type) => {
        const selected = (configuration.furnishingOptions ?? []).includes(type);
        return <div key={type} className="rounded-lg border border-gray-200 p-2">
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selected} disabled={saving} onChange={(event) => setConfiguration(section, index, "furnishingOptions", event.target.checked ? [...(configuration.furnishingOptions ?? []), type] : (configuration.furnishingOptions ?? []).filter((item) => item !== type))} />{type}</label>
        </div>;
      })}</div>
    </div>
  );

  const submit = async () => {
    if (saving) return;
    if (!form.projectName.trim() || !form.cityName.trim() || !form.locality.address.trim()) {
      const message = "Project name, city, and locality are required.";
      setSaveError(message);
      setToast({ type: "error", message });
      return;
    }
    if (!Number.isInteger(Number(form.totalUnits)) || Number(form.totalUnits) < 1 || !Number.isInteger(Number(form.availableUnits)) || Number(form.availableUnits) < 1 || Number(form.availableUnits) > Number(form.totalUnits)) {
      const message = `Available units must be a whole number from 1 to ${form.totalUnits}.`;
      setSaveError(message);
      setToast({ type: "error", message });
      return;
    }
    if (form.projectStatus !== "Ready to Move" && !form.possessionDate) {
      const message = "Enter the expected possession date for this project status.";
      setSaveError(message);
      setToast({ type: "error", message });
      return;
    }
    if (Number(form.minPrice) <= 0 || Number(form.maxPrice) < Number(form.minPrice)) {
      const message = "Enter a valid price range. Maximum price must be equal to or greater than minimum price.";
      setSaveError(message);
      setToast({ type: "error", message });
      return;
    }
    if (categoryName.toLowerCase() === "residential" && (
      form.residentialDetails.configurations.length === 0 ||
      form.residentialDetails.configurations.some((configuration) => !BHK_OPTIONS.includes(configuration.bhk))
    )) {
      const message = "Add at least one residential configuration and select a valid BHK or RK count for each one.";
      setSaveError(message);
      setToast({ type: "error", message });
      return;
    }
    if (categoryName.toLowerCase() === "commercial" && form.idealFor.length === 0) {
      const message = "Select at least one Ideal For option.";
      setSaveError(message);
      setToast({ type: "error", message });
      return;
    }
    setSaving(true);
    setSaveError("");
    setToast(null);
    try {
      const diff = changedFields(form, original);
      const patch = { projectListingId: id };
      for (const key of ["projectName", "developerName", "projectDescription", "launchDate", "projectStatus", "possessionDate", "reraId", "cityName", "totalUnits", "availableUnits", "towerCount", "minPrice", "maxPrice", "furnishings", "amenities", "idealFor"]) {
        if (Object.prototype.hasOwnProperty.call(diff, key)) patch[key] = diff[key];
      }
      if (diff.locality) patch.locality = diff.locality;
      if (diff.residentialDetails) {
        const residentialDetails = { ...diff.residentialDetails };
        if (Array.isArray(residentialDetails.configurations)) {
          residentialDetails.configurations = residentialDetails.configurations.map(({ bhk, carpetArea, furnishingOptions, price, image2DUrl, model3DUrl }) => ({
            bhk,
            ...(carpetArea !== "" && carpetArea != null && { carpetArea }),
            furnishingOptions: furnishingOptions ?? [],
            ...(price !== "" && price != null ? { price: Number(price) } : {}),
            image2DUrl: image2DUrl ?? "", model3DUrl: model3DUrl ?? "",
          }));
        }
        patch.residentialDetails = residentialDetails;
      }
      if (diff.commercialDetails) {
        const commercialDetails = { ...diff.commercialDetails };
        if (Array.isArray(commercialDetails.configurations)) {
          commercialDetails.configurations = commercialDetails.configurations.map(({ carpetArea, furnishingOptions, price, image2DUrl, model3DUrl }) => ({
            ...(carpetArea !== "" && carpetArea != null && { carpetArea }),
            furnishingOptions: furnishingOptions ?? [],
            ...(price !== "" && price != null ? { price: Number(price) } : {}),
            image2DUrl: image2DUrl ?? "", model3DUrl: model3DUrl ?? "",
          }));
        }
        patch.commercialDetails = commercialDetails;
      }
      if (Object.keys(patch).length > 1) {
        const response = await axios.patch(`${API}/api/mixed/project-listings`, patch, { withCredentials: true });
        if (!response.data.success) throw new Error(response.data.message ?? "Project update failed");
      }

      const originalImages = project.media?.images ?? [];
      const imagesChanged = newFiles.length > 0 || !equal(images, originalImages);
      const videosChanged = Boolean(videoFiles.video || videoFiles.reelVideo || clearUploads.video || clearUploads.reelVideo) || videoLinks.ytVideoUrl !== originalVideoLinks.ytVideoUrl || videoLinks.ytReelUrl !== originalVideoLinks.ytReelUrl;
      const brochureChanged = Boolean(brochureFile) || clearBrochure;
      const configImageEntries = [];
      for (const section of ["residentialDetails", "commercialDetails"]) {
        form[section].configurations.forEach((configuration, index) => {
          for (const slot of ["image2DUrl", "model3DUrl"]) {
            const file = configurationImageFiles[configImageKey(configuration, slot)];
            if (file) configImageEntries.push({ section, index, slot, file });
          }
        });
      }
      if (imagesChanged || videosChanged || brochureChanged || configImageEntries.length) {
        const fd = new FormData();
        fd.append("projectListingId", id);
        if (imagesChanged) {
          fd.append("existingImages", JSON.stringify(images));
          fd.append("isPrimary", JSON.stringify(newFiles.map((_, index) => index === 0)));
          newFiles.forEach((file) => fd.append("images", file));
        }
        if (videosChanged) {
          fd.append("ytVideoUrl", videoLinks.ytVideoUrl.trim() || "null");
          fd.append("ytReelUrl", videoLinks.ytReelUrl.trim() || "null");
          fd.append("clearVideo", String(clearUploads.video));
          fd.append("clearReelVideo", String(clearUploads.reelVideo));
          if (videoFiles.video) fd.append("video", videoFiles.video);
          if (videoFiles.reelVideo) fd.append("reelVideo", videoFiles.reelVideo);
        }
        if (brochureChanged) {
          fd.append("clearBrochure", String(clearBrochure));
          if (brochureFile) fd.append("brochure", brochureFile);
        }
        if (configImageEntries.length) {
          fd.append("configurationImageMap", JSON.stringify(configImageEntries.map(({ section, index, slot }) => ({ section, index, slot }))));
          configImageEntries.forEach(({ file }) => fd.append("configurationMedia", file));
        }
        const response = await axios.patch(`${API}/api/mixed/project-listings/media`, fd, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
        if (!response.data.success) throw new Error(response.data.message ?? "Project media update failed");
      }
      setToast({ type: "success", message: "Project updated successfully" });
      window.setTimeout(() => navigate("/my-project-listings"), 1200);
    } catch (error) {
      const errors = error.response?.data?.errors;
      const validationMessage = Array.isArray(errors) ? errors.map((item) => item.msg ?? item.message).filter(Boolean).join("; ") : "";
      const message = error.response?.data?.message || validationMessage || error.message || "Failed to update project";
      setSaveError(message);
      setToast({ type: "error", message });
    } finally { setSaving(false); }
  };

  if (loading) return <><Navbar /><PageSpinner /><Footer /></>;
  if (!project) return <><Navbar /><main className="mx-auto min-h-[55vh] max-w-3xl p-8 text-center"><p className="font-semibold text-red-600">{toast?.message ?? "Project not found"}</p><button onClick={() => navigate("/my-project-listings")} className="mt-4 text-[var(--primary-color)]">Back to My Project Listings</button></main><Footer /></>;

  return (
    <div className="min-h-screen bg-[#f9f9fb] flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <button onClick={() => navigate("/my-project-listings")} className="mb-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-[var(--primary-color)]"><FiArrowLeft size={14} /> Back to My Project Listings</button>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Edit Project</h1>
        <p className="mb-7 mt-1 text-sm text-gray-400">Update the details from your project listing.</p>
        {toast && <div className={`mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${toast.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{toast.type === "success" ? <FiCheck /> : <FiAlertCircle />} {toast.message}</div>}

        <div className="flex flex-col gap-5">
          <Section title="Photos"><ImageEditor images={images} onChange={setImages} newFiles={newFiles} onNewFiles={(files) => setNewFiles((current) => [...current, ...files])} onRemoveNew={(index) => setNewFiles((current) => current.filter((_, i) => i !== index))} onNewFilesReorder={setNewFiles} disabled={saving} /></Section>
          {[{ title: "Videos", fileKey: "video", urlKey: "videoUrl", youtubeKey: "ytVideoUrl", clearKey: "video", label: "Project video" }, { title: "Reels", fileKey: "reelVideo", urlKey: "reelUrl", youtubeKey: "ytReelUrl", clearKey: "reelVideo", label: "Project reel" }].map((item) => (
            <Section title={item.title} key={item.title}><div className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4"><div className="flex items-center justify-between gap-3"><h4 className="text-sm font-bold text-gray-800">{item.label}</h4><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-[var(--primary-color)]"><FiUpload size={14} /> {videoFiles[item.fileKey] ? "Replace video" : "Choose video file"}<input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/x-matroska" className="hidden" disabled={saving} onChange={(event) => { setVideoFiles((current) => ({ ...current, [item.fileKey]: event.target.files?.[0] ?? null })); if (event.target.files?.[0]) setClearUploads((current) => ({ ...current, [item.clearKey]: false })); event.target.value = ""; }} /></label></div>
              {videoLinks[item.urlKey] && !clearUploads[item.clearKey] && <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"><a href={videoLinks[item.urlKey]} target="_blank" rel="noreferrer" className="truncate text-xs text-[var(--primary-color)] underline">Current uploaded video</a><button type="button" disabled={saving} onClick={() => setClearUploads((current) => ({ ...current, [item.clearKey]: true }))} className="text-xs text-red-600">Remove</button></div>}
              {clearUploads[item.clearKey] && <button type="button" onClick={() => setClearUploads((current) => ({ ...current, [item.clearKey]: false }))} className="self-start text-xs text-[var(--primary-color)]">Undo remove</button>}
              {videoFiles[item.fileKey] && <div className="flex items-center justify-between rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700"><span className="truncate">Selected: {videoFiles[item.fileKey].name}</span><button type="button" onClick={() => setVideoFiles((current) => ({ ...current, [item.fileKey]: null }))}><FiX /></button></div>}
              <p className="text-[11px] text-gray-400">MP4, WebM, MOV, M4V, or MKV</p><FormField label="YouTube URL"><TextInput value={videoLinks[item.youtubeKey]} onChange={(value) => setVideoLinks((current) => ({ ...current, [item.youtubeKey]: value }))} placeholder="https://www.youtube.com/watch?v=..." /></FormField>
            </div></Section>
          ))}

          <Section title="Brochure">
            <div className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4">
              {project.brochureUrl && !clearBrochure && (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                  <a href={project.brochureUrl} target="_blank" rel="noreferrer" className="truncate text-xs text-[var(--primary-color)] underline">View current brochure</a>
                  <button type="button" disabled={saving} onClick={() => setClearBrochure(true)} className="shrink-0 text-xs text-red-600">Remove</button>
                </div>
              )}
              {clearBrochure && <button type="button" disabled={saving} onClick={() => setClearBrochure(false)} className="self-start text-xs text-[var(--primary-color)]">Undo remove</button>}
              {brochureFile && (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-700">
                  <span className="truncate">Selected: {brochureFile.name}</span>
                  <button type="button" disabled={saving} onClick={() => setBrochureFile(null)} aria-label="Remove selected brochure"><FiX /></button>
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 self-start rounded-xl border border-dashed border-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-[var(--primary-color)]">
                <FiUpload size={14} /> {brochureFile || (project.brochureUrl && !clearBrochure) ? "Replace brochure PDF" : "Choose brochure PDF"}
                <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={saving} onChange={(event) => { const file = event.target.files?.[0] ?? null; setBrochureFile(file); if (file) setClearBrochure(false); event.target.value = ""; }} />
              </label>
              <p className="text-[11px] text-gray-400">PDF format</p>
            </div>
          </Section>

          <Section title="Listing details"><Grid>
            <FormField label="Category"><SelectField value={categoryName} onChange={() => {}} options={[categoryName]} disabled /></FormField>
          </Grid></Section>

          <Section title="Basic information"><Grid>
            <FormField label="Project name"><TextInput value={form.projectName} onChange={(value) => setField("projectName", value)} /></FormField>
            <FormField label="Developer / builder name" hint="Optional"><TextInput value={form.developerName} onChange={(value) => setField("developerName", value)} /></FormField>
            <FormField label="City">
              <CityAutocomplete
                value={form.cityName}
                onChange={(v) => setField("cityName", v)}
                onSelect={({ city }) => setForm((current) => ({ ...current, cityName: city, locality: { address: "", latitude: null, longitude: null } }))}
                placeholder="Search city..."
                disabled={saving}
              />
            </FormField>
            <FormField label="Locality" hint={!form.cityName ? "Select a city first" : ""}>
              <LocationAutocomplete
                value={form.locality.address}
                onChange={(v) => setField("locality", { ...form.locality, address: v })}
                onSelect={(location) => setField("locality", { address: location.address, latitude: location.latitude, longitude: location.longitude })}
                placeholder={form.cityName ? "Search location..." : "Select city first"}
                disabled={saving || !form.cityName}
                cityName={form.cityName}
              />
            </FormField>
          </Grid></Section>

          <Section title="RERA verification"><FormField label="RERA ID" hint="Optional"><TextInput value={form.reraId} onChange={(value) => setField("reraId", value)} placeholder="Enter project RERA ID" /></FormField></Section>

          <Section title="Project details">
            <Grid>
              <FormField label="Project status">
                <SelectField value={form.projectStatus} onChange={(value) => { setField("projectStatus", value); if (value === "Ready to Move") setField("possessionDate", ""); }} options={PROJECT_STATUS_OPTIONS} />
              </FormField>
              {form.projectStatus !== "Ready to Move" && (
                <FormField label="Expected possession">
                  <input type="month" value={form.possessionDate} onChange={(event) => setField("possessionDate", event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                </FormField>
              )}
              <FormField label="Launch date" hint="Optional">
                <input type="date" value={form.launchDate} onChange={(event) => setField("launchDate", event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              </FormField>
              <FormField label="Total units">
                <NumberInput value={form.totalUnits} onChange={(value) => setField("totalUnits", value)} min={1} />
              </FormField>
              <FormField label="Available units">
                <NumberInput value={form.availableUnits} onChange={(value) => setField("availableUnits", value)} min={1} max={Number(form.totalUnits)} />
              </FormField>
              <FormField label="Towers / buildings" hint="Optional">
                <NumberInput value={form.towerCount} onChange={(value) => setField("towerCount", value)} min={1} />
              </FormField>
              {isCommercial && (
                <>
                  <FormField label="Zone type" hint="Optional">
                    <SelectField value={form.commercialDetails.zoneType} onChange={(value) => setDetail("commercialDetails", "zoneType", value)} options={ZONE_TYPE_OPTIONS} placeholder="Select zone type" />
                  </FormField>
                  <FormField label="Location hub" hint="Optional">
                    <SelectField value={form.commercialDetails.locationHub} onChange={(value) => setDetail("commercialDetails", "locationHub", value)} options={LOCATION_HUB_OPTIONS} placeholder="Select location hub" />
                  </FormField>
                </>
              )}
              <FormField label="Minimum unit price (₹)">
                <NumberInput value={form.minPrice} onChange={(value) => setField("minPrice", value)} min={1} />
              </FormField>
              <FormField label="Maximum unit price (₹)">
                <NumberInput value={form.maxPrice} onChange={(value) => setField("maxPrice", value)} min={1} />
              </FormField>
              {/* Description — full width, last field */}
              <div className="col-span-full">
                <FormField label="Project description" hint="Optional">
                  <textarea
                    value={form.projectDescription}
                    onChange={(event) => setField("projectDescription", event.target.value)}
                    rows={4}
                    placeholder="Describe the project — location highlights, amenities, USPs…"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]/20 resize-none"
                  />
                </FormField>
              </div>
            </Grid>
          </Section>

          {categoryName.toLowerCase() === "commercial" && (
            <Section title="Ideal for">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {idealForOptions.map((option) => {
                  const selected = form.idealFor.includes(String(option._id));
                  return (
                    <button
                      type="button"
                      key={option._id}
                      onClick={() => setField("idealFor", selected ? form.idealFor.filter((item) => item !== String(option._id)) : [...form.idealFor, String(option._id)])}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-semibold ${selected ? "border-[var(--primary-color)] bg-[var(--primary-color-light)] text-[var(--primary-color)]" : "border-gray-200 bg-white text-gray-600"}`}
                    >
                      {option.image && <img src={option.image} alt="" className="h-8 w-8 object-contain" />}
                      <span>{option.name}</span>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {isCommercial ? (
            <Section title={<div className="flex w-full items-center justify-between gap-3"><span>Commercial configurations</span><button type="button" disabled={saving} onClick={addCommercialConfiguration} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--primary-color-hover)] disabled:opacity-60"><FiPlus size={14} /> Add area configuration</button></div>}>
              <Grid>
                <FormField label="Area unit">
                  <SelectField value={form.commercialDetails.areaUnit} onChange={(value) => setDetail("commercialDetails", "areaUnit", value)} options={AREA_UNITS} />
                </FormField>
              </Grid>
              {addedConfigurationMessage && <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">{addedConfigurationMessage}</p>}
              {form.commercialDetails.configurations.length === 0 && <p className="text-sm text-gray-500">No area configurations added yet. Use the button above to add one.</p>}
              <div className="mt-4 flex flex-col gap-3">
                {form.commercialDetails.configurations.map((configuration, index) => (
                  <div key={configuration._clientId} ref={(element) => { configurationCardRefs.current[configuration._clientId] = element; }} className="rounded-xl border border-[var(--primary-color)] bg-[var(--primary-color-light)]/30 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-gray-800">Configuration {index + 1}</h4>
                      <button type="button" disabled={saving} aria-label={`Remove configuration ${index + 1}`} onClick={() => setDetail("commercialDetails", "configurations", form.commercialDetails.configurations.filter((_, i) => i !== index))} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-60"><FiTrash2 size={16} /></button>
                    </div>
                    <FormField label={`Carpet area (${form.commercialDetails.areaUnit})`}>
                      <NumberInput value={configuration.carpetArea} onChange={(value) => setConfiguration("commercialDetails", index, "carpetArea", value)} min={1} disabled={saving} />
                    </FormField>
                    {renderFurnishingOptions("commercialDetails", configuration, index)}
                    {renderConfigurationMedia("commercialDetails", configuration)}
                  </div>
                ))}
              </div>
            </Section>
          ) : (
            <Section title={<div className="flex w-full items-center justify-between gap-3"><span>BHK configurations</span><button type="button" disabled={saving} onClick={addResidentialConfiguration} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--primary-color-hover)] disabled:opacity-60"><FiPlus size={14} /> Add BHK configuration</button></div>}>
              <FormField label="Area unit for all carpet areas">
                <SelectField value={form.residentialDetails.areaUnit} onChange={(value) => setDetail("residentialDetails", "areaUnit", value)} options={AREA_UNITS} />
              </FormField>
              {addedConfigurationMessage && <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">{addedConfigurationMessage}</p>}
              {form.residentialDetails.configurations.length === 0 ? <p className="text-sm text-gray-500">No BHK configurations added yet. Use the button above to add one.</p> : (
                <div className="mt-4 flex flex-col gap-4">
                  {form.residentialDetails.configurations.map((configuration, index) => (
                    <div key={configuration._clientId} ref={(element) => { configurationCardRefs.current[configuration._clientId] = element; }} className="rounded-xl border border-[var(--primary-color)] bg-[var(--primary-color-light)]/30 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-gray-800">Configuration {index + 1}</h4>
                        <button type="button" disabled={saving} aria-label={`Remove configuration ${index + 1}`} onClick={() => setDetail("residentialDetails", "configurations", form.residentialDetails.configurations.filter((_, i) => i !== index))} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-60"><FiTrash2 size={16} /></button>
                      </div>
                      <Grid>
                        <FormField label="Unit type">
                          <SelectField value={configuration.bhkType} onChange={(value) => setResidentialUnitType(index, value)} options={[{ value: "BHK", label: "BHK" }, { value: "RK", label: "RK" }]} placeholder="Select BHK or RK" disabled={saving} />
                        </FormField>
                        <FormField label={configuration.bhkType === "RK" ? "RK count" : "BHK count"} hint={configuration.bhkType === "RK" ? "The project currently supports 1 RK." : "Enter a number from 1 to 12."}>
                          <NumberInput value={configuration.bhkType === "RK" ? 1 : configuration.bhkCount} onChange={(value) => setResidentialBhkCount(index, value === "" ? "" : Math.min(12, Math.max(1, Math.floor(Number(value)))))} min={1} max={configuration.bhkType === "RK" ? 1 : 12} step={1} disabled={saving || configuration.bhkType !== "BHK"} />
                        </FormField>
                        <FormField label={`Carpet area (${form.residentialDetails.areaUnit})`}>
                          <NumberInput value={configuration.carpetArea ?? ""} onChange={(value) => setConfiguration("residentialDetails", index, "carpetArea", value)} min={1} disabled={saving} />
                        </FormField>
                      </Grid>
                      {renderFurnishingOptions("residentialDetails", configuration, index)}
                      {renderConfigurationMedia("residentialDetails", configuration)}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Furnishings & Amenities — always shown */}
          <FurnishingsAmenitiesSection
            availableFurnishings={furnishingsAmenities.furnishings}
            availableAmenities={furnishingsAmenities.amenities}
            selectedFurnishings={form.furnishings}
            selectedAmenities={form.amenities}
            onFurnishingsChange={(value) => setField("furnishings", value)}
            onAmenitiesChange={(value) => setField("amenities", value)}
            showFurnishType={false}
            disabled={saving}
          />

          <div className="flex flex-col gap-3 pb-4">
            {saveError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 whitespace-pre-wrap">{saveError}</div>}
            <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => navigate("/my-project-listings")} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</button><button type="button" disabled={saving} onClick={submit} className="rounded-xl bg-[var(--primary-color)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button></div>
          </div>
        </div>
      </main><Footer />
    </div>
  );
}
