import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-start overflow-y-hidden">
      <h2 className="w-full bg-appBlue p-4 text-center text-lg font-bold text-appBG">
        Page not found
      </h2>
      <div className="p-4">
        <p className="mb-4">{`We're sorry but we couldn't find that page. Try searching again on the home page.`}</p>
        <Link href="/">
          <button className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">
            Back to Home
          </button>
        </Link>
      </div>
    </main>
  );
}
