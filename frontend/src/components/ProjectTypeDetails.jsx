import { useEffect, useState } from "react";
import FurnishingsAmenitiesDisplay from "./FurnishingsAmenitiesDisplay";
import Interactive3DModel from "./Interactive3DModel";

const AREA_UNITS = { sqft: "sq.ft", sqyd: "sq.yd", sqmt: "sq.m" };

function Value({ label, children }) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900">{children}</p>
    </div>
  );
}

function formatArea(area, areaUnit) {
  if (area == null || area === "") return "—";
  return `${Number(area).toLocaleString("en-IN")} ${AREA_UNITS[areaUnit] ?? areaUnit ?? "sq.ft"}`;
}

function formatBhk(value) {
  if (value == null || value === "") return "Other";
  if (typeof value === "number" || /^\d+(?:\.\d+)?$/.test(String(value).trim())) {
    const numericValue = Number(value);
    return numericValue === 0 ? "1 RK" : `${numericValue} BHK`;
  }
  const text = String(value).trim();
  const numericBhk = text.match(/^(\d+)\s*BHK$/i);
  if (numericBhk) return `${Number(numericBhk[1])} BHK`;
  return text;
}

function ConfigurationMedia({ configuration }) {
  const [activeMedia, setActiveMedia] = useState("3d");

  return (
    <div>
      <div className="mb-3 flex gap-2" role="tablist" aria-label="Configuration media">
        <button type="button" role="tab" aria-selected={activeMedia === "3d"} onClick={() => setActiveMedia("3d")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeMedia === "3d" ? "bg-[var(--primary-color)] text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100"}`}>3D Model</button>
        <button type="button" role="tab" aria-selected={activeMedia === "2d"} onClick={() => setActiveMedia("2d")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeMedia === "2d" ? "bg-[var(--primary-color)] text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100"}`}>2D Image</button>
      </div>

      {activeMedia === "3d" ? (
        configuration.model3DUrl ? (
          <>
            <Interactive3DModel src={configuration.model3DUrl} alt="Interactive 3D project configuration" height={260} />
            <p className="mt-1 text-[11px] text-gray-500">Drag to rotate the 3D model</p>
          </>
        ) : <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-sm text-gray-400">3D model not available</div>
      ) : (
        configuration.image2DUrl
          ? <a href={configuration.image2DUrl} target="_blank" rel="noreferrer" className="block"><img src={configuration.image2DUrl} alt="2D configuration" className="h-[260px] w-full rounded-lg border border-gray-200 bg-white object-contain" /></a>
          : <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-sm text-gray-400">2D image not available</div>
      )}
    </div>
  );
}

function ConfigurationDetails({ configurations = [], groups: apiGroups = [], areaUnit, residential, embedded = false }) {
  const label = residential ? "Residential Configurations" : "Carpet Area Configurations";
  const groups = residential
    ? apiGroups.map((group) => ({
      key: group.bhk,
      label: formatBhk(group.bhk),
      carpetAreas: (group.carpetAreas ?? []).map((area) => ({
        key: area.carpetArea == null ? "__unspecified__" : String(Number(area.carpetArea)),
        label: formatArea(area.carpetArea, areaUnit),
        configurations: area.configurations ?? [],
      })),
    }))
    : apiGroups.map((group) => ({
      key: group.carpetArea == null ? "__unspecified__" : String(Number(group.carpetArea)),
      label: formatArea(group.carpetArea, areaUnit),
      configurations: group.configurations ?? [],
    }));
  const [selectedGroupKey, setSelectedGroupKey] = useState(groups[0]?.key ?? "");
  const selectedGroup = groups.find((group) => group.key === selectedGroupKey) ?? groups[0];
  const areaGroups = residential ? selectedGroup?.carpetAreas ?? [] : [];
  const firstAreaKey = areaGroups[0]?.key ?? "";
  const [selectedAreaKey, setSelectedAreaKey] = useState(areaGroups[0]?.key ?? "");
  const selectedArea = residential
    ? areaGroups.find((area) => area.key === selectedAreaKey) ?? areaGroups[0]
    : selectedGroup;
  const currentConfigurations = selectedArea?.configurations ?? [];
  const [activeConfigurationIndex, setActiveConfigurationIndex] = useState(0);
  const activeConfiguration = currentConfigurations[activeConfigurationIndex] ?? currentConfigurations[0];

  useEffect(() => {
    setSelectedAreaKey(firstAreaKey);
    setActiveConfigurationIndex(0);
  }, [selectedGroup?.key, firstAreaKey]);
  useEffect(() => setActiveConfigurationIndex(0), [selectedArea?.key]);

  if (!configurations.length) return null;
  return (
    <section className={embedded ? "mt-5 border-t border-gray-100 pt-5" : "rounded-2xl bg-white p-6"}>
      {embedded ? <h3 className="mb-4 text-base font-bold text-[#1a1a2e]">{label}</h3> : <h2 className="mb-5 text-xl font-bold text-[#1a1a2e]">{label}</h2>}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={residential ? "Configurations by BHK" : "Configurations by carpet area"}>
        {groups.map((group) => <button key={group.key} type="button" role="tab" aria-selected={selectedGroup?.key === group.key} onClick={() => { setSelectedGroupKey(group.key); setActiveConfigurationIndex(0); }} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${selectedGroup?.key === group.key ? "bg-[var(--primary-color)] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{group.label}</button>)}
      </div>
      {residential && areaGroups.length > 0 && <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Carpet area configurations">
        {areaGroups.map((area) => <button key={area.key} type="button" role="tab" aria-selected={selectedArea?.key === area.key} onClick={() => { setSelectedAreaKey(area.key); setActiveConfigurationIndex(0); }} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${selectedArea?.key === area.key ? "bg-[var(--primary-color)] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{area.label}</button>)}
      </div>}
      {activeConfiguration && <article className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">{currentConfigurations.length} {currentConfigurations.length === 1 ? "configuration" : "configurations"} available</span>
          {currentConfigurations.length > 1 && <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous configuration" onClick={() => setActiveConfigurationIndex((index) => (index - 1 + currentConfigurations.length) % currentConfigurations.length)} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">‹</button>
            <span className="min-w-12 text-center text-xs font-medium text-gray-500">{activeConfigurationIndex + 1} / {currentConfigurations.length}</span>
            <button type="button" aria-label="Next configuration" onClick={() => setActiveConfigurationIndex((index) => (index + 1) % currentConfigurations.length)} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100">›</button>
          </div>}
        </div>
        <ConfigurationMedia key={`${selectedGroup?.key}-${selectedArea?.key}-${activeConfigurationIndex}`} configuration={activeConfiguration} />
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-3">
          <div><p className="mb-1 text-xs text-gray-500">Carpet Area</p><p className="text-sm font-semibold text-gray-900">{formatArea(activeConfiguration.carpetArea, areaUnit)}</p></div>
          <div><p className="mb-1 text-xs text-gray-500">Furnishing Status</p>{activeConfiguration.furnishingOptions?.length ? <div className="flex flex-wrap gap-1">{activeConfiguration.furnishingOptions.map((option, optionIndex) => <span key={`${option}-${optionIndex}`} className="w-fit rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{option}</span>)}</div> : <p className="text-sm font-semibold text-gray-900">—</p>}</div>
          <div><p className="mb-1 text-xs text-gray-500">Starting Price</p><p className="text-sm font-semibold text-gray-900">{activeConfiguration.price == null ? "—" : `₹${Number(activeConfiguration.price).toLocaleString("en-IN")}`}</p></div>
        </div>
      </article>}
    </section>
  );
}

function ResidentialProjectDetails({ project }) {
  const details = project.residentialDetails ?? {};
  return (
    <div className="flex flex-col gap-6">
      <ConfigurationDetails configurations={details.configurations} groups={project.configurationGroups?.residential ?? []} areaUnit={details.areaUnit} residential />
      <FurnishingsAmenitiesDisplay furnishings={project.furnishings ?? []} amenities={project.amenities ?? []} />
    </div>
  );
}

function CommercialProjectDetails({ project }) {
  const details = project.commercialDetails ?? {};
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-white p-6">
        <h2 className="mb-5 text-xl font-bold text-[#1a1a2e]">Commercial Project Details</h2>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <Value label="Zone Type">{details.zoneType}</Value>
          <Value label="Location Hub">{details.locationHub}</Value>
          <Value label="Area Unit">{AREA_UNITS[details.areaUnit] ?? details.areaUnit}</Value>
        </div>
        <ConfigurationDetails configurations={details.configurations} groups={project.configurationGroups?.commercial ?? []} areaUnit={details.areaUnit} embedded />
      </section>
      <FurnishingsAmenitiesDisplay furnishings={project.furnishings ?? []} amenities={project.amenities ?? []} />
    </div>
  );
}

export default function ProjectTypeDetails({ project }) {
  const category = project.category?.name?.toLowerCase() ?? "";
  if (category.includes("residential")) return <ResidentialProjectDetails project={project} />;
  if (category.includes("commercial")) return <CommercialProjectDetails project={project} />;
  return <div className="rounded-2xl bg-white p-6 text-sm text-gray-500">No additional category details are available.</div>;
}
