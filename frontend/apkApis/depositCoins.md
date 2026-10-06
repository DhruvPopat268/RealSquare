# Deposit Coins APIs

Base URL: `https://api.realsquarevalue.com`

These APIs are used by the Coins Wallet page to load available coin offers, read the signed-in user's wallet and transaction history, and create a Razorpay order for a coin deposit.

## Authentication

All three APIs require authentication using the `userProtect` middleware. Send either the `user_token` cookie or a bearer token:

```http
Authorization: Bearer <token>
```

For cookie-based requests, send credentials with the request.

---

## 1. Get Active Coin Offers

**GET** `/api/mixed/purchase-coins/offers`

Returns active coin offers only.

### Success Response `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "66abc1234567890123456789",
      "name": "Starter Offer",
      "description": "Get bonus coins with this offer",
      "coins": 120,
      "amount": 100
    }
  ]
}
```

- `coins` is the number of coins credited after successful payment.
- `amount` is the payment amount in INR.
- `description` may be omitted if the offer has no description.
- The response includes `_id`, `name`, `description` (when set), `coins`, and `amount`; it omits `isActive` and timestamps.

---

## 2. Get Wallet and Coin Transaction History

**GET** `/api/mixed/coins-transactions`

Returns the authenticated user's wallet totals and that user's coin transactions, newest first.

### Query Parameters

| Parameter | Required | Default | Description |
|---|---|---:|---|
| `page` | No | `1` | Page number, starting at 1 |
| `limit` | No | `10` | Number of transactions per page |

Example:

```http
GET /api/mixed/coins-transactions?page=1&limit=10
```

### Success Response `200`

```json
{
  "success": true,
  "data": {
    "wallet": {
      "currentBalance": 120,
      "totalCreditedCoins": 120,
      "totalDebitedCoins": 0
    },
    "transactions": [
      {
        "_id": "66abc1234567890123456789",
        "type": "Credit",
        "coins": 120,
        "reason": "CoinsPurchase",
        "coinsOffer": {
          "offerId": "66abc1234567890123456787",
          "name": "Starter Offer",
          "description": "Get bonus coins with this offer",
          "coins": 120,
          "amount": 100
        },
        "createdAt": "2026-10-06T10:00:00.000Z",
        "updatedAt": "2026-10-06T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

If the user has no wallet record yet, wallet totals are returned as zero. If there are no coin transactions, `transactions` is an empty array.

The transaction list intentionally omits internal/user-identifying fields: `user`, `userType`, `userDetails`, `refId`, `refModel`, `balanceBefore`, `balanceAfter`, and `__v`. The wallet balance totals are returned separately in `data.wallet`.

`coinsOffer` is included when an offer snapshot exists. `note` is included only when the transaction has a note.

---

## 3. Create a Razorpay Order for a Coin Deposit

**POST** `/api/mixed/purchase-coins/create-order`

Creates a Razorpay order and a pending payment transaction. This endpoint does not credit coins; coins are credited after payment succeeds and the payment webhook is processed.

**Headers:**

```http
Content-Type: application/json
```

Choose one of the following request bodies.

### Purchase an Offer

```json
{
  "coinsOfferId": "66abc1234567890123456789"
}
```

The server loads the active offer and uses its `coins` and `amount` values. An unknown or inactive offer returns `404`.

### Purchase a Custom Number of Coins

```json
{
  "coins": 100
}
```

For a custom purchase, the amount is the same number in INR: `100` coins costs ₹100 (1 coin = ₹1). `coins` is required for this request.

If both `coinsOfferId` and `coins` are sent, the offer is used.

### Success Response `201`

```json
{
  "success": true,
  "data": {
    "orderId": "order_abc123",
    "amount": 10000,
    "currency": "INR",
    "transactionId": "66abc1234567890123456788",
    "coins": 100,
    "offer": null
  }
}
```

- `amount` is in paise for Razorpay (`10000` means ₹100).
- `transactionId` identifies the pending payment transaction.
- `offer` contains the selected offer's `name`, `coins`, and `amount`, or is `null` for a custom purchase.
- Use `orderId`, `amount`, and `currency` to open the Razorpay checkout. Use the configured Razorpay key ID on the client.

### Error Responses

```json
{ "success": false, "message": "Not authorized to purchase coins" }       // 403; role must be Owner, Broker, or Builder
{ "success": false, "message": "coins is required for direct purchase" } // 400
{ "success": false, "message": "Coins offer not found or inactive" }     // 404
{ "success": false, "message": "..." }                                   // 500; order/payment service error
```
