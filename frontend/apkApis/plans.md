# Listing and Requirement Plan APIs

Base URL: `https://api.realsquarevalue.com`

These APIs are used by the customer panel's Listing Plans and Requirement Plans pages. All endpoints below require authentication with the `user_token` cookie or a bearer token:

```http
Authorization: Bearer <token>
```

For cookie-based requests, include credentials. The plan pages use `credentials: "include"`.

---

## Listing Plans

Base path: `/api/mixed/purchased-plans`

### 1. Get available listing plans

**GET** `/api/mixed/purchased-plans/active-plans`

When the customer already has an active plan, the page adds `?userWantToUpgrade=true`. The response includes `currentPlan` on plans when applicable.

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "66abc1234567890123456789",
      "name": "Gold Listing Plan",
      "description": "For growing property listings",
      "benefits": ["Priority support", "Featured listing"],
      "numberOfPropertiesGiven": 10,
      "expiryInDays": 30,
      "coins": 100,
      "amount": 500,
      "isActive": true,
      "currentPlan": false
    }
  ],
  "expiryTabs": [-1, 30]
}
```

`benefits` is an ordered array of strings and may be empty for plans without listed benefits. `expiryTabs` contains the distinct expiry periods available for filtering.

### 2. Purchase or change a plan with free activation or coins

Both endpoints take the same payload. The backend determines whether the plan is free or coin-paid.

**POST** `/api/mixed/purchased-plans/purchase` — customer has no active plan.

**POST** `/api/mixed/purchased-plans/change-plan` — customer already has an active plan.

```json
{
  "planId": "66abc1234567890123456789"
}
```

On success, the page expects HTTP `201`, then redirects the customer to the home page.

### 3. Create an online payment order

**POST** `/api/mixed/purchased-plans/create-order` — new purchase.

**POST** `/api/mixed/purchased-plans/change-plan-order` — plan change.

```json
{
  "planId": "66abc1234567890123456789"
}
```

**Success Response `201`:**

```json
{
  "success": true,
  "data": {
    "orderId": "order_abc123",
    "amount": 50000,
    "currency": "INR",
    "transactionId": "66abc1234567890123456788"
  }
}
```

`amount` is in paise for Razorpay. The page opens Razorpay Checkout with the returned order details. Payment completion is processed by the server's Razorpay webhook.

### 4. Cancel a dismissed online payment

**PATCH** `/api/mixed/purchased-plans/cancel/:transactionId`

The page calls this if the customer dismisses Razorpay Checkout. No request body is sent.

---

## Requirement Plans

Base path: `/api/mixed/enquiry-plans`

### 1. Get available requirement plans

**GET** `/api/mixed/enquiry-plans/active-plans`

When the customer already has an active requirement plan, the page adds `?userWantToUpgrade=true`. The response includes `currentPlan` on plans when applicable.

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "66abc1234567890123456789",
      "name": "Starter Requirement Plan",
      "description": "For finding new opportunities",
      "benefits": ["Access to matching requirements", "Priority support"],
      "numberOfEnquiriesGiven": 20,
      "expiryInDays": 30,
      "coins": 100,
      "amount": 500,
      "isActive": true,
      "currentPlan": false
    }
  ],
  "expiryTabs": [-1, 30]
}
```

`benefits` is an ordered array of strings and may be empty for plans without listed benefits. `expiryTabs` contains the distinct expiry periods available for filtering.

### 2. Purchase or change a plan with free activation or coins

Both endpoints take the same payload. The backend determines whether the plan is free or coin-paid.

**POST** `/api/mixed/enquiry-plans/purchase` — customer has no active plan.

**POST** `/api/mixed/enquiry-plans/change-plan` — customer already has an active plan.

```json
{
  "planId": "66abc1234567890123456789"
}
```

On success, the page expects HTTP `201`, then redirects the customer to the home page.

### 3. Create an online payment order

**POST** `/api/mixed/enquiry-plans/create-order` — new purchase.

**POST** `/api/mixed/enquiry-plans/change-plan-order` — plan change.

```json
{
  "planId": "66abc1234567890123456789"
}
```

**Success Response `201`:**

```json
{
  "success": true,
  "data": {
    "orderId": "order_abc123",
    "amount": 50000,
    "currency": "INR",
    "transactionId": "66abc1234567890123456788"
  }
}
```

`amount` is in paise for Razorpay. The page opens Razorpay Checkout with the returned order details. Payment completion is processed by the server's Razorpay webhook.

### 4. Cancel a dismissed online payment

**PATCH** `/api/mixed/enquiry-plans/cancel/:transactionId`

The page calls this if the customer dismisses Razorpay Checkout. No request body is sent.

---

## Razorpay Checkout Script

For online payments, both pages load Razorpay Checkout from:

```text
https://checkout.razorpay.com/v1/checkout.js
```
