# Requirement (Inquiry) APIs

Base URL: `https://api.realsquarevalue.com`

This document covers the APIs used by `MyInquiriesPage.jsx`, `CreateInquiryPage.jsx`, and `AssignedInquiriesPage.jsx`. Authenticated requests require the `user_token` cookie or a bearer token:

```http
Authorization: Bearer <token>
```

The customer web panel sends cookie credentials (`withCredentials: true` or `credentials: "include"`).

## 1. Shared listing-option APIs

`MyInquiriesPage` and `AssignedInquiriesPage` use these endpoints for filters. The create-requirement chatbot uses them to build the purpose, category, and property-type questions.

### Get active purposes

**GET** `/api/mixed/property-listings/active-purposes`

Loads available purposes. For the create-requirement flow, the Sell purpose is displayed as “Buy”.

### Get active categories

**GET** `/api/mixed/property-listings/active-categories`

Loads the property-category choices. PG/Co-Living requirements skip this question.

### Get active property types

**GET** `/api/mixed/property-listings/active-property-types?categoryId=<categoryId>`

Loads property types for the selected category.

These endpoints return their options in `data` as an array. For more detail, see the option API section in [propertyListing.md](./propertyListing.md).

## 2. Create a requirement

**POST** `/api/mixed/inquiries/create`

Used by the create-requirement chatbot after the user confirms the summary. Only individual-property requirements are currently supported. The chatbot sends JSON and includes the applicable property requirement field for the selected case.

### Common required fields

| Field | Type | Notes |
|---|---|---|
| `isProperty` | boolean | Must be `true` for an individual-property requirement. |
| `listingType` | ID | Active property purpose ID. |
| `preferredCity` | string | City being searched. |
| `budget.min` | number | Must be less than `budget.max`. |
| `budget.max` | number | Must be greater than `budget.min`. |
| `inquiryClassification` | string | `hot`, `warm`, or `cold`. |
| `lastFollowUpDate` | ISO 8601 date | The chatbot sends the selected date as an ISO date-time. |
| `preferredCommunication` | string array | At least one value: `call`, `whatsapp`, `email`, `sms`. |

### Optional common fields

| Field | Type | When included |
|---|---|---|
| `propertyCategory` | ID | Selected category; omitted for PG/Co-Living. |
| `propertyType` | ID | Selected property type; omitted for PG/Co-Living. |
| `preferredArea` | string | Omitted when the user skips locality. |
| `remarks` | string | Omitted when the user skips notes. |
| `furnishingType` | string | Included when selected; one of `Unfurnished`, `Semi-Furnished`, `Fully-Furnished`. |

### Detail payload cases

Include the matching detail field based on the user's property requirement. The flow submits one of `bhk`, `builtUpArea`, or `plotArea` (PG skips these).

**Residential property with BHK requirement:**

```json
{
  "isProperty": true,
  "listingType": "<purposeId>",
  "propertyCategory": "<residentialCategoryId>",
  "propertyType": "<propertyTypeId>",
  "preferredCity": "Pune",
  "preferredArea": "Baner",
  "budget": { "min": 5000000, "max": 9000000 },
  "bhk": 2,
  "furnishingType": "Semi-Furnished",
  "inquiryClassification": "hot",
  "lastFollowUpDate": "2026-10-15T00:00:00.000Z",
  "preferredCommunication": ["call", "whatsapp"],
  "remarks": "Looking for a 2 BHK near the main road"
}
```

`bhk: 0` represents 1 RK.

**Commercial non-plot property with built-up area:**

```json
{
  "isProperty": true,
  "listingType": "<purposeId>",
  "propertyCategory": "<commercialCategoryId>",
  "propertyType": "<propertyTypeId>",
  "preferredCity": "Pune",
  "budget": { "min": 10000000, "max": 20000000 },
  "builtUpArea": { "value": 1800, "unit": "sqft" },
  "furnishingType": "Unfurnished",
  "inquiryClassification": "warm",
  "lastFollowUpDate": "2026-10-15T00:00:00.000Z",
  "preferredCommunication": ["email"]
}
```

Area units are `sqft`, `sqyd`, or `sqmt`.

**Plot requirement (residential or commercial):**

```json
{
  "isProperty": true,
  "listingType": "<purposeId>",
  "propertyCategory": "<categoryId>",
  "propertyType": "<plotPropertyTypeId>",
  "preferredCity": "Pune",
  "budget": { "min": 3000000, "max": 7000000 },
  "plotArea": { "value": 2400, "unit": "sqft" },
  "inquiryClassification": "cold",
  "lastFollowUpDate": "2026-10-15T00:00:00.000Z",
  "preferredCommunication": ["sms"]
}
```

Plots do not include `furnishingType` in this flow.

**PG / Co-Living requirement:**

```json
{
  "isProperty": true,
  "listingType": "<pgPurposeId>",
  "preferredCity": "Pune",
  "budget": { "min": 8000, "max": 20000 },
  "inquiryClassification": "warm",
  "lastFollowUpDate": "2026-10-15T00:00:00.000Z",
  "preferredCommunication": ["call"]
}
```

The current flow omits `propertyCategory`, `propertyType`, `bhk`, `builtUpArea`, `plotArea`, and `furnishingType` for PG.

On success, the API creates the requirement and assignments for eligible professionals. The page displays a confirmation; it does not require the response body to continue.

### City and locality suggestions (Google Maps Places)

The Create Inquiry page uses the Google Maps JavaScript API through `ChatbotPlacesInput` to suggest cities and localities. It loads the Places library with the configured Google Maps API key, requests autocomplete predictions as the user types, and uses the Geocoder to obtain locality coordinates when a locality is selected. These are Google Maps API calls, not RealSquare backend endpoints.

## 3. My Requirements

### Get requirements created by the signed-in user

**GET** `/api/mixed/inquiries/my`

Used by My Inquiries to load the user's requirements, pagination, status/classification statistics, and filter/search results. The page requests 10 records per page and loads more as the user scrolls.

| Query parameter | Purpose |
|---|---|
| `page` | Page number; defaults to `1`. |
| `limit` | Page size; defaults to `10`. |
| `purposeId` | Filter by listing purpose ID. |
| `categoryId` | Filter by property category ID. |
| `typeId` | Filter by property type ID. |
| `status` | Filter by `active`, `inactive`, `completed`, or `expired` in the page UI. |
| `classification` | Filter by `hot`, `warm`, or `cold`. |
| `search` | Search the preferred city and area. |

Example:

```http
GET /api/mixed/inquiries/my?page=1&limit=10&status=active&classification=hot&search=Pune
```

**Response fields used by the page:**

```json
{
  "success": true,
  "data": {
    "inquiries": [],
    "pagination": { "total": 0, "page": 1, "limit": 10, "totalPages": 0 },
    "stats": {
      "total": 0,
      "active": 0,
      "expired": 0,
      "inactive": 0,
      "completed": 0,
      "rejected": 0,
      "hot": 0,
      "warm": 0,
      "cold": 0
    }
  }
}
```

### Update a requirement's status

**PATCH** `/api/mixed/inquiries/status`

Used when the owner of a requirement chooses to close an active requirement as inactive or completed. Only active requirements can be updated through this endpoint.

```json
{
  "inquiryId": "<inquiryId>",
  "status": "completed"
}
```

`status` must be `inactive` or `completed`. On success, `data` contains the updated requirement.

## 4. Assigned Requirements

### Check access and load account purchase balances

**GET** `/api/system-users/me`

Assigned Inquiries uses this request to check that the user is an Owner, Broker, or Builder and to read `activeEnquiryPlan`, `coinsPerEnquiry`, and `coinsBalance` for the unlock options. After a successful purchase, the page calls it again to refresh those balances.

No request body. The page uses `fetch` with `credentials: "include"`.

### Get requirements assigned to the signed-in user

**GET** `/api/mixed/inquiries/assigned`

Used to load assigned requirement cards, masked or unlocked requester details, pagination, and stats. The page requests 10 records at a time.

| Query parameter | Purpose |
|---|---|
| `page` | Page number; defaults to `1`. |
| `limit` | Page size; defaults to `10`. |
| `status` | Assignment filter: `active` or `purchased`. |
| `classification` | Requirement classification: `hot`, `warm`, or `cold`. |
| `purposeId` | Filter by listing purpose ID. |
| `categoryId` | Filter by property category ID. |
| `typeId` | Filter by property type ID. |
| `search` | Search city/area; requester name and mobile are searchable for purchased assignments. |

Example:

```http
GET /api/mixed/inquiries/assigned?page=1&limit=10&status=active&classification=hot&search=Pune
```

Locked assignments have requester contact details masked. Purchased assignments remain visible after the requirement closes and include the unlocked details.

**Response fields used by the page:**

```json
{
  "success": true,
  "data": {
    "assignments": [],
    "pagination": { "total": 0, "page": 1, "limit": 10, "totalPages": 0 },
    "stats": { "total": 0, "active": 0, "purchased": 0, "hot": 0, "warm": 0, "cold": 0 }
  }
}
```

Stats describe the visible assignments and are independent of the applied list filters.

### Unlock an assigned requirement

**PATCH** `/api/mixed/inquiries/purchase`

Used when an Owner, Broker, or Builder unlocks an assigned requirement. Select either one active enquiry-plan credit or coins.

```json
{
  "assignmentId": "<assignmentId>",
  "purchasedVia": "plan"
}
```

`purchasedVia` is `plan` or `coins`. On success, the response includes the purchased assignment and purchase details. The page then reloads the visible assignment pages and calls `/api/system-users/me` to refresh balances.

