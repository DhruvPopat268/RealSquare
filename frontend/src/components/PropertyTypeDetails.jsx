import { lazy, Suspense } from "react";

// Lazy load components for better performance
const ResidentialDetails = lazy(() => import("./ResidentialDetails"));
const PlotDetails = lazy(() => import("./PlotDetails"));
const PGDetails = lazy(() => import("./PGDetails"));
const CommercialDetails = lazy(() => import("./CommercialDetails"));
const GenericDetails = lazy(() => import("./GenericDetails"));

// Loading skeleton
function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Property type detection logic
export function getPropertyStructure(listing) {
  const categoryId = listing.category?.id?.toString();
  const listingTypeId = listing.listingType?.id?.toString();
  const propertyTypeId = listing.propertyType?.id?.toString();
  
  // Priority: Listing Type (PG) > Category > Property Type
  if (listingTypeId === import.meta.env.VITE_LISTING_TYPE_PG_ID) {
    return { 
      type: 'PG', 
      data: listing.pgDetails, 
      component: 'PGDetails',
      title: 'PG Details'
    };
  }
  
  if (categoryId === import.meta.env.VITE_CATEGORY_RESIDENTIAL_ID) {
    return { 
      type: 'RESIDENTIAL', 
      data: listing.residentialDetails, 
      component: 'ResidentialDetails',
      title: 'Property Details'
    };
  }
  
  if (categoryId === import.meta.env.VITE_CATEGORY_COMMERCIAL_ID) {
    // Check if it's a plot
    const plotIds = [
      import.meta.env.VITE_COMMERCIAL_PROPERTY_TYPE_PLOT_IDS,
      import.meta.env.VITE_RESIDENTIAL_PROPERTY_TYPE_PLOT_IDS
    ].join(',').split(',').filter(Boolean);
    
    if (plotIds.includes(propertyTypeId)) {
      return { 
        type: 'PLOT', 
        data: listing.plotDetails, 
        component: 'PlotDetails',
        title: 'Plot Details'
      };
    }
    
    return { 
      type: 'COMMERCIAL', 
      data: listing.commercialDetails, 
      component: 'CommercialDetails',
      title: 'Commercial Details'
    };
  }
  
  // Fallback for unknown types
  return { 
    type: 'GENERIC', 
    data: null, 
    component: 'GenericDetails',
    title: 'Property Information'
  };
}

// Main router component
export default function PropertyTypeDetails({ listing }) {
  const structure = getPropertyStructure(listing);
  
  const components = {
    ResidentialDetails,
    PlotDetails,
    PGDetails,
    CommercialDetails,
    GenericDetails,
  };
  
  const Component = components[structure.component];
  
  if (!Component) {
    return <GenericDetails listing={listing} structure={structure} />;
  }
  
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <Component 
        data={structure.data} 
        listing={listing} 
        structure={structure}
      />
    </Suspense>
  );
}