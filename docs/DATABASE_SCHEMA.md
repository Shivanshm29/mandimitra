# MANDIMITRA — Database Schema & Data Modeling

## 1. Design Principles
- **Strict Monetary Types**: All financial values (rates, deductions, payments, balances) use `DECIMAL(12, 2)` or `NUMERIC(12, 2)`. Floating-point arithmetic is strictly forbidden.
- **Base Currency**: Indian Rupee (INR / ₹).
- **Time Precision**: All timestamps are stored in UTC (`TIMESTAMP WITH TIME ZONE`).
- **Normalized Architecture**: Clean primary/foreign key constraints preventing orphaned transactions.

---

## 2. Implemented Schema (Phase 1)

### `users`
Core authentication and credentials table.
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `farmer_profiles`
Associated farmer demographic and geographic context.
```sql
CREATE TABLE farmer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    district VARCHAR(100) NOT NULL,
    village VARCHAR(150) NOT NULL,
    locality VARCHAR(255),
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'mr-IN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Comprehensive Future Schema Specification (Phases 2-6)

### `traders`
Registered mandi commission agents, buyers, or private traders.
- `id` (PK)
- `name` (VARCHAR)
- `firm_name` (VARCHAR)
- `mandi_license_number` (VARCHAR, optional)
- `phone_number` (VARCHAR)
- `market_name` (VARCHAR)
- `district` (VARCHAR)
- `state` (VARCHAR)

### `selling_lots`
Harvested produce lots ready or available for sale.
- `id` (PK)
- `farmer_id` (FK -> farmer_profiles.id)
- `commodity` (VARCHAR) (e.g., Soybean, Onion, Cotton)
- `variety` (VARCHAR)
- `quantity` (DECIMAL(10, 2))
- `quantity_unit` (VARCHAR) (e.g., Quintal, Bag, Kg)
- `expected_rate_min` (DECIMAL(12, 2))
- `status` (VARCHAR) (`AVAILABLE`, `COMMITTED`, `SOLD`)
- `harvest_date` (DATE)

### `market_prices`
Daily government-reported mandi price records.
- `id` (PK)
- `state` (VARCHAR)
- `district` (VARCHAR)
- `market_name` (VARCHAR)
- `commodity` (VARCHAR)
- `variety` (VARCHAR)
- `arrival_date` (DATE)
- `min_price` (DECIMAL(12, 2))
- `max_price` (DECIMAL(12, 2))
- `modal_price` (DECIMAL(12, 2))
- `arrivals_volume` (DECIMAL(10, 2), optional)
- `data_source` (VARCHAR) (e.g., AGMARKNET, DATA_GOV_IN)
- `reported_at` (TIMESTAMP)

### `sales`
Recorded sales transactions between a farmer and a trader.
- `id` (PK)
- `farmer_id` (FK -> farmer_profiles.id)
- `trader_id` (FK -> traders.id, optional)
- `lot_id` (FK -> selling_lots.id, optional)
- `commodity` (VARCHAR)
- `variety` (VARCHAR)
- `quantity` (DECIMAL(10, 2))
- `rate_per_unit` (DECIMAL(12, 2))
- `gross_amount` (DECIMAL(12, 2))
- `total_deductions` (DECIMAL(12, 2))
- `net_receivable` (DECIMAL(12, 2))
- `amount_received` (DECIMAL(12, 2))
- `outstanding_balance` (DECIMAL(12, 2))
- `status` (VARCHAR) (`PENDING`, `PARTIALLY_PAID`, `SETTLED`)
- `sale_date` (DATE)

### `sale_deductions`
Itemized deductions recorded on weighing slips or trader vouchers.
- `id` (PK)
- `sale_id` (FK -> sales.id ON DELETE CASCADE)
- `deduction_type` (VARCHAR) (e.g., `MANDI_CESS`, `WEIGHING_FEE`, `HAMALI`, `COMMISSION`, `TRANSPORT`, `QUALITY_CUT`)
- `amount` (DECIMAL(12, 2))
- `description` (TEXT)

### `payments`
Inflows received from buyers/traders.
- `id` (PK)
- `farmer_id` (FK -> farmer_profiles.id)
- `trader_id` (FK -> traders.id, optional)
- `payment_date` (DATE)
- `amount` (DECIMAL(12, 2))
- `payment_mode` (VARCHAR) (`CASH`, `UPI_TRANSFER`, `CHEQUE`, `NEFT`)
- `reference_note` (VARCHAR)

### `payment_allocations`
Links payments to specific sales (supporting partial payment across multiple sales).
- `id` (PK)
- `payment_id` (FK -> payments.id ON DELETE CASCADE)
- `sale_id` (FK -> sales.id ON DELETE CASCADE)
- `allocated_amount` (DECIMAL(12, 2))

### `documents`
Uploaded weighing slips, receipts, and settlement vouchers.
- `id` (PK)
- `farmer_id` (FK -> farmer_profiles.id)
- `sale_id` (FK -> sales.id, optional)
- `document_type` (VARCHAR) (`WEIGHING_SLIP`, `TRADER_VOUCHER`, `UPI_SCREENSHOT`)
- `file_path` (VARCHAR)
- `ocr_raw_text` (TEXT, optional)
- `parsed_data` (JSONB, optional)

### `conversation_sessions` & `assistant_action_logs`
Sarvam AI voice/text interactions and validated agent tool executions.
- Session context, audio transcript references, structured action payloads, and safety verification status.

