import React, { useState } from 'react';
import { 
  Play, Plus, Trash2, Volume2, VolumeX, 
  Tv, UserCheck, Shield, Sparkles, LogOut, KeyRound, User
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState(null); // 'host' | 'player' | 'tv'
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Quiz State
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [players, setPlayers] = useState([]);
  const [buzzedPlayer, setBuzzedPlayer] = useState(null);
  const [revealedAnswer, setRevealedAnswer] = useState(false);

  // Audio Synth
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'buzzer') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.log('Audio Error', e);
    }
  };

  // Raum-Code Generieren (5-stellig)
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    const newCode = generateCode();
    setRoomCode(newCode);
    setRole('host');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim() || inputCode.length !== 5) return;
    const cleanCode = inputCode.toUpperCase().trim();
    setRoomCode(cleanCode);
    setRole('player');
    
    setPlayers(prev => {
      if (prev.some(p => p.name === playerName)) return prev;
      return [...prev, { name: playerName, score: 0, answer: null }];
    });
  };

  const handleJoinTV = (e) => {
    e.preventDefault();
    if (inputCode.length !== 5) return;
    setRoomCode(inputCode.toUpperCase().trim());
    setRole('tv');
  };

  // Fragen-Formular State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('mc');
  const
