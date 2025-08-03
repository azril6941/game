import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Trophy, Star } from 'lucide-react';
import GameCanvas from './GameCanvas';
import GameEngine from '../game/GameEngine';

const DinoRunnerGame: React.FC = () => {
  const [gameEngine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('dinoRunnerHighScore') || '0');
  });
  const gameLoopRef = useRef<number>();

  const startGame = useCallback(() => {
    gameEngine.reset();
    setScore(0);
    setGameState('playing');
  }, [gameEngine]);

  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  const resumeGame = useCallback(() => {
    setGameState('playing');
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState === 'playing') {
      gameEngine.update();
      setScore(gameEngine.getScore());
      
      if (gameEngine.isGameOver()) {
        const finalScore = gameEngine.getScore();
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem('dinoRunnerHighScore', finalScore.toString());
        }
        setGameState('gameOver');
        return;
      }
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameEngine, highScore]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (gameState === 'menu' || gameState === 'gameOver') {
          startGame();
        } else if (gameState === 'playing') {
          gameEngine.jump();
        } else if (gameState === 'paused') {
          resumeGame();
        }
      } else if (event.code === 'Escape' && gameState === 'playing') {
        pauseGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, gameEngine, startGame, pauseGame, resumeGame]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🦕 Dino Runner
          </h1>
          <div className="flex justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Score: {score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Best: {highScore.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="relative mb-6">
          <GameCanvas 
            gameEngine={gameEngine} 
            isPlaying={gameState === 'playing'}
            className="w-full h-64 md:h-80 bg-gradient-to-b from-blue-200 to-green-200 rounded-2xl shadow-inner border-4 border-white/20"
          />
          
          {/* Game State Overlays */}
          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-2xl backdrop-blur-sm">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to Run?</h2>
                <p className="text-lg mb-6 opacity-80">Press SPACE to jump and collect coins!</p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-full hover:from-green-500 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Play className="w-5 h-5 inline mr-2" />
                  Start Game
                </button>
              </div>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-2xl backdrop-blur-sm">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Paused</h2>
                <button
                  onClick={resumeGame}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Play className="w-5 h-5 inline mr-2" />
                  Resume
                </button>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-2">Game Over!</h2>
                <div className="mb-4">
                  <p className="text-xl mb-1">Final Score: <span className="font-bold text-yellow-400">{score.toLocaleString()}</span></p>
                  {score === highScore && score > 0 && (
                    <p className="text-lg text-green-400 animate-pulse">🎉 New High Score!</p>
                  )}
                </div>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold rounded-full hover:from-purple-500 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {gameState === 'playing' && (
            <button
              onClick={pauseGame}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30"
            >
              <Pause className="w-4 h-4 inline mr-2" />
              Pause (ESC)
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-white/70 text-sm">
          <p className="mb-1">🎮 <strong>SPACE</strong> to jump • <strong>ESC</strong> to pause</p>
          <p>Avoid obstacles, collect coins, and beat your high score!</p>
        </div>
      </div>
    </div>
  );
};

export default DinoRunnerGame;