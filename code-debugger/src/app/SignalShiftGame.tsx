'use client';

import { useEffect, useState } from 'react';
import { Radio, RotateCcw, X } from 'lucide-react';

interface SignalShiftGameProps {
  onClose: () => void;
}

const ROUND_SECONDS = 20;

function nextTarget() {
  return {
    left: 12 + Math.random() * 70,
    top: 12 + Math.random() * 68,
  };
}

export default function SignalShiftGame({ onClose }: SignalShiftGameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [target, setTarget] = useState(nextTarget);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setFinished(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, finished]);

  const reset = () => {
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setTarget(nextTarget());
    setStarted(false);
    setFinished(false);
  };

  const hitTarget = () => {
    if (finished) return;
    setStarted(true);
    setScore((current) => current + 1);
    setTarget(nextTarget());
  };

  return (
    <div className="game-backdrop" role="dialog" aria-modal="true" aria-label="Signal Shift game">
      <div className="game-modal signal-modal">
        <div className="game-toolbar">
          <div className="game-title"><Radio className="w-4 h-4" /><span>Signal Shift</span><span className="game-score">{score.toString().padStart(2, '0')}</span></div>
          <button type="button" className="game-close" onClick={onClose} aria-label="Close game"><X className="w-4 h-4" /></button>
        </div>
        <div className="signal-hud"><span>Score <strong>{score}</strong></span><span>Time <strong>{timeLeft}s</strong></span></div>
        <div className="signal-board">
          {!started && !finished && <div className="signal-prompt"><strong>Track the signal.</strong><span>Click the light as it moves. Your 20-second round starts on the first hit.</span></div>}
          {finished && <div className="signal-prompt"><strong>Round complete.</strong><span>You caught {score} signals.</span></div>}
          {!finished && <button type="button" className="signal-target" style={{ left: `${target.left}%`, top: `${target.top}%` }} onClick={hitTarget} aria-label="Hit the signal" />}
        </div>
        <div className="signal-actions">
          <button type="button" className="hill-restart" onClick={reset} aria-label="Restart Signal Shift"><RotateCcw className="w-3.5 h-3.5" /></button>
          <span>Fast eyes. Clean clicks.</span>
        </div>
        <div className="game-footer"><span>Secret mode unlocked</span><span>Esc to close</span></div>
      </div>
    </div>
  );
}
