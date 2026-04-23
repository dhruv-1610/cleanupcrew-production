import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HlsVideoBg({ src, className }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls;

        if (Hls.isSupported()) {
            hls = new Hls({
                capLevelToPlayerSize: true,
                maxBufferLength: 30,
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(err => console.log('Autoplay prevented:', err));
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native support
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(err => console.log('Autoplay prevented:', err));
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src]);

    return (
        <video
            ref={videoRef}
            className={className}
            autoPlay
            loop
            muted
            playsInline
        />
    );
}
