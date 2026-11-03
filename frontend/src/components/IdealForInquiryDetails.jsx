export default function IdealForInquiryDetails({ options = [] }) {
  if (!options?.length) return null;

  const names = options
    .map((option) => (typeof option === "string" ? option : option?.name))
    .filter(Boolean);
  if (!names.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mr-1">Ideal For:</span>
      {names.map((name) => (
        <span key={name} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
          {name}
        </span>
      ))}
    </div>
  );
}
