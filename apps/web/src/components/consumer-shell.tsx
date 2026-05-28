import { ConsumerTopBar, MobileShell } from "./ui";
import { BottomNav } from "./bottom-nav";

export function ConsumerShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileShell>
      <div className="flex min-h-screen flex-col md:min-h-[860px]">
        <ConsumerTopBar />
        <section className="rpay-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-5">{children}</section>
        <BottomNav />
      </div>
    </MobileShell>
  );
}
