export default function ListingOverviewFields({ listing }) {
  const areaPrice = [
    listing.perSqFtPrice != null && `₹${listing.perSqFtPrice.toLocaleString("en-IN")}/sqft`,
    listing.perSqYdPrice != null && `₹${listing.perSqYdPrice.toLocaleString("en-IN")}/sqyd`,
    listing.perSqMtPrice != null && `₹${listing.perSqMtPrice.toLocaleString("en-IN")}/sqmt`,
  ].filter(Boolean).join(" · ");

  const fields = [
    ["Purpose", listing.listingType?.name ?? "—"],
    ["Category", listing.category?.name ?? "—"],
    ["Property Type", listing.propertyType?.name ?? "—"],
    ...(areaPrice ? [["Price per Area", areaPrice]] : []),
    ...(listing.zeroBrokerage != null ? [["Zero Brokerage", listing.zeroBrokerage ? "Yes" : "No"]] : []),
  ];

  return (
    <>
      {fields.map(([label, value]) => (
        <div key={label}>
          <p className="mb-1 text-sm text-gray-500">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      ))}
    </>
  );
}
