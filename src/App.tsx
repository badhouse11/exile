import { useEffect, useState } from 'react';
import { isRoomCode, makeRoomCode } from './net/protocol';
import Home from './screens/Home';
import Rules from './screens/Rules';
import Room from './screens/Room';

export type Route = { to: 'home' } | { to: 'rules' } | { to: 'room'; code: string; create?: boolean; watch?: boolean };

function fromUrl(): Route {
  const code = new URLSearchParams(window.location.search).get('room')?.toUpperCase() ?? '';
  return isRoomCode(code) ? { to: 'room', code } : { to: 'home' };
}

export default function App() {
  const [route, setRoute] = useState<Route>(fromUrl);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (route.to === 'room') url.searchParams.set('room', route.code);
    else url.searchParams.delete('room');
    window.history.replaceState(null, '', url.toString());
    window.scrollTo(0, 0);
  }, [route]);

  if (route.to === 'rules') return <Rules onBack={() => setRoute({ to: 'home' })} />;
  if (route.to === 'room') return <Room key={route.code} code={route.code} create={!!route.create} watch={!!route.watch} onLeave={() => setRoute({ to: 'home' })} />;
  return (
    <Home
      onStart={() => setRoute({ to: 'room', code: makeRoomCode(), create: true })}
      onJoin={(code) => setRoute({ to: 'room', code })}
      onWatch={(code) => setRoute({ to: 'room', code, watch: true })}
      onRules={() => setRoute({ to: 'rules' })}
    />
  );
}
