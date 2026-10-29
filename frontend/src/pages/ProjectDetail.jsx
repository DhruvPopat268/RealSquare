import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiChevronLeft, FiChevronRight, FiEdit2, FiExternalLink, FiMapPin, FiShare2, FiShield, FiX } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";
import ProjectTypeDetails from "../components/ProjectTypeDetails";
import { fetchProjectListingById, updateProjectListingStatus } from "../utils/myListingsApi";
import MediaSection from "../components/MediaSection";

const STATUS_CONFIG = {
  Active: { label: "Active", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  Sold: { label: "Sold", bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-500" },
  sold: { label: "Sold", bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-500" },
  UnderReview: { label: "Under Review", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
  Rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
  Inactive: { label: "Inactive", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
};

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function getProjectStatusOptions(status) {
  if (status === "Active") return ["Inactive", "Sold"];
  if (status === "Inactive" || status === "Sold" || status === "sold") return ["Active"];
  return [];
}

function formatListingStatus(status) {
  if (status === "UnderReview") return "Under Review";
  if (status === "sold") return "Sold";
  return status;
}

function DetailItem({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return <div><p className="mb-1 text-xs text-gray-500">{label}</p><p className="text-sm font-semibold text-gray-900">{value}</p></div>;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [shareMessage, setShareMessage] = useState("");
  const [unitsModalOpen, setUnitsModalOpen] = useState(false);
  const [availableUnitsInput, setAvailableUnitsInput] = useState("");
  const [unitsError, setUnitsError] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [listingStatusInput, setListingStatusInput] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  const handleShare = async () => {
    const shareData = { title: project.projectName, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        setShareMessage("Link copied");
        window.setTimeout(() => setShareMessage(""), 2000);
      }
    } catch (shareError) {
      if (shareError?.name !== "AbortError") setShareMessage("Unable to share link");
    }
  };

  const handleUpdateUnits = () => {
    const availableUnits = Number(availableUnitsInput);
    if (!Number.isInteger(availableUnits) || availableUnits < 1 || availableUnits > Number(project.totalUnits)) {
      setUnitsError(`Enter a whole number from 1 to ${project.totalUnits}.`);
      return;
    }
    setProject((current) => ({ ...current, availableUnits }));
    setUnitsModalOpen(false);
  };

  const handleUpdateStatus = async () => {
    if (!listingStatusInput || statusUpdating) return;
    setStatusUpdating(true);
    setStatusError("");
    try {
      const result = await updateProjectListingStatus(project._id, listingStatusInput);
      setProject((current) => ({ ...current, status: result.data.status }));
      setStatusModalOpen(false);
      setListingStatusInput("");
    } catch (requestError) {
      setStatusError(requestError?.response?.data?.message ?? "Failed to update project status");
    } finally {
      setStatusUpdating(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProject(null);
    setError("");
    fetchProjectListingById(id)
      .then((result) => { if (!cancelled) setProject(result); })
      .catch((requestError) => { if (!cancelled) setError(requestError?.response?.data?.message ?? "Failed to load project listing"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => { window.scrollTo(0, 0); setLightbox(null); }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <PageSpinner key={id} />
        <Navbar />
        <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-12 animate-pulse">
          <div className="h-8 w-1/2 rounded bg-gray-200" />
          <div className="h-[420px] rounded-2xl bg-gray-200" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-24 rounded-2xl bg-gray-200" />)}</div>
          <div className="h-56 rounded-2xl bg-gray-200" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <><Navbar /><main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Project not found</h1>
        <p className="mt-2 text-sm text-gray-500">{error || "This project listing may have been removed."}</p>
        <button type="button" onClick={() => navigate("/my-project-listings")} className="mt-5 rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white">Back to My Project Listings</button>
      </main><Footer /></>
    );
  }

  const images = project.media?.images ?? [];
  const possession = formatDate(project.possessionDate);
  const launch = formatDate(project.launchDate);
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.Inactive;
  const projectDetails = project.rera?.projectDetails;
  const configurations = project.category?.name?.toLowerCase().includes("residential")
    ? project.residentialDetails?.configurations ?? []
    : project.commercialDetails?.configurations ?? [];

  return (
    <><Navbar />
      <main className="min-h-screen bg-[#f5f5f5]">
        <div className="mx-auto max-w-[1280px] px-4 py-6">
          <div className="mb-6 flex flex-col justify-between gap-6 lg:flex-row">
            <div>
              <button type="button" onClick={() => navigate("/my-project-listings")} className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[var(--primary-color)]"><FiArrowLeft size={16} /> Back to My Project Listings</button>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{project.projectName}</h1>
                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.bg} ${status.text}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span>
              </div>
             
              <div className="flex items-start gap-2 text-gray-600"><FiMapPin className="mt-0.5 shrink-0" /><span>{[project.locality?.address, project.cityName].filter(Boolean).join(", ")}</span></div>
              {project.locality?.latitude != null && project.locality?.longitude != null && <a href={`https://www.google.com/maps?q=${project.locality.latitude},${project.locality.longitude}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--primary-color)] px-4 py-1.5 text-sm font-medium text-[var(--primary-color)] transition hover:bg-[var(--primary-color)] hover:text-white"><FiExternalLink size={13} />View on Map</a>}
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end lg:text-right">
              <span className="rounded-full bg-[var(--primary-color-light)] px-3 py-1 text-xs font-bold text-[var(--primary-color)]">{project.category?.name ?? "Project"}</span>
              <h2 className="text-3xl font-bold text-black">{project.budgetRange ?? "Price on request"}</h2>
              {project.createdAt && <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-left shadow-sm"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100"><FiCalendar size={13} className="text-[var(--primary-color)]" /></span><div className="leading-tight"><p className="text-[11px] uppercase tracking-wide text-gray-400">Listed on</p><p className="text-sm font-semibold text-gray-800">{new Date(project.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></div></div>}
              <div className="flex justify-end gap-2">
                {shareMessage && <span role="status" className="self-center text-xs text-gray-500">{shareMessage}</span>}
                <button type="button" onClick={handleShare} className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-3 py-1.5 text-xs font-medium shadow-md transition hover:shadow-lg"><FiShare2 size={12} /> SHARE</button>
                <button type="button" onClick={() => navigate(`/edit-project/${project._id}`)} className="flex items-center gap-1.5 rounded-xl bg-[var(--primary-color)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--primary-color-hover)]"><FiEdit2 size={12} /> Edit Details</button>
                {getProjectStatusOptions(project.status).length > 0 && <button type="button" onClick={() => { setListingStatusInput(""); setStatusError(""); setStatusModalOpen(true); }} className="rounded-xl bg-[var(--primary-color)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--primary-color-hover)]">Update Status</button>}
                <button type="button" onClick={() => { setAvailableUnitsInput(String(project.availableUnits ?? "")); setUnitsError(""); setUnitsModalOpen(true); }} className="rounded-xl bg-[var(--primary-color)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--primary-color-hover)]">Update Units</button>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-6">
            <MediaSection
              images={images}
              onImageClick={setLightbox}
              videoUrl={project.media?.videos?.videoUrl}
              ytVideoUrl={project.media?.videos?.ytVideoUrl}
              reelUrl={project.media?.reelVideo?.reelUrl}
              ytReelUrl={project.media?.reelVideo?.ytReelUrl}
              brochureUrl={project.brochureUrl}
            />
          </div>

          {project.rera && <section className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full ${project.rera.reraStatus === "verified" ? "bg-green-100" : "bg-amber-100"}`}><FiShield size={16} className={project.rera.reraStatus === "verified" ? "text-green-600" : "text-amber-500"} /></span><div><p className="mb-0.5 text-xs uppercase tracking-wide text-gray-400">RERA Registration</p><p className="text-sm font-semibold text-gray-900">{project.rera.reraId || "No RERA number provided"}</p></div></div>
              <div className="flex flex-wrap gap-2"><span className={`rounded-full border px-3 py-1 text-xs font-bold ${project.rera.reraStatus === "verified" ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>RERA {project.rera.reraStatus === "verified" ? "Verified" : "Unverified"}</span><span className={`rounded-full border px-3 py-1 text-xs font-bold ${project.rera.reraAdminApproved ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-gray-100 text-gray-500"}`}>{project.rera.reraAdminApproved ? "Admin Approved" : "Admin Approval Pending"}</span></div>
            </div>
            {project.rera.verifiedAt && <DetailItem label="Verified At" value={new Date(project.rera.verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />}
            {projectDetails && <div className="border-t pt-4"><h3 className="mb-4 font-bold text-gray-900">RERA Project Details</h3><div className="grid grid-cols-2 gap-4 md:grid-cols-3">{[["Project Name", projectDetails.projectName], ["Developer", projectDetails.developerName], ["Location", projectDetails.localityOrCity], ["State", projectDetails.state], ["Project Type", projectDetails.projectType], ["Project Status", projectDetails.status], ["Completion Date", projectDetails.completionDate], ["Total Units", projectDetails.totalUnits], ["Confidence", projectDetails.confidence]].filter(([, value]) => value).map(([label, value]) => <DetailItem key={label} label={label} value={value} />)}</div></div>}
            {project.rera.sources?.length > 0 && <div className="border-t pt-4"><p className="mb-2 text-xs text-gray-500">Sources</p>{project.rera.sources.map((source, index) => <a key={`${source}-${index}`} href={source} target="_blank" rel="noopener noreferrer" className="block break-all text-sm text-blue-600 hover:underline">{source}</a>)}</div>}
          </section>}

          <div className="flex flex-col gap-6">
            <section className="rounded-2xl bg-white p-6">
              <h2 className="mb-6 text-2xl font-bold">Project Overview</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                <DetailItem label="Project Name" value={project.projectName} />
                <DetailItem label="Developer Name" value={project.developerName} />
                <DetailItem label="Category" value={project.category?.name} />
                <DetailItem label="Project Status" value={project.projectStatus} />
                <DetailItem label="Total Units" value={project.totalUnits} />
                <DetailItem label="Available Units" value={project.availableUnits} />
                <DetailItem label="Configurations" value={configurations.length} />
                <DetailItem label="Launch Date" value={launch} />
                <DetailItem label="Possession Date" value={possession} />
                <DetailItem label="Number of Towers" value={project.towerCount} />
                <DetailItem label="Listing Status" value={status.label} />
              </div>
            </section>

            {project.idealFor?.length > 0 && <section className="rounded-2xl bg-white p-6"><h2 className="mb-5 text-2xl font-bold">Ideal For</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{project.idealFor.map((item, index) => <div key={item.id ?? `${item.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">{item.image && <img src={item.image} alt="" className="h-10 w-10 shrink-0 object-contain" />}<span className="text-sm font-semibold text-gray-700">{item.name}</span></div>)}</div></section>}

            {project.projectDescription && <section className="rounded-2xl bg-white p-6"><h2 className="mb-5 text-2xl font-bold">About {project.projectName}</h2><p className="whitespace-pre-line leading-7 text-gray-700">{project.projectDescription}</p></section>}
            <ProjectTypeDetails project={project} />

          </div>

          {lightbox !== null && images[lightbox] && <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90" onClick={() => setLightbox(null)}>
            <img src={images[lightbox]} alt="" className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
            <button type="button" onClick={() => setLightbox(null)} aria-label="Close gallery" className="absolute right-6 top-4 text-2xl font-bold text-white"> <FiX /> </button>
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">{lightbox + 1} / {images.length}</div>
            {images.length > 1 && <><button type="button" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); setLightbox((index) => (index - 1 + images.length) % images.length); }} className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"><FiChevronLeft size={20} /></button><button type="button" aria-label="Next image" onClick={(event) => { event.stopPropagation(); setLightbox((index) => (index + 1) % images.length); }} className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"><FiChevronRight size={20} /></button></>}
          </div>}

          {unitsModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={() => setUnitsModalOpen(false)}>
            <div role="dialog" aria-modal="true" aria-labelledby="project-units-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
              <h2 id="project-units-title" className="text-lg font-bold text-[#1a1a2e]">Update Available Units</h2>
              <p className="mt-1 text-sm text-gray-500">Total units: {project.totalUnits}</p>
              <label className="mt-4 block text-sm font-medium text-gray-700">Available units<input type="number" min="1" max={project.totalUnits} value={availableUnitsInput} onChange={(event) => { setAvailableUnitsInput(event.target.value); setUnitsError(""); }} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[var(--primary-color)]" /></label>
              {unitsError && <p className="mt-2 text-sm text-red-600">{unitsError}</p>}
              <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setUnitsModalOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600">Cancel</button><button type="button" onClick={handleUpdateUnits} className="rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white">Save</button></div>
            </div>
          </div>}

          {statusModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={() => !statusUpdating && setStatusModalOpen(false)}>
            <div role="dialog" aria-modal="true" aria-labelledby="project-status-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
              <h2 id="project-status-title" className="text-lg font-bold text-[#1a1a2e]">{listingStatusInput ? "Confirm Status Update" : "Update Listing Status"}</h2>
              <p className="mt-1 text-sm text-gray-500">{project.projectName}</p>
              <p className="mt-4 text-sm text-gray-600">Current status: <span className="font-semibold text-gray-900">{formatListingStatus(project.status)}</span></p>
              {listingStatusInput ? <p className="mt-3 text-sm text-gray-600">Change this project to <span className="font-semibold text-gray-900">{formatListingStatus(listingStatusInput)}</span>?</p> : <div className="mt-4 flex flex-col gap-2">{getProjectStatusOptions(project.status).map((value) => <button key={value} type="button" onClick={() => { setListingStatusInput(value); setStatusError(""); }} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:border-[var(--primary-color)] hover:bg-[var(--primary-color-light)]">Mark as {formatListingStatus(value)}</button>)}</div>}
              {statusError && <p role="alert" className="mt-3 text-sm text-red-600">{statusError}</p>}
              <div className="mt-5 flex justify-end gap-2"><button type="button" disabled={statusUpdating} onClick={() => { if (listingStatusInput) { setListingStatusInput(""); setStatusError(""); } else setStatusModalOpen(false); }} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 disabled:opacity-50">{listingStatusInput ? "Back" : "Cancel"}</button>{listingStatusInput && <button type="button" disabled={statusUpdating} onClick={handleUpdateStatus} className="rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{statusUpdating ? "Saving…" : "Confirm"}</button>}</div>
            </div>
          </div>}
        </div>
      </main>
      <Footer />
    </>
  );
}
