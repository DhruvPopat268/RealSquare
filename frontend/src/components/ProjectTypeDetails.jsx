import { useState } from "react";
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

function ConfigurationDetails({ configurations = [], areaUnit, residential, embedded = false }) {
  const label = residential ? "Residential Configurations" : "Carpet Area Configurations";
  const groups = [];
  const groupMap = new Map();

  configurations.forEach((configuration, index) => {
    const rawKey = residential
      ? formatBhk(configuration.bhk)
      : configuration.carpetArea == null || configuration.carpetArea === ""
        ? "Area not specified"
        : String(Number(configuration.carpetArea));
    const key = rawKey;
    if (!groupMap.has(key)) {
      const group = {
        key,
        label: residential
          ? rawKey
          : rawKey === "Area not specified"
            ? rawKey
            : formatArea(configuration.carpetArea, areaUnit),
        configurations: [],
      };
      groupMap.set(key, group);
      groups.push(group);
    }
    groupMap.get(key).configurations.push({ configuration, index });
  });
  const [selectedGroupKey, setSelectedGroupKey] = useState(groups[0]?.key ?? "");
  const selectedGroup = groups.find((group) => group.key === selectedGroupKey) ?? groups[0];

  if (!configurations.length) return null;
  return (
    <section className={embedded ? "mt-5 border-t border-gray-100 pt-5" : "rounded-2xl bg-white p-6"}>
      {embedded ? <h3 className="mb-4 text-base font-bold text-[#1a1a2e]">{label}</h3> : <h2 className="mb-5 text-xl font-bold text-[#1a1a2e]">{label}</h2>}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={residential ? "Configurations by BHK" : "Configurations by carpet area"}>
        {groups.map((group) => (
          <button key={group.key} type="button" role="tab" aria-selected={selectedGroup?.key === group.key} onClick={() => setSelectedGroupKey(group.key)} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${selectedGroup?.key === group.key ? "bg-[var(--primary-color)] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {group.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {selectedGroup?.configurations.map(({ configuration, index }) => (
          <article key={`${selectedGroup.key}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <ConfigurationMedia configuration={configuration} />
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-xs text-gray-500">Carpet Area</p>
                <p className="text-sm font-semibold text-gray-900">{formatArea(configuration.carpetArea, areaUnit)}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500">Furnishing Status</p>
                {configuration.furnishingOptions?.length ? <div className="flex flex-wrap gap-1">{configuration.furnishingOptions.map((option, optionIndex) => <span key={`${option}-${optionIndex}`} className="w-fit rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{option}</span>)}</div> : <p className="text-sm font-semibold text-gray-900">—</p>}
              </div>
              <div>
                <p className="mb-1 text-xs text-gray-500">Starting Price</p>
                <p className="text-sm font-semibold text-gray-900">{configuration.price == null ? "—" : `₹${Number(configuration.price).toLocaleString("en-IN")}`}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResidentialProjectDetails({ project }) {
  const details = project.residentialDetails ?? {};
  return (
    <div className="flex flex-col gap-6">
      <ConfigurationDetails configurations={details.configurations} areaUnit={details.areaUnit} residential />
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
        <ConfigurationDetails configurations={details.configurations} areaUnit={details.areaUnit} embedded />
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
