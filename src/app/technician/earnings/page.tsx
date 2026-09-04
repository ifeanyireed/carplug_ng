"use client";

import React from "react";
import { Wallet, ArrowDownRight, CheckCircle2, DollarSign } from "lucide-react";

export default function TechnicianEarningsPage() {
  const payouts = [
    { id: "PAY-901", vehicle: "2021 Lexus RX 350", tier: "Comprehensive", fee: 35000, date: "Sept 2, 2026", status: "Paid to Access Bank" },
    { id: "PAY-882", vehicle: "2020 Toyota Camry XSE", tier: "Premium", fee: 28000, date: "Sept 1, 2026", status: "Paid to Access Bank" },
    { id: "PAY-741", vehicle: "2019 Honda Accord", tier: "Standard", fee: 18000, date: "Aug 29, 2026", status: "Paid to Access Bank" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Earnings & Payout Wallet</h1>
          <p className="text-xs text-gray-500 mt-1">
            Inspection fee splits are auto-settled within 24 hours of report completion
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400">Withdrawable Balance</span>
          <div className="text-2xl font-black text-emerald-600">₦81,000</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-neutral-900">Completed Audit Settlements</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider">
                <th className="pb-3">Reference</th>
                <th className="pb-3">Inspected Vehicle</th>
                <th className="pb-3">Audit Tier</th>
                <th className="pb-3">Payout Amount</th>
                <th className="pb-3">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 font-mono text-gray-500">{p.id}</td>
                  <td className="py-3 font-bold text-neutral-900">{p.vehicle}</td>
                  <td className="py-3 text-gray-600">{p.tier}</td>
                  <td className="py-3 font-black text-neutral-900">
                    ₦{p.fee.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
