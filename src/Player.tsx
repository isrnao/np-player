import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const getM3u8Url = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('url');
};

const Player: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const url = getM3u8Url();
    const video = videoRef.current;
    if (!video || !url) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }
  }, []);

  return (
    <div style={{width: '100%', height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
      <video ref={videoRef} controls style={{maxWidth: '90vw', maxHeight: '80vh'}} autoPlay />
      <div style={{color: '#fff', marginTop: '1rem'}}>m3u8動画を再生中</div>
    </div>
  );
};

export default Player;
