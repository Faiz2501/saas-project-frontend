export type NotificationType =
  | "WELCOME"
  | "WALLET_CREDITED"
  | "WALLET_DEBITED"
  | "TICKET_RAISED"
  | "TICKET_REPLIED"
  | "TICKET_RESOLVED"
  | "API_KEY_CREATED"
  | "API_KEY_ROTATED"
  | "API_KEY_DEACTIVATED"
  | "PERMISSIONS_UPDATED";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
