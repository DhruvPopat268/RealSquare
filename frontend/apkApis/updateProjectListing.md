# Update Project Listing APIs

Base URL: `https://api.realsquarevalue.com`

Authentication: `user_token` cookie (`withCredentials: true` for web) or bearer token. Only the listing owner can update.

---

## 1. Update Project Text Data

**PATCH** `/api/mixed/project-listings`

**Content-Type:** `application/json`

Partial update — always include `projectListingId`, send only changed fields.

### Enums

**`projectStatus`:** `"Ready to Move" | "Under Construction" | "New Launch"`
> `possessionDate` is required for all statuses except `"Ready to Move"`.

**`areaUnit` (residential & commercial):** `"sqft" | "sqyd" | "sqmt"`

**`bhk` (residential configuration):** `"1 RK" | "1 BHK" | "2 BHK" | "3 BHK" | "4 BHK" | "5 BHK" | "6 BHK" | "7 BHK" | "8 BHK" | "9 BHK" | "10 BHK" | "11 BHK" | "12 BHK"`

**`furnishingOptions` (per configuration):** `"Unfurnished" | "Semi-Furnished" | "Fully-Furnished"`

**`zoneType` (commercial):** `"Industrial" | "Commercial" | "Residential" | "SEZ" | "OpenSpaces" | "Agricultural" | "Others"`

**`locationHub` (commercial):** `"IT Park" | "Business Park" | "Mall" | "Commercial Project" | "Residential Project" | "Retail Complex/Building" | "Market/High Street" | "Others"`

**`rera.reraStatus`:** `"unverified" | "verified"`

**`rera.projectDetails.confidence`:** `"high" | "low" | "unknown"`

---

### Payload diff cases

**Project name and description:**

```json
{
  "projectListingId": "<projectListingId>",
  "projectName": "Sunrise Residency Phase 2",
  "projectDescription": "A premium gated community with world-class amenities."
}
```

**Project status — Ready to Move (clears possession date requirement):**

```json
{
  "projectListingId": "<projectListingId>",
  "projectStatus": "Ready to Move"
}
```

**Project status — Under Construction or New Launch (possession date required):**

```json
{
  "projectListingId": "<projectListingId>",
  "projectStatus": "Under Construction",
  "possessionDate": "2027-12-01"
}
```

**Price range and unit counts:**

```json
{
  "projectListingId": "<projectListingId>",
  "minPrice": 5000000,
  "maxPrice": 12000000,
  "totalUnits": 200,
  "availableUnits": 150,
  "towerCount": 4
}
```

**Clear towerCount:**

```json
{
  "projectListingId": "<projectListingId>",
  "towerCount": null
}
```

**Developer name:**

```json
{
  "projectListingId": "<projectListingId>",
  "developerName": "Sunrise Builders Pvt Ltd"
}
```

**Clear developer name:**

```json
{
  "projectListingId": "<projectListingId>",
  "developerName": null
}
```

**Location (triggers geocode verification):**

```json
{
  "projectListingId": "<projectListingId>",
  "cityName": "Pune",
  "locality": {
    "address": "Wakad, Pune",
    "latitude": 18.598,
    "longitude": 73.761
  }
}
```

**RERA ID:**

```json
{
  "projectListingId": "<projectListingId>",
  "reraId": "PR/MH/PUNE/REALTORSHUB001234"
}
```

**Clear RERA ID:**

```json
{
  "projectListingId": "<projectListingId>",
  "reraId": null
}
```

**Launch date:**

```json
{
  "projectListingId": "<projectListingId>",
  "launchDate": "2025-01-15"
}
```

**Ideal For (commercial projects — array of active IdealFor IDs):**

```json
{
  "projectListingId": "<projectListingId>",
  "idealFor": ["<idealForId1>", "<idealForId2>"]
}
```

**Project-level furnishings and amenities:**

```json
{
  "projectListingId": "<projectListingId>",
  "furnishings": [
    { "furnishingId": "<furnishingId1>", "count": 50 },
    { "furnishingId": "<furnishingId2>" }
  ],
  "amenities": [
    { "amenityId": "<amenityId1>", "count": 5 },
    { "amenityId": "<amenityId2>" }
  ]
}
```

**Residential configurations (full replacement — send the complete updated list):**

```json
{
  "projectListingId": "<projectListingId>",
  "residentialDetails": {
    "areaUnit": "sqft",
    "configurations": [
      { "bhk": "2 BHK", "carpetArea": 950, "furnishingOptions": ["Semi-Furnished"], "price": 6500000 },
      { "bhk": "3 BHK", "carpetArea": 1350, "price": 9500000 },
      { "bhk": "4 BHK", "carpetArea": 1800 }
    ]
  }
}
```

**Residential area unit only (without touching configurations):**

```json
{
  "projectListingId": "<projectListingId>",
  "residentialDetails": {
    "areaUnit": "sqmt"
  }
}
```

**Commercial configurations (full replacement — send the complete updated list):**

```json
{
  "projectListingId": "<projectListingId>",
  "commercialDetails": {
    "zoneType": "Commercial",
    "locationHub": "IT Park",
    "areaUnit": "sqft",
    "configurations": [
      { "carpetArea": 1500, "furnishingOptions": ["Fully-Furnished"], "price": 12000000 },
      { "carpetArea": 3000, "price": 25000000 }
    ]
  }
}
```

**Commercial zone/hub only (without touching configurations):**

```json
{
  "projectListingId": "<projectListingId>",
  "commercialDetails": {
    "zoneType": "SEZ",
    "locationHub": "Business Park"
  }
}
```

---

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "_id": "<projectListingId>",
    "status": "Active"
  }
}
```

> `status` is `"UnderReview"` and message changes to `"Project updated and sent for review"` when auto-approval is not enabled for the user's role.

---

---

## 2. Update Project Media

**PATCH** `/api/mixed/project-listings/media`

**Content-Type:** `multipart/form-data`

Always include `projectListingId`. Send only changed media groups — omit unchanged ones entirely.

### Notes on file types

- `images` / `configurationMedia` for `image2DUrl` slot: JPEG, PNG, or WebP
- `configurationMedia` for `model3DUrl` slot: `.glb` or self-contained `.gltf` (all buffers/images embedded, no external URIs). GLB files are auto-compressed on the server.
- You cannot send a replacement file and a clear flag for the same type in one request (e.g. `video` + `clearVideo: "true"` is rejected).
- To clear a YouTube URL, send the string `"null"` (not a JSON null).

### `configurationImageMap` slot object

```json
{ "section": "residentialDetails|commercialDetails", "index": 0, "slot": "image2DUrl|model3DUrl" }
```

`index` is zero-based. Duplicate `section + index + slot` targets in one request are rejected.

---

### Payload diff cases

**Keep existing images, upload one new image as primary:**

```text
projectListingId: <projectListingId>
existingImages: ["<kept-url-1>", "<kept-url-2>"]
images: <new-image-file>
isPrimary: [true]
```

**Keep existing images, upload two new (second is primary):**

```text
projectListingId: <projectListingId>
existingImages: ["<kept-url-1>"]
images: <first-new-image-file>
images: <second-new-image-file>
isPrimary: [false, true]
```

**Remove an image (send only the URLs to keep, no new files):**

```text
projectListingId: <projectListingId>
existingImages: ["<kept-url-1>", "<kept-url-2>"]
```

**Reorder images (make second image primary — put it first in existingImages):**

```text
projectListingId: <projectListingId>
existingImages: ["<url-2>", "<url-1>", "<url-3>"]
```

**2D floor plan image for first residential configuration:**

```text
projectListingId: <projectListingId>
configurationMedia: <floor-plan.jpg>
configurationImageMap: [{"section":"residentialDetails","index":0,"slot":"image2DUrl"}]
```

**3D model for second commercial configuration:**

```text
projectListingId: <projectListingId>
configurationMedia: <model.glb>
configurationImageMap: [{"section":"commercialDetails","index":1,"slot":"model3DUrl"}]
```

**Multiple configuration media in one request:**

```text
projectListingId: <projectListingId>
configurationMedia: <floor-plan-2bhk.jpg>
configurationMedia: <floor-plan-3bhk.jpg>
configurationMedia: <3d-model-2bhk.glb>
configurationImageMap: [
  {"section":"residentialDetails","index":0,"slot":"image2DUrl"},
  {"section":"residentialDetails","index":1,"slot":"image2DUrl"},
  {"section":"residentialDetails","index":0,"slot":"model3DUrl"}
]
```

**Set YouTube video URL:**

```text
projectListingId: <projectListingId>
ytVideoUrl: https://www.youtube.com/watch?v=abc123
```

**Upload a video file:**

```text
projectListingId: <projectListingId>
video: <video-file.mp4>
```

**Clear uploaded video:**

```text
projectListingId: <projectListingId>
clearVideo: "true"
```

**Clear YouTube video URL:**

```text
projectListingId: <projectListingId>
ytVideoUrl: "null"
```

**Set YouTube reel URL:**

```text
projectListingId: <projectListingId>
ytReelUrl: https://www.youtube.com/shorts/abc123
```

**Upload a reel file:**

```text
projectListingId: <projectListingId>
reelVideo: <reel-file.mp4>
```

**Clear uploaded reel:**

```text
projectListingId: <projectListingId>
clearReelVideo: "true"
```

**Upload brochure:**

```text
projectListingId: <projectListingId>
brochure: <project-brochure.pdf>
```

**Clear brochure:**

```text
projectListingId: <projectListingId>
clearBrochure: "true"
```

**Combined — images and video in one request:**

```text
projectListingId: <projectListingId>
existingImages: ["<kept-url-1>"]
images: <new-image-file>
isPrimary: [false]
ytVideoUrl: https://www.youtube.com/watch?v=abc123
```

---

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Project media updated successfully",
  "data": {
    "images": ["<image-url-1>", "<image-url-2>"],
    "videos": {
      "videoUrl": "<uploaded-video-url>",
      "ytVideoUrl": "https://www.youtube.com/watch?v=..."
    },
    "reelVideo": {
      "reelUrl": "<uploaded-reel-url>",
      "ytReelUrl": "https://www.youtube.com/shorts/..."
    },
    "brochureUrl": "<brochure-url>"
  }
}
```

> `status` goes to `"UnderReview"` and message changes to `"Project media updated and sent for review"` when auto-approval is not enabled.
