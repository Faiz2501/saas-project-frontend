import type { NotificationType } from "@/types/notifications";
import {
  PartyPopper,
  TrendingUp,
  TrendingDown,
  Ticket,
  MessageCircle,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  KeySquare,
  ShieldCheck,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NotificationMeta {
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const NOTIFICATION_META: Record<NotificationType, NotificationMeta> = {
  WELCOME:             { icon: PartyPopper,   color: "text-blue-400",    bg: "bg-blue-500/10" },
  WALLET_CREDITED:     { icon: TrendingUp,    color: "text-green-400",   bg: "bg-green-500/10" },
  WALLET_DEBITED:      { icon: TrendingDown,  color: "text-orange-400",  bg: "bg-orange-500/10" },
  TICKET_RAISED:       { icon: Ticket,        color: "text-purple-400",  bg: "bg-purple-500/10" },
  TICKET_REPLIED:      { icon: MessageCircle, color: "text-blue-400",    bg: "bg-blue-500/10" },
  TICKET_RESOLVED:     { icon: CheckCircle2,  color: "text-green-400",   bg: "bg-green-500/10" },
  API_KEY_CREATED:     { icon: KeyRound,      color: "text-yellow-400",  bg: "bg-yellow-500/10" },
  API_KEY_ROTATED:     { icon: RefreshCw,     color: "text-yellow-400",  bg: "bg-yellow-500/10" },
  API_KEY_DEACTIVATED: { icon: KeySquare,     color: "text-red-400",     bg: "bg-red-500/10" },
  PERMISSIONS_UPDATED: { icon: ShieldCheck,   color: "text-indigo-400",  bg: "bg-indigo-500/10" },
};

export function getNotificationMeta(type: string): NotificationMeta {
  return (
    NOTIFICATION_META[type as NotificationType] ?? {
      icon: Bell,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
    }
  );
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}