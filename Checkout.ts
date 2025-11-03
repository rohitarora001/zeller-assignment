import { AllProducts } from "./AllProducts";
import { OfferRule } from "./models/OfferRule";

export class Checkout {
  private items: string[] = [];

  constructor(private readonly rules: OfferRule[]) {}

  scan(sku: string): void {
    if (!(sku in AllProducts)) {
      throw new Error(`Unknown SKU: ${sku}`);
    }
    this.items.push(sku);
  }

  total(): number {
    // Base total is sum of item prices without discounts/offers applied
    const base = this.items.reduce((acc, s) => acc + AllProducts[s].price, 0);
    // Sum all discounts provided by rules
    const totalDiscount = this.rules.reduce((acc, r) => acc + Math.max(0, r.discount(this.items)), 0);
    const total = base - totalDiscount;
    return Number(total.toFixed(2));
  }
}
