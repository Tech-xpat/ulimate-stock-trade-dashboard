import { Search, Filter, TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

export function TransactionHistory() {
  const transactions = [
    {
      id: 1,
      type: "buy",
      symbol: "BTC/USD",
      amount: "+0.025 BTC",
      value: "$1,250.00",
      date: "2025-01-10",
      time: "14:32",
      status: "completed",
    },
    {
      id: 2,
      type: "deposit",
      symbol: "USD",
      amount: "+$5,000.00",
      value: "$5,000.00",
      date: "2025-01-10",
      time: "09:15",
      status: "completed",
    },
    {
      id: 3,
      type: "buy",
      symbol: "ETH/USD",
      amount: "+1.5 ETH",
      value: "$3,450.00",
      date: "2025-01-09",
      time: "16:45",
      status: "completed",
    },
    {
      id: 4,
      type: "sell",
      symbol: "AAPL",
      amount: "-10 shares",
      value: "$1,850.00",
      date: "2025-01-09",
      time: "11:20",
      status: "completed",
    },
    {
      id: 5,
      type: "withdraw",
      symbol: "USD",
      amount: "-$2,000.00",
      value: "$2,000.00",
      date: "2025-01-08",
      time: "13:00",
      status: "completed",
    },
    {
      id: 6,
      type: "buy",
      symbol: "TSLA",
      amount: "+5 shares",
      value: "$1,125.00",
      date: "2025-01-08",
      time: "10:30",
      status: "completed",
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "buy"
                      ? "bg-emerald-500/10"
                      : transaction.type === "sell"
                        ? "bg-red-500/10"
                        : transaction.type === "deposit"
                          ? "bg-blue-500/10"
                          : "bg-orange-500/10"
                  }`}
                >
                  {transaction.type === "buy" && <TrendingUp className="w-5 h-5 text-emerald-400" />}
                  {transaction.type === "sell" && <TrendingDown className="w-5 h-5 text-red-400" />}
                  {transaction.type === "deposit" && <ArrowDownToLine className="w-5 h-5 text-blue-400" />}
                  {transaction.type === "withdraw" && <ArrowUpFromLine className="w-5 h-5 text-orange-400" />}
                </div>
                <div>
                  <p className="font-semibold text-sm capitalize">{transaction.type}</p>
                  <p className="text-xs text-slate-400">{transaction.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold text-sm ${
                    transaction.type === "buy" || transaction.type === "deposit" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {transaction.amount}
                </p>
                <p className="text-xs text-slate-400">{transaction.value}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
              <span>
                {transaction.date} at {transaction.time}
              </span>
              <span className="text-emerald-400 capitalize">{transaction.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
