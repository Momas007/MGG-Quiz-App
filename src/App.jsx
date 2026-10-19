import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, get, child } from 'firebase/database';
import { 
  Play, Plus, Trash2, Volume2, VolumeX, 
  Tv, UserCheck, Shield, Sparkles, KeyRound, User, AlertCircle, Send, CheckSquare, Square, Eye, EyeOff, Award, Check, X
} from 'lucide-react';

// Firebase Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyD-BSbLY3GF0a1C4_VXHFNuSHcHY6mnIFQ",
  authDomain: "mgg-quiz-app.firebaseapp.com",
  databaseURL: "https://mgg-quiz-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mgg-quiz-app",
  storageBucket: "mgg-quiz-app.firebasestorage.app",
  messagingSenderId: "803721728351",
  appId: "1:803721728351:web:00b052f6a9d7851a28e6ea",
  measurementId: "G-PPMWSG4JTL"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function App() {
  const [role, setRole] = useState(null); // 'host' | 'player' | 'tv'
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [playerTextAnswer, setPlayerTextAnswer] = useState('');

  // Live Room State aus Firebase Realtime Database
  const [roomData, setRoomData] = useState(null);

  // Audio Feedback
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
      console.log('Audio Context Error', e);
    }
  };

  // Synchronisierung mit Firebase
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      setRoomData(data);
    });
    return () => unsubscribe();
  }, [roomCode]);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Raum Erstellen
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    const newCode = generateCode();
    
    try {
      await set(ref(db, `rooms/${newCode}`), {
        host: playerName,
        createdAt: Date.now(),
        currentQuestionIndex: -1,
        questions: [],
        players: {},
        buzzedPlayer: null,
        revealedAnswer: false,
        revealedPlayers: {}
      });

      setRoomCode(newCode);
      setRole('host');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Fehler beim Erstellen des Raums. Bitte prüfe die Firebase-Regeln.');
    }
  };

  // Raum Beitreten
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanCode = inputCode.toUpperCase().trim();
    if (!playerName.trim() || cleanCode.length !== 5) return;

    const snapshot = await get(child(ref(db), `rooms/${cleanCode}`));
    if (!snapshot.exists()) {
      setErrorMessage('Raum existiert nicht! Bitte prüfe den Code.');
      return;
    }

    await update(ref(db, `rooms/${cleanCode}/players/${playerName}`), {
      name: playerName,
      score: 0,
      answer: null,
      selected: false
    });

    setRoomCode(cleanCode);
    setRole('player');
  };

  const handleJoinTV = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanCode = inputCode.toUpperCase().trim();
    if (cleanCode.length !== 5) return;

    const snapshot = await get(child(ref(db), `rooms/${cleanCode}`));
    if (!snapshot.exists()) {
      setErrorMessage('Raum existiert nicht!');
      return;
    }

    setRoomCode(cleanCode);
    setRole('tv');
  };

  // --- MODERATOR ACTIONS ---
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('mc'); // 'mc' | 'buzzer' | 'freetext'
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectOption, setNewCorrectOption] = useState(0);
  const [newCorrectText, setNewCorrectText] = useState('');
  const [newPoints, setNewPoints] = useState(100);

  const addQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !roomCode) return;

    const currentQuestions = roomData?.questions || [];
    const newQ = {
      id: Date.now(),
      text: newQuestionText,
      type: newQuestionType,
      options: newQuestionType === 'mc' ? [...newOptions] : [],
      correctOption: newQuestionType === 'mc' ? newCorrectOption : null,
      correctText: newQuestionType === 'freetext' ? newCorrectText : '',
      points: Number(newPoints) || 100
    };

    const updatedQuestions = [...currentQuestions, newQ];
    await update(ref(db, `rooms/${roomCode}`), {
      questions: updatedQuestions,
      currentQuestionIndex: roomData?.currentQuestionIndex === -1 ? 0 : roomData?.currentQuestionIndex
    });

    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
    setNewCorrectText('');
  };

  const setQuestionIndex = async (idx) => {
    const resetPlayers = { ...roomData?.players };
    Object.keys(resetPlayers).forEach(pKey => {
      resetPlayers[pKey].answer = null;
      resetPlayers[pKey].selected = false;
    });

    await update(ref(db, `rooms/${roomCode}`), {
      currentQuestionIndex: idx,
      buzzedPlayer: null,
      revealedAnswer: false,
      revealedPlayers: {},
      players: resetPlayers
    });
  };

  const deleteQuestion = async (qId) => {
    const currentQuestions = roomData?.questions || [];
    const filtered = currentQuestions.filter(q => q.id !== qId);
    await update(ref(db, `rooms/${roomCode}`), {
      questions: filtered,
      currentQuestionIndex: filtered.length === 0 ? -1 : 0
    });
  };

  const handleBuzzer = async () => {
    if (!roomData || roomData.buzzedPlayer) return;
    playSound('buzzer');
    await update(ref(db, `rooms/${roomCode}`), {
      buzzedPlayer: playerName
    });
  };

  const handleEvaluateBuzzer = async (isCorrect) => {
    if (!roomData?.buzzedPlayer) return;
    const bPlayer = roomData.buzzedPlayer;
    const pts = currentQ ? currentQ.points : 100;
    const currentScore = roomData?.players?.[bPlayer]?.score || 0;
    const newScore = isCorrect ? currentScore + pts : currentScore - Math.round(pts / 2);

    if (isCorrect) playSound('correct');

    await update(ref(db, `rooms/${roomCode}`), {
      [`players/${bPlayer}/score`]: newScore,
      buzzedPlayer: null
    });
  };

  const handleSubmitAnswer = async (answerVal) => {
    if (!roomCode || !playerName) return;
    await update(ref(db, `rooms/${roomCode}/players/${playerName}`), {
      answer: answerVal
    });
  };

  const togglePlayerSelect = async (pName) => {
    const currentVal = roomData?.players?.[pName]?.selected || false;
    await update(ref(db, `rooms/${roomCode}/players/${pName}`), {
      selected: !currentVal
    });
  };

  const togglePlayerReveal = async (pName) => {
    const currentRev = roomData?.revealedPlayers?.[pName] || false;
    await update(ref(db, `rooms/${roomCode}/revealedPlayers`), {
      [pName]: !currentRev
    });
  };

  const handleAwardPoints = async (pName, pts) => {
    if (!roomData?.players?.[pName]) return;
    playSound('correct');
    const currentScore = roomData.players[pName].score || 0;
    await update(ref(db, `rooms/${roomCode}/players/${pName}`), {
      score: currentScore + pts
    });
  };

  const awardPointsToSelected = async () => {
    if (!roomData?.players) return;
    const pts = currentQ ? currentQ.points : 100;
    const updates = {};
    
    Object.values(roomData.players).forEach(p => {
      if (p.selected) {
        updates[`rooms/${roomCode}/players/${p.name}/score`] = (p.score || 0) + pts;
      }
    });

    if (Object.keys(updates).length > 0) {
      playSound('correct');
      await update(ref(db), updates);
    }
  };

  const resetBuzzer = async () => {
    await update(ref(db, `rooms/${roomCode}`), { buzzedPlayer: null });
  };

  const toggleReveal = async () => {
    const nextRevealed = !roomData?.revealedAnswer;
    const updates = {
      [`rooms/${roomCode}/revealedAnswer`]: nextRevealed
    };

    // Automatische Auswertung für MC-Fragen
    if (nextRevealed && currentQ && currentQ.type === 'mc') {
      const pts = currentQ.points || 100;
      const targetOpt = currentQ.correctOption;

      if (roomData?.players) {
        Object.values(roomData.players).forEach(p => {
          if (p.answer === targetOpt) {
            updates[`rooms/${roomCode}/players/${p.name}/score`] = (p.score || 0) + pts;
          }
        });
        playSound('correct');
      }
    }

    await update(ref(db), updates);
  };

  // --- HOME / LOGIN SCREEN ---
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-3">
              <Sparkles className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Quiz Show Live</h1>
            <p className="text-slate-400 text-sm mt-1">Echtzeit-Quiz für dich & deine Freunde</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dein Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="z. B. Alex"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <form onSubmit={handleCreateRoom} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" /> Als Moderator Raum erstellen
              </h3>
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
              >
                Neuen Live-Raum erstellen
              </button>
            </form>

            <form onSubmit={handleJoinRoom} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" /> Einem Raum beitreten
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  maxLength={5}
                  placeholder="5-stelliger Code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-lg font-mono tracking-widest uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={!playerName.trim() || inputCode.length !== 5}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
              >
                Raum betreten
              </button>
            </form>

            <form onSubmit={handleJoinTV} className="pt-2 text-center">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={5}
                  placeholder="CODE"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-sm uppercase"
                />
                <button
                  type="submit"
                  disabled={inputCode.length !== 5}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Tv className="w-4 h-4" /> TV / Discord Ansicht
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestions = roomData?.questions || [];
  const currentQIndex = roomData?.currentQuestionIndex ?? -1;
  const currentQ = currentQuestions[currentQIndex];
  const playerList = roomData?.players ? Object.values(roomData.players) : [];

  // --- MODERATOR VIEW ---
  if (role === 'host') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
          <div>
            <span className="text-xs text-indigo-400 font-semibold uppercase">Moderator Control</span>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Raumcode: <span className="font-mono bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/30">{roomCode}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>
            <button onClick={() => setRole(null)} className="px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-semibold">Verlassen</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-indigo-400 flex items-center gap-2"><Play className="w-5 h-5"/> Live Steuerung</h2>
              {currentQ ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                    <span className="text-xs text-indigo-400 font-semibold uppercase block mb-1">
                      Typ: {currentQ.type === 'mc' ? 'Multiple Choice (Auto-Scoring)' : currentQ.type === 'buzzer' ? 'Schnell-Buzzer' : 'Freitext'}
                    </span>
                    <p className="text-xl font-semibold text-white">{currentQ.text}</p>
                    
                    {currentQ.type === 'freetext' && currentQ.correctText && (
                      <p className="text-xs text-emerald-400 mt-2 font-mono">Richtige Musterantwort: {currentQ.correctText}</p>
                    )}
                  </div>

                  {/* Buzzer Bewertung (Richtig / Falsch) */}
                  {currentQ.type === 'buzzer' && roomData?.buzzedPlayer && (
                    <div className="p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl space-y-3">
                      <p className="text-sm font-bold text-amber-300 flex items-center justify-between">
                        <span>🔔 Gebuzzert von: {roomData.buzzedPlayer}</span>
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleEvaluateBuzzer(true)} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                          <Check className="w-5 h-5"/> Richtig (+{currentQ.points} Pkt.)
                        </button>
                        <button onClick={() => handleEvaluateBuzzer(false)} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                          <X className="w-5 h-5"/> Falsch (-{Math.round(currentQ.points / 2)} Pkt.)
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button onClick={toggleReveal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition">
                      {roomData?.revealedAnswer ? 'Antwort verbergen' : 'Antwort auflösen (Auto-Punkte bei A,B,C,D)'}
                    </button>

                    {currentQ.type === 'freetext' && (
                      <button onClick={awardPointsToSelected} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition">
                        <Award className="w-4 h-4"/> Punkte an angehakte Spieler (+{currentQ.points})
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Keine Frage aktiv. Erstelle unten eine neue Frage.</p>
              )}
            </div>

            {/* Frage Anlegen */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-indigo-400 flex items-center gap-2"><Plus className="w-5 h-5"/> Neue Frage erstellen</h2>
              <form onSubmit={addQuestion} className="space-y-4">
                <input
                  type="text"
                  placeholder="Fragetext eintippen..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                  >
                    <option value="mc">Multiple Choice (A, B, C, D)</option>
                    <option value="buzzer">Schnell-Buzzer</option>
                    <option value="freetext">Freitext-Antwort</option>
                  </select>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                    placeholder="Punkte"
                  />
                </div>

                {newQuestionType === 'freetext' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Musterantwort / Richtige Lösung</label>
                    <input
                      type="text"
                      placeholder="z. B. Wien"
                      value={newCorrectText}
                      onChange={(e) => setNewCorrectText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white"
                    />
                  </div>
                )}

                {newQuestionType === 'mc' && (
                  <div className="space-y-2">
                    {newOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="w-4 font-bold text-slate-500">{['A','B','C','D'][idx]}</span>
                        <input
                          type="text"
                          placeholder={`Option ${['A','B','C','D'][idx]}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newOptions];
                            updated[idx] = e.target.value;
                            setNewOptions(updated);
                          }}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                        />
                        <input
                          type="radio"
                          name="correct"
                          checked={newCorrectOption === idx}
                          onChange={() => setNewCorrectOption(idx)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold transition">
                  Frage speichern
                </button>
              </form>
            </div>

            {/* Fragenliste */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 mb-3">Erstellte Fragen ({currentQuestions.length})</h3>
              <div className="space-y-2">
                {currentQuestions.map((q, idx) => (
                  <div key={q.id} className={`p-3 rounded-xl border flex items-center justify-between ${idx === currentQIndex ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-900 border-slate-700'}`}>
                    <div>
                      <p className="text-sm text-white truncate">{idx + 1}. {q.text}</p>
                      <span className="text-xs text-slate-500">[{q.type === 'mc' ? 'Multiple Choice' : q.type === 'buzzer' ? 'Buzzer' : 'Freitext'}]</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setQuestionIndex(idx)} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg font-semibold">Aktivieren</button>
                      <button onClick={() => deleteQuestion(q.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spieler Liste & Antworten */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-bold mb-4 text-indigo-400 flex items-center gap-2"><UserCheck className="w-5 h-5"/> Spieler Live ({playerList.length})</h2>

            <div className="space-y-3">
              {playerList.map(p => {
                const isRevealed = roomData?.revealedPlayers?.[p.name];
                return (
                  <div key={p.name} className={`p-3 rounded-xl border transition ${p.selected ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {currentQ?.type === 'freetext' && (
                          <button onClick={() => togglePlayerSelect(p.name)} className="text-indigo-400">
                            {p.selected ? <CheckSquare className="w-5 h-5 text-indigo-400"/> : <Square className="w-5 h-5 text-slate-600"/>}
                          </button>
                        )}
                        <div>
                          <p className="font-semibold text-white text-sm">{p.name}</p>
                          <p className="text-xs text-indigo-400">{p.score} Punkte</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleAwardPoints(p.name, currentQ ? currentQ.points : 100)} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold">+{currentQ ? currentQ.points : 100}</button>
                        <button onClick={() => handleAwardPoints(p.name, -50)} className="px-2 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded text-xs font-bold">-50</button>
                      </div>
                    </div>

                    {/* Eingereichte Antwort des Spielers */}
                    {p.answer !== null && p.answer !== undefined && (
                      <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-500 block">Antwort:</span>
                          <span className="text-emerald-300 font-medium">
                            {currentQ?.type === 'mc' ? `Option ${['A','B','C','D'][p.answer]}` : p.answer}
                          </span>
                        </div>
                        {currentQ?.type === 'freetext' && (
                          <button 
                            onClick={() => togglePlayerReveal(p.name)} 
                            className={`px-2 py-1 rounded text-xs flex items-center gap-1 font-semibold ${isRevealed ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                          >
                            {isRevealed ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}
                            {isRevealed ? 'Auf TV [Aktiv]' : 'Auf TV zeigen'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SPIELER VIEW ---
  if (role === 'player') {
    const playerObj = roomData?.players?.[playerName];
    const hasAnswered = playerObj?.answer !== null && playerObj?.answer !== undefined;

    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div>
            <span className="text-xs text-slate-400">Mitspieler</span>
            <p className="font-bold">{playerName}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Raumcode</span>
            <p className="font-mono font-bold text-indigo-400">{roomCode}</p>
          </div>
        </div>

        <div className="my-auto space-y-6 text-center">
          {currentQ ? (
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
              <span className="text-xs text-indigo-400 font-semibold uppercase">Aktuelle Frage</span>
              <p className="text-xl font-bold">{currentQ.text}</p>

              {currentQ.type === 'mc' && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmitAnswer(idx)}
                      className={`w-full p-3 rounded-xl border text-left text-sm font-medium transition ${
                        playerObj?.answer === idx 
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                          : 'bg-slate-900 hover:bg-indigo-600/30 border-slate-700 text-white'
                      }`}
                    >
                      <strong className="text-indigo-400 mr-2">{['A','B','C','D'][idx]}:</strong> {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'freetext' && (
                <div className="pt-2 space-y-3">
                  <input
                    type="text"
                    placeholder="Deine Antwort eingeben..."
                    value={playerTextAnswer}
                    onChange={(e) => setPlayerTextAnswer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleSubmitAnswer(playerTextAnswer)}
                    disabled={!playerTextAnswer.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4"/> Antwort absenden
                  </button>
                  {hasAnswered && (
                    <p className="text-xs text-emerald-400 font-medium pt-1">✓ Antwort an Moderator gesendet!</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500">Warte auf die nächste Frage vom Moderator...</p>
          )}

          {currentQ?.type === 'buzzer' && (
            <button
              onClick={handleBuzzer}
              disabled={!!roomData?.buzzedPlayer}
              className={`w-full py-12 rounded-3xl font-extrabold text-2xl uppercase transition transform active:scale-95 ${
                roomData?.buzzedPlayer === playerName
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : roomData?.buzzedPlayer
                  ? 'bg-slate-800 text-slate-600 border border-slate-700'
                  : 'bg-rose-600 hover:bg-rose-500 text-white border-b-8 border-rose-800 shadow-2xl'
              }`}
            >
              {roomData?.buzzedPlayer === playerName ? 'GEBUZZERT!' : roomData?.buzzedPlayer ? 'GESPERRT' : 'BUZZER'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- TV VIEW ---
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col justify-between">
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-black tracking-wider uppercase">QUIZ SHOW</h1>
        <div className="text-right">
          <span className="text-xs text-slate-500 uppercase block">Raumcode</span>
          <span className="font-mono text-2xl font-bold text-indigo-400">{roomCode}</span>
        </div>
      </div>

      <div className="my-auto max-w-4xl mx-auto text-center space-y-8">
        {currentQ ? (
          <div className="space-y-6">
            <span className="inline-block px-4 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-sm font-semibold">
              {currentQ.points} Punkte
            </span>
            <h2 className="text-4xl font-extrabold">{currentQ.text}</h2>

            {currentQ.type === 'mc' && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {currentQ.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border text-left text-lg font-semibold transition ${
                      roomData?.revealedAnswer && idx === currentQ.correctOption
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-indigo-400 mr-3 font-bold">{['A','B','C','D'][idx]}:</span> {opt}
                  </div>
                ))}
              </div>
            )}

            {/* Freitext Musterantwort auflösen */}
            {currentQ.type === 'freetext' && roomData?.revealedAnswer && (
              <div className="p-6 bg-emerald-600/20 border-2 border-emerald-500 rounded-2xl text-emerald-200 text-2xl font-bold inline-block">
                Musterantwort: {currentQ.correctText || 'Keine Angabe'}
              </div>
            )}

            {/* Einzelne freigeschaltete Spieler-Antworten anzeigen */}
            {currentQ.type === 'freetext' && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {playerList.filter(p => roomData?.revealedPlayers?.[p.name]).map(p => (
                  <div key={p.name} className="p-4 bg-slate-900 border-2 border-indigo-500 rounded-xl text-left">
                    <span className="text-xs text-indigo-400 font-bold block">{p.name}:</span>
                    <span className="text-xl font-semibold text-white">{p.answer || 'Keine Antwort'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-600 text-xl font-bold">Warte auf den Start der nächsten Runde...</p>
        )}

        {currentQ?.type === 'buzzer' && roomData?.buzzedPlayer && (
          <div className="p-6 bg-amber-500/20 border-2 border-amber-500 rounded-2xl text-amber-300 text-2xl font-black animate-bounce inline-block">
            🔔 {roomData.buzzedPlayer} HAT GEBUZZERT!
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {playerList.map(p => (
          <div key={p.name} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400 truncate">{p.name}</p>
            <p className="text-xl font-black text-indigo-400">{p.score} Pkt.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
