import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft, FiGrid, FiHome, FiList, FiMapPin } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageSpinner from "../components/PageSpinner";
import { fetchActiveCategories, fetchMyProjectListings, updateProjectListingStatus } from "../utils/myListingsApi";
import { fetchActiveIdealFor } from "../chatbot/chatbotApi";

const PAGE_LIMIT = 10;
const ALLOWED_ROLES = [
  import.meta.env.VITE_OWNER_ROLE_ID,
  import.meta.env.VITE_BROKER_ROLE_ID,
  import.meta.env.VITE_BUILDER_ROLE_ID,
];

function mapProjectListing(project) {
  const residentialConfigurations = project.residentialDetails?.configurations ?? [];
  const commercialDetails = project.commercialDetails ?? {};
  return {
    id: project._id,
    name: project.projectName,
    completionPercentage: project.projectCompletionPercentage,
    developer: project.developerName,
    category: project.category?.name ?? "",
    image: project.media?.images?.[0] ?? "",
    location: [project.locality?.address, project.cityName].filter(Boolean).join(", "),
    projectStatus: project.projectStatus,
    listingStatus: project.status,
    budgetRange: project.budgetRange ?? "Price on request",
    totalUnits: project.totalUnits,
    availableUnits: project.availableUnits,
    residentialConfigurations,
    residentialAreaUnit: project.residentialDetails?.areaUnit,
    commercialAreaUnit: commercialDetails.areaUnit,
    commercialConfigurations: commercialDetails.configurations ?? [],
  };
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

function ProjectCompletionPercentageRing({ percentage }) {
  const value = Math.max(0, Math.min(100, Number(percentage) || 0));
  const color = value <= 40 ? "#EF4444" : value < 100 ? "#EAB308" : "#22C55E";
  const degrees = value * 3.6;

  return (
    <div
      className="h-10 w-10 flex-shrink-0 rounded-full p-[2px]"
      style={{ background: `conic-gradient(${color} 0deg ${degrees}deg, #e5e7eb ${degrees}deg 360deg)` }}
      title={`Listing completion: ${value}%`}
      aria-label={`Listing completion: ${value}%`}
    >
      <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[9px] font-bold" style={{ color }}>
        {value}%
      </div>
    </div>
  );
}

function EndOfList({ total }) {
  return (
    <div className="flex flex-col items-center py-6 gap-1 text-xs text-gray-400">
      <span className="w-8 h-px bg-gray-200" />
      <span>You&apos;ve seen all {total} project{total !== 1 ? "s" : ""}</span>
    </div>
  );
}

export default function MyProjectListingsPage() {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [projectCards, setProjectCards] = useState([]);
  const [projectTotalCount, setProjectTotalCount] = useState(0);
  const [projectStats, setProjectStats] = useState(null);
  const [projectHasMore, setProjectHasMore] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectLoadingMore, setProjectLoadingMore] = useState(false);
  const [view, setView] = useState("grid");
  const [unitsProject, setUnitsProject] = useState(null);
  const [unitsValue, setUnitsValue] = useState("");
  const [unitsError, setUnitsError] = useState("");
  const [statusProject, setStatusProject] = useState(null);
  const [statusValue, setStatusValue] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  const saveAvailableUnits = () => {
    const availableUnits = Number(unitsValue);
    if (!Number.isInteger(availableUnits) || availableUnits < 1 || availableUnits > Number(unitsProject?.totalUnits)) {
      setUnitsError(`Enter a whole number from 1 to ${unitsProject?.totalUnits}.`);
      return;
    }
    setProjectCards((projects) => projects.map((project) => project.id === unitsProject.id ? { ...project, availableUnits } : project));
    setUnitsProject(null);
  };

  const saveListingStatus = async () => {
    if (!statusProject || !statusValue || statusUpdating) return;
    setStatusUpdating(true);
    setStatusError("");
    try {
      const result = await updateProjectListingStatus(statusProject.id, statusValue);
      const updatedStatus = result.data.status;
      setProjectCards((projects) => projects.map((project) => project.id === statusProject.id ? { ...project, listingStatus: updatedStatus } : project));
      setProjectStats((current) => {
        if (!current) return current;
        const updated = { ...current };
        const oldStatus = statusProject.listingStatus;
        if (updated[oldStatus] > 0) updated[oldStatus] -= 1;
        updated[updatedStatus] = (updated[updatedStatus] ?? 0) + 1;
        return updated;
      });
      setStatusProject(null);
      setStatusValue("");
    } catch (error) {
      setStatusError(error?.response?.data?.message ?? "Failed to update project status");
    } finally {
      setStatusUpdating(false);
    }
  };
  const [projectError, setProjectError] = useState(null);
  const [projectCategories, setProjectCategories] = useState([]);
  const [projectIdealForOptions, setProjectIdealForOptions] = useState([]);
  const [projectFilterOptionsLoading, setProjectFilterOptionsLoading] = useState(true);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingFilters, setPendingFilters] = useState({ categoryId: "", idealForId: "", status: "" });
  const [appliedFilters, setAppliedFilters] = useState({ categoryId: "", idealForId: "", status: "" });
  const [sentinelNode, setSentinelNode] = useState(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/system-users/me`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          navigate("/login");
          return;
        }
        setAllowed(ALLOWED_ROLES.includes(data.data?.role?._id));
        setRejectedCount(data.data?.rejectedProjectListingsCount ?? 0);
      })
      .catch(() => navigate("/login"))
      .finally(() => setAuthLoading(false));
  }, [navigate]);

  useEffect(() => {
    setProjectFilterOptionsLoading(true);
    Promise.all([fetchActiveCategories(), fetchActiveIdealFor()])
      .then(([categories, idealFor]) => {
        setProjectCategories(categories);
        setProjectIdealForOptions(idealFor);
      })
      .catch(() => {})
      .finally(() => setProjectFilterOptionsLoading(false));
  }, []);

  const loadPage = useCallback(async (page) => {
    const requestId = ++requestIdRef.current;
    if (page > 1) {
      loadingMoreRef.current = true;
      setProjectLoadingMore(true);
    }
    try {
      const result = await fetchMyProjectListings({
        page,
        limit: PAGE_LIMIT,
        categoryId: appliedFilters.categoryId || undefined,
        idealForId: appliedFilters.idealForId || undefined,
        status: appliedFilters.status || undefined,
      });
      if (requestId !== requestIdRef.current) return;
      const projects = result.projects.map(mapProjectListing);
      setProjectCards((previous) => page === 1 ? projects : [...previous, ...projects]);
      pageRef.current = page;
      hasMoreRef.current = result.pagination.hasMore;
      setProjectHasMore(result.pagination.hasMore);
      setProjectTotalCount(result.pagination.totalCount);
      setProjectStats(result.stats);
      setProjectError(null);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      if (page > 1) pageRef.current = page - 1;
      setProjectError(error?.response?.data?.message ?? "Failed to load project listings");
    } finally {
      if (requestId === requestIdRef.current) {
        setProjectLoading(false);
        loadingMoreRef.current = false;
        setProjectLoadingMore(false);
      }
    }
  }, [appliedFilters]);

  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setProjectCards([]);
    setProjectHasMore(true);
    setProjectTotalCount(0);
    setProjectStats(null);
    setProjectError(null);
    setProjectLoading(true);
    loadPage(1);
  }, [appliedFilters, loadPage]);

  useEffect(() => {
    if (!sentinelNode || !projectHasMore || projectLoading || projectLoadingMore || projectError) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || loadingMoreRef.current || !hasMoreRef.current) return;
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      loadPage(nextPage);
    }, { rootMargin: "400px 0px", threshold: 0 });
    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [sentinelNode, projectHasMore, projectLoading, projectLoadingMore, projectError, loadPage]);

  const retry = () => {
    setProjectError(null);
    if (projectCards.length === 0) {
      pageRef.current = 1;
      setProjectLoading(true);
      loadPage(1);
    } else {
      loadPage(pageRef.current + 1);
    }
  };

  if (authLoading) {
    return (
      <>
        <PageSpinner />
        <Navbar />
        <div className="min-h-[calc(100vh-62px)] bg-[#f7f8fa]" />
        <Footer />
      </>
    );
  }

  if (!allowed) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[calc(100vh-62px)] items-center justify-center bg-[#f7f8fa] px-4">
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-10 text-center shadow-lg">
            <h1 className="mb-2 text-xl font-extrabold text-[#1a1a2e]">Access Restricted</h1>
            <p className="mb-6 text-sm text-gray-400">Only Owners, Brokers, and Builders can view project listings.</p>
            <button onClick={() => navigate("/")} className="w-full rounded-xl bg-[var(--primary-color)] py-3 text-sm font-semibold text-white">Back to Home</button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f9f9fb]">
        <div className={`mx-auto px-4 py-8 ${view === "grid" ? "max-w-6xl" : "max-w-4xl"}`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="w-full">
              <button onClick={() => navigate("/")} className="mb-3 flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-[var(--primary-color)]">
                <FiArrowLeft size={14} /> Back to Home
              </button>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1a1a2e]">My Project Listings</h1>
              <p className="mt-1 text-xs text-gray-400">{projectLoading ? "Loading your projects…" : `${projectTotalCount} project${projectTotalCount === 1 ? "" : "s"} found`}</p>
            </div>
            {!projectLoading && (
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-white p-1">
                  <button type="button" onClick={() => setView("grid")} title="Grid view" aria-label="Grid view" className={`rounded-lg p-1.5 transition-colors ${view === "grid" ? "bg-[var(--primary-color)] text-white" : "text-gray-400 hover:text-[var(--primary-color)]"}`}><FiGrid size={14} /></button>
                  <button type="button" onClick={() => setView("list")} title="List view" aria-label="List view" className={`rounded-lg p-1.5 transition-colors ${view === "list" ? "bg-[var(--primary-color)] text-white" : "text-gray-400 hover:text-[var(--primary-color)]"}`}><FiList size={14} /></button>
                </div>
                <button type="button" onClick={() => navigate("/project-listing")} className="rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-color-hover)]">Create a project listing</button>
              </div>
            )}
          </div>

          {rejectedCount > 0 && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100"><FiAlertTriangle size={16} className="text-red-500" /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-700">{rejectedCount} {rejectedCount === 1 ? "project requires" : "projects require"} your attention</p>
                <p className="mt-0.5 text-xs text-red-500">{rejectedCount === 1 ? "A project listing was" : "Some project listings were"} rejected. Please review the reasons and update accordingly.</p>
              </div>
              <button type="button" onClick={() => {
                const rejectedFilters = { ...appliedFilters, status: "Rejected" };
                setPendingFilters(rejectedFilters);
                setAppliedFilters(rejectedFilters);
              }} className="shrink-0 rounded-lg border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-200">View Rejected</button>
            </div>
          )}

          {projectStats && !projectLoading && (
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["Total", projectStats.total ?? projectTotalCount, "text-[var(--primary-color)]", "border-gray-100"],
                ["Active", projectStats.Active, "text-green-600", "border-green-200"],
                ["Under Review", projectStats.UnderReview, "text-amber-600", "border-amber-200"],
                ["Inactive", projectStats.Inactive, "text-gray-500", "border-gray-200"],
                ["Rejected", projectStats.Rejected, "text-red-600", "border-red-200"],
                ["Sold", projectStats.Sold, "text-blue-600", "border-blue-200"],
              ].map(([label, count, color, border]) => (
                <div key={label} className={`rounded-2xl border ${border} bg-white p-3 text-center transition hover:shadow-md`}>
                  <p className={`mb-1 text-xs font-semibold ${color}`}>{label}</p>
                  <p className={`text-2xl font-extrabold ${color}`}>{count ?? 0}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4">
            <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-[11px] font-semibold text-gray-500">
              Category
              <select value={pendingFilters.categoryId} disabled={projectFilterOptionsLoading} onChange={(event) => setPendingFilters((filters) => ({ ...filters, categoryId: event.target.value }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-700 outline-none focus:border-[var(--primary-color)]">
                <option value="">All categories</option>
                {projectCategories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </label>
            <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-[11px] font-semibold text-gray-500">
              Ideal For
              <select value={pendingFilters.idealForId} disabled={projectFilterOptionsLoading} onChange={(event) => setPendingFilters((filters) => ({ ...filters, idealForId: event.target.value }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-700 outline-none focus:border-[var(--primary-color)]">
                <option value="">All Ideal For options</option>
                {projectIdealForOptions.map((option) => <option key={option._id} value={option._id}>{option.name}</option>)}
              </select>
            </label>
            <button type="button" disabled={projectFilterOptionsLoading || (pendingFilters.categoryId === appliedFilters.categoryId && pendingFilters.idealForId === appliedFilters.idealForId && pendingFilters.status === appliedFilters.status)} onClick={() => setAppliedFilters({ ...pendingFilters })} className="rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40">Apply filters</button>
            {(pendingFilters.categoryId || pendingFilters.idealForId || pendingFilters.status || appliedFilters.categoryId || appliedFilters.idealForId || appliedFilters.status) && (
              <button type="button" disabled={projectFilterOptionsLoading} onClick={() => { const clear = { categoryId: "", idealForId: "", status: "" }; setPendingFilters(clear); setAppliedFilters(clear); }} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:border-gray-300 disabled:opacity-40">Clear</button>
            )}
          </div>

          {projectError && <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{projectError}</span><button type="button" onClick={retry} className="font-semibold underline">Retry</button></div>}

          {projectLoading && projectCards.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading your projects…</div>
          ) : projectCards.length === 0 && !projectError ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <FiHome size={30} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-700">You haven’t listed any projects yet.</p>
            </div>
          ) : (
            <>
              <div className={view === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
                {projectCards.map((project) => (
                  <article
                    key={project.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`View ${project.name} project details`}
                    onClick={() => navigate(`/project/${project.id}`)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/project/${project.id}`);
                      }
                    }}
                    className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-[var(--primary-color)] hover:shadow-md ${view === "list" ? "sm:flex-row" : ""}`}
                  >
                    <div className={`relative flex items-center justify-center overflow-hidden bg-[var(--primary-color-light)] ${view === "list" ? "h-[180px] w-full shrink-0 sm:h-auto sm:w-[220px]" : "h-52 w-full"}`}>
                      {project.image ? <img src={project.image} alt={project.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <FiHome size={34} className="text-[#c4aaff]" />}
                      <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${project.category === "Residential" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{project.category || "Project"}</span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">{project.projectStatus ?? "—"}</span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">{formatListingStatus(project.listingStatus)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <button type="button" onClick={() => navigate(`/project/${project.id}`)} className="min-w-0 text-left text-sm font-bold leading-snug text-[#1a1a2e] transition hover:text-[var(--primary-color)]">{project.name}</button>
                        <ProjectCompletionPercentageRing percentage={project.completionPercentage} />
                      </div>
                      {project.developer && <p className="mt-1 text-xs text-gray-400">By {project.developer}</p>}
                      <p className="mt-1 flex min-w-0 items-start gap-1 text-xs text-gray-500"><FiMapPin size={13} className="mt-0.5 shrink-0" /><span className="min-w-0 break-words">{project.location}</span></p>
                      <p className="mt-2 text-sm font-extrabold text-[var(--primary-color)]">{project.budgetRange}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
                        <p><span className="font-semibold">Total units:</span> {project.totalUnits}</p>
                        <p><span className="font-semibold">Available units:</span> {project.availableUnits}</p>
                        {project.category === "Residential" ? (
                          <p className="col-span-2"><span className="font-semibold">BHK configurations:</span> {project.residentialConfigurations.map((item) => [item.bhk, item.carpetArea != null ? `${Number(item.carpetArea).toLocaleString("en-IN")} ${project.residentialAreaUnit ?? "sqft"}` : null, item.price != null ? `₹${Number(item.price).toLocaleString("en-IN")}` : null, ...(item.furnishingOptions ?? [])].filter(Boolean).join(" · ")).join("; ") || "—"}</p>
                        ) : (
                          <p className="col-span-2"><span className="font-semibold">Carpet area configuration:</span> {project.commercialConfigurations.map((item) => [`${Number(item.carpetArea).toLocaleString("en-IN")} ${project.commercialAreaUnit}`, item.price != null ? `₹${Number(item.price).toLocaleString("en-IN")}` : null, ...(item.furnishingOptions ?? [])].filter(Boolean).join(" · ")).join("; ") || "—"}</p>
                        )}
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                        <button type="button" onClick={(event) => { event.stopPropagation(); navigate(`/edit-project/${project.id}`); }} className="rounded-xl bg-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--primary-color-hover)]">Edit Details</button>
                        {getProjectStatusOptions(project.listingStatus).length > 0 && <button type="button" onClick={(event) => { event.stopPropagation(); setStatusProject(project); setStatusValue(""); setStatusError(""); }} className="rounded-xl bg-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--primary-color-hover)]">Update Status</button>}
                        <button type="button" onClick={(event) => { event.stopPropagation(); setUnitsProject(project); setUnitsValue(String(project.availableUnits ?? "")); setUnitsError(""); }} className="rounded-xl bg-[var(--primary-color)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--primary-color-hover)]">Update Units</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {projectHasMore && <div ref={setSentinelNode} className="h-2" aria-hidden="true" />}
              {projectLoadingMore && <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary-color)] border-t-transparent" /> Loading more projects…</div>}
              {!projectLoading && !projectHasMore && projectCards.length > 0 && <EndOfList total={projectTotalCount} />}
            </>
          )}

          {unitsProject && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={() => setUnitsProject(null)}>
              <div role="dialog" aria-modal="true" aria-labelledby="update-units-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <h2 id="update-units-title" className="text-lg font-bold text-[#1a1a2e]">Update Available Units</h2>
                <p className="mt-1 text-sm text-gray-500">Total units: {unitsProject.totalUnits}</p>
                <label className="mt-4 block text-sm font-medium text-gray-700">Available units
                  <input type="number" min="1" max={unitsProject.totalUnits} value={unitsValue} onChange={(event) => { setUnitsValue(event.target.value); setUnitsError(""); }} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[var(--primary-color)]" />
                </label>
                {unitsError && <p className="mt-2 text-sm text-red-600">{unitsError}</p>}
                <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setUnitsProject(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600">Cancel</button><button type="button" onClick={saveAvailableUnits} className="rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white">Save</button></div>
              </div>
            </div>
          )}

          {statusProject && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={() => setStatusProject(null)}>
              <div role="dialog" aria-modal="true" aria-labelledby="update-project-status-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <h2 id="update-project-status-title" className="text-lg font-bold text-[#1a1a2e]">{statusValue ? "Confirm Status Update" : "Update Listing Status"}</h2>
                <p className="mt-1 text-sm text-gray-500">{statusProject.name}</p>
                <p className="mt-4 text-sm text-gray-600">Current status: <span className="font-semibold text-gray-900">{formatListingStatus(statusProject.listingStatus)}</span></p>
                {statusValue ? (
                  <p className="mt-3 text-sm text-gray-600">Change this project to <span className="font-semibold text-gray-900">{formatListingStatus(statusValue)}</span>?</p>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    {getProjectStatusOptions(statusProject.listingStatus).map((status) => <button key={status} type="button" onClick={() => { setStatusValue(status); setStatusError(""); }} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:border-[var(--primary-color)] hover:bg-[var(--primary-color-light)]">Mark as {formatListingStatus(status)}</button>)}
                  </div>
                )}
                {statusError && <p role="alert" className="mt-3 text-sm text-red-600">{statusError}</p>}
                <div className="mt-5 flex justify-end gap-2"><button type="button" disabled={statusUpdating} onClick={() => { if (statusValue) { setStatusValue(""); setStatusError(""); } else setStatusProject(null); }} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 disabled:opacity-50">{statusValue ? "Back" : "Cancel"}</button>{statusValue && <button type="button" disabled={statusUpdating} onClick={saveListingStatus} className="rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{statusUpdating ? "Saving…" : "Confirm"}</button>}</div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
