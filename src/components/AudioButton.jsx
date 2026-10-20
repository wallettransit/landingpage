import React, { useState, useEffect } from 'react';
import { sound } from '../services/sound';

/**
 * Floating Audio Control Pill matching the user's reference:
 * - Rounded pill style: [speaker-icon] "Tap to disable audio" / "Tap to enable audio"
 * - Toggle background ambient beat and interactive SFX
 * - Non-intrusive floating position with smooth hover animation
 */
export const AudioButton = () => {
  const [audioState, setAudioState] = useState({ isPlaying: sound.isPlaying, isMuted: sound.isMuted });

  useEffect(() => {
    const unsub = sound.subscribe((state) => {
      setAudioState({ ...state });
    });
    return unsub;
  }, []);

  const handleToggle = () => {
    sound.ensureContext();
    if (!audioState.isPlaying) {
      sound.startMusic();
      sound.playTap();
    } else {
      sound.togglePlay();
    }
  };

  const isActive = audioState.isPlaying && !audioState.isMuted;

  return (
    <div className="audio-pill-wrap" aria-label="Audio Controls">
      <button
        type="button"
        className={`audio-pill ${isActive ? 'active' : ''}`}
        onClick={handleToggle}
        aria-pressed={isActive}
        title={isActive ? 'Disable audio' : 'Enable audio'}
      >
        <span className="audio-icon">
          {isActive ? (
            /* Speaker with sound waves */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.15" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            /* Muted Speaker */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </span>
        <span className="audio-label">
          {isActive ? 'Tap to disable audio' : 'Tap to enable audio'}
        </span>
        {isActive && (
          <span className="audio-bars" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </span>
        )}
      </button>
    </div>
  );
};
