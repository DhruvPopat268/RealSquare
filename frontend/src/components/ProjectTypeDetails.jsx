import FurnishingsAmenitiesDisplay from "./FurnishingsAmenitiesDisplay";

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
              {configuration.furnishType && (
                <span className="w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {configuration.furnishType}
                </span>
              )}
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
