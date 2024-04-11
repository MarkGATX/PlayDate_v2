import Image from "next/image";
import Header from "./components/Header/Header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start">
      <Header />
    </main>
  );
}
