// Centers the mobile-first app and, on larger screens, frames it like a phone
// so the experience stays focused and readable.
//
// The shell is locked to exactly the viewport height and clips its overflow.
// That matters: if the page itself can also scroll, the browser hands off
// between the page scroll and a screen's inner scroll, which feels like the
// content sticking for a moment before jumping. Only inner areas scroll.
export default function PhoneShell({ children }) {
  return (
    <div className="app-viewport box-border h-[100dvh] w-full overflow-hidden sm:flex sm:items-center sm:justify-center sm:py-8">
      <div className="app-shell relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-cream shadow-none sm:h-[min(860px,100%)] sm:rounded-[40px] sm:shadow-[0_20px_60px_rgba(34,32,28,0.18)]">
        {children}
      </div>
    </div>
  );
}
