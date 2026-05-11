"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

type PaymentRequest = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  plan: string;
  amount: number;
  transaction_note: string;
  status: string;
  created_at: string;
};

export default function AdminPaymentsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");

  async function loadRequests() {
    setLoading(true);

    let query = supabase
      .from("payment_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      toast.error("Хүсэлтүүд унших үед алдаа гарлаа");
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    if (status === "approved") {
      const res = await fetch("/api/admin/approve-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Approve хийх үед алдаа гарлаа");
        return;
      }

      toast.success(`Approve хийлээ. ${data.creditsAdded} credit нэмэгдлээ`);
    } else {
      const { error } = await supabase
        .from("payment_requests")
        .update({ status })
        .eq("id", id);

      if (error) {
        toast.error("Reject хийх үед алдаа гарлаа");
        return;
      }

      toast.success("Reject хийлээ");
    }

    setRequests((prev) => prev.filter((item) => item.id !== id));
  }

  useEffect(() => {
    loadRequests();
  }, [filter]);

  return (
    <main className="min-h-screen bg-[#050711] px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-pink-400">Admin</p>
            <h1 className="mt-1 text-2xl font-semibold">Төлбөрийн хүсэлтүүд</h1>
          </div>

          <button
            onClick={loadRequests}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
          >
            Refresh
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-xl border px-4 py-2 text-sm ${
                filter === item
                  ? "border-pink-500 bg-pink-500 text-white"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading && <p className="text-sm text-slate-400">Уншиж байна...</p>}

          {!loading && requests.length === 0 && (
            <p className="text-sm text-slate-400">Хүсэлт алга.</p>
          )}

          {requests.map((item) => {
            const isCompact = filter !== "pending";

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                {isCompact ? (
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {item.transaction_note}
                        </p>

                        <span
                          className={`rounded-full px-2 py-1 text-[11px] ${
                            item.status === "approved"
                              ? "bg-green-500/10 text-green-300"
                              : item.status === "rejected"
                                ? "bg-red-500/10 text-red-300"
                                : "bg-yellow-500/10 text-yellow-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.plan} · {item.amount?.toLocaleString()}₮ ·{" "}
                        {new Date(item.created_at).toLocaleString("mn-MN")}
                      </p>
                    </div>

                    <p className="text-xs text-slate-400">
                      {item.phone} {item.email ? `· ${item.email}` : ""}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-medium">{item.name}</h2>

                        <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-[11px] text-yellow-300">
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                        <p>Утас: {item.phone}</p>
                        <p>Email: {item.email || "-"}</p>
                        <p>Багц: {item.plan}</p>
                        <p>Дүн: {item.amount?.toLocaleString()}₮</p>
                        <p>Гүйлгээний утга: {item.transaction_note}</p>
                        <p>
                          Огноо:{" "}
                          {new Date(item.created_at).toLocaleString("mn-MN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(item.id, "approved")}
                        className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(item.id, "rejected")}
                        className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
