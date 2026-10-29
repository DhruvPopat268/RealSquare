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

function ConfigurationDetails({ configurations = [], areaUnit, residential, embedded = false }) {
  const label = residential ? "Residential Configurations" : "Carpet Area Configurations";

  if (!configurations.length) return null;
  return (
    <section className={embedded ? "mt-5 border-t border-gray-100 pt-5" : "rounded-2xl bg-white p-6"}>
      {embedded ? <h3 className="mb-4 text-base font-bold text-[#1a1a2e]">{label}</h3> : <h2 className="mb-5 text-xl font-bold text-[#1a1a2e]">{label}</h2>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {configurations.map((configuration, index) => {
          const area = configuration.carpetArea;
          const areaText = area == null ? null : `${Number(area).toLocaleString("en-IN")} ${AREA_UNITS[areaUnit] ?? areaUnit ?? "sq.ft"}`;
          const title = [residential ? configuration.bhk : null, areaText].filter(Boolean).join(" · ");
          return (
            <div key={`${title}-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex flex-col gap-1">
              <p className="text-sm font-semibold text-gray-800">{title || `Configuration ${index + 1}`}</p>
              <p className="mt-2 text-sm font-semibold text-gray-700">Starting price: {configuration.price == null ? "—" : `₹${Number(configuration.price).toLocaleString("en-IN")}`}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(configuration.furnishingOptions ?? []).map((option, optionIndex) => <span key={optionIndex} className="w-fit rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{option}</span>)}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {configuration.image2DUrl ? <a href={configuration.image2DUrl} target="_blank" rel="noreferrer" className="block"><img src={configuration.image2DUrl} alt="2D image" className="h-24 w-full rounded-lg object-cover" /><span className="text-[11px] text-gray-500">2D image</span></a> : <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-xs text-gray-400">2D image: —</div>}
                {configuration.model3DUrl ? <div><Interactive3DModel src={configuration.model3DUrl} alt="Interactive 3D project configuration" /><span className="text-[11px] text-gray-500">Drag to rotate the 3D model</span></div> : <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-xs text-gray-400">3D model: —</div>}
              </div>
            </div>
          );
        })}
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
