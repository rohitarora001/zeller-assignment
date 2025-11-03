import { Checkout } from "../services/Checkout";
import { ThreeForTwoRule, BulkDiscountRule } from "../services/OfferRules";

describe("Checkout pricing rules", () => {
  test("Test 1: atv 3-for-2 with vga", () => {
    const rules = [new ThreeForTwoRule("atv"), new BulkDiscountRule("ipd", 4, 499.99)];
    const co = new Checkout(rules);
    ["atv", "atv", "atv", "vga"].forEach((s) => co.scan(s));
    // 3x atv (109.50 each) with 3-for-2 => 2 * 109.50 + 1x vga (30.00)
    expect(co.total()).toBeCloseTo(219.0 + 30.0, 2);
  });

  test("Test 2: bulk ipd discount applies (>4)", () => {
    const rules = [new ThreeForTwoRule("atv"), new BulkDiscountRule("ipd", 4, 499.99)];
    const co = new Checkout(rules);
    ["atv", "ipd", "ipd", "atv", "ipd", "ipd", "ipd"].forEach((s) => co.scan(s));
    // 2x atv no 3-for-2 + 5x ipd at 499.99
    const expected = 2 * 109.5 + 5 * 499.99;
    expect(co.total()).toBeCloseTo(expected, 2);
  });

  test("Unknown SKU throws", () => {
    const co = new Checkout([]);
    expect(() => co.scan("unknown" as any)).toThrow(/Unknown SKU/);
  });

  test("Test 3: Combined discounts: atv 3-for-2 and ipd bulk", () => {
    const rules = [new ThreeForTwoRule("atv"), new BulkDiscountRule("ipd", 4, 499.99)];
    const co = new Checkout(rules);
    ["atv", "atv", "atv", "ipd", "ipd", "ipd", "ipd", "ipd", "vga"].forEach((s) => co.scan(s));
    const expected = 2 * 109.5 + 5 * 499.99 + 30.0; // atv 3-for-2, ipd bulk, vga normal
    expect(co.total()).toBeCloseTo(expected, 2);
  });
});
