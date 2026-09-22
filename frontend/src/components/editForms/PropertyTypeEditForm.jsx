import { lazy, Suspense } from "react";
import ResidentialEditForm from "./ResidentialEditForm";
import CommercialEditForm from "./CommercialEditForm";
import PlotEditForm from "./PlotEditForm";
import PGEditForm from "./PGEditForm";
import GenericEditForm from "./GenericEditForm";

// Get property structure from listing
function getPropertyStructure(listing) {
  const categoryId = listing.category?.id?.toString();
  const listingTypeId = listing.listingType?.id?.toString();
  const propertyTypeId = listing.propertyType?.id?.toString();

  if (listingTypeId === import.meta.env.VITE_LISTING_TYPE_PG_ID) {
    return { type: "PG", component: "PGEditForm" };
  }

  if (categoryId === import.meta.env.VITE_CATEGORY_RESIDENTIAL_ID) {
    const plotIds = [
      import.meta.env.VITE_RESIDENTIAL_PROPERTY_TYPE_PLOT_IDS,
      import.meta.env.VITE_COMMERCIAL_PROPERTY_TYPE_PLOT_IDS,
    ].join(",").split(",").filter(Boolean);
    if (plotIds.includes(propertyTypeId)) {
      return { type: "PLOT", component: "PlotEditForm" };
    }
    return { type: "RESIDENTIAL", component: "ResidentialEditForm" };
  }

  if (categoryId === import.meta.env.VITE_CATEGORY_COMMERCIAL_ID) {
    const plotIds = [
      import.meta.env.VITE_COMMERCIAL_PROPERTY_TYPE_PLOT_IDS,
      import.meta.env.VITE_RESIDENTIAL_PROPERTY_TYPE_PLOT_IDS,
    ].join(",").split(",").filter(Boolean);
    if (plotIds.includes(propertyTypeId)) {
      return { type: "PLOT", component: "PlotEditForm" };
    }
    return { type: "COMMERCIAL", component: "CommercialEditForm" };
  }

  return { type: "GENERIC", component: "GenericEditForm" };
}

function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PropertyTypeEditForm({ listing, form, onChange, furnishingsAmenities, showFurnishings }) {
  const structure = getPropertyStructure(listing);

  const components = {
    ResidentialEditForm,
    CommercialEditForm,
    PlotEditForm,
    PGEditForm,
    GenericEditForm,
  };

  const Component = components[structure.component];

  return (
    <Suspense fallback={<SkeletonLoader />}>
      {Component ? (
        <Component
          listing={listing}
          form={form}
          onChange={onChange}
          furnishingsAmenities={furnishingsAmenities}
          showFurnishings={showFurnishings}
        />
      ) : (
        <GenericEditForm listing={listing} form={form} onChange={onChange} />
      )}
    </Suspense>
  );
}
