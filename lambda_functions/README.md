# Generated Lambda Handlers

Auto-generated CRUD API handlers for DynamoDB.

## Entities

### User

**Partition Key:** `user_id`

**Fields:**
- `user_id` (string) - ✓ Required (Partition Key)
- `first_name` (string) - ✓ Required
- `last_name` (string) - ✓ Required

**Endpoints:**
- `GET /users` - Get all users
- `GET /users/{user_id}` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

**Environment Variables:**
- `USER_TABLE_NAME` - DynamoDB table name for users

**Handler Location:**
- `user/handler.py`

---

### Order

**Partition Key:** `order_id`

**Fields:**
- `order_id` (string) - ✓ Required (Partition Key)
- `user_id` (string) - ✓ Required
- `product_name` (string) - ✓ Required

**Endpoints:**
- `GET /orders` - Get all orders
- `GET /orders/{order_id}` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/{order_id}` - Update order
- `DELETE /orders/{order_id}` - Delete order

**Environment Variables:**
- `ORDER_TABLE_NAME` - DynamoDB table name for orders

**Handler Location:**
- `order/handler.py`

---

