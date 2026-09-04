"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, ArrowDownRight, RefreshCw, ShieldCheck } from "lucide-react";

export default function PaymentsConsolePage() {
  const transactions = [
    { id: "TXN-8091", type: "Dealer Subscription (Pro Shop)", entity: "Reed Motors Lagos", amount: 65000, date: "Today, 08:30 AM", status: "Successful (Paystack)", role: "Dealer" },
    { id: "TXN-8090", type: "Inspection Escrow Payment", entity: "Dr. Chidi Nwosu", amount: 75000, date: "Sept 2", status: "Escrow Held", role: "Buyer" },
    { id: "TXN-8089", type: "Technician Payout Release", entity: "Musa Danladi (Tech #01)", amount: 35000, date: "Sept 2", status: "Settled to Bank", role: "Technician" },
    { id: "TXN-8088", type: "Dealer Subscription (Pro Shop)", entity: "Crown Continental Autos", amount: 65000, date: "Sept 1", status: "Successful (Paystack)", role: "Dealer" },
    { id: "TXN-8087", type: "Inspection Fee Payment", entity: "Amina Bello", amount: 45000, date: "Sept 1", status: "Completed", role: "Buyer" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">
            Platform Payments & Escrow Console
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Reconcile inspection escrow deposits, technician bank payouts, and monthly dealer subscriptions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-400">Total 30-Day Volume</span>
            <div className="text-2xl font-black text-emerald-600">₦3,840,000</div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-neutral-900">Recent Financial Ledger</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Reference ID</th>
                <th className="pb-3">Transaction Category</th>
                <th className="pb-3">Counterparty</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Gateway Status</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 font-mono text-gray-500">{t.id}</td>
                  <td className="py-3.5 font-bold text-neutral-900">{t.type}</td>
                  <td className="py-3.5 text-gray-700 font-medium">{t.entity}</td>
                  <td className="py-3.5 font-black text-neutral-900">
                    ₦{t.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-md font-semibold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-400">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
