// Centers the mobile-first app and, on larger screens, frames it like a phone
// so the experience stays focused and readable.
export default function PhoneShell({ children }) {
  return (
    <div className="min-h-screen w-full bg-cream-deep sm:flex sm:items-center sm:justify-center sm:py-8">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-cream shadow-none sm:min-h-[860px] sm:rounded-[40px] sm:shadow-[0_20px_60px_rgba(34,32,28,0.18)]">
        {children}
      </div>
    </div>
  );
}
