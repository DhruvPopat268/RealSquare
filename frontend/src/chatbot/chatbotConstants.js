// Static option for Q1 — no API needed
export const LISTING_MODE_OPTIONS = ["Property Listing", "Project Listing"];

// Maps purpose name → purposeKey used in final payload
export const PURPOSE_KEY_MAP = {
  "Buy":          "sellInfo",
  "Rent":         "rentInfo",
  "Pg/Co-Living": "rentInfo",
};

// Construction status options for sellInfo
export const CONSTRUCTION_STATUS_OPTIONS = ["Ready to Move", "Under Construction"];
export const CONSTRUCTION_STATUS_MAP = {
  "Ready to Move":      "ReadyToMove",
  "Under Construction": "UnderConstruction",
};

// Security deposit type options for rentInfo
export const SECURITY_DEPOSIT_OPTIONS = ["1 Month", "2 Months", "3 Months", "Custom Amount"];
export const SECURITY_DEPOSIT_MAP = {
  "1 Month":      "1Month",
  "2 Months":     "2Month",
  "3 Months":     "3Month",
  "Custom Amount": "Custom",
};

// Area unit options
export const AREA_UNIT_OPTIONS = ["sqft", "sqyd", "sqmt"];

// BHK options
export const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6 BHK", "7 BHK", "8 BHK", "9 BHK", "10 BHK", "11 BHK", "12 BHK"];

// Furnish type options
export const FURNISH_TYPE_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];

// PG options
export const PG_FOR_OPTIONS          = ["Boys", "Girls", "Both"];
export const PG_SUITED_FOR_OPTIONS   = ["Students", "Professionals", "Family"];
export const PG_MEALS_OPTIONS        = ["Breakfast", "Lunch", "Dinner"];
export const PG_COMMON_AREA_OPTIONS  = ["Kitchen", "Gym", "Parking", "Laundry", "TV Room", "Terrace"];
export const PG_ROOM_TYPE_OPTIONS    = ["1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing", "5 Sharing", "6 Sharing", "7 Sharing"];
export const PG_ROOM_TYPE_MAP        = {
  "1 Sharing": "Single", "2 Sharing": "Double", "3 Sharing": "Triple",
  "4 Sharing": "4 Sharing", "5 Sharing": "5 Sharing", "6 Sharing": "6 Sharing", "7 Sharing": "7 Sharing",
};

// Commercial options
export const COMMERCIAL_ZONE_TYPE_OPTIONS = ["Industrial", "Commercial", "Residential", "SEZ", "OpenSpaces", "Agricultural", "Others"];
export const COMMERCIAL_LOCATION_HUB_OPTIONS = ["IT Park", "Business Park", "Mall", "Commercial Project", "Residential Project", "Retail Complex/Building", "Market/High Street", "Others"];
export const COMMERCIAL_OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "CooperativeSociety", "PowerOfAttorney"];

// IDs from env — residential plot type IDs (comma separated)
export const RESIDENTIAL_PLOT_IDS    = (import.meta.env.VITE_RESIDENTIAL_PROPERTY_TYPE_PLOT_IDS ?? "").split(",").filter(Boolean);
export const COMMERCIAL_PLOT_IDS     = (import.meta.env.VITE_COMMERCIAL_PROPERTY_TYPE_PLOT_IDS  ?? "").split(",").filter(Boolean);
export const COMMERCIAL_OFFICE_IDS   = (import.meta.env.VITE_COMMERCIAL_PROPERTY_TYPE_OFFICE_IDS ?? "").split(",").filter(Boolean);
export const COMMERCIAL_OTHERS_IDS   = (import.meta.env.VITE_COMMERCIAL_PROPERTY_TYPE_OTHERS_IDS ?? "").split(",").filter(Boolean);

// Category IDs from env
export const CATEGORY_RESIDENTIAL_ID = import.meta.env.VITE_CATEGORY_RESIDENTIAL_ID;
export const CATEGORY_COMMERCIAL_ID  = import.meta.env.VITE_CATEGORY_COMMERCIAL_ID;

// Listing type IDs from env
export const LISTING_TYPE_SELL_ID = import.meta.env.VITE_LISTING_TYPE_SELL_ID;
export const LISTING_TYPE_RENT_ID = import.meta.env.VITE_LISTING_TYPE_RENT_ID;
export const LISTING_TYPE_PG_ID   = import.meta.env.VITE_LISTING_TYPE_PG_ID;
