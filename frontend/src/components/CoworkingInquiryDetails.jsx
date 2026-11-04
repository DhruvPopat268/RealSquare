function formatRent(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function workspaceName(type) {
  if (type === "virtual_office") return "Virtual Office";
  if (type === "individual_private_cabin") return "Individual Private Cabin";
  if (type === "dedicated_coworking_desk") return "Dedicated Coworking Desk";
  return type;
}

export default function CoworkingInquiryDetails({ workspaces = [] }) {
  if (!workspaces.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Workspace Requirements</p>
      <div className="space-y-2">
        {workspaces.map((workspace) => {
          const isVirtual = workspace.type === "virtual_office";
          const min = isVirtual ? workspace.minMonthlyRent : workspace.minRentPerSeat;
          const max = isVirtual ? workspace.maxMonthlyRent : workspace.maxRentPerSeat;
          return (
            <div key={workspace.type} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
              <span className="font-semibold text-[#1a1a2e]">
                {workspaceName(workspace.type)}{workspace.requiredSeats ? ` · ${workspace.requiredSeats} seats` : ""}
              </span>
              <span className="font-medium text-gray-600">
                {formatRent(min)} – {formatRent(max)} {isVirtual ? "monthly" : "per seat/month"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
