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

For a residential rental listing, use `rentInfo` instead of `sellInfo`, for example `{ "monthlyRent": 25000 }`.

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

**Commercial non-plot:**

```json
{
  "categoryId": "<commercialCategoryId>",
  "listingTypeId": "<sellListingTypeId>",
  "propertyTypeId": "<propertyTypeId>",
  "cityName": "Pune",
  "locality": { "address": "Koregaon Park, Pune", "latitude": 18.536, "longitude": 73.893 },
  "commercialDetails": {
    "propertyType": "Office",
    "builtUpArea": { "value": 1800, "unit": "sqft" },
    "carpetArea": { "value": 1400, "unit": "sqft" }
  },
  "sellInfo": { "price": 12000000 }
}
```

For commercial plots, the chatbot sends `plotArea`, `length`, and `width` inside `commercialDetails` instead of `plotDetails`.

**PG / co-living:**

```json
{
  "categoryId": "<residentialCategoryId>",
  "listingTypeId": "<pgListingTypeId>",
  "propertyTypeId": "<propertyTypeId>",
  "cityName": "Pune",
  "locality": { "address": "Viman Nagar, Pune", "latitude": 18.567, "longitude": 73.914 },
  "pgDetails": {
    "pgName": "Green View PG",
    "totalBedsAvailable": 20,
    "rooms": [
      { "roomType": "Shared", "bedsAvailable": 12, "rent": 9000, "securityDeposit": 9000 }
    ]
  }
}
```

The chatbot uses `sellInfo: { "price": <number> }` for sale listings and `rentInfo: { "monthlyRent": <number> }` for rental listings. PG details are submitted under `pgDetails`.

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

These examples show the partial body sent when only the listed detail fields change. Include only sections with changes.

**Residential details:**

```json
{
  "propertyListingId": "<propertyListingId>",
  "residentialDetails": {
    "bhk": 3,
    "builtUpArea": { "value": 1600, "unit": "sqft" }
  }
}
```

Other editable residential keys include `societyName`, `carpetArea`, `propertyStatus`, `ageOfProperty`, `constructionStatus`, `availableFrom`, `furnishType`, `furnishings`, and `amenities`.

**Plot details:**

```json
{
  "propertyListingId": "<propertyListingId>",
  "plotDetails": {
    "plotArea": { "value": 2400, "unit": "sqft" },
    "length": 60,
    "width": 40,
    "societyName": "Green Valley Layout"
  }
}
```

For a commercial plot, the corresponding changed plot keys are sent inside `commercialDetails`; changed commercial fields such as `ownership`, `zoneType`, or `locationHub` are also sent in that section.

**Commercial non-plot details:**

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "builtUpArea": { "value": 2000, "unit": "sqft" },
    "carpetArea": { "value": 1500, "unit": "sqft" },
    "constructionStatus": "UnderConstruction",
    "availableFrom": "2027-04-01"
  }
}
```

Other editable commercial keys include `propertyType`, `ownership`, `zoneType`, `locationHub`, `furnishType`, `furnishings`, and `amenities`.

**PG details:**

```json
{
  "propertyListingId": "<propertyListingId>",
  "pgDetails": {
    "pgName": "Green View PG",
    "totalBedsAvailable": 24,
    "constructionStatus": "ReadyToMove"
  }
}
```

Other editable PG keys include `pgFor`, `rooms`, `availableFrom`, `furnishType`, `furnishings`, and `amenities`.

**Purpose details:**

```json
{
  "propertyListingId": "<propertyListingId>",
  "sellInfo": { "price": 8000000 }
}
```

For a rental listing, changed values are sent under `rentInfo`, such as `{ "monthlyRent": 30000, "securityDeposit": 60000, "availableFrom": "2026-11-01" }`.

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
