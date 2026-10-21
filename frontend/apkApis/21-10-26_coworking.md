# Coworking Property Listing APIs

These endpoints and payloads cover coworking listings only. Requests require the same authenticated session as the other property listing APIs.

## Get active virtual-space benefit plans

**GET** `/api/mixed/property-listings/active-virtual-space-benefits`

Returns active benefit plan masters. Each master is presented as a plan; its title and benefits are used to let the customer choose the benefits they will provide.

Example response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "<benefitPlanId>",
      "title": "Business Address Plan",
      "benefits": [
        "Mail and package handling",
        "Business address for registration"
      ]
    }
  ]
}
```

## Create a coworking listing

**POST** `/api/mixed/property-listings`

Coworking listings automatically use the Rent listing purpose. Do not send `listingTypeId`, `propertyListingId`, `rentInfo`, or property-wide monthly rent. `workSpaceFloor` must be an integer greater than or equal to `-1`. Include one or more unique workspace types: `cabin`, `hall`, and `virtualSpace`.

```json
{
  "categoryId": "<commercialCategoryId>",
  "propertyTypeId": "<coworkingPropertyTypeId>",
  "cityName": "Pune",
  "locality": {
    "address": "Baner, Pune",
    "latitude": 18.559,
    "longitude": 73.786
  },
  "commercialDetails": {
    "workSpaceFloor": 0,
    "workspaces": [
      {
        "type": "cabin",
        "available": 2,
        "config": [
          { "availableSeats": 4, "rentPerSeat": 5000 },
          { "availableSeats": 3, "rentPerSeat": 7000 }
        ]
      },
      {
        "type": "hall",
        "availableSeats": 30,
        "rentPerSeat": 2000
      },
      {
        "type": "virtualSpace",
        "benefits": [
          {
            "_id": "<activeBenefitPlanId>",
            "monthlyRent": 12000,
            "benefits": ["Mail and package handling"]
          }
        ]
      }
    ]
  }
}
```

For virtual space, send the selected master `_id`, that plan's positive `monthlyRent`, and one or more benefit strings from that master. Do not send `title`; the API resolves and stores it from the master. The API rejects unknown or inactive plan IDs and benefits that are not in the selected plan. Sending a valid subset of a plan's benefits is supported.

Cabin `available` must match the number of `config` entries. Each cabin and the hall require a positive integer seat count and a non-negative `rentPerSeat`.

## Update a coworking listing

**PATCH** `/api/mixed/property-listings`

Send `propertyListingId` in the body. The API merges changed coworking fields into the saved listing, so include only the fields being changed. When changing a virtual-space plan, send its current selected benefits and monthly rent together with the plan `_id`.

Change only the workspace floor:

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "workSpaceFloor": -1
  }
}
```

Change virtual-space selected benefits and rent:

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "workspaces": [
      {
        "type": "virtualSpace",
        "benefits": [
          {
            "_id": "<benefitPlanId>",
            "monthlyRent": 14000,
            "benefits": [
              "Mail and package handling",
              "Business address for registration"
            ]
          }
        ]
      }
    ]
  }
}
```

Change hall details:

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "workspaces": [
      {
        "type": "hall",
        "availableSeats": 35,
        "rentPerSeat": 2200
      }
    ]
  }
}
```

Change cabin details:

```json
{
  "propertyListingId": "<propertyListingId>",
  "commercialDetails": {
    "workspaces": [
      {
        "type": "cabin",
        "available": 2,
        "config": [
          { "availableSeats": 5, "rentPerSeat": 5500 },
          { "availableSeats": 3, "rentPerSeat": 7000 }
        ]
      }
    ]
  }
}
```

Do not send unrelated workspace types in an update. Virtual-space plans require at least one selected benefit and a positive plan-level `monthlyRent`; virtual-space rent must not be sent on the workspace root. The API fills the plan title from its master record.
