import Map from "./components/MapContainer/MapContainer";
import MapContainerReact from "./components/MapContainer/MapContainerReact";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start">
      <MapContainerReact />
    </main>
  );
}
