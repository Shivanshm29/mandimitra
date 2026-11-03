# MANDIMITRA — Product Specification

## 1. Vision & Purpose
MANDIMITRA is a multilingual agricultural market and financial intelligence platform designed for Indian farmers, with an initial focus on Maharashtra. It bridges the critical information gap between harvest and revenue realization, empowering farmers to discover genuine government-reported mandi prices, compare markets, record sales, track partial payments/deductions, and receive AI-guided financial explanations through Sarvam AI in Marathi (mr-IN), Hindi (hi-IN), and English (en-IN).

---

## 2. Approved Product Pillars

### A. Farmer Management
- Authentication & Session Management (secure token-based auth).
- Farmer Profile: Display name, optional phone number, location hierarchy (State, District, Village, Locality), preferred language (`mr-IN`, `hi-IN`, `en-IN`).
- Selling history and produce inventory records.

### B. Mandi Intelligence
- Actual government-reported mandi prices (minimum, maximum, modal prices per quintal).
- Filtering by State, District, Market, Commodity, and Variety.
- Stamped reporting dates, data source transparency, and arrival volumes (where reported).
- Historical price trend visualizations and multi-market comparison.

### C. Selling Recommendations
- Inputs: Commodity, variety, quantity, and desired selling window.
- Comparative analysis across accessible mandis based on latest reported modal rates.
- Transparent reasoning; explicit indicators for missing, estimated, or stale data.
- **Rule**: Never guarantee a selling price.

### D. Transaction and Payment Intelligence
- Comprehensive sales record: Buyer/trader name, commodity, quantity, rate per unit, gross amount, and sale date.
- Itemized deductions (market cess, weighing fees, commission, hamali/labor).
- Payment tracking: Installment records (Cash, UPI receipt reference, Cheque), partial payment allocation across sales.
- Real-time balance calculations: Gross amount, net receivable, total received, outstanding balance.
- Payment evidence document linkage.

### E. Sarvam AI Integration
- Speech-to-Text (`Saaras` for Indic voice queries).
- Text-to-Speech (`Bulbul` for voice narration in Marathi, Hindi, English).
- Chat completions (`sarvam-105b` / `sarvam-105b-conversations` for structured market reasoning and advice).
- Document Intelligence (Weighing slip and sale receipt OCR/parsing).
- All AI calls originate strictly from the backend via validated tool boundaries.

### F. Financial Intelligence / Profit Coach
- Profit & loss summaries per crop and season.
- Deductions audit to identify abnormal or unagreed trader deductions.
- Outstanding receivables aging analysis.
- Clear, plain-language financial breakdowns delivered in farmer's preferred language.

---

## 3. Explicit Non-Goals & Exclusions
To maintain product focus and avoid feature sprawl, the following are strictly prohibited:
- Agronomy advice (seed selection, irrigation, fertilizers, pesticides, disease detection).
- Logistics operations (vehicle booking, route optimization, transit cost calculators).
- Banking/fintech operations (direct UPI payment execution, bank account transfers, loan underwriting).
- Generic open-ended non-agricultural chatbots.

