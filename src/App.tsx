import { useEffect, useRef } from 'react';
import { TonyCore } from './core/TonyCore';
import { WorkshopUI } from './ui/WorkshopUI';

export default function App() {
  const core = useRef(new TonyCore());
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current && core.current) {
      core.current.initialize(mapRef.current);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900">
      <WorkshopUI core={core.current} mapRef={mapRef} />
    </div>
  );
}