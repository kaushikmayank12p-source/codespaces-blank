'use client';

import { useEffect, useRef, useState } from 'react';
import { Car, RotateCcw, X } from 'lucide-react';

interface HillClimbGameProps {
  onClose: () => void;
}

const WIDTH = 520;
const HEIGHT = 330;
const WHEEL_RADIUS = 12;

function terrainY(worldX: number) {
  return 230 - Math.sin(worldX * 0.012) * 22 - Math.sin(worldX * 0.027 + 1.3) * 13 - Math.sin(worldX * 0.004) * 34;
}

export default function HillClimbGame({ onClose }: HillClimbGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const inputRef = useRef({ gas: false, brake: false });
  const gameRef = useRef({ x: 90, speed: 0, fuel: 100, distance: 0, crashed: false });
  const [distance, setDistance] = useState(0);
  const [gameState, setGameState] = useState<'ready' | 'driving' | 'crashed'>('ready');

  const resetGame = () => {
    gameRef.current = { x: 90, speed: 0, fuel: 100, distance: 0, crashed: false };
    setDistance(0);
    setGameState('ready');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        inputRef.current.gas = pressed;
        event.preventDefault();
      }
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        inputRef.current.brake = pressed;
        event.preventDefault();
      }
      if (event.key === 'Escape') onClose();
      if (event.key.toLowerCase() === 'r') resetGame();
    };
    const keyDown = (event: KeyboardEvent) => handleKey(event, true);
    const keyUp = (event: KeyboardEvent) => handleKey(event, false);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    let lastTime = performance.now();
    const draw = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;
      const game = gameRef.current;
      const input = inputRef.current;

      if (!game.crashed && (input.gas || input.brake)) setGameState('driving');
      if (!game.crashed && gameState !== 'ready') {
        const acceleration = input.gas ? 0.14 : input.brake ? -0.10 : -0.025;
        game.speed = Math.max(-1.5, Math.min(6.5, game.speed + acceleration * delta));
        game.x += game.speed * delta;
        game.distance = Math.max(0, Math.floor((game.x - 90) / 4));
        game.fuel = Math.max(0, game.fuel - (input.gas ? 0.025 : 0.006) * delta);
        if (game.fuel <= 0 || game.speed < -1.35) game.crashed = true;
        setDistance(game.distance);
        if (game.crashed) setGameState('crashed');
      }

      const cameraX = Math.max(0, game.x - 130);
      const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
      sky.addColorStop(0, '#f0b56a');
      sky.addColorStop(0.58, '#d87965');
      sky.addColorStop(1, '#4d3b50');
      context.fillStyle = sky;
      context.fillRect(0, 0, WIDTH, HEIGHT);

      context.fillStyle = 'rgba(255, 226, 154, 0.55)';
      context.beginPath();
      context.arc(405, 70, 32, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'rgba(47, 45, 64, 0.32)';
      context.beginPath();
      context.moveTo(0, 188);
      for (let x = 0; x <= WIDTH; x += 8) context.lineTo(x, 178 + Math.sin((x + cameraX) * 0.008) * 18);
      context.lineTo(WIDTH, HEIGHT);
      context.lineTo(0, HEIGHT);
      context.fill();

      context.fillStyle = '#263b35';
      context.strokeStyle = '#b4cf85';
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(0, HEIGHT);
      for (let x = 0; x <= WIDTH; x += 5) context.lineTo(x, terrainY(x + cameraX));
      context.lineTo(WIDTH, HEIGHT);
      context.closePath();
      context.fill();
      context.beginPath();
      for (let x = 0; x <= WIDTH; x += 5) {
        const y = terrainY(x + cameraX);
        if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.stroke();

      const carWorldY = terrainY(game.x) - 30;
      const carScreenX = game.x - cameraX;
      context.save();
      context.translate(carScreenX, carWorldY);
      context.rotate(Math.atan2(terrainY(game.x + 20) - terrainY(game.x - 20), 40) * 0.8);
      context.fillStyle = '#f2d36d';
      context.strokeStyle = '#fff0a5';
      context.lineWidth = 2;
      context.fillRect(-31, -18, 62, 19);
      context.strokeRect(-31, -18, 62, 19);
      context.fillStyle = '#78c7d5';
      context.fillRect(-16, -29, 25, 13);
      context.strokeRect(-16, -29, 25, 13);
      context.fillStyle = '#19242f';
      context.beginPath();
      context.arc(-20, 5, WHEEL_RADIUS, 0, Math.PI * 2);
      context.arc(20, 5, WHEEL_RADIUS, 0, Math.PI * 2);
      context.fill();
      context.restore();

      context.fillStyle = 'rgba(6, 12, 18, 0.55)';
      context.fillRect(14, 14, 180, 42);
      context.fillStyle = '#e9f1e8';
      context.font = '600 12px sans-serif';
      context.fillText(`DISTANCE  ${game.distance}m`, 26, 32);
      context.fillStyle = '#b8d98c';
      context.fillText(`FUEL  ${game.fuel}%`, 26, 48);

      if (gameState === 'ready' || game.crashed) {
        context.fillStyle = 'rgba(6, 12, 18, 0.52)';
        context.fillRect(0, 0, WIDTH, HEIGHT);
      }
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [gameState, onClose]);

  const setControl = (control: 'gas' | 'brake', pressed: boolean) => {
    inputRef.current[control] = pressed;
    if (pressed && gameState === 'ready') setGameState('driving');
  };

  return (
    <div className="game-backdrop" role="dialog" aria-modal="true" aria-label="Hill Climb game">
      <div className="game-modal hill-game-modal">
        <div className="game-toolbar">
          <div className="game-title"><Car className="w-4 h-4" /><span>Hill Climb</span><span className="game-score">{distance}m</span></div>
          <button type="button" className="game-close" onClick={onClose} aria-label="Close game"><X className="w-4 h-4" /></button>
        </div>
        <div className="game-stage hill-game-stage">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Hill Climb game canvas" />
          <div className="game-prompt">
            {gameState === 'ready' && <><strong>Drive the ridge.</strong><span>Hold D or the gas button to accelerate</span></>}
            {gameState === 'crashed' && <><strong>Vehicle stopped.</strong><span>Press R or tap restart to drive again</span></>}
          </div>
        </div>
        <div className="hill-controls">
          <button type="button" className="hill-control" onPointerDown={() => setControl('brake', true)} onPointerUp={() => setControl('brake', false)} onPointerLeave={() => setControl('brake', false)}>Brake <kbd>A</kbd></button>
          <button type="button" className="hill-restart" onClick={resetGame} aria-label="Restart Hill Climb"><RotateCcw className="w-3.5 h-3.5" /></button>
          <button type="button" className="hill-control gas-control" onPointerDown={() => setControl('gas', true)} onPointerUp={() => setControl('gas', false)} onPointerLeave={() => setControl('gas', false)}>Gas <kbd>D</kbd></button>
        </div>
        <div className="game-footer"><span>Secret mode unlocked</span><span>Esc to close</span></div>
      </div>
    </div>
  );
}
