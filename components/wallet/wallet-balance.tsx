import { Wallet } from "lucide-react";

interface WalletBalanceProps {
  balance: number;
  onAddFunds?: () => void;
}

export default function WalletBalance({
  balance,
  onAddFunds,
}: WalletBalanceProps) {
  return (
    <div
      className="
      rounded-xl
      border border-slate-800
      bg-gradient-to-br
      from-[#0a1d33]
      to-[#122742]
      p-6
    "
    >
      <div className="mb-4 flex items-center gap-3">
        <Wallet size={20} className="text-blue-400" />
        <span className="text-slate-400">Available Balance</span>
      </div>

      <h2 className="text-5xl font-semibold text-white">
        ₹{new Intl.NumberFormat("en-IN").format(Number(balance || 0))}
      </h2>

      <p className="mt-2 text-sm text-slate-500">Auto recharge enabled</p>

      <button
        onClick={onAddFunds}
        className="
          mt-6
          w-full
          rounded-sm
          bg-blue-600
          py-3
          font-medium
          text-white
          transition-all
          hover:bg-blue-500
        "
      >
        Add Funds
      </button>
    </div>
  );
}