# Property Listing APIs

Base URL: `https://api.realsquarevalue.com`

These APIs cover the customer panel's property listing chatbot, My Property Listings page, and Edit Property page. Authenticated requests use the `user_token` cookie or a bearer token. The web panel sends cookie credentials (`withCredentials: true` or `credentials: "include"`).

## 1. Listing option APIs

These active-option endpoints are used to populate purpose, category, property type, furnishing, and amenity choices. They are called from the chatbot, My Property Listings filters, and/or Edit Property form as noted.

### Get active listing purposes

**GET** `/api/mixed/property-listings/active-purposes`

Used by the chatbot to ask what the user wants to do with the property, and by My Property Listings/Edit Property to populate purpose options.

### Get active categories

**GET** `/api/mixed/property-listings/active-categories`

Used by the chatbot and Edit Property form for categories such as Residential and Commercial, and by My Property Listings for its category filter. The chatbot skips category selection for PG listings.

### Get active property types

**GET** `/api/mixed/property-listings/active-property-types?categoryId=<categoryId>`

Used to populate property types for a selected category in the chatbot, My Property Listings filter, and Edit Property form. `categoryId` is supplied by the selected category.

### Get active furnishings and amenities

**GET** `/api/mixed/property-listings/active-furnishings-amenities`

Used by Edit Property when the listing type/category/property type supports a furnishings section. The response supplies the available furnishings and amenities options.

**Response shape used by the frontend:**

```json
{
  "success": true,
  "data": {
    "furnishings": [],
    "amenities": []
  }
}
```

## 2. My Property Listings

### Get the signed-in user's listings

**GET** `/api/mixed/property-listings/my-listings`

Used to display the user's listings, counts, and pagination. The page requests 10 records at a time and loads further pages as the user scrolls. Filters are optional and may be combined.

**Query parameters:**

| Parameter | Purpose |
|---|---|
| `page` | Page number; used for paginated listing results. |
| `limit` | Maximum records per page. |
| `status` | Filter by listing status, e.g. `Active`, `UnderReview`, `Sold`, `Rented`, `Rejected`, or `Inactive`. |
| `purposeId` | Filter by listing purpose ID. |
| `categoryId` | Filter by property category ID. |
| `typeId` | Filter by property type ID. |

Example:

```http
GET /api/mixed/property-listings/my-listings?page=1&limit=10&status=Active&categoryId=<categoryId>
```

**Paginated response fields used by the page:**

```json
{
  "success": true,
  "data": {
    "properties": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 0,
      "hasMore": false
    },
    "stats": {
      "total": 0,
      "Active": 0,
      "UnderReview": 0,
      "Inactive": 0,
      "Sold": 0,
      "Rented": 0,
      "Rejected": 0
    }
  }
}
```

The page uses `properties` for cards, `pagination` to decide whether to fetch another page, and `stats` for status totals. The first-page response is expected to include `stats`.

### Change a listing's status

The page sends an empty JSON object with each request. The listing ID is part of the URL.

| Method and endpoint | Usage |
|---|---|
| **PATCH** `/api/mixed/property-listings/mark-inactive/:id` | Mark a listing inactive. |
| **PATCH** `/api/mixed/property-listings/mark-active/:id` | Mark a listing active. |
| **PATCH** `/api/mixed/property-listings/mark-sold/:id` | Mark a listing sold. |
| **PATCH** `/api/mixed/property-listings/mark-rented/:id` | Mark a listing rented. |

```json
{}
```

The page uses the returned `data.status` to update the listing card and status counts.

## 3. Read a property for editing

**GET** `/api/mixed/property-listings/:id`

Used by Edit Property to load the selected listing's current details and media. The page reads the listing fields to initialize the form and reads:

- `media.images` for the existing image gallery.
- `media.videos.videoUrl` and `media.videos.ytVideoUrl` for the uploaded video and YouTube video link.
- `media.reelVideo.reelUrl` and `media.reelVideo.ytReelUrl` for the uploaded reel and YouTube reel link.

The `:id` is the property listing ID. No request body.

## 4. Create a listing from the chatbot

**POST** `/api/mixed/property-listings`

Used after the chatbot has collected the listing details. The JSON body contains the listing type/category/property type IDs, city/locality, one applicable property-detail object, and the applicable purpose object. The chatbot sends the detail section selected by the listing case as a top-level field.

### Common payload structure

```json
{
  "categoryId": "<categoryId>",
  "listingTypeId": "<listingTypeId>",
  "propertyTypeId": "<propertyTypeId>",
  "cityName": "Pune",
  "locality": {
    "address": "Baner, Pune",
    "latitude": 18.559,
    "longitude": 73.786
  },
  "<detailSection>": {},
  "<purposeSection>": {}
}
```

Send the applicable case fields below. Do not send the placeholder keys literally.

### Payload cases

**Residential non-plot, sale:**

```json
{
  "categoryId": "<residentialCategoryId>",
  "listingTypeId": "<sellListingTypeId>",
  "propertyTypeId": "<propertyTypeId>",
  "cityName": "Pune",
  "locality": { "address": "Baner, Pune", "latitude": 18.559, "longitude": 73.786 },
  "residentialDetails": { "bhk": 2 },
  "sellInfo": { "price": 7500000 }
}
```

**Residential non-plot, rent:**

```json
{
  "categoryId": "<residentialCategoryId>",
  "listingTypeId": "<rentListingTypeId>",
  "propertyTypeId": "<propertyTypeId>",
  "cityName": "Pune",
  "locality": { "address": "Baner, Pune", "latitude": 18.559, "longitude": 73.786 },
  "residentialDetails": { "bhk": 3 },
  "rentInfo": { "monthlyRent": 25000 }
}
```

**Residential plot, sale:**

```json
{
  "categoryId": "<residentialCategoryId>",
  "listingTypeId": "<sellListingTypeId>",
  "propertyTypeId": "<plotPropertyTypeId>",
  "cityName": "Pune",
  "locality": { "address": "Baner, Pune", "latitude": 18.559, "longitude": 73.786 },
  "plotDetails": {
    "plotArea": { "value": 2000, "unit": "sqft" },
    "length": 50,
    "width": 40
  },
  "sellInfo": { "price": 9000000 }
}
```

**Residential plot, rent:**

```json
{
  "categoryId": "<residentialCategoryId>",
  "listingTypeId": "<rentListingTypeId>",
  "propertyTypeId": "<plotPropertyTypeId>",
  "cityName": "Pune",
  "locality": { "address": "Baner, Pune", "latitude": 18.559, "longitude": 73.786 },
  "plotDetails": {
    "plotArea": { "value": 1500, "unit": "sqyd" },
    "length": 60,
    "width": 45
  },
  "rentInfo": { "monthlyRent": 15000 }
}
```

**Commercial non-plot, sale:**

```json
{
  "categoryId": "<commercialCategoryId>",
  "listingTypeId": "<sellListingTypeId>",
  "propertyTypeId": "<propertyTypeId>",
  "cityName": "Pune",
  "locality": { "address": "Koregaon Park, Pune", "latitude": 18.536, "longitude": 73.893 },
  "commercialDetails": {
    "builtUpArea": { "value": 1800, "unit": "sqft" },
    "carpetArea": { "value": 1400, "unit": "sqft" }
  },
  "sellInfo": { "price": 12000000 }
}
```

**Commercial non-plot, rent:**

```json
{
  "categoryId": "<commercialCategoryId>",
  "listingTypeId": "<rentListingTypeId>",
  "propertyTypeId": "<officePropertyTypeId>",
  "cityName": "Mumbai",
  "locality": { "address": "BKC, Mumbai", "latitude": 19.065, "longitude": 72.869 },
  "commercialDetails": {
    "builtUpArea": { "value": 2500, "unit": "sqft" },
    "carpetArea": { "value": 2000, "unit": "sqft" }
  },
  "rentInfo": { "monthlyRent": 125000 }
}
```

**Commercial plot, sale:**

```json
{
  "categoryId": "<commercialCategoryId>",
  "listingTypeId": "<sellListingTypeId>",
  "propertyTypeId": "<commercialPlotPropertyTypeId>",
  "cityName": "Chennai",
  "locality": { "address": "OMR, Chennai", "latitude": 12.847, "longitude": 80.224 },
  "commercialDetails": {
    "plotArea": { "value": 5000, "unit": "sqft" },
    "length": 100,
    "width": 50
  },
  "sellInfo": { "price": 25000000 }
}
```

**Commercial plot, rent:**

```json
{
  "categoryId": "<commercialCategoryId>",
  "listingTypeId": "<rentListingTypeId>",
  "propertyTypeId": "<commercialPlotPropertyTypeId>",
  "cityName": "Hyderabad",
  "locality": { "address": "HITEC City, Hyderabad", "latitude": 17.448, "longitude": 78.381 },
  "commercialDetails": {
    "plotArea": { "value": 3000, "unit": "sqmt" },
    "length": 80,
    "width": 60
  },
  "rentInfo": { "monthlyRent": 75000 }
}
```

**Commercial "Others" property type, sale:**

```json
{
  "categoryId": "<commercialCategoryId>",
  "listingTypeId": "<sellListingTypeId>",
  "propertyTypeId": "<othersCommercialPropertyTypeId>",
  "cityName": "Delhi",
  "locality": { "address": "Connaught Place, Delhi", "latitude": 28.631, "longitude": 77.219 },
  "commercialDetails": {
    "propertyType": "Co-working Space",
    "builtUpArea": { "value": 3000, "unit": "sqft" },
    "carpetArea": { "value": 2700, "unit": "sqft" }
  },
  "sellInfo": { "price": 18000000 }
}
```

**Commercial "Others" property type, rent:**

```json
{
  "categoryId": "<commercialCategoryId>",
  "listingTypeId": "<rentListingTypeId>",
  "propertyTypeId": "<othersCommercialPropertyTypeId>",
  "cityName": "Bangalore",
  "locality": { "address": "Whitefield, Bangalore", "latitude": 12.970, "longitude": 77.750 },
  "commercialDetails": {
    "propertyType": "Event Hall",
    "builtUpArea": { "value": 4000, "unit": "sqft" },
    "carpetArea": { "value": 3500, "unit": "sqft" }
  },
  "rentInfo": { "monthlyRent": 200000 }
}
```

**PG / co-living (single room type):**

```json
{
  "categoryId": "<residentialCategoryId>",
  "listingTypeId": "<pgListingTypeId>",
  "cityName": "Pune",
  "locality": { "address": "Viman Nagar, Pune", "latitude": 18.567, "longitude": 73.914 },
  "pgDetails": {
    "pgName": "Green View PG",
    "totalBedsAvailable": 12,
    "rooms": [
      { "roomType": "2 Sharing", "bedsAvailable": 12, "rent": 9000, "securityDeposit": 9000 }
    ]
  }
}
```

**PG / co-living (multiple room types):**

```json
{
  "categoryId": "<residentialCategoryId>",
  "listingTypeId": "<pgListingTypeId>",
  "cityName": "Mumbai",
  "locality": { "address": "Andheri West, Mumbai", "latitude": 19.135, "longitude": 72.826 },
  "pgDetails": {
    "pgName": "Student Paradise PG",
    "totalBedsAvailable": 18,
    "rooms": [
      { "roomType": "1 Sharing", "bedsAvailable": 2, "rent": 15000, "securityDeposit": 15000 },
      { "roomType": "2 Sharing", "bedsAvailable": 8, "rent": 12000, "securityDeposit": 12000 },
      { "roomType": "3 Sharing", "bedsAvailable": 8, "rent": 10000, "securityDeposit": 10000 }
    ]
  }
}
```

**Important Notes for Chatbot Payloads:**

- **PG listings do not include `propertyTypeId`** - The chatbot skips property type selection for PG/Co-living
- **Commercial "Others" types include custom `propertyType`** - When propertyTypeId is for "Others", the chatbot collects a custom property type string
- **Plot area validation** - The chatbot validates that `length × width = plotArea.value` (with unit conversion)
- **Carpet area validation** - The chatbot ensures `carpetArea.value ≤ builtUpArea.value`
- **PG room sharing** - For "1 Sharing" rooms, `bedsAvailable` is automatically set and not sent in payload
- **Area units supported** - "sqft", "sqyd", "sqmt" 
- **BHK mapping** - "1 RK" maps to `bhk: 0`, "X BHK" maps to `bhk: X`
- **Required fields only** - Chatbot sends only the minimal required fields; optional fields like `societyName`, `furnishings`, `amenities`, etc. are added later via Edit Property

The chatbot uses `sellInfo: { "price": <number> }` for sale listings and `rentInfo: { "monthlyRent": <number> }` for rental listings. PG details are submitted under `pgDetails` and do not include sell/rent info.

The response's `data._id` is used as the `propertyId` for the following media upload.

> The chatbot's initial submission uploads images through the media endpoint below. This flow does not submit the Edit Property page's video/reel fields.

## 5. Update a property

### Update listing fields

**PATCH** `/api/mixed/property-listings`

Used by Edit Property to save changed property fields. This is a partial update: the JSON body contains `propertyListingId` and only the fields that changed. For nested detail sections, the page sends only the changed keys inside each section. For example, changing only `bhk` sends `residentialDetails` with `bhk`, rather than resending every residential field. If `availableFrom` changes, the page also includes the selected `constructionStatus` in that section.

### Common partial-update structure

```json
{
  "propertyListingId": "<propertyListingId>",
  "<changedFieldOrSection>": "<changedValue>"
}
```

### Detail diff cases

These examples show the body sent when detail fields change. Include only sections with changes.

**Residential non-plot details (field enums):**
- `builtUpArea.unit`, `carpetArea.unit`: `["sqft", "sqyd", "sqmt"]`
- `constructionStatus`: `["UnderConstruction", "ReadyToMove"]`
- `propertyStatus`: `["NewlyAdded", "Relaunch"]`
- `furnishType`: `["Unfurnished", "Semi-Furnished", "Fully-Furnished"]`

**Residential non-plot details (complete payload reference):**
*Send only the fields that actually changed - this shows all possible residential non-plot fields*

```json
{
  "propertyListingId": "<propertyListingId>",
  "residentialDetails": {
    "societyName": "Sunrise Apartments",
    "bhk": 3,
    "builtUpArea": { "value": 1600, "unit": "sqft" },
    "carpetArea": { "value": 1200, "unit": "sqft" },
    "constructionStatus": "ReadyToMove",
    "propertyStatus": "NewlyAdded", 
    "ageOfProperty": 5,
    "availableFrom": "2027-06-15",
    "furnishType": "Semi-Furnished",
    "furnishings": [
      { "id": "<furnishingId1>", "name": "Bed", "count": 2 },
      { "id": "<furnishingId2>", "name": "Wardrobe", "count": 1 }
    ],
    "amenities": [
      { "id": "<amenityId1>", "name": "WiFi" },
      { "id": "<amenityId2>", "name": "Parking" }
    ]
  }
}
```

**Residential non-plot details (partial update example):**

```json
{
  "propertyListingId": "<propertyListingId>",
  "residentialDetails": {
    "bhk": 3,
    "builtUpArea": { "value": 1600, "unit": "sqft" }
  }
}
```

**Residential plot details (field enums):**
*Send only the fields that actually changed - this shows all possible residential plot fields*

```json
{
  "propertyListingId": "<propertyListingId>",
  "plotDetails": {
    "societyName": "Green Valley Layout",
    "plotArea": { "value": 2400, "unit": "sqft" },
    "length": 60,
    "width": 40
  }
}
```

**Residential plot details (partial update example):**

```json
{
  "propertyListingId": "<propertyListingId>",
  "plotDetails": {
    "plotArea": { "value": 2400, "unit": "sqft" }
  }
}
```

**Residential plot field enums:**
- `plotArea.unit`: `["sqft", "sqyd", "sqmt"]`

**Commercial non-plot details excluding office (complete payload reference):**
*Send only the fields that actually changed - for Shop, Showroom, Warehouse, Others types*

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "societyName": "Tech Tower",
    "propertyType": "Co-working Space",
    "zoneType": "Commercial",
    "locationHub": "IT Park", 
    "builtUpArea": { "value": 2000, "unit": "sqft" },
    "carpetArea": { "value": 1500, "unit": "sqft" },
    "constructionStatus": "UnderConstruction",
    "propertyStatus": "Relaunch",
    "ageOfProperty": 3,
    "availableFrom": "2027-04-01",
    "ownership": "Freehold",
    "totalFloors": 15,
    "yourFloor": "8th Floor",
    "furnishType": "Fully-Furnished",
    "furnishings": [
      { "id": "<deskFurnishingId>", "name": "Desk", "count": 25 },
      { "id": "<chairFurnishingId>", "name": "Chair", "count": 30 }
    ],
    "amenities": [
      { "id": "<wifiAmenityId>", "name": "WiFi" },
      { "id": "<parkingAmenityId>", "name": "Parking" }
    ]
  }
}
```

**Commercial non-plot details excluding office (partial update example):**

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "builtUpArea": { "value": 2000, "unit": "sqft" },
    "carpetArea": { "value": 1500, "unit": "sqft" }
  }
}
```

**Commercial non-plot field enums:**
- `builtUpArea.unit`, `carpetArea.unit`, `plotArea.unit`: `["sqft", "sqyd", "sqmt"]`
- `zoneType`: `["Industrial", "Commercial", "Residential", "SEZ", "OpenSpaces", "Agricultural", "Others"]`
- `locationHub`: `["IT Park", "Business Park", "Mall", "Commercial Project", "Residential Project", "Retail Complex/Building", "Market/High Street", "Others"]`
- `constructionStatus`: `["UnderConstruction", "ReadyToMove"]`
- `propertyStatus`: `["NewlyAdded", "Relaunch"]`
- `ownership`: `["Freehold", "Leasehold", "CooperativeSociety", "PowerOfAttorney"]`
- `furnishType`: `["Unfurnished", "Semi-Furnished", "Fully-Furnished"]`

**Commercial non-plot details including office (complete payload reference):**
*Send only the fields that actually changed - for Office type with additional office specifications*

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "societyName": "Corporate Hub",
    "zoneType": "Commercial",
    "locationHub": "Business Park", 
    "builtUpArea": { "value": 3000, "unit": "sqft" },
    "carpetArea": { "value": 2500, "unit": "sqft" },
    "constructionStatus": "ReadyToMove",
    "propertyStatus": "NewlyAdded",
    "ageOfProperty": 2,
    "ownership": "Freehold",
    "totalFloors": 20,
    "yourFloor": "12th Floor",
    "minSeats": 50,
    "minCabins": 8,
    "minMeetingRooms": 4,
    "furnishType": "Fully-Furnished",
    "furnishings": [
      { "id": "<deskFurnishingId>", "name": "Office Desk", "count": 50 },
      { "id": "<chairFurnishingId>", "name": "Office Chair", "count": 60 }
    ],
    "amenities": [
      { "id": "<wifiAmenityId>", "name": "High-Speed WiFi" },
      { "id": "<parkingAmenityId>", "name": "Reserved Parking" },
      { "id": "<securityAmenityId>", "name": "24/7 Security" }
    ]
  }
}
```

**Commercial non-plot details including office (partial update example):**

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "minSeats": 50,
    "minCabins": 8,
    "minMeetingRooms": 4
  }
}
```

**Commercial office field enums:**
*Same as commercial non-plot above, plus office-specific numeric fields:*
- `minSeats`: Number (office workstations)
- `minCabins`: Number (private cabins)
- `minMeetingRooms`: Number (meeting rooms)

**Commercial plot details (complete payload reference):**
*Send only the fields that actually changed - this shows all possible commercial plot fields*

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "societyName": "Industrial Park",
    "plotArea": { "value": 5000, "unit": "sqft" },
    "length": 100,
    "width": 50,
    "zoneType": "Industrial",
    "locationHub": "Industrial Park",
    "ownership": "Freehold"
  }
}
```

**Commercial plot details (partial update example):**

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "plotArea": { "value": 5000, "unit": "sqft" },
    "length": 100,
    "width": 50
  }
}
```

**Commercial plot field enums:**
- `plotArea.unit`: `["sqft", "sqyd", "sqmt"]`
- `zoneType`: `["Industrial", "Commercial", "Residential", "SEZ", "OpenSpaces", "Agricultural", "Others"]`
- `locationHub`: `["IT Park", "Business Park", "Mall", "Commercial Project", "Residential Project", "Retail Complex/Building", "Market/High Street", "Others"]`
- `ownership`: `["Freehold", "Leasehold", "CooperativeSociety", "PowerOfAttorney"]`

**PG details (complete payload reference):**
*Send only the fields that actually changed - this shows all possible PG fields*

```json
{
  "propertyListingId": "<propertyListingId>",
  "pgDetails": {
    "pgName": "Student Paradise PG",
    "totalBedsAvailable": 24,
    "pgFor": "Both",
    "bestSuitedFor": ["Students", "Professionals"],
    "mealsAvailable": true,
    "meals": ["Breakfast", "Lunch", "Dinner"],
    "noticePeriod": 30,
    "lockInPeriod": 90,
    "commonAreas": ["Living Room", "Kitchen", "Study Room", "Gym"],
    "constructionStatus": "ReadyToMove",
    "ageOfProperty": 2,
    "availableFrom": "2027-03-01",
    "furnishType": "Fully-Furnished",
    "furnishings": [
      { "id": "<bedFurnishingId>", "name": "Bed", "count": 24 },
      { "id": "<wardrobeFurnishingId>", "name": "Wardrobe", "count": 24 },
      { "id": "<studyTableFurnishingId>", "name": "Study Table", "count": 24 }
    ],
    "amenities": [
      { "id": "<wifiAmenityId>", "name": "WiFi" },
      { "id": "<laundryAmenityId>", "name": "Laundry Service" },
      { "id": "<foodAmenityId>", "name": "Mess Facility" }
    ],
    "rooms": [
      { "roomType": "1 Sharing", "bedsAvailable": 2, "rent": 15000, "securityDeposit": 15000 },
      { "roomType": "2 Sharing", "bedsAvailable": 6, "rent": 12000, "securityDeposit": 12000 },
      { "roomType": "3 Sharing", "bedsAvailable": 9, "rent": 10000, "securityDeposit": 10000 }
    ]
  }
}
```

**PG details (partial update example):**

```json
{
  "propertyListingId": "<propertyListingId>",
  "pgDetails": {
    "pgName": "Green View PG",
    "totalBedsAvailable": 24,
    "pgFor": "Both"
  }
}
```

**PG field enums:**
- `pgFor`: `["Girls", "Boys", "Both"]`
- `bestSuitedFor`: `["Students", "Professionals"]` (array)
- `meals`: `["Breakfast", "Lunch", "Dinner"]` (array)
- `commonAreas`: `["Living Room", "Kitchen", "Dining Area", "Bathroom", "Balcony", "Terrace", "Laundry Room", "Study Room", "Gym", "Parking"]` (array)
- `constructionStatus`: `["UnderConstruction", "ReadyToMove"]`
- `furnishType`: `["Unfurnished", "Semi-Furnished", "Fully-Furnished"]`
- `rooms[].roomType`: `["1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing", "5 Sharing", "6 Sharing", "7 Sharing"]`

**Sell info (complete payload reference):**
*Send only the fields that actually changed - this shows all possible sell info fields*

```json
{
  "propertyListingId": "<propertyListingId>",
  "sellInfo": {
    "price": 8000000
  }
}
```

**Rent info (complete payload reference):**
*Send only the fields that actually changed - this shows all possible rent info fields*

```json
{
  "propertyListingId": "<propertyListingId>",
  "rentInfo": {
    "monthlyRent": 25000,
    "securityDeposit": 75000,
    "availableFrom": "2026-12-01"
  }
}
```

**Purpose details (partial update examples):**

```json
{
  "propertyListingId": "<propertyListingId>",
  "sellInfo": { "price": 8000000 }
}
```

```json
{
  "propertyListingId": "<propertyListingId>",
  "rentInfo": { "monthlyRent": 30000, "securityDeposit": 60000 }
}
```

**Other top-level fields (complete payload reference):**
*Send only the fields that actually changed - these can be mixed with detail sections*

```json
{
  "propertyListingId": "<propertyListingId>",
  "cityName": "Mumbai",
  "locality": {
    "address": "Andheri West, Mumbai", 
    "latitude": 19.135,
    "longitude": 72.826
  },
  "reraId": "PR/MH/MUMBAI/MUMBAI CITY/REALTORSHUB001234",
  "zeroBrokerage": true
}
```

**Field validation notes:**
- To clear RERA ID, send `"reraId": null`
- `zeroBrokerage` field is only applicable for broker listings
- `carpetArea.value` must be ≤ `builtUpArea.value` when both are provided
- `availableFrom` is only allowed when `constructionStatus` is "UnderConstruction"
- When changing `availableFrom`, include `constructionStatus` in the same payload section
- For commercial "Others" types, `propertyType` field is required
- For furnishings, `count` field is required; for amenities, `count` is optional

**Other field enums:**
- `rera.reraStatus`: `["unverified", "verified"]`
- `rera.projectDetails.confidence`: `["high", "low", "unknown"]`
- Property listing `status`: `["Active", "Inactive", "Sold", "Rented", "UnderReview", "Rejected"]` (read-only via PATCH)

Other top-level fields that may be included when changed are `cityName`, `locality`, `reraId` (send `null` to clear it), and `zeroBrokerage`.

Images and video/reel media are sent separately using the media endpoint.

### Media create/update payload cases

Both endpoints use `multipart/form-data`.

#### POST `/api/mixed/property-listings/media` — chatbot initial upload

The chatbot sends this request after creating the listing and collecting at least one image. It appends each image file as `images`.

```text
propertyId: <id returned by POST /api/mixed/property-listings>
images: <image file>      (repeat once per image)
```

#### PATCH `/api/mixed/property-listings/media` — edit media diff

Send this request only if images or video/reel values changed. Do not send it when the user made no media changes. Include `propertyListingId` in every PATCH payload case.

**Image-only change** — include when images are added, removed, or reordered. `existingImages` is the JSON array of existing image URLs to retain, in the desired order. Include `images` and `isPrimary` only when uploading new files. `isPrimary` applies only to those newly uploaded files; it has one boolean per `images` file, in the same order. It cannot mark an already-existing image as primary.

```text
propertyListingId: <propertyListingId>
existingImages: ["<kept-image-url-1>", "<kept-image-url-2>"]  (JSON string)
images: <new image file>                                         (repeat per new file; only when adding)
isPrimary: [true]                                                (JSON string; only with new files)
```

Example diff payload — keep two existing images and upload one new image as primary:

```text
propertyListingId: <propertyListingId>
existingImages: ["<existing-image-url-1>", "<existing-image-url-2>"]
images: <new-image-file>
isPrimary: [true]
```

For two new files, the boolean order matches the file order. This example marks the second new image as primary:

```text
propertyListingId: <propertyListingId>
existingImages: ["<existing-image-url-1>"]
images: <first-new-image-file>
images: <second-new-image-file>
isPrimary: [false, true]
```

**Video/reel-only change** — include when an uploaded video/reel is selected or removed, or a YouTube video/reel URL changes. Send the video fields together when either video or reel data changed; use an empty URL to clear its YouTube link and a `true` clear flag to remove its uploaded file.

```text
propertyListingId: <propertyListingId>
ytVideoUrl: "https://www.youtube.com/watch?v=..."   (send the string "null" to clear/store null)
ytReelUrl: "https://www.youtube.com/shorts/..."     (send the string "null" to clear/store null)
clearVideo: "false"                                 ("true" removes current uploaded video)
clearReelVideo: "false"                             ("true" removes current uploaded reel)
video: <video file>                                  (only when replacing/uploading video)
reelVideo: <reel file>                               (only when replacing/uploading reel)
```

**Combined image and video/reel change** — send both groups of fields in the same PATCH request when both media categories changed.

Do not include `existingImages`, `images`, or `isPrimary` when images did not change. Do not include video/reel fields when neither video nor reel changed. The file field names are `images`, `video`, and `reelVideo`; files are appended as multipart fields, not JSON values.

## Notes

- These endpoints are called with credentials by the customer web panel. For APK clients, send the bearer token as described in [authentication.md](./authentication.md).
- The listing option endpoints are used in multiple places, so a page may request the same options independently.
- `fetchFurnishingsAmenities` exists as a helper in the chatbot API utility but is not invoked by the chatbot listing flow; Edit Property does invoke the endpoint when applicable.
