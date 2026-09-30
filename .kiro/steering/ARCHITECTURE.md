# RealSquare Customer Panel — Architecture

## Overview

This is the customer-facing frontend for the RealSquare real estate platform. It is a standalone React SPA that communicates with the RealSquare Admin backend via REST API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | JavaScript (JSX) |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Styling | Tailwind CSS v3 |
| Icons | react-icons (Feather icons — `fi` prefix) |
| Charts | Recharts |
| Deployment | Vercel (`vercel.json`) |

---

## Folder Structure

```
frontend/src/
├── App.jsx                  # Root component with all route definitions
├── main.jsx                 # App entry point
├── index.css                # Global styles
├── pages/                   # One file per route/page
├── components/              # Shared reusable UI components
│   └── editForms/           # Property edit form sub-components
├── chatbot/                 # Chatbot engine, flows, and input components
├── utils/                   # API helper functions and constants
├── data/                    # Static/seed data files
└── assets/                  # Images and SVGs
```

---

## Pages

| File | Route | Purpose |
|---|---|---|
| `LoginPage.jsx` | `/login` | OTP-based user login |
| `CompleteProfilePage.jsx` | `/complete-profile` | First-time profile setup after login |
| `UpdateProfilePage.jsx` | `/profile` | Edit existing profile |
| `ChatbotPage.jsx` | `/chatbot` | Conversational property listing flow |
| `ListPropertyPage.jsx` | `/list-property` | Manual property listing form |
| `EditPropertyPage.jsx` | `/edit-property/:id` | Edit an existing property listing |
| `MyListingsPage.jsx` | `/my-property-listings` | Paginated list of user's own listings with filters |
| `PropertyDetail.jsx` | `/property/:id` | Full property detail view |
| `PropertyListPage.jsx` | `/listings` | Browse all property listings |
| `CreateInquiryPage.jsx` | `/create-inquiry` | Create a new property inquiry |
| `MyInquiriesPage.jsx` | `/my-inquiries` | Paginated list of user's own inquiries with filters |
| `AssignedInquiriesPage.jsx` | `/assigned-inquiries` | Inquiries assigned to the user (owners/brokers/builders only) |
| `PlansPage.jsx` | `/plans` | Listing plan purchase (free, coins, Razorpay) |
| `EnquiryPlansPage.jsx` | `/enquiry-plans` | Enquiry plan purchase (free, coins, Razorpay) |
| `DepositCoinsPage.jsx` | `/deposit-coins` | Purchase coins via Razorpay |
| `PaymentTransactionsPage.jsx` | `/payment-transactions` | Payment transaction history |
| `EMICalculator.jsx` | `/emi-calculator` | EMI calculator tool |
| `PropertyValueCalculator.jsx` | `/property-value-calculator` | Property value estimator |
| `PriceTrends.jsx` | `/price-trends/:city?` | City-level price trend charts |
| `DeveloperPage.jsx` | `/developer-plans` | Builder/developer plans page |
| `DeveloperProjects.jsx` | `/developer/:developerId` | Projects by a specific developer |
| `OwnersPage.jsx` | `/owners` | Property owners listing |
| `BrokerPage.jsx` | `/broker` | Broker listing page |
| `BuyersPage.jsx` | `/buy` | Buyers landing page |
| `NewsPage.jsx` | `/news` | Real estate news articles |

---

## Components

### General
| File | Purpose |
|---|---|
| `Navbar.jsx` | Main navigation — profile dropdown, mobile menu, role-based menu items |
| `Footer.jsx` | Site footer |
| `PageSpinner.jsx` | Full-page loading spinner |
| `Hero.jsx` | Homepage hero section with search |
| `PropertyCard.jsx` | Single property card |
| `PropertyCardGrid.jsx` | Grid of property cards |
| `ListingHeader.jsx` | Header for listing pages |
| `ImageSlider.jsx` | Property image carousel |
| `ContactFlow.jsx` | Contact owner/broker flow |
| `ScheduleVisit.jsx` | Schedule property visit |
| `WishlistToast.jsx` | Wishlist action feedback |
| `CityAutocomplete.jsx` | City search autocomplete |
| `LocationAutocomplete.jsx` | Location/area autocomplete |
| `PlacesAutocomplete.jsx` | Google Places autocomplete |
| `CoinIcon.jsx` | Coin balance icon |
| `FurnishingsAmenitiesDisplay.jsx` | Read-only furnishings/amenities display |

### Property Type Detail Views
| File | Purpose |
|---|---|
| `PropertyTypeDetails.jsx` | Switcher — selects correct detail component |
| `ResidentialDetails.jsx` | Residential-specific fields |
| `CommercialDetails.jsx` | Commercial-specific fields |
| `PGDetails.jsx` | PG/co-living-specific fields |
| `PlotDetails.jsx` | Plot-specific fields |
| `GenericDetails.jsx` | Fallback generic property details |

### Edit Forms (`components/editForms/`)
| File | Purpose |
|---|---|
| `EditFormShared.jsx` | Shared edit form fields |
| `PropertyTypeEditForm.jsx` | Property type selector in edit flow |
| `ResidentialEditForm.jsx` | Residential fields edit form |
| `CommercialEditForm.jsx` | Commercial fields edit form |
| `PGEditForm.jsx` | PG fields edit form |
| `PlotEditForm.jsx` | Plot fields edit form |
| `GenericEditForm.jsx` | Generic fields edit form |
| `ImageEditor.jsx` | Image upload/reorder/delete in edit flow |
| `FurnishingsAmenitiesSection.jsx` | Furnishings & amenities selector |

---

## Chatbot (`src/chatbot/`)

Conversational UI engine for guided property listing and inquiry creation.

| File | Purpose |
|---|---|
| `useChatbot.js` | Core chatbot state machine hook |
| `chatbotConstants.js` | Shared constants (step names, enums) |
| `chatbotApi.js` | API calls used within chatbot flows |
| `PropertyListingFlow.js` | Step-by-step property listing conversation flow |
| `InquiryFlow.js` | Step-by-step inquiry creation conversation flow |
| `ChatbotPlacesInput.jsx` | Places/location input widget |
| `ChatbotImageUpload.jsx` | Image upload widget |
| `ChatbotFurnishAmenitiesInput.jsx` | Furnishings & amenities selector widget |
| `ChatbotMultiSelect.jsx` | Multi-select chip input widget |
| `ChatbotNumberInput.jsx` | Numeric input widget |
| `ChatbotDateInput.jsx` | Date picker widget |

---

## Utils (`src/utils/`)

| File | Purpose |
|---|---|
| `inquiryApi.js` | `fetchMyInquiries`, `fetchAssignedInquiries` — paginated + filtered inquiry API calls |
| `myListingsApi.js` | `fetchMyListings`, `fetchActivePurposes`, `fetchActiveCategories`, `fetchActivePropertyTypes`, status update helpers |
| `listingStatusOptions.js` | Available status transitions per current listing status |

---

## Auth & Access Control

- Login is OTP-based via mobile number — handled in `LoginPage.jsx`
- Auth state is held in Navbar via a `/api/system-users/me` call on mount
- The `/me` response includes:
  - `isProfileCompleted` — gates profile-dependent UI
  - `canListProperty` — controls listing eligibility (role + credits check)
  - `haveAssignedInquiries` — `true` only for Owner/Broker/Builder roles; controls visibility of Assigned Inquiries menu item
  - `enquiryCities` — cities the user receives inquiry assignments for
  - `coinsBalance`, `activePlan`, `activeEnquiryPlan`, `rejectedPropertiesCount`
  - `showListingPlan` — `true` for Owner/Broker/Builder; controls listing plan section visibility in Navbar
  - `showEnquiryPlan` — `true` for Owner/Broker/Builder; controls enquiry plan section visibility in Navbar
- `MyListingsPage` and `AssignedInquiriesPage` perform their own `/me` guard check on mount, showing an "Access Restricted" screen for unauthorized roles and redirecting to `/login` if unauthenticated

---

## Inquiry System

- **My Inquiries** (`/my-inquiries`) — any logged-in user can create and view their own inquiries; supports infinite scroll pagination + filters (status, classification, purpose, category, property type, city/area search)
- **Assigned Inquiries** (`/assigned-inquiries`) — owners/brokers/builders only; shows inquiries auto-assigned based on their `enquiryCities`; supports same filter set plus assignment status (active/purchased) and search by city, area, name, mobile; contact details masked until purchased

---

## Plans System

Two separate plan types are available to Owner, Broker, and Builder users. Both are only shown in the Navbar profile dialog when `user.showListingPlan` / `user.showEnquiryPlan` is `true`.

### Listing Plans (`/plans` → `PlansPage.jsx`)
Controls how many property listings a user can create.

| Purchase Method | Endpoint |
|---|---|
| Free | `POST /api/mixed/purchased-plans/purchase` |
| Coins | `POST /api/mixed/purchased-plans/purchase` |
| Online (new) | `POST /api/mixed/purchased-plans/create-order` → Razorpay → webhook |
| Online (change) | `POST /api/mixed/purchased-plans/change-plan-order` → Razorpay → webhook |
| Change (free/coins) | `POST /api/mixed/purchased-plans/change-plan` |
| Cancel order | `PATCH /api/mixed/purchased-plans/cancel/:transactionId` |

### Enquiry Plans (`/enquiry-plans` → `EnquiryPlansPage.jsx`)
Controls how many enquiry contact details a user can unlock.

| Purchase Method | Endpoint |
|---|---|
| Free | `POST /api/mixed/enquiry-plans/purchase` |
| Coins | `POST /api/mixed/enquiry-plans/purchase` |
| Online (new) | `POST /api/mixed/enquiry-plans/create-order` → Razorpay → webhook |
| Online (change) | `POST /api/mixed/enquiry-plans/change-plan-order` → Razorpay → webhook |
| Change (free/coins) | `POST /api/mixed/enquiry-plans/change-plan` |
| Cancel order | `PATCH /api/mixed/enquiry-plans/cancel/:transactionId` |

Both pages follow the same UX pattern:
- Expiry tabs (dynamic from `expiryTabs` in API response)
- Plan cards showing price (free / coins / ₹amount), features, and action buttons
- Coins confirmation modal before deducting wallet balance
- Razorpay modal for online payment; on dismiss calls cancel endpoint
- On success: sets `sessionStorage.openProfile = "1"` and redirects to `/` (Navbar auto-opens profile dialog)

---

## API Communication

- Base URL: `VITE_API_URL` env variable (e.g. `http://192.168.0.184:5000`)
- All requests use `{ withCredentials: true }` to send the JWT cookie
- Backend routes consumed: `/api/system-users/*`, `/api/mixed/*`, `/api/admin/*` (read-only for dropdowns)

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps / Places API key |
| `VITE_CUSTOMER_ROLE_ID` | Customer role ObjectId |
| `VITE_OWNER_ROLE_ID` | Owner role ObjectId |
| `VITE_BROKER_ROLE_ID` | Broker role ObjectId |
| `VITE_BUILDER_ROLE_ID` | Builder role ObjectId |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key |
| `VITE_CATEGORY_COMMERCIAL_ID` | Commercial property category ObjectId |
| `VITE_CATEGORY_RESIDENTIAL_ID` | Residential property category ObjectId |
| `VITE_LISTING_TYPE_SELL_ID` | Sell listing type ObjectId |
| `VITE_LISTING_TYPE_RENT_ID` | Rent listing type ObjectId |
| `VITE_LISTING_TYPE_PG_ID` | PG listing type ObjectId |
