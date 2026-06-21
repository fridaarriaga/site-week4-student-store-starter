# Student Store API - System Spec

This document defines the source of truth for model design, API behavior, and transaction logic before implementing schema or route handlers.

## 1) Data Models

### Product

| Field | Prisma Type | Required? | Default | Notes |
|---|---|---|---|---|
| `id` | `Int` | Required | `autoincrement()` | Primary key |
| `name` | `String` | Required | none | Product display name |
| `description` | `String` | Optional | none | Optional product details |
| `category` | `String` | Optional | none | Lowercase category label (e.g., `clothing`, `school`, `electronics`) |
| `price` | `Float` | Required | none | Unit price |
| `imageUrl` | `String` | Optional | none | Optional image URL |
| `createdAt` | `DateTime` | Required | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Required | `updatedAt` | Auto-updated timestamp |

**Primary key behavior**
- `id` is the primary key and auto-increments.

**Relationships**
- One `Product` can appear in many `OrderItem` rows (`Product` 1 -> many `OrderItem`).
- `OrderItem.productId` is the foreign key to `Product.id`.

**Cascade behavior**
- If a `Product` is deleted, all `OrderItem` rows referencing that product are automatically deleted (`onDelete: Cascade`).

---

### Order

| Field | Prisma Type | Required? | Default | Notes |
|---|---|---|---|---|
| `id` | `Int` | Required | `autoincrement()` | Primary key |
| `customerName` | `String` | Required | none | Customer full name |
| `customerEmail` | `String` | Required | none | Customer email |
| `customerAddress` | `String` | Required | none | Shipping address |
| `status` | `String` | Required | `"pending"` | Lifecycle status (`pending`, `paid`, `shipped`, etc.) |
| `total` | `Float` | Required | `0` | Stored order total price |
| `createdAt` | `DateTime` | Required | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Required | `updatedAt` | Auto-updated timestamp |

**Primary key behavior**
- `id` is the primary key and auto-increments.

**Relationships**
- One `Order` has many `OrderItem` rows (`Order` 1 -> many `OrderItem`).
- `OrderItem.orderId` is the foreign key to `Order.id`.

**Cascade behavior**
- If an `Order` is deleted, all `OrderItem` rows for that order are automatically deleted (`onDelete: Cascade`).

---

### OrderItem

| Field | Prisma Type | Required? | Default | Notes |
|---|---|---|---|---|
| `id` | `Int` | Required | `autoincrement()` | Primary key |
| `orderId` | `Int` | Required | none | FK -> `Order.id` |
| `productId` | `Int` | Required | none | FK -> `Product.id` |
| `quantity` | `Int` | Required | `1` | Number of units |
| `unitPrice` | `Float` | Required | none | Snapshotted price at purchase time |
| `lineTotal` | `Float` | Required | none | `quantity * unitPrice` |
| `createdAt` | `DateTime` | Required | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Required | `updatedAt` | Auto-updated timestamp |

**Primary key behavior**
- `id` is the primary key and auto-increments.

**Relationships**
- Belongs to one `Order` via `orderId`.
- Belongs to one `Product` via `productId`.

**Cascade behavior**
- Deleting a parent `Order` cascades and deletes dependent `OrderItem` rows.
- Deleting a parent `Product` cascades and deletes dependent `OrderItem` rows.

---

### Relationship Summary

- `Product` 1 -> many `OrderItem`
- `Order` 1 -> many `OrderItem`
- `OrderItem` is the join/intersection model that links products to orders.

## 2) API Contract

**Global error response shape**

All errors should return:

```json
{ "error": "Human-readable error message" }
```

### Products Endpoints

#### `GET /products`
- **Request**
  - No body.
  - Optional query params:
    - `category` (string): filter products by category (example: `?category=clothing`).
    - `sort` (string): sort ascending by supported fields:
      - `price` (example: `?sort=price`)
      - `name` (example: `?sort=name`)
  - Default behavior when no query parameters are provided:
    - Returns all products.
    - No explicit ordering is applied.
- **Query Parameters**
  - `category`: must be one of `clothing`, `school`, `electronics`, `accessories`, `other`.
  - `sort`: must be one of `price` or `name`.
- **Success**
  - `200 OK`
  - Body: array of products.
- **Error example**
  - `400 Bad Request`
  - `{ "error": "Invalid category value" }`
  - `400 Bad Request`
  - `{ "error": "sort must be one of: price, name" }`
  - `500 Internal Server Error`
  - `{ "error": "Unable to fetch products" }`

#### `GET /products/:id`
- **Request**
  - Route param: `id` (integer).
- **Success**
  - `200 OK`
  - Body: one product object.
- **Error example**
  - `404 Not Found`
  - `{ "error": "Product not found" }`

#### `POST /products`
- **Request body**
```json
{
  "name": "Notebook",
  "description": "College ruled notebook",
  "category": "school",
  "price": 4.99,
  "imageUrl": "https://example.com/notebook.png"
}
```
- **Success**
  - `201 Created`
  - Body: created product object.
- **Error example**
  - `400 Bad Request`
  - `{ "error": "name and price are required" }`

#### `PUT /products/:id`
- **Request**
  - Route param: `id` (integer).
  - Body: any updatable product fields (`name`, `description`, `category`, `price`, `imageUrl`).
- **Success**
  - `200 OK`
  - Body: updated product object.
- **Error example**
  - `404 Not Found`
  - `{ "error": "Product not found" }`

#### `DELETE /products/:id`
- **Request**
  - Route param: `id` (integer).
- **Success**
  - `200 OK`
  - Body:
```json
{ "message": "Product deleted" }
```
- **Error example**
  - `404 Not Found`
  - `{ "error": "Product not found" }`

> Cascade note: deleting a product also deletes any `OrderItem` rows that reference it.

### Orders Endpoints

#### `GET /orders`
- **Request**
  - No body.
  - Optional query param: `status`.
- **Success**
  - `200 OK`
  - Body: array of orders, each optionally including `items`.
- **Error example**
  - `500 Internal Server Error`
  - `{ "error": "Unable to fetch orders" }`

#### `GET /orders/:id`
- **Request**
  - Route param: `id` (integer).
- **Success**
  - `200 OK`
  - Body: order object including nested `items`.
- **Error example**
  - `404 Not Found`
  - `{ "error": "Order not found" }`

#### `POST /orders`
- **Request body**
```json
{
  "customerName": "Ada Lovelace",
  "customerEmail": "ada@example.com",
  "customerAddress": "123 Main St, San Francisco, CA",
  "status": "pending",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```
- **Success**
  - `201 Created`
  - Body: created order including nested `items` and computed `total`.
```json
{
  "id": 42,
  "customerName": "Ada Lovelace",
  "customerEmail": "ada@example.com",
  "customerAddress": "123 Main St, San Francisco, CA",
  "status": "pending",
  "total": 29.97,
  "items": [
    {
      "id": 101,
      "orderId": 42,
      "productId": 1,
      "quantity": 2,
      "unitPrice": 9.99,
      "lineTotal": 19.98
    },
    {
      "id": 102,
      "orderId": 42,
      "productId": 3,
      "quantity": 1,
      "unitPrice": 9.99,
      "lineTotal": 9.99
    }
  ]
}
```
- **Error examples**
  - `400 Bad Request`
  - `{ "error": "items must be a non-empty array" }`
  - `404 Not Found`
  - `{ "error": "One or more products do not exist" }`

#### `PUT /orders/:id`
- **Request**
  - Route param: `id` (integer).
  - Body: updatable order metadata (`customerName`, `customerEmail`, `customerAddress`, `status`).
  - This endpoint does not replace order items in this milestone.
- **Success**
  - `200 OK`
  - Body: updated order object.
- **Error example**
  - `404 Not Found`
  - `{ "error": "Order not found" }`

#### `DELETE /orders/:id`
- **Request**
  - Route param: `id` (integer).
- **Success**
  - `200 OK`
  - Body:
```json
{ "message": "Order deleted" }
```
- **Error example**
  - `404 Not Found`
  - `{ "error": "Order not found" }`

> Cascade note: deleting an order also deletes all associated `OrderItem` rows.

## 3) Transactional Flow for `POST /orders`

`POST /orders` must be atomic and run in a single Prisma transaction so partial orders are never persisted.

### Request shape

```json
{
  "customerName": "string",
  "customerEmail": "string",
  "customerAddress": "string",
  "status": "pending",
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}
```

### Data-layer steps (in order)

1. Validate request body:
   - Required customer fields must be present.
   - `items` must be a non-empty array.
   - Each item must include valid `productId` and positive `quantity`.
2. Start a Prisma transaction (`prisma.$transaction`).
3. Read all products referenced by `items` in one query (`findMany` with `id in [...]`).
4. Verify all requested product IDs exist:
   - If any are missing, throw an error and abort transaction.
5. Create the `Order` row first with metadata and temporary `total = 0`.
6. For each item:
   - Map `productId` to the fetched product price.
   - Compute `unitPrice` and `lineTotal = unitPrice * quantity`.
   - Create corresponding `OrderItem` row with `orderId`, `productId`, `quantity`, `unitPrice`, `lineTotal`.
7. Sum all `lineTotal` values to compute order `total`.
8. Update the newly created `Order` row with computed `total`.
9. Read back the full created order including nested items.
10. Commit transaction and return `201 Created`.

### Failure / rollback behavior

- If any step inside the transaction throws (for example, an item references a nonexistent product), Prisma rolls back the whole transaction.
- Result: no `Order` row and no `OrderItem` rows are persisted.
- API response should be:
  - `404 Not Found` with `{ "error": "One or more products do not exist" }` for missing product IDs.
  - `400 Bad Request` for validation issues.
  - `500 Internal Server Error` for unexpected failures.

## Decisions Log -- Product Model

- **Schema translation that went smoothly**: `id`, `createdAt`, and `updatedAt` mapped directly to Prisma decorators (`@id`, `@default(now())`, `@updatedAt`) without needing spec changes.
- **Field decision I made during implementation that wasn't in the original spec**: Route handlers validate `price` as a non-negative number before writing to the database to avoid invalid numeric input.
- **Route behavior that needed a spec update**: Added explicit `400` invalid-id handling (`/products/:id`) and empty-update-body handling for `PUT /products/:id`; success-path response shapes stayed aligned with the contract.

## Spec Reconciliation -- Milestone 4 (Schema Audit)

### Schema vs. spec gaps found
- `OrderItem` model and relation fields were missing from `schema.prisma`; added `OrderItem` with `orderId`, `productId`, `quantity`, `unitPrice`, `lineTotal`, `createdAt`, and `updatedAt` to match the spec.
- `Product` and `Order` relation arrays were missing; added `orderItems` relation fields on both models so schema relationships match planning.
- `GET /orders/:id` previously returned only the order row; updated data access to include associated `orderItems` per API contract.

### Cascade delete verification
- Deleting a Product removes associated OrderItems: ✅ tested
- Deleting an Order removes associated OrderItems: ✅ tested

## Decisions Log -- Order Creation Transaction

- **What my Transactional Flow spec got right**: The operation order was correct: validate input, load products, create order, create order items, compute/update total, and return order with nested items.
- **What the spec missed that I discovered during implementation**: I needed an explicit response-mapping step so the API returns `items` in responses while Prisma stores the relation as `orderItems`.
- **How the transaction error handling works**: `prisma.$transaction` runs all writes as one unit; if any step throws (like missing product IDs), Prisma rolls back all writes so no partial order or order items are saved.
- **One thing I'd design differently if starting over**: I would move order creation logic into a dedicated service layer early, so route handlers stay thin as transaction complexity grows.

## Final Spec Reconciliation: Project Complete

### Full-system audit result
- Frontend API usage now aligns with backend contract: product listing, product detail, and order creation all target the documented endpoints.
- `POST /orders` request and response shape match the spec, including nested `items` and computed `total`.
- Added CORS middleware in backend implementation so the browser frontend can call the API during development.

### Gaps resolved during frontend integration
- Frontend initially had no active API request flow; added axios requests for `GET /products`, `GET /products/:id`, and `POST /orders`.
- Frontend expected `image_url`; backend/spec uses `imageUrl`. Updated frontend to use `imageUrl`.
- Checkout UI originally used fields not present in the API contract (`name`/`dorm_number` state); updated to collect and send `customerName`, `customerEmail`, and `customerAddress`.
- Checkout success component expected legacy `purchase.receipt` response shape; updated it to render from the spec-compliant order response (`id`, `items`, `total`).

### What the spec enabled during this project
- The API contract and transaction spec made it straightforward to identify integration mismatches quickly, because every endpoint already had expected request/response shapes and error behavior documented.
- During debugging, the written spec reduced guesswork: once frontend fields were mapped to contract fields, the end-to-end flow worked without adding extra endpoints or undocumented payload formats.
