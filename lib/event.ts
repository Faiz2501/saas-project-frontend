export const WALLET_UPDATED_EVENT = "wallet-updated";

export function notifyWalletUpdated() {
  window.dispatchEvent(new Event(WALLET_UPDATED_EVENT));
}