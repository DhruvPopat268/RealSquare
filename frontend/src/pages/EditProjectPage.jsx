import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageEditor from "../components/editForms/ImageEditor";
import FurnishingsAmenitiesSection from "../components/editForms/FurnishingsAmenitiesSection";
import { STATIC_PROJECTS } from "./MyListingsPage";
import { Section, Grid, FormField, TextInput, NumberInput, SelectField } from "../components/editForms/EditFormShared";

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6 BHK"];
const STATUS_OPTIONS = ["Ready to Move", "Under Construction", "New Launch"];
const API = import.meta.env.VITE_API_URL;

export default function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const source = useMemo(() => STATIC_PROJECTS.find((project) => project.id === id), [id]);
  const [form, setForm] = useState(() => source ? { ...source, commercialAreaUnit: source.commercialAreaUnit ?? source.commercialConfigurations?.[0]?.areaUnit ?? "sqft", commercialConfigurations: source.commercialConfigurations?.map(({ areaUnit, ...item }) => ({ ...item })) ?? [], residentialConfigurations: [...(source.residentialConfigurations ?? [])] } : null);
  const [newFiles, setNewFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState({ video: null, reel: null });
  const [brochureFile, setBrochureFile] = useState(null);
  const [furnishingsAmenities, setFurnishingsAmenities] = useState({ furnishings: [], amenities: [] });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/mixed/property-listings/active-furnishings-amenities`, { withCredentials: true })
      .then((response) => {
        if (response.data.success) setFurnishingsAmenities(response.data.data);
      })
      .catch(() => {});
  }, []);

  if (!form) {
    return <><Navbar /><main className="min-h-[60vh] p-8 text-center"><h1 className="text-xl font-bold">Project not found</h1><button onClick={() => navigate("/my-property-listings?view=projects")} className="mt-4 text-[var(--primary-color)]">Back to My Project Listings</button></main><Footer /></>;
  }

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateCommercial = (index, key, value) => update("commercialConfigurations", form.commercialConfigurations.map((item, i) => i === index ? { ...item, [key]: value } : item));

  return (
    <div className="min-h-screen bg-[#f9f9fb] flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <button onClick={() => navigate("/my-property-listings?view=projects")} className="mb-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-[var(--primary-color)]">
          <FiArrowLeft size={14} /> Back to My Project Listings
        </button>
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Edit Project</h1>
          <p className="mt-1 text-sm text-gray-400">Update project details and media.</p>
        </div>

        <div className="flex flex-col gap-5">
          <Section title="Photos"><ImageEditor images={form.images} onChange={(images) => update("images", images)} newFiles={newFiles} onNewFiles={(files) => setNewFiles((current) => [...current, ...files])} onRemoveNew={(index) => setNewFiles((current) => current.filter((_, i) => i !== index))} onNewFilesReorder={setNewFiles} /></Section>

          {[{ title: "Videos", fileKey: "video", urlKey: "videoUrl", youtubeKey: "youtubeVideoUrl", label: "Project video" }, { title: "Reels", fileKey: "reel", urlKey: "reelUrl", youtubeKey: "youtubeReelUrl", label: "Project reel" }].map((media) => (
            <Section title={media.title} key={media.fileKey}>
              <div className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4">
                <h4 className="text-sm font-bold text-gray-800">{media.label}</h4>
                <label className="flex cursor-pointer items-center gap-2 self-start rounded-xl border border-dashed border-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-[var(--primary-color)]"><FiUpload size={14} /> {videoFiles[media.fileKey]?.name ?? "Choose video file"}<input type="file" accept="video/*" className="hidden" onChange={(event) => setVideoFiles((current) => ({ ...current, [media.fileKey]: event.target.files?.[0] ?? null }))} /></label>
                <FormField label="YouTube URL"><TextInput value={form[media.youtubeKey]} onChange={(value) => update(media.youtubeKey, value)} placeholder="https://www.youtube.com/watch?v=..." /></FormField>
                {form[media.urlKey] && <a href={form[media.urlKey]} target="_blank" rel="noreferrer" className="text-xs text-[var(--primary-color)] underline">View current uploaded {media.label.toLowerCase()}</a>}
              </div>
            </Section>
          ))}

          <Section title="Brochure">
            <div className="flex flex-col gap-3">
              {form.brochureUrl && <a href={form.brochureUrl} target="_blank" rel="noreferrer" className="text-sm text-[var(--primary-color)] underline">View current brochure</a>}
              <label className="flex cursor-pointer items-center gap-2 self-start rounded-xl border border-dashed border-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-[var(--primary-color)]"><FiUpload size={14} /> {brochureFile?.name ?? "Choose brochure PDF"}<input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => setBrochureFile(event.target.files?.[0] ?? null)} /></label>
              <p className="text-[11px] text-gray-400">PDF format</p>
            </div>
          </Section>

          <Section title="Project details">
            <Grid>
              <FormField label="Project name"><TextInput value={form.name} onChange={(value) => update("name", value)} /></FormField>
              <FormField label="Developer / builder name"><TextInput value={form.developer} onChange={(value) => update("developer", value)} /></FormField>
              <FormField label="Category"><SelectField value={form.category} onChange={() => {}} options={["Residential", "Commercial"]} disabled /></FormField>
              <FormField label="City"><TextInput value={form.cityName} onChange={(value) => update("cityName", value)} /></FormField>
              <FormField label="Locality"><TextInput value={form.locality} onChange={(value) => update("locality", value)} /></FormField>
              <FormField label="RERA Registration ID" hint="Optional"><TextInput value={form.reraId} onChange={(value) => update("reraId", value)} placeholder="Enter project RERA ID" /></FormField>
              <FormField label="Total units"><NumberInput value={form.totalUnits} onChange={(value) => update("totalUnits", value)} min={1} /></FormField>
              <FormField label="Available units"><NumberInput value={form.availableUnits} onChange={(value) => update("availableUnits", value)} min={1} /></FormField>
              <FormField label="Towers / buildings"><NumberInput value={form.towerCount ?? ""} onChange={(value) => update("towerCount", value)} min={1} /></FormField>
              <FormField label="Minimum unit price (₹)"><NumberInput value={form.minPrice} onChange={(value) => update("minPrice", value)} min={0} /></FormField>
              <FormField label="Maximum unit price (₹)"><NumberInput value={form.maxPrice} onChange={(value) => update("maxPrice", value)} min={0} /></FormField>
            </Grid>
            <FormField label="Project description"><textarea value={form.projectDescription ?? ""} onChange={(event) => update("projectDescription", event.target.value)} rows={4} placeholder="Describe the project and its key features" className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]/20" /></FormField>
          </Section>

          <Section title="Launch details">
            <Grid>
              <FormField label="Launch status"><SelectField value={form.status} onChange={(value) => update("status", value)} options={STATUS_OPTIONS} /></FormField>
              <FormField label="Project launch date"><input type="date" value={form.launchDate ?? ""} onChange={(event) => update("launchDate", event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" /></FormField>
              {form.status !== "Ready to Move" && <FormField label="Possession date"><input type="month" value={form.possessionDate} onChange={(event) => update("possessionDate", event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" /></FormField>}
            </Grid>
          </Section>

          {form.category === "Residential" ? (
            <Section title="BHK configurations">
              <p className="text-xs text-gray-500">Select all configurations available in this project.</p>
              <div className="flex flex-wrap gap-2">{BHK_OPTIONS.map((option) => <button type="button" key={option} onClick={() => update("residentialConfigurations", form.residentialConfigurations.includes(option) ? form.residentialConfigurations.filter((item) => item !== option) : [...form.residentialConfigurations, option])} className={`rounded-full border px-4 py-2 text-sm font-semibold ${form.residentialConfigurations.includes(option) ? "border-[var(--primary-color)] bg-[var(--primary-color-light)] text-[var(--primary-color)]" : "border-gray-200 text-gray-500"}`}>{option}</button>)}</div>
            </Section>
          ) : (
            <Section title="Area configurations">
              <FormField label="Area unit"><SelectField value={form.commercialAreaUnit} onChange={(value) => update("commercialAreaUnit", value)} options={[{ value: "sqft", label: "sq.ft" }, { value: "sqyd", label: "sq.yd" }, { value: "sqmt", label: "sq.m" }]} /></FormField>
              <div className="flex flex-col gap-4">{form.commercialConfigurations.map((configuration, index) => <div key={index} className="rounded-xl border border-gray-100 p-4"><div className="mb-3 flex items-center justify-between"><h4 className="text-sm font-semibold text-gray-700">Configuration {index + 1}</h4><button type="button" onClick={() => update("commercialConfigurations", form.commercialConfigurations.filter((_, i) => i !== index))} className="text-red-500" aria-label="Remove configuration"><FiTrash2 size={15} /></button></div><FormField label={`Carpet area (${form.commercialAreaUnit})`}><NumberInput value={configuration.carpetArea} onChange={(value) => updateCommercial(index, "carpetArea", value)} min={0} /></FormField></div>)}</div>
              <button type="button" onClick={() => update("commercialConfigurations", [...form.commercialConfigurations, { carpetArea: "" }])} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary-color)]"><FiPlus size={15} /> Add area configuration</button>
            </Section>
          )}

          <FurnishingsAmenitiesSection
            availableFurnishings={furnishingsAmenities.furnishings}
            availableAmenities={furnishingsAmenities.amenities}
            furnishType={form.furnishType ?? ""}
            selectedFurnishings={form.furnishingSelections ?? []}
            selectedAmenities={form.amenitySelections ?? []}
            onFurnishTypeChange={(furnishType) => update("furnishType", furnishType)}
            onFurnishingsChange={(furnishingSelections) => update("furnishingSelections", furnishingSelections)}
            onAmenitiesChange={(amenitySelections) => update("amenitySelections", amenitySelections)}
          />

          <div className="flex items-center justify-end gap-3 pb-4"><button type="button" onClick={() => navigate("/my-property-listings?view=projects")} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</button><button type="button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 3000); }} className="rounded-xl bg-[var(--primary-color)] px-5 py-2.5 text-sm font-semibold text-white">{saved ? "Changes ready" : "Save changes"}</button></div>
          {saved && <p className="text-right text-xs text-amber-700">This project edit screen is a UI preview; changes are not persisted yet.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
