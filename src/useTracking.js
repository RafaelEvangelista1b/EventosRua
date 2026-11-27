import { useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const native = Capacitor.isNativePlatform();
const deniedMessage = 'Permissão de localização negada. Libere o acesso nas configurações e tente novamente.';

function locationError(code) {
  switch (code) {
    case 1:
    case 'OS-PLUG-GLOC-0003':
      return deniedMessage;
    case 'OS-PLUG-GLOC-0007':
    case 'OS-PLUG-GLOC-0009':
    case 'OS-PLUG-GLOC-0016':
    case 'OS-PLUG-GLOC-0017':
      return 'Ative a localização do dispositivo e tente novamente.';
    case 3:
    case 'OS-PLUG-GLOC-0010':
      return 'O tempo para obter a localização se esgotou. Tente novamente em um local aberto.';
    default:
      return 'Localização indisponível. Verifique o sinal e tente novamente.';
  }
}

async function hasLocationPermission() {
  if (!native) {
    // O próprio navegador solicita permissão ao iniciar o monitoramento.
    if (!navigator.permissions) return true;
    const permission = await Geolocation.checkPermissions().catch(() => null);
    return permission?.location !== 'denied';
  }

  let permission = await Geolocation.checkPermissions();
  if (permission.location.startsWith('prompt') || permission.coarseLocation.startsWith('prompt')) {
    permission = await Geolocation.requestPermissions();
  }
  return permission.location === 'granted' || permission.coarseLocation === 'granted';
}

export function useTracking() {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const tracking = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const onVisibilityChange = () => {
      if (document.hidden) void stopTracking();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // onStop no Android evita interromper a solicitação nativa de permissão.
    const listener = native
      ? CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) void stopTracking();
        }).catch(() => null)
      : null;

    return () => {
      mounted.current = false;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void listener?.then((handle) => handle?.remove());
      void stopTracking();
    };
  }, []);

  async function stopTracking() {
    const session = tracking.current;
    if (!session || session.stopping) return;

    session.cancelled = true;
    session.stopping = true;
    if (mounted.current) setStatus('stopping');

    const id = await session.ready.catch(() => null);
    if (id !== null) {
      try {
        await Geolocation.clearWatch({ id });
      } catch (failure) {
        if (failure.code !== 'OS-PLUG-GLOC-0012') {
          session.stopping = false;
          if (mounted.current) {
            setError('Não foi possível encerrar o rastreamento. Tente parar novamente.');
            setStatus('stopFailed');
          }
          return;
        }
      }
    }

    tracking.current = null;
    if (mounted.current) setStatus('idle');
  }

  async function startTracking() {
    if (tracking.current || document.hidden) return;

    setError('');
    setStatus('starting');
    const session = { cancelled: false, stopping: false, ready: null };
    tracking.current = session;

    session.ready = (async () => {
      if (!native && (!window.isSecureContext || !navigator.geolocation)) {
        throw new Error('A localização no navegador precisa de HTTPS ou localhost.');
      }

      if (!(await hasLocationPermission())) throw new Error(deniedMessage);
      if (session.cancelled) return null;

      return Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        (position, failure) => {
          if (session.cancelled || !mounted.current) return;

          if (failure) {
            setError(locationError(failure.code));
            void stopTracking();
          } else if (position) {
            const { latitude, longitude, accuracy } = position.coords;
            if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
                !Number.isFinite(longitude) || Math.abs(longitude) > 180) return;

            setCoords({ latitude, longitude, accuracy });
            setStatus('active');
          }
        },
      );
    })();

    try {
      await session.ready;
    } catch (failure) {
      if (!session.cancelled && mounted.current) {
        setError(failure instanceof Error && !failure.code
          ? failure.message
          : locationError(failure.code));
        void stopTracking();
      }
    }
  }

  return { status, coords, error, startTracking, stopTracking };
}
