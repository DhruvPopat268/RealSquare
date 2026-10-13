# Payment Transaction APIs

Base URL: `https://api.realsquarevalue.com`

Both endpoints are mounted under `/api/mixed/transactions` and require authentication through the `user_token` cookie or `Authorization: Bearer <token>` header. The API only returns or modifies transactions owned by the authenticated user.

## 1. List Payment Transactions

**GET** `/api/mixed/transactions`

**Auth required:** Yes

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---:|---|
| `page` | integer | `1` | Page number; values below 1 are treated as 1. |
| `limit` | integer | `10` | Number of records per page; values below 1 are treated as 1. |

**Example:**

```http
GET /api/mixed/transactions?page=1&limit=10
Authorization: Bearer <token>
```

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "Pending": 1,
      "Success": 4,
      "Failed": 0
    },
    "transactions": [
      {
        "_id": "66abc1234567890123456789",
        "user": "66abc1234567890123456780",
        "userType": "Owner",
        "userDetails": {
          "name": "Jane Smith",
          "mobile": "9876543210"
        },
        "reason": "ListingPlanPurchase",
        "amount": 1180,
        "baseAmount": 1000,
        "taxState": {
          "userState": "Maharashtra",
          "companyState": "Maharashtra"
        },
        "taxBreakdown": {
          "cgst": 9,
          "sgst": 9,
          "igst": 0,
          "taxAmount": 180
        },
        "currency": "INR",
        "status": "Success",
        "invoiceNumber": "RSVI-1",
        "invoiceUrl": "/storage/documents/invoice-RSVI-1.pdf",
        "createdAt": "2026-10-13T07:29:11.901Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

`transactions` is sorted newest first and contains only the current user's records. The transaction may have `invoiceUrl` and `invoiceNumber` already populated; older or otherwise uninvoiced records can have those fields unset. Tax fields record the jurisdiction and GST breakdown used for that transaction.

## 2. Generate an Invoice

**POST** `/api/mixed/transactions/generate-invoice`

**Auth required:** Yes

**Content-Type:** `application/json`

**Payload:**

```json
{
  "transactionId": "66abc1234567890123456789"
}
```

`transactionId` must be a valid MongoDB ObjectId for an existing transaction with status `Success`. The transaction must belong to the authenticated user and must not already have an invoice URL. The API generates a PDF invoice, saves its URL and invoice number on the transaction, and returns the invoice URL. The customer panel can open that URL after a successful response.

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "invoiceUrl": "/storage/documents/invoice-RSVI-1.pdf",
    "invoiceNumber": "RSVI-1",
    "transaction": {
      "_id": "66abc1234567890123456789",
      "amount": 1180,
      "reason": "ListingPlanPurchase",
      "status": "Success",
      "userType": "Owner",
      "invoiceNumber": "RSVI-1",
      "invoiceUrl": "/storage/documents/invoice-RSVI-1.pdf",
      "createdAt": "2026-10-13T07:29:11.901Z"
    }
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "errors": [
    { "msg": "transactionId is required", "path": "transactionId", "location": "body" }
  ]
}
```

Validation errors return `400`, including an invalid ID, a missing transaction, or a transaction that is not successful. A transaction owned by another user returns `403`. Authentication errors return `401`. Invoice-generation failures return `500` with a `message` describing the error.

If an invoice URL is already saved for the transaction, the API returns `409`:

```json
{
  "success": false,
  "message": "An invoice has already been generated for this transaction"
}
```
