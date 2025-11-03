import { OfferRule } from "../models/OfferRule";
import { AllProducts } from "../data/AllProducts";

const priceOf = (sku: string): number => AllProducts[sku].price;
const sumRaw = (items: string[]): number => items.reduce((acc, sku) => acc + priceOf(sku), 0);
const countOf = (items: string[], sku: string): number => items.reduce((n, s) => n + (s === sku ? 1 : 0), 0);

export class ThreeForTwoRule implements OfferRule {
  constructor(private readonly sku: string) {}

  discount(items: string[]): number {
    const qty = countOf(items, this.sku);
    if (qty === 0) return 0;

    // For every 3 purchased, one is free
    const freeUnits = Math.floor(qty / 3);
    return freeUnits * priceOf(this.sku);
  }
}

export class BulkDiscountRule implements OfferRule {
  constructor(
    private readonly sku: string,
    private readonly minQty: number,
    private readonly newPrice: number
  ) {}

  discount(items: string[]): number {
    const qty = countOf(items, this.sku);
    if (qty <= this.minQty) return 0;

    const unitPrice = priceOf(this.sku);
    const discountPerUnit = unitPrice - this.newPrice;
    return discountPerUnit * qty;
  }
}
