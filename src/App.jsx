import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, get, child, remove } from 'firebase/database';
import { 
  Play, Plus, Trash2, Volume2, VolumeX, 
  Tv, UserCheck, Shield, Sparkles, KeyRound, User, AlertCircle, Send, CheckSquare, Square, Eye, EyeOff, Award, Check, X, LogOut, Lock, Edit3, RotateCcw, ChevronLeft, ChevronRight, Radio
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

  // Lokaler Moderator Preview Index
  const [hostPreviewIndex, setHostPreviewIndex] = useState(0);

  // Live Room State aus Firebase Realtime Database
  const [roomData, setRoomData] = useState(null);
  const [scoreDeltas, setScoreDeltas] = useState({});

  // Reset beim Zurückkehren zur Startseite
  useEffect(() => {
    if (!role) {
      setRoomCode('');
      setInputCode('');
      setPlayerTextAnswer('');
    }
  }, [role]);

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
      
      if (!data && role) {
        setRole(null);
        setRoomCode('');
        setInputCode('');
        setErrorMessage('Der Moderator hat den Raum geschlossen.');
        return;
      }

      if (data?.players && roomData?.players) {
        Object.keys(data.players).forEach(pName => {
          const oldScore = roomData.players[pName]?.score || 0;
          const newScore = data.players[pName]?.score || 0;
          if (oldScore !== newScore) {
            const diff = newScore - oldScore;
            setScoreDeltas(prev => ({ ...prev, [pName]: diff }));
            setTimeout(() => {
              setScoreDeltas(prev => ({ ...prev, [pName]: null }));
            }, 2500);
          }
        });
      }

      setRoomData(data);
    });
    return () => unsubscribe();
  }, [roomCode, role]);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

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
        buzzerLocked: false,
        revealedAnswer: false,
        revealedPlayers: {},
        editRequests: {}
      });

      setRoomCode(newCode);
      setRole('host');
      setHostPreviewIndex(0);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Fehler beim Erstellen des Raums.');
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanCode = inputCode.toUpperCase().trim();
    if (!playerName.trim() || cleanCode.length !== 5) return;

    const snapshot = await get(child(ref(db), `rooms/${cleanCode}`));
    if (!snapshot.exists()) {
      setErrorMessage('Raum existiert nicht!');
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

  const handleLeaveHost = async () => {
    if (roomCode && role === 'host') {
      try {
        await remove(ref(db, `rooms/${roomCode}`));
      } catch (e) {
        console.log('Fehler beim Löschen des Raums:', e);
      }
    }
    setRole(null);
    setRoomCode('');
    setInputCode('');
  };

  const handleLeavePlayer = async () => {
    if (roomCode && playerName && role === 'player') {
      try {
        await remove(ref(db, `rooms/${roomCode}/players/${playerName}`));
      } catch (e) {
        console.log('Fehler beim Verlassen:', e);
      }
    }
    setRole(null);
    setRoomCode('');
    setInputCode('');
    setPlayerTextAnswer('');
  };

  // --- MODERATOR ACTIONS ---
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('mc'); 
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
      questions: updatedQuestions
    });

    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
    setNewCorrectText('');
  };

  // Moderator gibt die ausgewählte Frage jetzt exakt für alle frei
  const releaseQuestionToLive = async (idx) => {
    const resetPlayers = { ...roomData?.players };
    Object.keys(resetPlayers).forEach(pKey => {
      resetPlayers[pKey].answer = null;
      resetPlayers[pKey].selected = false;
    });

    await update(ref(db, `rooms/${roomCode}`), {
      currentQuestionIndex: idx,
      buzzedPlayer: null,
      buzzerLocked: false,
      revealedAnswer: false,
      revealedPlayers: {},
      editRequests: {},
      players: resetPlayers
    });
  };

  const deleteQuestion = async (qId) => {
    const currentQuestions = roomData?.questions || [];
    const filtered = currentQuestions.filter(q => q.id !== qId);
    await update(ref(db, `rooms/${roomCode}`), {
      questions: filtered,
      currentQuestionIndex: filtered.length === 0 ? -1 : roomData?.currentQuestionIndex
    });
  };

  const handleBuzzer = async () => {
    if (!roomData || roomData.buzzedPlayer || roomData.buzzerLocked) return;
    playSound('buzzer');
    await update(ref(db, `rooms/${roomCode}`), {
      buzzedPlayer: playerName
    });
  };

  const handleEvaluateBuzzer = async (isCorrect) => {
    if (!roomData?.buzzedPlayer) return;
    const bPlayer = roomData.buzzedPlayer;
    const currentQuestions = roomData?.questions || [];
    const qIndex = roomData?.currentQuestionIndex ?? -1;
    const currentQ = qIndex >= 0 ? currentQuestions[qIndex] : null;
    const pts = currentQ ? currentQ.points : 100;
    const currentScore = roomData?.players?.[bPlayer]?.score || 0;
    const newScore = isCorrect ? currentScore + pts : currentScore - Math.round(pts / 2);

    if (isCorrect) playSound('correct');

    await update(ref(db, `rooms/${roomCode}`), {
      [`players/${bPlayer}/score`]: newScore,
      buzzedPlayer: null,
      buzzerLocked: isCorrect
    });
  };

  const resetBuzzerOnly = async () => {
    await update(ref(db, `rooms/${roomCode}`), { buzzedPlayer: null });
  };

  const handleSubmitAnswer = async (answerVal) => {
    if (!roomCode || !playerName) return;
    await update(ref(db, `rooms/${roomCode}/players/${playerName}`), {
      answer: answerVal
    });
  };

  const handleRequestEdit = async () => {
    if (!roomCode || !playerName) return;
    await update(ref(db, `rooms/${roomCode}/editRequests`), {
      [playerName]: 'pending'
    });
  };

  const handleRespondEditRequest = async (pName, isAllowed) => {
    const updates = {
      [`rooms/${roomCode}/editRequests/${pName}`]: isAllowed ? 'approved' : 'rejected'
    };
    if (isAllowed) {
      updates[`rooms/${roomCode}/players/${pName}/answer`] = null;
    }
    await update(ref(db), updates);
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

  const toggleReveal = async () => {
    const currentQuestions = roomData?.questions || [];
    const qIndex = roomData?.currentQuestionIndex ?? -1;
    const currentQ = qIndex >= 0 ? currentQuestions[qIndex] : null;

    const nextRevealed = !roomData?.revealedAnswer;
    const updates = {
      [`rooms/${roomCode}/revealedAnswer`]: nextRevealed
    };

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

    if (nextRevealed && currentQ && currentQ.type === 'freetext') {
      const pts = currentQ.points || 100;
      if (roomData?.players) {
        Object.values(roomData.players).forEach(p => {
          if (p.selected) {
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
  const liveQIndex = roomData?.currentQuestionIndex ?? -1;
  const liveQ = liveQIndex >= 0 ? currentQuestions[liveQIndex] : null;

  // Die Frage, die der Moderator aktuell im Vorschau-Modus betrachert
  const previewQ = currentQuestions[hostPreviewIndex] || null;
  const isPreviewLive = hostPreviewIndex === liveQIndex;

  const playerList = roomData?.players ? Object.values(roomData.players) : [];
  const editRequests = roomData?.editRequests || {};

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
            <button onClick={handleLeaveHost} className="px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-rose-600/30">
              <LogOut className="w-4 h-4"/> Raum Schließen & Löschen
            </button>
          </div>
        </div>

        {Object.entries(editRequests).filter(([_, status]) => status === 'pending').map(([pName]) => (
          <div key={pName} className="mb-6 p-4 bg-indigo-600/20 border border-indigo-500 rounded-xl flex items-center justify-between animate-pulse">
            <span className="text-sm font-semibold text-indigo-200">
              ✏️ <strong>{pName}</strong> möchte seine Freitext-Antwort korrigieren. Erlauben?
            </span>
            <div className="flex gap-2">
              <button onClick={() => handleRespondEditRequest(pName, true)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">Erlauben</button>
              <button onClick={() => handleRespondEditRequest(pName, false)} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold">Ablehnen</button>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* MODERATOR CONTROL BOARD */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2"><Eye className="w-5 h-5"/> Moderator Vorschau</h2>
                  {isPreviewLive ? (
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                      <Radio className="w-3 h-3 animate-pulse" /> LIVE
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-slate-700 text-slate-400 text-xs font-medium rounded-full">
                      Nur Vorschau
                    </span>
                  )}
                </div>

                {/* VORHERIGE / NÄCHSTE FRAGE DURCHBLÄTTERN */}
                {currentQuestions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHostPreviewIndex(Math.max(0, hostPreviewIndex - 1))}
                      disabled={hostPreviewIndex <= 0}
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1 text-xs font-semibold"
                    >
                      <ChevronLeft className="w-4 h-4"/> Vorherige
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      {hostPreviewIndex + 1} / {currentQuestions.length}
                    </span>
                    <button
                      onClick={() => setHostPreviewIndex(Math.min(currentQuestions.length - 1, hostPreviewIndex + 1))}
                      disabled={hostPreviewIndex >= currentQuestions.length - 1}
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1 text-xs font-semibold"
                    >
                      Nächste <ChevronRight className="w-4 h-4"/>
                    </button>
                  </div>
                )}
              </div>

              {previewQ ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                    <span className="text-xs text-indigo-400 font-semibold uppercase block mb-1">
                      Typ: {previewQ.type === 'mc' ? 'Multiple Choice' : previewQ.type === 'buzzer' ? 'Schnell-Buzzer' : 'Freitext'} | {previewQ.points} Punkte
                    </span>
                    <p className="text-xl font-semibold text-white">{previewQ.text}</p>

                    {previewQ.type === 'mc' && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        {previewQ.options.map((o, idx) => (
                          <div key={idx} className={`p-2 rounded border ${idx === previewQ.correctOption ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
                            <strong>{['A','B','C','D'][idx]}:</strong> {o} {idx === previewQ.correctOption && '✓'}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {previewQ.type === 'freetext' && previewQ.correctText && (
                      <p className="text-xs text-emerald-400 mt-2 font-mono">Richtige Musterantwort: {previewQ.correctText}</p>
                    )}
                  </div>

                  {/* BUTTON ZUM FREIGEBEN DER FRAGE */}
                  {!isPreviewLive ? (
                    <button
                      onClick={() => releaseQuestionToLive(hostPreviewIndex)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                    >
                      <Radio className="w-5 h-5" /> Diese Frage jetzt für ALLE FREIGEBEN & LIVE SCHALTEN
                    </button>
                  ) : (
                    <div className="space-y-3 pt-2">
                      {liveQ?.type === 'buzzer' && (
                        <div className="p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-amber-300">
                              {roomData?.buzzedPlayer ? `🔔 Gebuzzert von: ${roomData.buzzedPlayer}` : 'Warte auf Buzzer...'}
                            </span>
                            {roomData?.buzzedPlayer && (
                              <button onClick={resetBuzzerOnly} className="text-xs underline text-amber-200 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3"/> Buzzer zurücksetzen
                              </button>
                            )}
                          </div>

                          {roomData?.buzzedPlayer && (
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => handleEvaluateBuzzer(true)} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                                <Check className="w-5 h-5"/> Richtig (+{liveQ.points} Pkt.)
                              </button>
                              <button onClick={() => handleEvaluateBuzzer(false)} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                                <X className="w-5 h-5"/> Falsch (-{Math.round(liveQ.points / 2)} Pkt.)
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button onClick={toggleReveal} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">
                          {roomData?.revealedAnswer ? 'Antwort verbergen' : 'Antwort auflösen (Auto-Punkte)'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Keine Frage vorhanden. Erstelle unten deine erste Frage.</p>
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
                  <div key={q.id} className={`p-3 rounded-xl border flex items-center justify-between ${idx === liveQIndex ? 'bg-emerald-950/30 border-emerald-500' : idx === hostPreviewIndex ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-900 border-slate-700'}`}>
                    <div>
                      <p className="text-sm text-white truncate">{idx + 1}. {q.text}</p>
                      <span className="text-xs text-slate-500">[{q.type === 'mc' ? 'Multiple Choice' : q.type === 'buzzer' ? 'Buzzer' : 'Freitext'}] {idx === liveQIndex && '• [LIVE AKTIV]'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setHostPreviewIndex(idx)} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg font-semibold hover:bg-indigo-500">
                        Ansehen / Vorschau
                      </button>
                      <button onClick={() => deleteQuestion(q.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-bold mb-4 text-indigo-400 flex items-center gap-2"><UserCheck className="w-5 h-5"/> Spieler Live ({playerList.length})</h2>

            <div className="space-y-3">
              {playerList.map(p => {
                const isRevealed = roomData?.revealedPlayers?.[p.name];
                return (
                  <div key={p.name} className={`p-3 rounded-xl border transition ${p.selected ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {liveQ?.type === 'freetext' && (
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
                        <button onClick={() => handleAwardPoints(p.name, liveQ ? liveQ.points : 100)} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold">+{liveQ ? liveQ.points : 100}</button>
                        <button onClick={() => handleAwardPoints(p.name, -50)} className="px-2 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded text-xs font-bold">-50</button>
                      </div>
                    </div>

                    {p.answer !== null && p.answer !== undefined && (
                      <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-500 block">Antwort:</span>
                          <span className="text-emerald-300 font-medium">
                            {liveQ?.type === 'mc' ? `Option ${['A','B','C','D'][p.answer]}` : p.answer}
                          </span>
                        </div>
                        {liveQ?.type === 'freetext' && (
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
    const editStatus = editRequests[playerName];

    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div>
            <span className="text-xs text-slate-400">Mitspieler</span>
            <p className="font-bold">{playerName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400">Raumcode</span>
              <p className="font-mono font-bold text-indigo-400">{roomCode}</p>
            </div>
            <button 
              onClick={handleLeavePlayer}
              className="px-3 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-rose-600/30"
            >
              <LogOut className="w-4 h-4" /> Verlassen
            </button>
          </div>
        </div>

        <div className="my-auto space-y-6 text-center">
          {liveQ ? (
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
              <span className="text-xs text-indigo-400 font-semibold uppercase">Aktuelle Frage</span>
              <p className="text-xl font-bold">{liveQ.text}</p>

              {liveQ.type === 'mc' && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {liveQ.options.map((opt, idx) => (
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

              {liveQ.type === 'freetext' && (
                <div className="pt-2 space-y-3">
                  {!hasAnswered ? (
                    <>
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
                    </>
                  ) : (
                    <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                        <span>✓ Antwort eingereicht & gesperrt</span>
                        <Lock className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-lg font-bold text-white font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">{playerObj.answer}</p>
                      
                      {editStatus === 'pending' ? (
                        <p className="text-xs text-amber-400 animate-pulse">Warte auf Bestätigung des Moderators...</p>
                      ) : editStatus === 'rejected' ? (
                        <p className="text-xs text-rose-400">Korrektur-Anfrage abgelehnt.</p>
                      ) : (
                        <button
                          onClick={handleRequestEdit}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-semibold flex items-center justify-center gap-1 border border-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Korrektur beim Moderator anfragen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500">Warte auf die Freigabe der nächsten Frage durch den Moderator...</p>
          )}

          {liveQ?.type === 'buzzer' && (
            <button
              onClick={handleBuzzer}
              disabled={!!roomData?.buzzedPlayer || roomData?.buzzerLocked}
              className={`w-full py-12 rounded-3xl font-extrabold text-2xl uppercase transition transform active:scale-95 ${
                roomData?.buzzedPlayer === playerName
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : roomData?.buzzedPlayer || roomData?.buzzerLocked
                  ? 'bg-slate-800 text-slate-600 border border-slate-700'
                  : 'bg-rose-600 hover:bg-rose-500 text-white border-b-8 border-rose-800 shadow-2xl'
              }`}
            >
              {roomData?.buzzedPlayer === playerName ? 'GEBUZZERT!' : roomData?.buzzerLocked ? 'GESPERRT' : roomData?.buzzedPlayer ? 'BLOCKIERT' : 'BUZZER'}
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
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase block">Raumcode</span>
            <span className="font-mono text-2xl font-bold text-indigo-400">{roomCode}</span>
          </div>
          <button 
            onClick={() => setRole(null)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 text-xs flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" /> Beenden
          </button>
        </div>
      </div>

      <div className="my-auto max-w-4xl mx-auto text-center space-y-8">
        {liveQ ? (
          <div className="space-y-6">
            <span className="inline-block px-4 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-sm font-semibold">
              {liveQ.points} Punkte
            </span>
            <h2 className="text-4xl font-extrabold">{liveQ.text}</h2>

            {liveQ.type === 'mc' && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {liveQ.options.map((opt, idx) => {
                  const playersWhoChoseThis = playerList.filter(p => p.answer === idx);
                  const isCorrect = roomData?.revealedAnswer && idx === liveQ.correctOption;

                  return (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl border text-left transition relative ${
                        isCorrect
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      <p className="text-lg font-semibold">
                        <span className="text-indigo-400 mr-3 font-bold">{['A','B','C','D'][idx]}:</span> {opt}
                      </p>

                      {roomData?.revealedAnswer && playersWhoChoseThis.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                          {playersWhoChoseThis.map(p => (
                            <span key={p.name} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700 font-medium">
                              👤 {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {liveQ.type === 'freetext' && roomData?.revealedAnswer && (
              <div className="p-6 bg-emerald-600/20 border-2 border-emerald-500 rounded-2xl text-emerald-200 text-2xl font-bold inline-block">
                Musterantwort: {liveQ.correctText || 'Keine Angabe'}
              </div>
            )}

            {liveQ.type === 'freetext' && (
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
          <p className="text-slate-600 text-xl font-bold">Warte auf die Freigabe der nächsten Frage...</p>
        )}

        {liveQ?.type === 'buzzer' && roomData?.buzzedPlayer && (
          <div className="p-6 bg-amber-500/20 border-2 border-amber-500 rounded-2xl text-amber-300 text-2xl font-black animate-bounce inline-block">
            🔔 {roomData.buzzedPlayer} HAT GEBUZZERT!
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {playerList.map(p => {
          const delta = scoreDeltas[p.name];
          return (
            <div key={p.name} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center relative overflow-hidden">
              {delta !== undefined && delta !== null && (
                <span className={`absolute -top-1 left-1/2 transform -translate-x-1/2 text-base font-black animate-bounce ${delta > 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`}>
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              )}
              <p className="text-xs text-slate-400 truncate">{p.name}</p>
              <p className="text-xl font-black text-indigo-400">{p.score} Pkt.</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
