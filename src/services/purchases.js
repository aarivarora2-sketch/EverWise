import { Capacitor, registerPlugin } from "@capacitor/core";

const NativePurchases = registerPlugin("EverwisePurchases");

export const PRODUCT_IDS = {
  annual: "com.everwise.app.annual",
  monthly: "com.everwise.app.monthly",
};

export function nativePurchasesAvailable() {
  return Capacitor.isNativePlatform();
}

export async function getSubscriptionProducts() {
  if (!nativePurchasesAvailable()) return [];
  const result = await NativePurchases.getProducts();
  return result.products || [];
}

export async function purchaseSubscription(plan) {
  if (!nativePurchasesAvailable()) {
    throw new Error("Purchases are only available in the iPhone app.");
  }
  return NativePurchases.purchase({ productId: PRODUCT_IDS[plan] });
}

export async function restoreSubscriptions() {
  if (!nativePurchasesAvailable()) {
    throw new Error("Purchases are only available in the iPhone app.");
  }
  return NativePurchases.restore();
}

export async function getCurrentEntitlement() {
  if (!nativePurchasesAvailable()) return { active: false };
  return NativePurchases.currentEntitlement();
}

export function planForProduct(productId) {
  return Object.entries(PRODUCT_IDS).find(([, id]) => id === productId)?.[0] || null;
}
