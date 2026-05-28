import Link from "next/link";
import { ArrowRight, Bell, CircleHelp, History, QrCode, ScanLine, Send, ShieldCheck, UserRound } from "lucide-react";
import { ConsumerShell } from "../components/consumer-shell";
import { BalanceCard, Card, ContactAvatar, QuickActionCard, SafetyBanner, TransactionRow } from "../components/ui";
import { apiGet, type Account, type Payment } from "../lib/api";
import { groupPaymentsByDate, hasPendingPayment, recentContacts, recentMerchants } from "../lib/demo-data";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const [accounts, transactions] = await Promise.all([
    apiGet<Account[]>("/api/accounts", []),
    apiGet<Payment[]>("/api/transactions", [])
  ]);
  const primary = accounts[0];
  const grouped = groupPaymentsByDate(transactions);
  const pending = hasPendingPayment(transactions);

  return (
    <ConsumerShell>
      <div className="space-y-5">
        <section className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500">{greeting()}, Raghu</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Ready to pay securely?</h1>
            <p className="mt-1 text-xs font-semibold text-slate-500">Sandbox payment environment</p>
          </div>
          <button className="grid size-11 place-items-center rounded-2xl border border-slate-900/10 bg-white text-midnight shadow-sm" aria-label="Notifications">
            <Bell size={19} aria-hidden />
          </button>
        </section>

        <BalanceCard balance={primary?.balance ?? 0} account={`${primary?.bankName ?? "Demo Bank"} ${primary?.maskedNumber ?? "**** 4242"}`} vpa="raghu@rpay" />

        {pending ? <SafetyBanner tone="warn">You have a pending payment waiting for payment network confirmation.</SafetyBanner> : null}

        <section className="grid grid-cols-4 gap-3">
          <QuickActionCard href="/scan" label="Scan & Pay" icon={<ScanLine size={21} aria-hidden />} tone="aqua" />
          <QuickActionCard href="/pay" label="Pay UPI ID" icon={<Send size={21} aria-hidden />} tone="indigo" />
          <QuickActionCard href="/pay" label="Pay Contact" icon={<UserRound size={21} aria-hidden />} tone="amber" />
          <QuickActionCard href="/transactions" label="History" icon={<History size={21} aria-hidden />} tone="plum" />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent contacts</h2>
            <Link className="text-xs font-semibold text-indigo" href="/pay">
              Pay contact
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 rpay-scrollbar">
            {recentContacts.map((contact) => (
              <Link key={contact.vpa} href={`/pay/confirm?payeeVpa=${encodeURIComponent(contact.vpa)}&amount=100&note=Quick%20pay`} className="min-w-20 rounded-2xl bg-white p-3 text-center shadow-sm">
                <ContactAvatar name={contact.name} tone={contact.tone} />
                <span className="mt-2 block text-xs font-semibold">{contact.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent transactions</h2>
            <Link className="text-sm font-semibold text-indigo" href="/transactions">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {grouped.slice(0, 1).map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
                {group.items.slice(0, 3).map((payment) => (
                  <TransactionRow key={payment.id} payment={payment} href={`/transactions/${payment.id}`} />
                ))}
              </div>
            ))}
            {transactions.length === 0 ? (
              <Card className="p-5 text-center">
                <p className="font-semibold">No transactions yet</p>
                <Link className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-indigo" href="/pay">
                  Send first payment <ArrowRight size={16} aria-hidden />
                </Link>
              </Card>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Recent merchants</h2>
          <div className="grid gap-3">
            {recentMerchants.map((merchant) => (
              <Link key={merchant.vpa} href={`/pay/confirm?payeeVpa=${encodeURIComponent(merchant.vpa)}&amount=250&note=${encodeURIComponent(merchant.category)}`} className="flex items-center gap-3 rounded-2xl border border-slate-900/8 bg-white p-3 shadow-sm">
                <ContactAvatar name={merchant.name} tone="indigo" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{merchant.name}</span>
                  <span className="text-xs font-semibold text-slate-500">{merchant.category} · {merchant.vpa}</span>
                </span>
                <ArrowRight size={18} className="text-slate-400" aria-hidden />
              </Link>
            ))}
          </div>
        </section>

        <SafetyBanner>
          <ShieldCheck size={16} aria-hidden />
          Sandbox mode: transactions are simulated for this demo.
        </SafetyBanner>
      </div>
    </ConsumerShell>
  );
}
