import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import './App.css';

export default function Piano() {
  const BASE_OCTAVE = 4;

  const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];

  const WHITE_MAP = { a: 0, s: 1, d: 2, f: 3, g: 4, h: 5, j: 6 };
  const BLACK_MAP = { w: 'C#', e: 'D#', t: 'F#', y: 'G#', u: 'A#' };

  const [started, setStarted] = useState(false);
  const [pressed, setPressed] = useState(new Set());

  const synth = useRef(null);
  const activeNotes = useRef(new Set());

  const startAudio = async () => {
    await Tone.start();
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    setStarted(true);
  };

  const note = (key, octave = BASE_OCTAVE) => `${key}${octave}`;

  const playNote = (n) => {
    if (!activeNotes.current.has(n)) {
      synth.current.triggerAttack(n);
      activeNotes.current.add(n);
      setPressed(new Set(activeNotes.current));
    }
  };

  const stopNote = (n) => {
    if (activeNotes.current.has(n)) {
      synth.current.triggerRelease(n);
      activeNotes.current.delete(n);
      setPressed(new Set(activeNotes.current));
    }
  };

  const handleKeyDown = (e) => {
    const k = e.key.toLowerCase();
    if (WHITE_MAP[k] !== undefined) playNote(note(WHITE_KEYS[WHITE_MAP[k]]));
    else if (BLACK_MAP[k]) playNote(note(BLACK_MAP[k]));
  };

  const handleKeyUp = (e) => {
    const k = e.key.toLowerCase();
    if (WHITE_MAP[k] !== undefined) stopNote(note(WHITE_KEYS[WHITE_MAP[k]]));
    else if (BLACK_MAP[k]) stopNote(note(BLACK_MAP[k]));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const getBlackKeyLeft = (index) => {
    const gapMap = [0, 1, 3, 4, 5];
    const whiteKeyWidth = 50;
    const blackKeyOffset = 35;
    return gapMap[index] * whiteKeyWidth + blackKeyOffset;
  };

  return (
    <div className="piano-container">
      <h1>Simple Piano 🎹</h1>
      {!started && <button onClick={startAudio}>Click to Start</button>}

      {started && (
        <>
          <div className="keyboard">
            {WHITE_KEYS.map((key, idx) => {
              const n = note(key);
              return (
                <div
                  key={n}
                  className={`white-key ${pressed.has(n) ? 'pressed' : ''}`}
                  onMouseDown={() => playNote(n)}
                  onMouseUp={() => stopNote(n)}
                  style={{ left: `${idx * 50}px` }}
                />
              );
            })}

            {BLACK_KEYS.map((key, i) => {
              const n = note(key);
              return (
                <div
                  key={n}
                  className={`black-key ${pressed.has(n) ? 'pressed' : ''}`}
                  onMouseDown={() => playNote(n)}
                  onMouseUp={() => stopNote(n)}
                  style={{ left: `${getBlackKeyLeft(i)}px` }}
                />
              );
            })}
          </div>
          <p className="instructions">Keys: a s d f g h j | Black: w e t y u</p>
        </>
      )}
    </div>
  );
}
