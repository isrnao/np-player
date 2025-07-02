import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import './App.css';

function getM3u8Url(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('url');
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const url = getM3u8Url();
    if (!url || !videoRef.current) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
    }
  }, []);

  return (
    <div style={{height:'100vh',display:'flex',justifyContent:'center',alignItems:'center',backgroundColor:'black'}}>
      <video ref={videoRef} controls style={{maxWidth:'100%',maxHeight:'100%'}} />
    </div>
  );
}
