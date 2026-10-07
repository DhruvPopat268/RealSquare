# Authentication APIs

Base URL: `https://api.realsquarevalue.com`

## Authentication Mechanism

The middleware (`userProtect`) extracts the token from **either**:
1. **Cookie:** `user_token` (set automatically by the server on verify-otp)
2. **Authorization Header:** `Authorization: Bearer <token>`

Both are supported. Cookie is used by the web app; the header can be used by mobile/APK clients.

---

## 1. Send OTP

**POST** `/api/system-users/send-otp`

**Auth required:** No

**Headers:**
```
Content-Type: application/json
```

**Payload:**
```json
{
  "mobile": "9876543210"
}
```

**Validations:**
- `mobile` is required
- Must be exactly 10 digits

**Success Response `200`:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Error Responses:**
```json
{ "success": false, "message": "mobile is required" }                  // 400
{ "success": false, "message": "mobile must be exactly 10 digits" }    // 400
{ "success": false, "message": "Account is deactivated" }              // 403
```

> Note: OTP is currently `123456` (dummy/hardcoded). Real SMS delivery is not yet wired.

---

## 2. Verify OTP

**POST** `/api/system-users/verify-otp`

**Auth required:** No

**Headers:**
```
Content-Type: application/json
```

**Payload:**
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

**Validations:**
- Both `mobile` and `otp` are required
- `mobile` must be exactly 10 digits
- `otp` must be exactly 6 digits

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isNew": true
  }
}
```

- `token` — JWT token (also set as `user_token` cookie automatically)
- `isNew: true` — user has no role yet → redirect to `/complete-profile`
- `isNew: false` — existing user with role → redirect to app

**Error Responses:**
```json
{ "success": false, "message": "mobile and otp are required" }             // 400
{ "success": false, "message": "otp must be exactly 6 digits" }            // 400
{ "success": false, "message": "Invalid or expired OTP" }                  // 400
{ "success": false, "message": "No account found for this mobile" }        // 404
{ "success": false, "message": "Account is deactivated" }                  // 403
```

---

## 3. Complete Profile

**POST** `/api/system-users/complete-profile`

**Auth required:** Yes (`user_token` cookie or `Authorization: Bearer <token>`)

**Content-Type:** `multipart/form-data`

This is a role-based endpoint. The payload differs depending on the selected role.

### Role IDs

| Role     | ID                          |
|----------|-----------------------------|
| Customer | `6a43619705d3b4234b1f09a0`  |
| Owner    | `6a435adb4700c3c0d1f1f893`  |
| Broker   | `6a435af24700c3c0d1f1f898`  |
| Builder  | `6a435b034700c3c0d1f1f89d`  |

---

### Case 1 — Customer

```
role:                6a43619705d3b4234b1f09a0   (required)
fullName:            John Doe                    (required)
email:               john@example.com            (optional)
bio:                 Looking for a 2BHK in Pune  (optional)
profilePhoto:        [file]                       (optional)
location.name:       Pune, Maharashtra           (optional)
location.latitude:   18.5204                     (optional)
location.longitude:  73.8567                     (optional)
```

---

### Case 2 — Owner

```
role:                        6a435adb4700c3c0d1f1f893   (required)
fullName:                    Jane Smith                  (required)
email:                       jane@example.com            (optional)
profilePhoto:                [file]                       (optional)
businessDetails.name:        Smith Properties            (optional)
businessDetails.type:        private_owner               (optional)
                             ↳ private_owner
                             ↳ real_estate_investment_trust
                             ↳ property_management_group
                             ↳ family_office
businessDetails.gstNumber:   22AAAA0000A1Z5              (optional)
businessDetails.email:       biz@smithprops.com          (optional)
businessDetails.mobile:      9876543210                  (optional)
businessDetails.website:     https://smithprops.com      (optional)
businessLogo:                [file]                       (optional)
enquiryCities:               ["Mumbai", "Pune"]          (optional; JSON array string)
```

---

### Case 3 — Broker

```
role:                6a435af24700c3c0d1f1f898        (required)
fullName:            Rajesh Kumar                    (required)
email:               rajesh@agency.com               (optional)
profilePhoto:        [file]                           (optional)
agencyName:          Kumar Realty                    (optional)
reraId:              GJ/12345/2024                    (optional; verified during profile completion)
yearsOfExperience:   8                               (optional)
bio:                 Expert in commercial real estate (optional)
enquiryCities:       ["Mumbai", "Pune"]               (optional; JSON array string)
```

When `reraId` is provided, the backend runs RERA verification and stores the result in `brokerProfile.reraVerification`. It includes `reraId`, `verified`, `reason`, `projectDetails` (project, developer, location, type, completion date, units, status, and confidence), and `sources`. If the verification service cannot complete, the profile is still saved with `verified: false`.

---

### Case 4 — Builder

> Note: Builder uses `name` (not `fullName`) for the company name.

```
role:                     6a435b034700c3c0d1f1f89d   (required)
name:                     ABC Developers              (required)
email:                    info@abcdev.com             (optional)
profilePhoto:             [file]                       (optional)
gstNumber:                27AAAA0000A1Z5              (optional)
cinNumber:                U45200MH2005PTC150673       (optional)
foundedYear:              2005                        (optional)
totalProjectsDelivered:   24                          (optional)
location.name:            Mumbai                      (optional)
location.latitude:        19.0760                     (optional)
location.longitude:       72.8777                     (optional)
enquiryCities:            ["Mumbai", "Pune"]          (optional; JSON array string)
```

For Owner, Broker, and Builder, send `enquiryCities` as a JSON-encoded array string in multipart form data, for example `JSON.stringify(["Mumbai", "Pune"])`. If no cities are selected, send `JSON.stringify([])`.

---

**Success Response `201` (all cases) — returns the updated user object:**
```json
{
  "success": true,
  "data": { ...user object... }
}
```

**Error Responses:**
```json
{ "success": false, "message": "role is required" }                            // 400
{ "success": false, "message": "This role is not allowed to self-register" }   // 403
{ "success": false, "message": "Profile already completed. Each user can only have one role profile." } // 409
{ "success": false, "message": "Missing required fields: fullName" }           // 400
{ "success": false, "message": "Invalid email format" }                        // 400
{ "success": false, "message": "Email already registered" }                    // 409
{ "success": false, "message": "Invalid GST number format" }                   // 400
{ "success": false, "message": "GST number already registered" }               // 409
```

## 4. Verify Profile Email

The profile email is optional. Before including a new email in Complete Profile or changing an email in Update Profile, verify it with these APIs. Both endpoints require authentication.

**POST** `/api/system-users/send-email-otp`

**Headers:** `Content-Type: application/json`

**Payload:**

```json
{
  "email": "john@example.com"
}
```

The API sends a six-digit code to the email. The code expires after 10 minutes. If this email is already verified on the current account, no new code is sent and the response returns `verified: true`.

**Success Response `200` — code sent:**

```json
{
  "success": true,
  "verified": false,
  "email": "john@example.com",
  "message": "Verification code sent to your email"
}
```

**Success Response `200` — already verified for this account:**

```json
{
  "success": true,
  "verified": true,
  "email": "john@example.com",
  "message": "Email is already verified"
}
```

**Error Responses:**

```json
{ "success": false, "message": "A valid email is required" }       // 400
{ "success": false, "message": "Email is already registered" }   // 409
{ "success": false, "message": "Failed to send email verification code" } // 500
```

**POST** `/api/system-users/verify-email-otp`

**Headers:** `Content-Type: application/json`

**Payload:**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "verified": true,
  "email": "john@example.com",
  "message": "Email verified successfully"
}
```

On success, the backend saves the email as verified and removes the temporary OTP data. The frontend should treat verification as complete only when both `success` and `verified` are `true`. Profile endpoints reject a changed or newly provided email unless it has been verified.

**Error Responses:**

```json
{ "success": false, "verified": false, "message": "A valid email and OTP are required" } // 400
{ "success": false, "verified": false, "message": "OTP must be exactly 6 digits" } // 400
{ "success": false, "verified": false, "message": "Invalid or expired verification code" } // 400
{ "success": false, "verified": false, "message": "Email is already registered" } // 409
```

---

## 5. Get Current User (Me)

**GET** `/api/system-users/me`

**Auth required:** Yes (`user_token` cookie or `Authorization: Bearer <token>`)

**Payload:** None

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true,
    "mobile": "9876543210",
    "profilePhoto": "https://...",
    "role": {
      "_id": "6a43619705d3b4234b1f09a0",
      "name": "Customer",
      "permissions": [],
      "isActive": true
    },
    "enquiryCities": ["Mumbai", "Pune"],
    "coinsBalance": 100,
    "coinsPerEnquiry": 5,
    "isProfileCompleted": true,
    "myPropertyListingAllowed": true,
    "canListProperty": {
      "canList": true,
      "source": "plan",
      "remaining": 3,
      "message": null
    },
    "activePlan": {
      "name": "Gold Plan",
      "numberOfPropertiesGiven": 10,
      "propertiesUsed": 7,
      "expiryDate": "2027-01-01T00:00:00.000Z"
    },
    "activeEnquiryPlan": {
      "name": "Enquiry Starter",
      "numberOfEnquiriesGiven": 20,
      "enquiriesUsed": 5,
      "expiryDate": "2027-01-01T00:00:00.000Z"
    },
    "showListingPlan": false,
    "showEnquiryPlan": false,
    "rejectedPropertiesCount": 0,
    "haveAssignedInquiries": false,

    "customerProfile": {
      "mobile": "9876543210",
      "bio": "Looking for a 2BHK in Pune",
      "location": {
        "name": "Pune, Maharashtra",
        "latitude": 18.5204,
        "longitude": 73.8567
      }
    },

    "ownerProfile": {
      "mobile": "9876543210",
      "businessDetails": {
        "name": "Smith Properties",
        "type": "private_owner",
        "gstNumber": "22AAAA0000A1Z5",
        "email": "biz@smithprops.com",
        "mobile": "9876543210",
        "website": "https://smithprops.com",
        "logo": "https://..."
      }
    },

    "brokerProfile": {
      "mobile": "9876543210",
      "agencyName": "Kumar Realty",
      "yearsOfExperience": 8,
      "bio": "Expert in commercial real estate"
    },

    "builderProfile": {
      "mobile": "9876543210",
      "gstNumber": "27AAAA0000A1Z5",
      "cinNumber": "U45200MH2005PTC150673",
      "foundedYear": 2005,
      "totalProjectsDelivered": 24,
      "location": {
        "name": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777
      }
    }
  }
}
```

**Notes:**
- Only one sub-profile (`customerProfile`, `ownerProfile`, `brokerProfile`, `builderProfile`) will have data; the others will be `null` or empty.
- `name`, `email`, `profilePhoto` are stored at root level (not inside the sub-profile).
- `coinsBalance` comes from the user's coins wallet.
- `isProfileCompleted` is `true` only if `mobile` + `name` + `role` are all present.
- `showListingPlan` / `showEnquiryPlan` — `true` for Owner, Broker, Builder only.
- `haveAssignedInquiries` — `true` for Owner, Broker, Builder only.
- `canListProperty.source` can be `"plan"`, `"free"`, or `null`.
- `activePlan` / `activeEnquiryPlan` are `null` if no active plan exists.

**Error Responses:**
```json
{ "success": false, "message": "Not authorized, no token" }         // 401
{ "success": false, "message": "Session expired or logged out" }    // 401
{ "success": false, "message": "Not authorized, token failed" }     // 401
{ "success": false, "message": "Unauthorized" }                     // 401 (non-system role)
```

### Skip profile setup

**POST** `/api/system-users/assign-customer-role`

**Auth required:** Yes (`user_token` cookie or `Authorization: Bearer <token>`)

Send no body. This assigns the Customer role without creating a `customerProfile` or requiring a name. The user can continue using the panel and complete the profile later. The endpoint is idempotent for an account that already has the Customer role; it returns `409` if another role is already assigned.

---

## 6. Update Profile

**PUT** `/api/system-users/update-profile`

**Auth required:** Yes (`user_token` cookie or `Authorization: Bearer <token>`)

**Content-Type:** `multipart/form-data`

Send only fields the user changed. The API uses partial updates:

- Omit unchanged fields; their stored values remain unchanged.
- Send a changed field with its new value to replace the stored value.
- To clear a changed optional field, send the literal string `null`. The backend removes that field from the database. For example, append `fd.append("bio", "null")` in JavaScript; `FormData` converts JavaScript `null` to the string `"null"` too.
- Required name fields cannot be cleared from the profile page because the frontend validates them before submitting.

For nested fields, use dot notation. For example, `location.name` or `businessDetails.name`.

### Common fields

| Field | Description |
|---|---|
| `email` | Root-level email; send `null` to clear |
| `profilePhoto` | Upload an image file to replace; send `null` to clear |
| `role` | Normally omit for an existing profile. Include the role ID when completing a profile for a user who does not yet have a role. |

### Role-specific fields

Send only the fields that changed for the user's role.

**Customer:** `fullName`, `bio`, `location.name`, `location.latitude`, `location.longitude`.

**Owner:** `fullName`, `businessDetails.name`, `businessDetails.type`, `businessDetails.gstNumber`, `businessDetails.mobile`, `businessDetails.website`, `businessDetails.logo`, `businessLogo` (image file), and `enquiryCities`.

**Broker:** `fullName`, `agencyName`, `reraId`, `yearsOfExperience`, `bio`, and `enquiryCities`. Send a changed, non-empty `reraId` to run verification and replace `brokerProfile.reraVerification`; omit it when unchanged. Send the literal `null` to clear the RERA ID and its saved verification result.

**Builder:** `name`, `gstNumber`, `cinNumber`, `foundedYear`, `totalProjectsDelivered`, `location.name`, `location.latitude`, `location.longitude`, and `enquiryCities`.

For image replacement, upload `profilePhoto` or `businessLogo` as a file. To clear an existing image, send the corresponding field path (`profilePhoto` or `businessDetails.logo`) with the literal value `null`.

For `enquiryCities`, send a JSON-encoded array string when changing the cities, such as `JSON.stringify(["Mumbai", "Pune"])`. Send the literal string `null` to remove the field when clearing all cities.

**Example — clearing a Customer's bio and updating email:**

```js
const formData = new FormData();
formData.append("email", "new.email@example.com");
formData.append("bio", "null");

fetch(`${BASE_URL}/api/system-users/update-profile`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

Do not manually set the multipart `Content-Type` header; the client must add its boundary.

**Success Response `200`:**

```json
{
  "success": true,
  "data": { ...updated user object... }
}
```

**Error Responses:**

```json
{ "success": false, "message": "role is required" }  // 400
```

Authentication errors are the same as those documented for **Get Current User (Me)**.
