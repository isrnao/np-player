import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import './App.css';

function getM3u8Url(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('url');
}

// m3u8ファイル名をmovielivestream8.m3u8に置換する関数
function replaceM3u8Filename(url: string): string {
  // URLの最後のファイル名部分を置換
  const lastSlashIndex = url.lastIndexOf('/');
  if (lastSlashIndex === -1) return url;

  const basePath = url.substring(0, lastSlashIndex + 1);
  const newUrl = basePath + 'movielivestream8.m3u8';

  console.log(`M3U8 URL置換: ${url} -> ${newUrl}`);
  return newUrl;
}

// m3u8ファイルのdummy.tsエントリを実際のファイル名に置き換える関数
function fixDummyEntries(m3u8Content: string): string {
  const lines = m3u8Content.split('\n');
  const output: string[] = [];
  let lastRealNum: number | null = null;
  let baseFileName = '';
  let hasDummyFiles = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 実際のファイル名パターンをマッチ (例: movielivestream8_00160.ts)
    const realFileMatch = trimmedLine.match(/^(.+?)_(\d+)\.ts$/);
    if (realFileMatch) {
      baseFileName = realFileMatch[1]; // "movielivestream8"
      lastRealNum = parseInt(realFileMatch[2], 10); // 160
      output.push(line);
      continue;
    }

    // dummy.tsパターンをマッチ (例: dummy.ts?id=161)
    const dummyMatch = trimmedLine.match(/^dummy\.ts\?id=(\d+)$/);
    if (dummyMatch && lastRealNum !== null && baseFileName) {
      hasDummyFiles = true;
      // 連番で次のファイル名を生成
      lastRealNum += 1;
      const paddedNum = lastRealNum.toString().padStart(5, '0');
      const realFileName = `${baseFileName}_${paddedNum}.ts`;

      output.push(realFileName);
      console.log(`Dummy変換: dummy.ts?id=${dummyMatch[1]} -> ${realFileName}`);
      continue;
    }

    // その他の行はそのまま
    output.push(line);
  }

  if (hasDummyFiles) {
    console.log('Dummy files detected and fixed');
  }
  return output.join('\n');
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<string>('ローディング中...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadVideo = async () => {
      const originalUrl = getM3u8Url();
      if (!originalUrl || !videoRef.current) {
        setError('URLが見つかりません');
        return;
      }

      // m3u8ファイル名をmovielivestream8.m3u8に置換
      const url = replaceM3u8Filename(originalUrl);

      setStatus(`動画を読み込み中: ${url}`);

      try {
        if (Hls.isSupported()) {
          setStatus('m3u8ファイルを解析中...');

          const hls = new Hls({
            debug: false,
            enableWorker: false,
            lowLatencyMode: false,
            backBufferLength: 90
          });

          let manifestLoaded = false;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            manifestLoaded = true;
            setStatus('マニフェスト解析完了、動画準備中...');
          });

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            setStatus('メディア接続完了');
          });

          hls.on(Hls.Events.FRAG_LOADING, () => {
            setStatus('動画セグメント読み込み中...');
          });

          hls.on(Hls.Events.FRAG_LOADED, () => {
            setStatus('再生準備完了');
          });

          hls.on(Hls.Events.ERROR, async (_, data) => {
            console.error('HLS Error:', data);

            if (data.fatal) {
              setError(`HLS Fatal Error: ${data.type} - ${data.details}`);

              // dummy.ts修正を試行
              if (!manifestLoaded) {
                setStatus('エラー発生、dummy.ts修正を試行中...');
                try {
                  const response = await fetch(url);
                  const originalContent = await response.text();
                  const fixedContent = fixDummyEntries(originalContent);

                  if (fixedContent !== originalContent) {
                    console.log('Dummy files detected, creating fixed manifest...');

                    const blob = new Blob([fixedContent], { type: 'application/vnd.apple.mpegurl' });
                    const blobUrl = URL.createObjectURL(blob);

                    // 新しいHLSインスタンスで修正されたm3u8を試行
                    const newHls = new Hls({
                      debug: false,
                      enableWorker: false
                    });

                    newHls.loadSource(blobUrl);
                    newHls.attachMedia(videoRef.current!);

                    newHls.on(Hls.Events.MANIFEST_PARSED, () => {
                      setStatus('修正されたマニフェストで再生開始');
                      setError('');
                    });

                    newHls.on(Hls.Events.ERROR, (_, errorData) => {
                      console.error('Fixed HLS Error:', errorData);
                      setError(`修正後もエラー: ${errorData.details}`);
                    });

                    // クリーンアップ
                    hls.destroy();

                    return () => {
                      URL.revokeObjectURL(blobUrl);
                      newHls.destroy();
                    };
                  } else {
                    setError('dummy.tsファイルが見つからず、修正できませんでした');
                  }
                } catch (fixError) {
                  console.error('Fix attempt failed:', fixError);
                  setError(`修正試行中にエラー: ${fixError}`);
                }
              }
            } else {
              // 非致命的エラーは回復を試行
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  setStatus('ネットワークエラー、回復中...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  setStatus('メディアエラー、回復中...');
                  hls.recoverMediaError();
                  break;
              }
            }
          });

          hls.loadSource(url);
          hls.attachMedia(videoRef.current);

          return () => {
            hls.destroy();
          };
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari等のネイティブサポート
          setStatus('ネイティブHLS再生を使用');
          videoRef.current.src = url;
        } else {
          setError('HLS再生がサポートされていません');
        }
      } catch (error) {
        console.error('Error loading video:', error);
        setError(`動画読み込みエラー: ${error}`);
      }
    };

    loadVideo();
  }, []);

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',backgroundColor:'black',color:'white'}}>
      <div style={{marginBottom:'20px',textAlign:'center'}}>
        <div style={{fontSize:'16px',marginBottom:'10px'}}>{status}</div>
        {error && <div style={{fontSize:'14px',color:'#ff6b6b'}}>{error}</div>}
      </div>
      <video
        ref={videoRef}
        controls
        style={{maxWidth:'100%',maxHeight:'70%'}}
        onLoadStart={() => setStatus('動画データ読み込み開始')}
        onCanPlay={() => setStatus('再生可能')}
        onPlay={() => setStatus('再生中')}
        onError={(e) => setError(`Video element error: ${e.currentTarget.error?.message}`)}
      />
    </div>
  );
}
