import { Capacitor } from '@capacitor/core';
import { useTracking } from './useTracking.js';

const statusLabels = {
  idle: 'Rastreamento inativo',
  starting: 'Buscando localização',
  active: 'Rastreamento ativo',
  stopping: 'Encerrando rastreamento',
  stopFailed: 'Falha ao parar',
};

const accuracyFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export default function App() {
  const { status, coords, error, startTracking, stopTracking } = useTracking();
  const idle = status === 'idle';
  const accuracy = coords?.accuracy;
  const mapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`
    : null;

  return (
    <main className="app">
      <header className="intro">
        <div className="app-icon" aria-hidden="true"><span className="pin" /></div>
        <h1>EventosRua</h1>
        <p>Acompanhe o deslocamento de blocos de rua e procissões pelo GPS do seu dispositivo.</p>
      </header>

      <section className="panel" aria-labelledby="location-title">
        <div className="panel-heading">
          <h2 id="location-title">Localização</h2>
          <span className="status" data-status={status} role="status">
            <span className="status-dot" aria-hidden="true" />
            {statusLabels[status]}
          </span>
        </div>

        <dl className="coordinates">
          <div className="coordinate">
            <dt>Latitude</dt>
            <dd>{coords ? `${coords.latitude.toFixed(6)}°` : '—'}</dd>
          </div>
          <div className="coordinate">
            <dt>Longitude</dt>
            <dd>{coords ? `${coords.longitude.toFixed(6)}°` : '—'}</dd>
          </div>
          <div className="accuracy">
            <dt>Precisão do GPS</dt>
            <dd>{Number.isFinite(accuracy) && accuracy >= 0 ? `${accuracyFormat.format(accuracy)} m` : '—'}</dd>
          </div>
        </dl>

        <div className="actions">
          <button
            className="action primary"
            type="button"
            onClick={idle ? startTracking : stopTracking}
            disabled={status === 'stopping'}
          >
            <span className={idle ? 'play' : 'stop'} aria-hidden="true" />
            {idle ? 'Iniciar rastreamento' : 'Parar rastreamento'}
          </button>
          {mapsUrl ? (
            <a
              className="action secondary"
              href={mapsUrl}
              target={Capacitor.isNativePlatform() ? undefined : '_blank'}
              rel="noopener noreferrer"
            >
              Abrir no Google Maps <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <button className="action secondary" type="button" disabled>
              Abrir no Google Maps <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>

        {error && <p className="error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
