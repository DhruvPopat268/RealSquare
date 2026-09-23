/**
 * Returns the available status transitions for a listing based on its current
 * status and listing type ID (compared against VITE_ env vars).
 *
 * Rules (customer — owner only):
 *   Active      → Inactive, Sold (Sell only), Rented (Rent/PG only)
 *   Inactive    → Active
 *   Sold        → Active
 *   Rented      → Active
 *   UnderReview → (no transitions allowed)
 *   Rejected    → (no transitions allowed)
 *
 * @param {string} currentStatus   — e.g. "Active"
 * @param {string} listingTypeId   — the listingType._id string from the listing
 * @returns {{ value, label, apiAction, confirmTitle, confirmMessage, color }[]}
 */
export function getAvailableStatusOptions(currentStatus, listingTypeId) {
  const SELL_ID = import.meta.env.VITE_LISTING_TYPE_SELL_ID;
  const RENT_ID = import.meta.env.VITE_LISTING_TYPE_RENT_ID;
  const PG_ID   = import.meta.env.VITE_LISTING_TYPE_PG_ID;

  const isSell     = listingTypeId === SELL_ID;
  const isRentOrPG = listingTypeId === RENT_ID || listingTypeId === PG_ID;

  switch (currentStatus) {
    case "Active": {
      const opts = [
        {
          value:          "Inactive",
          label:          "Mark as Inactive",
          apiAction:      "markInactive",
          confirmTitle:   "Mark Listing Inactive?",
          confirmMessage: "This listing will be hidden from search results. You can reactivate it anytime.",
          color:          "gray",
        },
      ];
      if (isSell) {
        opts.push({
          value:          "Sold",
          label:          "Mark as Sold",
          apiAction:      "markSold",
          confirmTitle:   "Mark Listing as Sold?",
          confirmMessage: "This will mark your property as sold. The listing will no longer appear in active searches.",
          color:          "blue",
        });
      }
      if (isRentOrPG) {
        opts.push({
          value:          "Rented",
          label:          "Mark as Rented",
          apiAction:      "markRented",
          confirmTitle:   "Mark Listing as Rented?",
          confirmMessage: "This will mark your property as rented. The listing will no longer appear in active searches.",
          color:          "teal",
        });
      }
      return opts;
    }

    case "Inactive":
    case "Sold":
    case "Rented":
      return [
        {
          value:          "Active",
          label:          "Mark as Active",
          apiAction:      "markActive",
          confirmTitle:   "Reactivate Listing?",
          confirmMessage: "This listing will become visible in search results again.",
          color:          "green",
        },
      ];

    // No transitions allowed
    case "UnderReview":
    case "Rejected":
    default:
      return [];
  }
}

/**
 * Color config for each option's button / badge styling.
 */
export const OPTION_COLOR_CONFIG = {
  gray:  { btn: "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200",    confirmBtn: "bg-gray-600 hover:bg-gray-700 text-white"   },
  blue:  { btn: "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200",     confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white"    },
  teal:  { btn: "bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-200",     confirmBtn: "bg-teal-600 hover:bg-teal-700 text-white"    },
  green: { btn: "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200", confirmBtn: "bg-green-600 hover:bg-green-700 text-white"  },
};
