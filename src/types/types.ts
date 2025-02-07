/**
 * Supported payment methods
 */
export type PaymentMethod = "esewa" | "khalti";

/**
 * Request payload for initiating a payment
 */
export interface PaymentRequestData {
  method: PaymentMethod;
  amount: string;           // Payment amount (in NPR)
  productName: string;      // Name of the product or service
  transactionId: string;    // Unique transaction identifier
  userId: string;           // User initiating the payment
  eventId: string;          // Event associated with the payment
}
