import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

export function getSpotifyEmbedUrl(urlOrId: string): string {
  if (!urlOrId) return '';
  if (urlOrId.includes('/embed/')) return urlOrId;
  const match = urlOrId.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match && match[1]) {
    return `https://open.spotify.com/embed/playlist/${match[1]}?utm_source=generator&theme=0`;
  }
  const trackMatch = urlOrId.match(/track\/([a-zA-Z0-9]+)/);
  if (trackMatch && trackMatch[1]) {
    return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`;
  }
  const showMatch = urlOrId.match(/show\/([a-zA-Z0-9]+)/);
  if (showMatch && showMatch[1]) {
    return `https://open.spotify.com/embed/show/${showMatch[1]}?utm_source=generator&theme=0`;
  }
  if (/^[a-zA-Z0-9]+$/.test(urlOrId)) {
    return `https://open.spotify.com/embed/playlist/${urlOrId}?utm_source=generator&theme=0`;
  }
  return urlOrId;
}

interface SpotifyWidgetProps {
  height?: number | string;
  style?: React.CSSProperties;
}

export default function SpotifyWidget({ height = 152, style }: SpotifyWidgetProps) {
  const spotifyPlaylistUrl = useSettingsStore((s) => s.spotifyPlaylistUrl);
  
  if (!spotifyPlaylistUrl) {
    return null;
  }

  const embedUrl = getSpotifyEmbedUrl(spotifyPlaylistUrl);

  return (
    <div 
      className="glass-card animate-fade-in"
      style={{
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        padding: 0,
        background: 'rgba(8, 8, 18, 0.4)',
        border: '1px solid var(--color-border)',
        ...style
      }}
    >
      <iframe
        title="Spotify Focus Player"
        src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ border: 'none', display: 'block' }}
      />
    </div>
  );
}
