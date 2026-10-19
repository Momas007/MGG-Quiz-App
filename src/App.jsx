import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Tv, 
  UserCheck, 
  Settings, 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Smartphone,
  Eye,
  EyeOff,
  Radio,
  Award,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  Share2,
  Globe,
  Wifi,
  Copy,
  Check,
  Zap,
  Clock,
  Send,
  Sliders,
  Maximize2,
  BarChart3,
  Edit3
} from 'lucide-react';

// Advanced Web Audio API Sound Generator
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playBuzzer() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.18);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.3);
    });
  }

  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.4);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  playReveal() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.22);

    gain.gain.setValueAtTime(this.volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(this.volume * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

const sounds = new SoundSystem();

// Initial Sample Questions
const DEFAULT_QUESTIONS = [
  {
    id: 'q1',
    category: 'Wissenschaft',
    type: 'multiple',
    question: 'Welches ist das häufigste Element im Universum?',
    options: ['Sauerstoff', 'Wasserstoff', 'Helium', 'Kohlenstoff'],
    correctAnswer: 'Wasserstoff',
    points: 100
  },
  {
    id: 'q2',
    category: 'Geschichte',
    type: 'text',
    question: 'In welchem Jahr landete die Apollo 11 auf dem Mond?',
    correctAnswer: '1969',
    points: 200
  },
  {
    id: 'q3',
    category: 'Popkultur',
    type: 'buzzer',
    question: 'Wie heißt der Protagonist in der Spielereihe "The Legend of Zelda"?',
    correctAnswer: 'Link',
    points: 150
  },
  {
    id: 'q4',
    category: 'Geografie',
    type: 'multiple',
    question: 'Was ist die Hauptstad von Australien?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
    correctAnswer: 'Canberra',
    points: 250
  },
  {
    id: 'q5',
    category: 'Filme',
    type: 'text',
    question: 'Welcher Film gewann den ersten Oscar für den besten Animationsfilm?',
    correctAnswer: 'Shrek',
    points: 300
  }
];

export default function App() {
  // Navigation & Local User State
  const [activeTab, setActiveTab] = useState('setup'); // 'setup', 'tv', 'host', 'player', 'sharing'
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [roomCode, setRoomCode] = useState('QUIZ1');
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Timer State for Host
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Global Sync State
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('quiz_masters_state');
    return saved ? JSON.parse(saved) : {
      roomCode: 'QUIZ1',
      questions: DEFAULT_QUESTIONS,
      currentQuestionIndex: 0,
      questionRevealed: false,
      answersRevealed: false,
      buzzerEnabled: true,
      buzzedPlayerId: null,
      buzzerQueue: [], // [{ id, name, time }]
      playerAnswers: {}, // { playerId: answerText }
      players: [
        { id: 'p1', name: 'Alex', score: 100, avatar: '🦊' },
        { id: 'p2', name: 'Sarah', score: 250, avatar: '🦉' },
        { id: 'p3', name: 'Max', score: 150, avatar: '🐯' }
      ]
    };
  });

  const channelRef = useRef(null);

  // BroadcastChannel Sync Across Tabs/Windows
  useEffect(() => {
    channelRef.current = new BroadcastChannel('quiz_masters_sync_channel');

    channelRef.current.onmessage = (event) => {
      if (event.data && event.data.type === 'SYNC_STATE') {
        setGameState(event.data.state);
      }
    };

    // Listen to localStorage changes for browsers without BroadcastChannel support
    const handleStorageChange = (e) => {
      if (e.key === 'quiz_masters_state' && e.newValue) {
        setGameState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channelRef.current) channelRef.current.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Timer countdown logic
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            sounds.playWrong();
            return 0;
          }
          if (prev <= 6) sounds.playTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Sync state helper function
  const updateGameState = (updater) => {
    setGameState((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem('quiz_masters_state', JSON.stringify(nextState));
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'SYNC_STATE', state: nextState });
      }
      return nextState;
    });
  };

  const toggleSound = () => {
    sounds.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Join as Player
  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const existingPlayer = gameState.players.find(
      p => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );
    
    let id = existingPlayer ? existingPlayer.id : 'p_' + Date.now();

    if (!existingPlayer) {
      const avatars = ['🦊', '🦉', '🐯', '🐼', '🦁', '🦄', '🐲', '🐙'];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      const newPlayer = { id, name: playerName.trim(), score: 0, avatar: randomAvatar };
      updateGameState(prev => ({
        ...prev,
        players: [...prev.players, newPlayer]
      }));
    }

    setPlayerId(id);
    setActiveTab('player');
  };

  const currentQ = gameState.questions[gameState.currentQuestionIndex] || DEFAULT_QUESTIONS[0];

  const adjustScore = (targetId, amount) => {
    updateGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === targetId ? { ...p, score: p.score + amount } : p)
    }));
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // =========================================================
  // TOP NAVIGATION BAR (Always accessible mode switcher)
  // =========================================================
  const TopNavBar = () => (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('setup')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent hidden sm:inline">
            QUIZ SHOW MASTERS
          </span>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'tv' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span className="hidden md:inline">TV View</span>
          </button>

          <button
            onClick={() => setActiveTab('host')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'host' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Moderator</span>
          </button>

          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'player' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden md:inline">Spieler</span>
          </button>

          <button
            onClick={() => setActiveTab('sharing')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'sharing' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden md:inline">Teilen & Online Hosten</span>
          </button>
        </div>

        {/* Utility Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title={isMuted ? 'Ton einschalten' : 'Ton ausschalten'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );

  // =========================================================
  // SETUP / HOME SCREEN
  // =========================================================
  if (activeTab === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <TopNavBar />

        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Neon Glow Effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-2xl w-full bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 p-6 sm:p-10 rounded-3xl shadow-2xl z-10 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> Bereit für euren Quiz-Abend
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-400 bg-clip-text text-transparent">
                Quiz Show Masters
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
                Spielt live zusammen im selben Raum oder über Discord. Wähle unten deine Rolle oder erfahre, wie du die App online teilen kannst.
              </p>
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('tv')}
                className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700/80 border border-slate-700/80 rounded-2xl text-left transition-all group hover:scale-[1.02] shadow-xl"
              >
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-3 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Tv className="w-6 h-6" />
                </div>
                <div className="font-bold text-lg text-white">1. Hauptbildschirm (TV)</div>
                <div className="text-xs text-slate-400 mt-1">Für Discord Stream oder den Fernseher im Raum</div>
              </button>

              <button
                onClick={() => setActiveTab('host')}
                className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700/80 border border-slate-700/80 rounded-2xl text-left transition-all group hover:scale-[1.02] shadow-xl"
              >
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl w-fit mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Settings className="w-6 h-6" />
                </div>
                <div className="font-bold text-lg text-white">2. Moderator Dashboard</div>
                <div className="text-xs text-slate-400 mt-1">Fragen steuern, Buzzer auswerten & Punkte geben</div>
              </button>
            </div>

            {/* Quick Join Player Form */}
            <form onSubmit={handleJoinGame} className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Als Spieler mit Smartphone beitreten
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Dein Name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
                <button
                  type="submit"
                  disabled={!playerName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm shrink-0 flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" /> Beitreten
                </button>
              </div>
            </form>

            {/* Sharing / How-to-Host banner */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-pink-400" />
                Wie verbinde ich alle Handys?
              </span>
              <button
                onClick={() => setActiveTab('sharing')}
                className="text-pink-400 hover:text-pink-300 font-bold underline flex items-center gap-1"
              >
                Teilen & Hosting-Anleitung →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 1. TV / MAIN DISPLAY VIEW
  // =========================================================
  if (activeTab === 'tv') {
    const buzzedPlayer = gameState.players.find(p => p.id === gameState.buzzedPlayerId);

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <TopNavBar />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Display Center (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
            
            {/* Question Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between min-h-[420px]">
              
              {/* Question Header Badge & Timer */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Frage {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
                  </span>
                  {currentQ?.category && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {currentQ.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Active Timer Display */}
                  {timerSeconds > 0 && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-bold text-sm border ${
                      timerSeconds <= 5 ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-amber-400'
                    }`}>
                      <Clock className="w-4 h-4" /> {timerSeconds}s
                    </div>
                  )}

                  <span className="text-xl font-black text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-5 h-5" /> {currentQ?.points || 100} PTS
                  </span>
                </div>
              </div>

              {/* Question Content */}
              {gameState.questionRevealed ? (
                <div className="space-y-6 my-auto">
                  <h2 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight text-white">
                    {currentQ?.question}
                  </h2>

                  {/* Multiple Choice Options Display */}
                  {currentQ?.type === 'multiple' && currentQ.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {currentQ.options.map((opt, idx) => {
                        const optionLetters = ['A', 'B', 'C', 'D'];
                        const isCorrect = gameState.answersRevealed && opt === currentQ.correctAnswer;

                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                              isCorrect
                                ? 'bg-emerald-500/20 border-emerald-500 text-white ring-2 ring-emerald-500/50 scale-[1.02]'
                                : 'bg-slate-800/80 border-slate-700 text-slate-200'
                            }`}
                          >
                            <span className="w-8 h-8 rounded-xl bg-slate-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                              {optionLetters[idx]}
                            </span>
                            <span className="text-base md:text-lg font-medium">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Solution Reveal for Free Text or Buzzer */}
                  {gameState.answersRevealed && currentQ?.type !== 'multiple' && (
                    <div className="mt-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
                      <div className="text-xs uppercase tracking-wider font-bold mb-1">Richtige Lösung:</div>
                      <div className="text-2xl font-black">{currentQ?.correctAnswer}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-auto text-center py-12 text-slate-500 space-y-3">
                  <EyeOff className="w-16 h-16 mx-auto animate-bounce opacity-40" />
                  <p className="text-lg font-semibold">Warten auf Moderator...</p>
                </div>
              )}

              {/* Question Type Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Typ: <strong className="text-slate-200 uppercase">{currentQ?.type}</strong></span>
                <span>Raumcode: <strong className="text-indigo-400 font-mono">{gameState.roomCode}</strong></span>
              </div>
            </div>

            {/* Buzzer Winner Alert Banner */}
            {buzzedPlayer && (
              <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-2 border-amber-500 p-5 rounded-2xl flex items-center justify-between shadow-2xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl font-black text-2xl flex items-center justify-center">
                    {buzzedPlayer.avatar || '⚡'}
                  </div>
                  <div>
                    <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">Erster am Buzzer!</div>
                    <div className="text-2xl font-black text-white">{buzzedPlayer.name}</div>
                  </div>
                </div>
                <Radio className="w-8 h-8 text-amber-400 animate-ping" />
              </div>
            )}

            {/* Answers Overview Box */}
            {gameState.answersRevealed && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Eingereichte Spieler-Antworten
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {gameState.players.map((p) => {
                    const ans = gameState.playerAnswers[p.id];
                    const isCorrect = currentQ?.type === 'multiple' && ans === currentQ.correctAnswer;

                    return (
                      <div key={p.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                        <span className="font-semibold text-slate-300 text-sm flex items-center gap-1.5">
                          <span>{p.avatar}</span> {p.name}:
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isCorrect 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-slate-700 text-white'
                        }`}>
                          {ans || 'Keine Antwort'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Scoreboard (1 col) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
                <Award className="w-5 h-5" /> SCOREBOARD
              </h3>

              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {[...gameState.players]
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="text-xl">{p.avatar || '👤'}</span>
                        <span className="font-bold text-white text-sm">{p.name}</span>
                      </div>
                      <span className="text-lg font-black text-indigo-400">{p.score}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bottom Room Tag */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Verbinden über:</div>
              <div className="text-sm font-mono font-bold text-indigo-400 mt-0.5">
                Raum {gameState.roomCode}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // 2. MODERATOR DASHBOARD VIEW
  // =========================================================
  if (activeTab === 'host') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <TopNavBar />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Question Selector & Control Dashboard */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                  <Play className="w-5 h-5" /> Quiz Regie & Steuerung
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateGameState(prev => ({
                      ...prev,
                      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
                      questionRevealed: false,
                      answersRevealed: false,
                      buzzedPlayerId: null,
                      buzzerQueue: [],
                      playerAnswers: {}
                    }))}
                    disabled={gameState.currentQuestionIndex === 0}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    ← Vorherige
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-400 px-2">
                    {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
                  </span>

                  <button
                    onClick={() => updateGameState(prev => ({
                      ...prev,
                      currentQuestionIndex: Math.min(prev.questions.length - 1, prev.currentQuestionIndex + 1),
                      questionRevealed: false,
                      answersRevealed: false,
                      buzzedPlayerId: null,
                      buzzerQueue: [],
                      playerAnswers: {}
                    }))}
                    disabled={gameState.currentQuestionIndex === gameState.questions.length - 1}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Nächste →
                  </button>
                </div>
              </div>

              {/* Selected Question Detail Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>Kategorie: {currentQ?.category || 'Allgemein'}</span>
                  <span className="text-amber-400">{currentQ?.points} PUNKTE</span>
                </div>
                <div className="text-lg font-bold text-white">{currentQ?.question}</div>
                <div className="text-xs text-emerald-400 font-semibold pt-1">
                  Soll-Antwort: {currentQ?.correctAnswer}
                </div>
              </div>

              {/* Host Control Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    updateGameState(prev => ({ ...prev, questionRevealed: !prev.questionRevealed }));
                    sounds.playReveal();
                  }}
                  className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                    gameState.questionRevealed
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                  }`}
                >
                  {gameState.questionRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {gameState.questionRevealed ? 'Frage Verbergen' : 'Frage Anzeigen'}
                </button>

                <button
                  onClick={() => {
                    updateGameState(prev => ({ ...prev, answersRevealed: !prev.answersRevealed }));
                    sounds.playReveal();
                  }}
                  className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                    gameState.answersRevealed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-purple-600 hover:bg-purple-500 text-white border-transparent'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {gameState.answersRevealed ? 'Lösung Verbergen' : 'Lösung Auflösen'}
                </button>

                <button
                  onClick={() => updateGameState(prev => ({ ...prev, buzzedPlayerId: null, buzzerQueue: [] }))}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs border border-slate-700 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Buzzer Reset
                </button>

                <button
                  onClick={() => {
                    setTimerSeconds(30);
                    setIsTimerRunning(true);
                  }}
                  className="p-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-xl font-bold text-xs border border-amber-500/40 flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" /> Timer (30s)
                </button>
              </div>
            </div>

            {/* Live Player Response & Buzzer Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" /> Abgegebene Antworten & Schnell-Vergabe
              </h2>

              <div className="space-y-3">
                {gameState.players.map((p) => {
                  const ans = gameState.playerAnswers[p.id];
                  const isBuzzed = gameState.buzzedPlayerId === p.id;

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        isBuzzed ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/30' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.avatar || '👤'}</span>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {p.name}
                            {isBuzzed && (
                              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                GEBUZZERT!
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 italic mt-0.5">
                            Antwort: {ans ? <strong className="text-indigo-300">"{ans}"</strong> : 'Noch keine Eingabe'}
                          </div>
                        </div>
                      </div>

                      {/* Quick Point Modifiers */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            adjustScore(p.id, currentQ?.points || 100);
                            sounds.playCorrect();
                          }}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded-xl font-bold text-xs border border-emerald-500/30 transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" /> +{currentQ?.points || 100}
                        </button>
                        <button
                          onClick={() => {
                            adjustScore(p.id, -(currentQ?.points || 100));
                            sounds.playWrong();
                          }}
                          className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-slate-950 rounded-xl font-bold text-xs border border-rose-500/30 transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> -{currentQ?.points || 100}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Add Question & Score Modifier */}
          <div className="space-y-6">
            {/* Scoreboard Editor */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Punkte Feinjustierung
              </h2>

              <div className="space-y-2.5">
                {gameState.players.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                      <span>{p.avatar}</span> {p.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustScore(p.id, -50)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-indigo-400 text-sm min-w-[36px] text-center">{p.score}</span>
                      <button
                        onClick={() => adjustScore(p.id, 50)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Add Custom Question Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> neue Frage Erstellen
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  const newQ = {
                    id: 'q_' + Date.now(),
                    category: form.qCat.value || 'Allgemein',
                    type: form.qType.value,
                    question: form.qText.value,
                    options: form.qType.value === 'multiple' ? [form.optA.value, form.optB.value, form.optC.value, form.optD.value] : [],
                    correctAnswer: form.qAnswer.value,
                    points: parseInt(form.qPoints.value) || 100
                  };

                  updateGameState(prev => ({
                    ...prev,
                    questions: [...prev.questions, newQ]
                  }));
                  form.reset();
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Kategorie</label>
                  <input name="qCat" placeholder="z.B. Gaming, Musik..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Fragentyp</label>
                  <select name="qType" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                    <option value="buzzer">Schnell-Buzzer / Freitext</option>
                    <option value="multiple">Multiple Choice (A,B,C,D)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Frage</label>
                  <input name="qText" required placeholder="Fragentext..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Richtige Antwort</label>
                  <input name="qAnswer" required placeholder="Richtige Antwort..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Punkte</label>
                  <input name="qPoints" type="number" defaultValue="100" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-all mt-2"
                >
                  Frage zum Quiz Hinzufügen
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // 3. PLAYER MOBILE VIEW
  // =========================================================
  if (activeTab === 'player') {
    const me = gameState.players.find(p => p.id === playerId);
    const myAnswer = gameState.playerAnswers[playerId] || '';
    const isFirstBuzzed = gameState.buzzedPlayerId === playerId;

    const handleBuzzerClick = () => {
      if (!gameState.buzzedPlayerId) {
        updateGameState(prev => ({
          ...prev,
          buzzedPlayerId: playerId
        }));
        sounds.playBuzzer();
      }
    };

    const handleAnswerSubmit = (ans) => {
      updateGameState(prev => ({
        ...prev,
        playerAnswers: {
          ...prev.playerAnswers,
          [playerId]: ans
        }
      }));
    };

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans max-w-md mx-auto">
        <TopNavBar />

        <main className="flex-1 p-4 flex flex-col justify-between gap-6">
          {/* Player Identity Badge */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{me?.avatar || '👤'}</span>
              <div>
                <div className="text-xs text-slate-400 font-semibold">Angemeldet als</div>
                <div className="font-bold text-white text-base">{me?.name || 'Gast'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-semibold">Deine Punkte</div>
              <div className="font-black text-xl text-amber-400">{me?.score || 0}</div>
            </div>
          </div>

          {/* Current Question Status Display */}
          <div className="space-y-4">
            {gameState.questionRevealed ? (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
                  Aktuelle Frage
                </span>
                <p className="text-slate-100 font-semibold text-base pt-1">{currentQ?.question}</p>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl text-center text-slate-400 text-sm">
                Warte auf Freischaltung durch den Moderator...
              </div>
            )}

            {/* Multiple Choice Buttons */}
            {gameState.questionRevealed && currentQ?.type === 'multiple' && (
              <div className="grid grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isSelected = myAnswer === opt;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit(opt)}
                      className={`p-4 rounded-2xl font-bold border text-left transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-400/50'
                          : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span className="block text-xs text-indigo-400 mb-1">{letters[idx]}</span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Free Text Input Field */}
            {gameState.questionRevealed && currentQ?.type !== 'multiple' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Deine Antwort eingeben..."
                  value={myAnswer}
                  onChange={(e) => handleAnswerSubmit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-white text-center text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                {myAnswer && (
                  <div className="text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Antwort gespeichert!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Huge Touch-Friendly Buzzer */}
          <div className="flex flex-col items-center justify-center my-auto py-2">
            <button
              onClick={handleBuzzerClick}
              disabled={!!gameState.buzzedPlayerId}
              className={`w-56 h-56 rounded-full font-black text-xl uppercase tracking-widest transition-all duration-150 shadow-2xl flex flex-col items-center justify-center gap-3 border-8 select-none ${
                isFirstBuzzed
                  ? 'bg-amber-500 border-amber-300 text-slate-950 scale-105 animate-pulse shadow-amber-500/50'
                  : gameState.buzzedPlayerId
                  ? 'bg-slate-800 border-slate-700 text-slate-500 opacity-40 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 active:scale-90 border-rose-400 text-white shadow-rose-600/50'
              }`}
            >
              <Radio className="w-12 h-12" />
              <span>{isFirstBuzzed ? 'GEBUZZERT!' : gameState.buzzedPlayerId ? 'GESPERRT' : 'BUZZER'}</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // 4. SHARING & ONLINE HOSTING GUIDE VIEW
  // =========================================================
  if (activeTab === 'sharing') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <TopNavBar />

        <main className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
              Wie teile ich das Quiz mit meinen Freunden?
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Hier findest du die besten Methoden, um die App kostenlos online zu bringen oder im lokalen WLAN zu nutzen.
            </p>
          </div>

          {/* Share Link Button Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="font-bold text-white text-base">Aktuellen Seiten-Link kopieren</div>
              <div className="text-xs text-slate-400 mt-0.5">Teile diesen Link in eurer Discord-Gruppe</div>
            </div>
            <button
              onClick={copyShareLink}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Link kopiert!' : 'Link Kopieren'}
            </button>
          </div>

          {/* Hosting Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Method 1: Free Cloud Hosting */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="p-3 bg-pink-500/20 text-pink-400 rounded-2xl w-fit">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Methode 1: Kostenlos Online Hosten (Empfohlen)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lade diesen Code auf <strong>Vercel</strong>, <strong>Netlify</strong> oder <strong>GitHub Pages</strong> hoch. Dadurch erhältst du eine echte Web-URL (z. B. <code className="text-pink-400">mein-quiz.vercel.app</code>), die jeder auf seinem Handy im Internet öffnen kann.
              </p>
              <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <li>Code als React-Projekt speichern</li>
                <li>Auf GitHub hochladen</li>
                <li>Mit Vercel/Netlify verbinden (1-Klick Deployment)</li>
              </ol>
            </div>

            {/* Method 2: Local Network (Same WiFi) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl w-fit">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Methode 2: Gleiches WLAN / Netzwerk</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Wenn ihr alle im selben Raum/WLAN seid, starte das Projekt lokal (z. B. mit Vite) und teile deine lokale IP-Adresse mit deinen Freunden (z. B. <code className="text-indigo-400">192.168.1.50:5173</code>).
              </p>
              <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <li><code className="text-slate-200">npm run dev -- --host</code> ausführen</li>
                <li>Lokale IP im Terminal ablesen</li>
                <li>Freunde geben IP in den Handy-Browser ein</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
