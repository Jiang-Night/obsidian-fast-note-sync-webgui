import "../../styles/auth.css";

import { Player } from "@lottiefiles/react-lottie-player";
import { memo, useState, useEffect } from "react";

import manusLight from "../../assets/manus_light.json";
import manusDark from "../../assets/manus_dark.json";
import { useTheme } from "../context/theme-context";


/**
 * Authentic Manus Lottie Animation Background
 * Exactly the same implementation as Manus project
 */
export const AnimatedBackground = memo(() => {
    const { resolvedTheme } = useTheme();
    const [animationData, setAnimationData] = useState<any>(manusDark);

    useEffect(() => {
        setAnimationData(resolvedTheme === 'dark' ? manusDark : manusLight);
    }, [resolvedTheme]);

    return (
        <div className={`fixed inset-0 w-full h-full z-0 pointer-events-none transition-colors duration-500 overflow-hidden select-none ${resolvedTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
            {/* Lottie Animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3840px] h-[2160px] opacity-100">
                <Player
                    autoplay
                    loop
                    src={animationData}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Grid Layer - Match Manus logic */}
            <div className={`absolute inset-0 auth-manus-grid z-10 transition-opacity duration-500 ${resolvedTheme === 'dark' ? 'opacity-100' : 'opacity-40'}`} />

            {/* Vignette Mask - Match Manus logic */}
            <div className={`absolute inset-0 auth-vignette-mask z-20 transition-opacity duration-500 ${resolvedTheme === 'dark' ? 'opacity-100' : 'opacity-30'}`} />

            {/* Noise Overlay - Match Manus logic */}
            <div className="absolute inset-0 auth-noise-overlay z-30 opacity-40" />
        </div>
    );
});

AnimatedBackground.displayName = "AnimatedBackground";
