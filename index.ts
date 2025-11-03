import { Checkout } from "./Checkout";
import { ThreeForTwoRule, BulkDiscountRule } from "./OfferRules";

interface CheckoutRequest {
  items: string[];
}

const payload: CheckoutRequest = {
  items: ["atv", "atv", "atv", "vga"], // Example 1
  // items: ["atv", "ipd", "ipd", "atv", "ipd", "ipd", "ipd"], // Example 2
};

// Offer rules
const offerRules = [
  new ThreeForTwoRule("atv"), // 3 for 2 Apple TV offer
  new BulkDiscountRule("ipd", 4, 499.99), // Bulk iPad discount when count is greater then 4
];

// Creating checkout
const checkout = new Checkout(offerRules);

// Scanning all items from payload
payload.items.forEach((sku) => checkout.scan(sku));

// Calculating total
const total = checkout.total();

// Displaying results
console.log("SKUs Scanned:", payload.items.join(", "));
console.log("Total expected: $" + total.toFixed(2));
