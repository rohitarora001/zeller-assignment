# Zeller Checkout — Solution Overview

## Project Overview
This project implements a simple point‑of‑sale checkout in TypeScript that supports composable pricing rules. Items are scanned by SKU, and the final price is computed by summing base prices and subtracting discounts contributed by each rule.

- Entry point: `index.ts`
- Core engine: `Checkout.ts`
- Rules: `OfferRules.ts` implementing `models/OfferRule.ts`
- Products catalog: `AllProducts.ts`
- Tests: `__tests__/checkout.test.ts`

## Problem Statement
Implement a checkout that:
- Scans items by SKU and validates them against a catalog
- Applies promotional rules when calculating the total
- Supports multiple promotions at once and is easy to extend with new rules

The included promotions mirror the assignment examples:
- 3‑for‑2 on Apple TV (`atv`)
- Bulk discount for Super iPad (`ipd`) when more than 4 are purchased (unit price drops to 499.99)

## Design & Approach
The design separates concerns between scanning items, pricing rules, and product data.

- Checkout pipeline: base total minus the sum of rule discounts
  - Base total: sum of line prices from the product catalog
  - Discounts: each rule inspects the full scanned items array and returns a numeric discount; the checkout subtracts the sum of all returned values
- Composable rules via a tiny interface
  - `OfferRule` exposes a single `discount(items: string[]): number` method (`models/OfferRule.ts:1`)
  - Rules are order‑independent and can be combined as long as their semantics don’t conflict
- Validation
  - `scan` validates that the SKU exists in the catalog and throws on unknown SKUs (`Checkout.ts:9`)

This keeps the core checkout logic minimal and shifts promotion complexity into independent rule objects.

## Key Files
- `Checkout.ts:16` — Computes base, aggregates discounts, and returns the final total.
- `OfferRules.ts:8` — `ThreeForTwoRule`: for every 3 matching SKUs, one is free.
- `OfferRules.ts:21` — `BulkDiscountRule`: if quantity is greater than a threshold, reduce unit price for all matching items.
- `AllProducts.ts:3` — In‑memory catalog keyed by SKU.
- `index.ts:13` — Example wiring: construct rules, scan items, print total.

## How It Works
1. Construct checkout with a list of rules:
   - `new ThreeForTwoRule("atv")`
   - `new BulkDiscountRule("ipd", 4, 499.99)`
2. Call `scan(sku)` for each item; unknown SKUs are rejected (`Checkout.ts:10`).
3. Call `total()` to compute:
   - Base = sum of product prices
   - Discount = sum of `rule.discount(items)` across all rules (`Checkout.ts:20`)
   - Final = Base − Discount (rounded to 2 decimals)

## Why This Approach
- Simplicity: The checkout doesn’t need to know promotion specifics; it only aggregates discounts.
- Extensibility: Add new promotions by implementing `OfferRule` without touching `Checkout`.
- Predictability: Rules run over the same immutable view of items and return an explicit discount value. This avoids hidden state and makes testing straightforward.

## Assumptions & Trade‑offs
- Rules are additive and independent: discounts are summed. If two rules target the same SKU in conflicting ways, you must encode precedence within a single rule or introduce a higher‑level rule that coordinates them.
- Rounding occurs at the very end to 2 decimals (`Checkout.ts:22`).
- Catalog is in‑memory for simplicity; a real system would back this with a database/service.

## Getting Started
Requirements: Node 18+.

Install dependencies:

- `npm install`

Run the sample scenario in `index.ts` (uses `ts-node`):

- `npx ts-node index.ts`

Run tests:

- `npm test`

## Tests
Unit tests cover the assignment scenarios and edge cases:
- 3‑for‑2 on `atv` with a `vga` add‑on (`__tests__/checkout.test.ts:5`)
- Bulk `ipd` discount when more than 4 are scanned (`__tests__/checkout.test.ts:13`)
- Combined offers apply together (`__tests__/checkout.test.ts:27`)
- Unknown SKU throws (`__tests__/checkout.test.ts:22`)

## Adding New Rules
Create a new class that implements `OfferRule` and add it to the rules list when constructing `Checkout`.

Example: a simple “Buy X Get Y Free” for the same SKU could compute the number of free units from quantities and return `freeUnits * unitPrice` as the discount, mirroring `ThreeForTwoRule` (`OfferRules.ts:8`).

Example: a bundle discount (e.g., buy `mbp` get `vga` free) could:
- Count pairs of `mbp` and `vga`
- Return `min(count(mbp), count(vga)) * priceOf("vga")` as the discount

## Folder Structure
- `index.ts` — Example usage / manual run
- `Checkout.ts` — Checkout engine (scan, total)
- `OfferRules.ts` — Concrete rule implementations
- `models/OfferRule.ts` — Rule interface
- `models/Product.ts` — Product model
- `AllProducts.ts` — Product catalog
- `__tests__/checkout.test.ts` — Jest tests
- `jest.config.js`, `tsconfig.json`, `package.json` — Tooling

## Future Improvements
- Add a rule coordinator to manage precedence and prevent conflicting discounts on the same line
- Add a pricing context to carry per‑rule data (e.g., per‑SKU subtotals) without recomputation
- Introduce a plug‑in registry for rules and serialized configuration
- Support localized currency formatting and tax rules

