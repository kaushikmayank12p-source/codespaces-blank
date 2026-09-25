'use client';

import { useEffect, useRef, useState } from 'react';
import { Bird, X } from 'lucide-react';

interface SkybirdGameProps {
  onClose: () => void;
}

type Pipe = { x: number; gapY: number; scored: boolean };

const WIDTH = 420;
const HEIGHT = 560;
const BIRD_X = 92;
const BIRD_SIZE = 15;
const PIPE_WIDTH = 54;
const PIPE_GAP = 154;

export default function SkybirdGame({ onClose }: SkybirdGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const gameRef = useRef({
    birdY: HEIGHT / 2,
    velocity: 0,
    pipes: [] as Pipe[],
    score: 0,
    started: false,
    gameOver: false,
    lastPipe: 0,
  });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'game-over'>('ready');

  const resetGame = () => {
    gameRef.current = {
      birdY: HEIGHT / 2,
      velocity: 0,
      pipes: [],
      score: 0,
      started: false,
      gameOver: false,
      lastPipe: 0,
    };
    setScore(0);
    setGameState('ready');
  };

  const flap = () => {
    const game = gameRef.current;
    if (game.gameOver) {
      resetGame();
      return;
    }
    game.started = true;
    game.velocity = -7.2;
    setGameState('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const draw = (time: number) => {
      const game = gameRef.current;
      const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
      sky.addColorStop(0, '#102a47');
      sky.addColorStop(1, '#08141f');
      context.fillStyle = sky;
      context.fillRect(0, 0, WIDTH, HEIGHT);

      context.fillStyle = 'rgba(133, 217, 229, 0.09)';
      for (let index = 0; index < 5; index += 1) {
        const cloudX = ((index * 130 - time * 0.018) % (WIDTH + 100)) - 60;
        const cloudY = 76 + index * 72;
        context.beginPath();
        context.arc(cloudX, cloudY, 26, 0, Math.PI * 2);
        context.arc(cloudX + 27, cloudY + 6, 19, 0, Math.PI * 2);
        context.fill();
      }

      if (game.started && !game.gameOver) {
        game.velocity += 0.36;
        game.birdY += game.velocity;
        game.lastPipe += 1;
        if (game.lastPipe > 92) {
          game.pipes.push({
            x: WIDTH + PIPE_WIDTH,
            gapY: 120 + Math.random() * 260,
            scored: false,
          });
          game.lastPipe = 0;
        }
        game.pipes.forEach((pipe) => { pipe.x -= 2.8; });
        game.pipes = game.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);

        for (const pipe of game.pipes) {
          const inPipeX = BIRD_X + BIRD_SIZE > pipe.x && BIRD_X - BIRD_SIZE < pipe.x + PIPE_WIDTH;
          const outsideGap = game.birdY - BIRD_SIZE < pipe.gapY - PIPE_GAP / 2 || game.birdY + BIRD_SIZE > pipe.gapY + PIPE_GAP / 2;
          if (inPipeX && outsideGap) game.gameOver = true;
          if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X) {
            pipe.scored = true;
            game.score += 1;
            setScore(game.score);
          }
        }
        if (game.birdY - BIRD_SIZE < 0 || game.birdY + BIRD_SIZE > HEIGHT) game.gameOver = true;
        if (game.gameOver) setGameState('game-over');
      }

      context.fillStyle = '#4bc5a1';
      context.strokeStyle = '#92f2c6';
      context.lineWidth = 2;
      game.pipes.forEach((pipe) => {
        context.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY - PIPE_GAP / 2);
        context.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY - PIPE_GAP / 2);
        context.fillRect(pipe.x, pipe.gapY + PIPE_GAP / 2, PIPE_WIDTH, HEIGHT);
        context.strokeRect(pipe.x, pipe.gapY + PIPE_GAP / 2, PIPE_WIDTH, HEIGHT);
      });

      context.save();
      context.translate(BIRD_X, game.birdY);
      context.rotate(Math.min(Math.max(game.velocity * 0.045, -0.35), 0.55));
      context.fillStyle = '#f5d77b';
      context.strokeStyle = '#fff2b7';
      context.beginPath();
      context.arc(0, 0, BIRD_SIZE, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = '#f2a65a';
      context.beginPath();
      context.moveTo(10, -2);
      context.lineTo(23, 3);
      context.lineTo(10, 7);
      context.closePath();
      context.fill();
      context.fillStyle = '#14263b';
      context.beginPath();
      context.arc(5, -6, 2.5, 0, Math.PI * 2);
      context.fill();
      context.restore();

      if (!game.started || game.gameOver) {
        context.fillStyle = 'rgba(3, 8, 14, 0.55)';
        context.fillRect(0, 0, WIDTH, HEIGHT);
      }
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.code === 'Space' || event.key === 'ArrowUp') {
        event.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="game-backdrop" role="dialog" aria-modal="true" aria-label="Skybird game">
      <div className="game-modal">
        <div className="game-toolbar">
          <div className="game-title"><Bird className="w-4 h-4" /><span>Skybird</span><span className="game-score">{score.toString().padStart(2, '0')}</span></div>
          <button type="button" className="game-close" onClick={onClose} aria-label="Close game"><X className="w-4 h-4" /></button>
        </div>
        <div className="game-stage" onClick={flap}>
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Skybird game canvas" />
          <div className="game-prompt">
            {gameState === 'ready' && <><strong>Keep flying.</strong><span>Click or press Space to flap</span></>}
            {gameState === 'game-over' && <><strong>Flight ended.</strong><span>Click or press Space to try again</span></>}
          </div>
        </div>
        <div className="game-footer"><span>Code word unlocked</span><span>Esc to close</span></div>
      </div>
    </div>
  );
}
