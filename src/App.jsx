import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, get, child, remove } from 'firebase/database';
import { 
  Play, Plus, Trash2, Volume2, VolumeX, 
  Tv, UserCheck, Shield, Sparkles, KeyRound, User, AlertCircle, Send, CheckSquare, Square, Eye, EyeOff, Award, Check, X, LogOut, Lock, Edit3, RotateCcw, ChevronLeft, ChevronRight, Radio, FolderPlus, BookOpen, Layers, Globe
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

// Übersetzungen mit PNG-Flaggen aus dem public-Ordner (/at.png, /gb.png, /sr.png)
const translations = {
  de: {
    appName: "Quiz Show Live",
    appSub: "Echtzeit-Quiz für dich & deine Freunde",
    yourName: "Dein Name",
    namePlaceholder: "z. B. Alex",
    hostRoom: "Als Moderator Raum erstellen",
    selectCollection: "Fragen-Kollektion wählen",
    emptyRoom: "--- Leerer Raum (Standard: +5 / -1) ---",
    createRoomBtn: "Raum mit gewählter Kollektion erstellen",
    createCollBtn: "Neue Fragen-Kollektion erstellen",
    joinRoom: "Einem Raum beitreten / Hot-Join",
    roomCodePlaceholder: "5-stelliger Code",
    joinBtn: "Raum betreten",
    tvBtn: "TV / Discord Ansicht",
    roomClosed: "Der Raum wurde geschlossen.",
    roomNotExist: "Raum existiert nicht!",
    errCreate: "Fehler beim Erstellen des Raums.",
    errNoName: "Bitte gib zuerst einen Kollektionsnamen ein.",
    errNoQ: "Bitte füge mindestens eine Frage hinzu.",
    saveSuccess: "Kollektion erfolgreich in der Datenbank gespeichert!",
    collectionManager: "Kollektions-Manager",
    saveCollection: "Kollektion speichern",
    cancel: "Abbrechen",
    collectionName: "Kollektionsname",
    collNamePlaceholder: "z. B. Allgemeinwissen 1",
    defaultCorrect: "Standard Punkte (+)",
    defaultWrong: "Standard Abzug (-)",
    addQuestion: "Frage hinzufügen",
    questionTextPlaceholder: "Fragetext eintippen...",
    questionType: "Fragetyp",
    mc: "Multiple Choice",
    buzzer: "Schnell-Buzzer",
    freetext: "Freitext-Antwort",
    correctAnswerText: "Musterantwort / Richtige Lösung",
    addQToColl: "Frage zur Kollektion hinzufügen",
    includedQuestions: "Enthaltene Fragen",
    moderatorControl: "Moderator Control",
    roomCode: "Raumcode",
    closeAndDelete: "Raum Schließen & Löschen",
    editRequestMsg: "möchte seine Freitext-Antwort korrigieren. Erlauben?",
    allow: "Erlauben",
    deny: "Ablehnen",
    modPreview: "Moderator Vorschau",
    live: "LIVE",
    previewOnly: "Nur Vorschau",
    prev: "Vorherige",
    next: "Nächste",
    releaseLive: "Diese Frage jetzt für ALLE FREIGEBEN & LIVE SCHALTEN",
    waitingBuzzer: "Warte auf Buzzer...",
    resetBuzzer: "Buzzer zurücksetzen",
    correct: "Richtig",
    wrong: "Falsch",
    hideAnswer: "Antwort verbergen",
    revealAnswer: "Antwort auflösen (Auto-Punkte)",
    createNewQuestion: "Neue Frage erstellen",
    saveQuestion: "Frage speichern",
    createdQuestions: "Erstellte Fragen",
    viewPreview: "Ansehen / Vorschau",
    playersLive: "Spieler Live",
    noPlayers: "Noch keine Spieler beigetreten.",
    answerLabel: "Antwort:",
    showOnTV: "Auf TV zeigen",
    activeOnTV: "Auf TV [Aktiv]",
    mitspieler: "Mitspieler",
    leave: "Verlassen",
    currentQuestion: "Aktuelle Frage",
    submitAnswer: "Antwort absenden",
    answerSubmitted: "✓ Antwort eingereicht & gesperrt",
    waitingHostEdit: "Warte auf Bestätigung des Moderators...",
    editRejected: "Korrektur-Anfrage abgelehnt.",
    requestEdit: "Korrektur beim Moderator anfragen",
    buzzedState: "GEBUZZERT!",
    locked: "GESPERRT",
    blocked: "BLOCKIERT",
    buzzerBtn: "BUZZER",
    waitingHostRelease: "Warte auf die Freigabe der nächsten Frage durch den Moderator...",
    modelAnswer: "Musterantwort:",
    noAnswer: "Keine Angabe"
  },
  en: {
    appName: "Quiz Show Live",
    appSub: "Real-time quiz for you & your friends",
    yourName: "Your Name",
    namePlaceholder: "e.g. Alex",
    hostRoom: "Create Room as Host",
    selectCollection: "Select Question Collection",
    emptyRoom: "--- Empty Room (Default: +5 / -1) ---",
    createRoomBtn: "Create room with selected collection",
    createCollBtn: "Create new question collection",
    joinRoom: "Join Room / Hot-Join",
    roomCodePlaceholder: "5-digit code",
    joinBtn: "Join Room",
    tvBtn: "TV / Discord View",
    roomClosed: "The room has been closed.",
    roomNotExist: "Room does not exist!",
    errCreate: "Error creating room.",
    errNoName: "Please enter a collection name first.",
    errNoQ: "Please add at least one question.",
    saveSuccess: "Collection successfully saved in database!",
    collectionManager: "Collection Manager",
    saveCollection: "Save Collection",
    cancel: "Cancel",
    collectionName: "Collection Name",
    collNamePlaceholder: "e.g. General Knowledge 1",
    defaultCorrect: "Default Points (+)",
    defaultWrong: "Default Deduction (-)",
    addQuestion: "Add Question",
    questionTextPlaceholder: "Type question text...",
    questionType: "Question Type",
    mc: "Multiple Choice",
    buzzer: "Fast Buzzer",
    freetext: "Free Text Answer",
    correctAnswerText: "Model Answer / Correct Solution",
    addQToColl: "Add question to collection",
    includedQuestions: "Included Questions",
    moderatorControl: "Moderator Control",
    roomCode: "Room Code",
    closeAndDelete: "Close & Delete Room",
    editRequestMsg: "wants to correct their free text answer. Allow?",
    allow: "Allow",
    deny: "Deny",
    modPreview: "Moderator Preview",
    live: "LIVE",
    previewOnly: "Preview Only",
    prev: "Previous",
    next: "Next",
    releaseLive: "Release & Go Live for ALL",
    waitingBuzzer: "Waiting for buzzer...",
    resetBuzzer: "Reset Buzzer",
    correct: "Correct",
    wrong: "Wrong",
    hideAnswer: "Hide Answer",
    revealAnswer: "Reveal Answer (Auto Points)",
    createNewQuestion: "Create New Question",
    saveQuestion: "Save Question",
    createdQuestions: "Created Questions",
    viewPreview: "View / Preview",
    playersLive: "Players Live",
    noPlayers: "No players joined yet.",
    answerLabel: "Answer:",
    showOnTV: "Show on TV",
    activeOnTV: "On TV [Active]",
    mitspieler: "Player",
    leave: "Leave",
    currentQuestion: "Current Question",
    submitAnswer: "Submit Answer",
    answerSubmitted: "✓ Answer submitted & locked",
    waitingHostEdit: "Waiting for host approval...",
    editRejected: "Correction request denied.",
    requestEdit: "Request correction from host",
    buzzedState: "BUZZED!",
    locked: "LOCKED",
    blocked: "BLOCKED",
    buzzerBtn: "BUZZER",
    waitingHostRelease: "Waiting for the host to release the next question...",
    modelAnswer: "Model Answer:",
    noAnswer: "No answer"
  },
  sr: {
    appName: "Kviz Uživo",
    appSub: "Kviz u realnom vremenu za tebe i prijatelje",
    yourName: "Tvoje ime",
    namePlaceholder: "npr. Aleksa",
    hostRoom: "Kreiraj sobu kao Moderator",
    selectCollection: "Izaberi kolekciju pitanja",
    emptyRoom: "--- Prazna soba (Standard: +5 / -1) ---",
    createRoomBtn: "Kreiraj sobu sa izabranom kolekcijom",
    createCollBtn: "Kreiraj novu kolekciju pitanja",
    joinRoom: "Pridruži se sobi / Hot-Join",
    roomCodePlaceholder: "5-cifreni kod",
    joinBtn: "Uđi u sobu",
    tvBtn: "TV / Discord Prikaz",
    roomClosed: "Soba je zatvorena.",
    roomNotExist: "Soba ne postoji!",
    errCreate: "Greška prilikom kreiranja sobe.",
    errNoName: "Molimo unesi naziv kolekcije.",
    errNoQ: "Molimo dodaj barem jedno pitanje.",
    saveSuccess: "Kolekcija uspešno sačuvana u bazi!",
    collectionManager: "Upravljač Kolekcijama",
    saveCollection: "Sačuvaj kolekciju",
    cancel: "Otkaži",
    collectionName: "Naziv kolekcije",
    collNamePlaceholder: "npr. Opšta kultura 1",
    defaultCorrect: "Standardni poeni (+)",
    defaultWrong: "Standardni minus (-)",
    addQuestion: "Dodaj pitanje",
    questionTextPlaceholder: "Unesi tekst pitanja...",
    questionType: "Tip pitanja",
    mc: "Više ponuđenih odgovora",
    buzzer: "Brzi Buzzer",
    freetext: "Slobodan tekst",
    correctAnswerText: "Tačan odgovor / rešenje",
    addQToColl: "Dodaj pitanje u kolekciju",
    includedQuestions: "Sadržana pitanja",
    moderatorControl: "Kontrola Moderatora",
    roomCode: "Kod sobe",
    closeAndDelete: "Zatvori i obriši sobu",
    editRequestMsg: "želi da ispravi svoj odgovor. Dozvoliti?",
    allow: "Dozvoli",
    deny: "Odbij",
    modPreview: "Pregled moderatora",
    live: "UŽIVO",
    previewOnly: "Samo pregled",
    prev: "Prethodna",
    next: "Sledeća",
    releaseLive: "Pusti pitanje UŽIVO za SVE",
    waitingBuzzer: "Čeka se buzzer...",
    resetBuzzer: "Resetuj buzzer",
    correct: "Tačno",
    wrong: "Netačno",
    hideAnswer: "Sakrij odgovor",
    revealAnswer: "Prikaži odgovor (Automatski poeni)",
    createNewQuestion: "Kreiraj novo pitanje",
    saveQuestion: "Sačuvaj pitanje",
    createdQuestions: "Kreirana pitanja",
    viewPreview: "Pregled",
    playersLive: "Igrači Uživo",
    noPlayers: "Nema prijavljenih igrača.",
    answerLabel: "Odgovor:",
    showOnTV: "Prikaži na TV-u",
    activeOnTV: "Na TV-u [Aktivno]",
    mitspieler: "Igrač",
    leave: "Napusti",
    currentQuestion: "Trenutno pitanje",
    submitAnswer: "Pošalji odgovor",
    answerSubmitted: "✓ Odgovor poslat i zaključan",
    waitingHostEdit: "Čeka se odobrenje moderatora...",
    editRejected: "Zahtev za ispravku odbijen.",
    requestEdit: "Zatraži ispravku od moderatora",
    buzzedState: "PRITISNUTO!",
    locked: "ZAKLJUČANO",
    blocked: "BLOKIRANO",
    buzzerBtn: "BUZZER",
    waitingHostRelease: "Čeka se da moderator pusti sledeće pitanje...",
    modelAnswer: "Tačan odgovor:",
    noAnswer: "Nema odgovora"
  }
};

export default function App() {
  const [lang, setLang] = useState('de');
  const t = translations[lang];

  const [role, setRole] = useState(null); // 'host' | 'player' | 'tv' | 'collection_creator'
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [playerTextAnswer, setPlayerTextAnswer] = useState('');
  
  // State für das Aufklappen des Sprachmenüs
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Kollektion Erstellungs State (Standard: +5 und -1)
  const [collHeader, setCollHeader] = useState('');
  const [collCorrectPoints, setCollCorrectPoints] = useState(5);
  const [collWrongPoints, setCollWrongPoints] = useState(1);
  const [collQuestions, setCollQuestions] = useState([]);
  const [publicCollections, setPublicCollections] = useState({});
  const [selectedCollectionKey, setSelectedCollectionKey] = useState('');

  // Eingabefelder für eine neue Frage im Kollektions-Modus
  const [newCollQText, setNewCollQText] = useState('');
  const [newCollQType, setNewCollQType] = useState('mc');
  const [newCollQOptions, setNewCollQOptions] = useState(['', '', '', '']);
  const [newCollQCorrectOpt, setNewCollQCorrectOpt] = useState(0);
  const [newCollQCorrectText, setNewCollQCorrectText] = useState('');

  // Lokaler Moderator Preview Index
  const [hostPreviewIndex, setHostPreviewIndex] = useState(0);

  // Live Room State aus Firebase Realtime Database
  const [roomData, setRoomData] = useState(null);

  // Öffentliche Kollektionen beim Start laden
  useEffect(() => {
    const collRef = ref(db, 'collections');
    const unsub = onValue(collRef, (snapshot) => {
      setPublicCollections(snapshot.val() || {});
    });
    return () => unsub();
  }, []);

  // Reset beim Zurückkehren zur Startseite
  useEffect(() => {
    if (!role) {
      setRoomCode('');
      setInputCode('');
      setPlayerTextAnswer('');
      setSelectedCollectionKey('');
    }
  }, [role]);

  // Wenn die Sprache gewechselt wird, Auswahl der Kollektion zurücksetzen damit keine falsche geladen bleibt
  useEffect(() => {
    setSelectedCollectionKey('');
  }, [lang]);

  // Synchronisierung des lokalen Antwort-Inputs bei Live-Datenänderungen
  useEffect(() => {
    if (role === 'player' && roomData?.players?.[playerName]) {
      const currentAns = roomData.players[playerName].answer;
      if (currentAns !== null && currentAns !== undefined) {
        setPlayerTextAnswer(currentAns);
      }
    }
  }, [roomData, role, playerName]);

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

  // Synchronisierung mit Firebase Raum
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data && role) {
        setRole(null);
        setRoomCode('');
        setInputCode('');
        setErrorMessage(t.roomClosed);
        return;
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

  // Raum Erstellen (Als Moderator) - Übernimmt Kollektions-Punkte falls vorhanden
  const handleCreateRoom = async (e) => {
    if (e) e.preventDefault();
    if (!playerName.trim()) return;
    const newCode = generateCode();
    
    let loadedQuestions = [];
    let cCorrectPts = 5;
    let cWrongPts = 1;

    if (selectedCollectionKey && publicCollections[selectedCollectionKey]) {
      const colData = publicCollections[selectedCollectionKey];
      loadedQuestions = colData.questions || [];
      if (colData.correctPoints !== undefined) cCorrectPts = Number(colData.correctPoints);
      if (colData.wrongPoints !== undefined) cWrongPts = Number(colData.wrongPoints);
    }

    const finalizedQuestions = loadedQuestions.map(q => ({
      ...q,
      points: q.points !== undefined ? q.points : cCorrectPts,
      wrongPoints: q.wrongPoints !== undefined ? q.wrongPoints : cWrongPts
    }));
    
    try {
      await set(ref(db, `rooms/${newCode}`), {
        host: playerName.trim(),
        createdAt: Date.now(),
        currentQuestionIndex: -1,
        questions: finalizedQuestions,
        correctPoints: cCorrectPts,
        wrongPoints: cWrongPts,
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
      setErrorMessage(t.errCreate);
    }
  };

  // Raum Beitreten / Hot-Join
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanCode = inputCode.toUpperCase().trim();
    const cleanName = playerName.trim();
    if (!cleanName || cleanCode.length !== 5) return;

    const snapshot = await get(child(ref(db), `rooms/${cleanCode}`));
    if (!snapshot.exists()) {
      setErrorMessage(t.roomNotExist);
      return;
    }

    const data = snapshot.val();

    if (data.host && data.host.toLowerCase() === cleanName.toLowerCase()) {
      setRoomCode(cleanCode);
      setRole('host');
      setHostPreviewIndex(data.currentQuestionIndex >= 0 ? data.currentQuestionIndex : 0);
      return;
    }

    const existingPlayers = data.players || {};
    const existingPlayerKey = Object.keys(existingPlayers).find(
      key => key.toLowerCase() === cleanName.toLowerCase()
    );

    if (!existingPlayerKey) {
      await update(ref(db, `rooms/${cleanCode}/players/${cleanName}`), {
        name: cleanName,
        score: 0,
        answer: null,
        selected: false
      });
    } else {
      const existingAns = existingPlayers[existingPlayerKey]?.answer;
      if (existingAns !== null && existingAns !== undefined) {
        setPlayerTextAnswer(existingAns);
      }
    }

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
      setErrorMessage(t.roomNotExist);
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

  const handleLeavePlayer = () => {
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
  const [newPoints, setNewPoints] = useState(5);
  const [newWrongPoints, setNewWrongPoints] = useState(1);

  useEffect(() => {
    if (roomData?.correctPoints !== undefined) setNewPoints(roomData.correctPoints);
    if (roomData?.wrongPoints !== undefined) setNewWrongPoints(roomData.wrongPoints);
  }, [roomData?.correctPoints, roomData?.wrongPoints]);

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
      points: Number(newPoints) || 5,
      wrongPoints: Number(newWrongPoints) || 1
    };

    const updatedQuestions = [...currentQuestions, newQ];
    await update(ref(db, `rooms/${roomCode}`), {
      questions: updatedQuestions
    });

    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
    setNewCorrectText('');
  };

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
    const pts = currentQ?.points !== undefined ? currentQ.points : (roomData?.correctPoints || 5);
    const wrongPts = currentQ?.wrongPoints !== undefined ? currentQ.wrongPoints : (roomData?.wrongPoints || 1);
    const currentScore = roomData?.players?.[bPlayer]?.score || 0;
    const newScore = isCorrect ? currentScore + pts : currentScore - wrongPts;

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
    
    const currentAns = roomData?.players?.[playerName]?.answer;
    if (currentAns !== null && currentAns !== undefined) return;

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
    if (pts > 0) playSound('correct');
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
      const pts = currentQ.points || roomData?.correctPoints || 5;
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
      const pts = currentQ.points || roomData?.correctPoints || 5;
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

  // Eingeklappte Sprachauswahl mit Welt-Icon und Flaggen
  const renderLanguageSelector = () => {
    const flagSrc = lang === 'de' ? '/at.png' : lang === 'en' ? '/gb.png' : '/sr.png';
    const langLabel = lang === 'de' ? 'DE' : lang === 'en' ? 'ENG' : 'SRB';

    return (
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          {/* Button zum Aufklappen mit Welt-Icon und aktiver Flagge */}
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-2 rounded-xl shadow-lg hover:bg-slate-700 transition text-white"
            title="Sprache auswählen"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <img src={flagSrc} alt={langLabel} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
            <span className="text-xs font-bold">{langLabel}</span>
          </button>

          {/* Aufgeklapptes Dropdown-Menü */}
          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 flex flex-col gap-1 z-50">
              <button 
                onClick={() => { setLang('de'); setIsLangMenuOpen(false); }} 
                className={`px-3 py-2 text-xs font-bold transition flex items-center gap-2 text-left hover:bg-slate-700 ${lang === 'de' ? 'text-indigo-400 bg-slate-900/50' : 'text-slate-300'}`}
              >
                <img src="/at.png" alt="AT" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" /> Deutsch (DE)
              </button>
              <button 
                onClick={() => { setLang('en'); setIsLangMenuOpen(false); }} 
                className={`px-3 py-2 text-xs font-bold transition flex items-center gap-2 text-left hover:bg-slate-700 ${lang === 'en' ? 'text-indigo-400 bg-slate-900/50' : 'text-slate-300'}`}
              >
                <img src="/gb.png" alt="ENG" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" /> English (ENG)
              </button>
              <button 
                onClick={() => { setLang('sr'); setIsLangMenuOpen(false); }} 
                className={`px-3 py-2 text-xs font-bold transition flex items-center gap-2 text-left hover:bg-slate-700 ${lang === 'sr' ? 'text-indigo-400 bg-slate-900/50' : 'text-slate-300'}`}
              >
                <img src="/sr.png" alt="SRB" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" /> Srpski (SRB)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- HOME / LOGIN SCREEN ---
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative">
        {renderLanguageSelector()}

        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-6">
          <div className="text-center">
            <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-3">
              <Sparkles className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">{t.appName}</h1>
            <p className="text-slate-400 text-sm mt-1">{t.appSub}</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.yourName}</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <form onSubmit={handleCreateRoom} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" /> {t.hostRoom}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.selectCollection}</label>
                  <select
                    value={selectedCollectionKey}
                    onChange={(e) => setSelectedCollectionKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="">{t.emptyRoom}</option>
                    {Object.entries(publicCollections)
                      .filter(([_, cData]) => {
                        const collLang = cData.language || 'de';
                        return collLang === lang;
                      })
                      .map(([cKey, cData]) => (
                        <option key={cKey} value={cKey}>
                          {cData.header} ({cData.questions?.length || 0} Q | +{cData.correctPoints !== undefined ? cData.correctPoints : 5} / -{cData.wrongPoints !== undefined ? cData.wrongPoints : 1})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!playerName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
                >
                  {t.createRoomBtn}
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  onClick={() => {
                    setRole('collection_creator');
                    setCollHeader('');
                    setCollCorrectPoints(5);
                    setCollWrongPoints(1);
                    setCollQuestions([]);
                  }}
                  className="text-xs text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto font-medium"
                >
                  <FolderPlus className="w-4 h-4" /> {t.createCollBtn}
                </button>
              </div>

              <form onSubmit={handleJoinRoom} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" /> {t.joinRoom}
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    maxLength={5}
                    placeholder={t.roomCodePlaceholder}
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
                  {t.joinBtn}
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
                    <Tv className="w-4 h-4" /> {t.tvBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- EIGENER KOLLEKTIONS-ERSTELLER MODUS ---
  if (role === 'collection_creator') {
    const handleSaveCollectionToDB = async () => {
      const cleanHeader = collHeader.trim();
      if (!cleanHeader) {
        alert(t.errNoName);
        return;
      }
      if (collQuestions.length === 0) {
        alert(t.errNoQ);
        return;
      }

      try {
        const safeKey = cleanHeader.replace(/[.#$[\]]/g, '_');

        await set(ref(db, `collections/${safeKey}`), {
          header: cleanHeader,
          language: lang,
          correctPoints: Number(collCorrectPoints) || 5,
          wrongPoints: Number(collWrongPoints) || 1,
          createdAt: Date.now(),
          questions: collQuestions
        });

        alert(t.saveSuccess);
        setRole(null);
      } catch (err) {
        console.error("Fehler beim Speichern der Kollektion:", err);
        alert('Fehler beim Speichern in Firebase: ' + err.message);
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex justify-center relative">
        {renderLanguageSelector()}

        <div className="w-full max-w-3xl space-y-6 pt-10">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div>
                <span className="text-xs text-indigo-400 font-semibold uppercase">{t.collectionManager}</span>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-indigo-400" /> {t.createCollBtn} <span className="text-xs bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/50 uppercase">[{lang}]</span>
                </h1>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={handleSaveCollectionToDB}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg flex items-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4"/> {t.saveCollection} ({collQuestions.length})
                </button>
                <button 
                  type="button"
                  onClick={() => setRole(null)}
                  className="px-3 py-2 bg-slate-700 text-slate-300 border border-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-600"
                >
                  {t.cancel}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.collectionName}</label>
                <input
                  type="text"
                  placeholder={t.collNamePlaceholder}
                  value={collHeader}
                  onChange={(e) => setCollHeader(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase mb-1">{t.defaultCorrect}</label>
                <input
                  type="number"
                  value={collCorrectPoints}
                  onChange={(e) => setCollCorrectPoints(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-rose-400 uppercase mb-1">{t.defaultWrong}</label>
                <input
                  type="number"
                  value={collWrongPoints}
                  onChange={(e) => setCollWrongPoints(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-indigo-400">{t.addQuestion}</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t.questionTextPlaceholder}
                value={newCollQText}
                onChange={(e) => setNewCollQText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm"
              />
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t.questionType}</label>
                <select
                  value={newCollQType}
                  onChange={(e) => setNewCollQType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm"
                >
                  <option value="mc">{t.mc}</option>
                  <option value="buzzer">{t.buzzer}</option>
                  <option value="freetext">{t.freetext}</option>
                </select>
              </div>

              {newCollQType === 'freetext' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t.correctAnswerText}</label>
                  <input
                    type="text"
                    placeholder="z. B. Wien"
                    value={newCollQCorrectText}
                    onChange={(e) => setNewCollQCorrectText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm"
                  />
                </div>
              )}

              {newCollQType === 'mc' && (
                <div className="space-y-2">
                  {newCollQOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="w-4 font-bold text-slate-500 text-sm">{['A','B','C','D'][idx]}</span>
                      <input
                        type="text"
                        placeholder={`Option ${['A','B','C','D'][idx]}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newCollQOptions];
                          updated[idx] = e.target.value;
                          setNewCollQOptions(updated);
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                      />
                      <input
                        type="radio"
                        name="collCorrect"
                        checked={newCollQCorrectOpt === idx}
                        onChange={() => setNewCollQCorrectOpt(idx)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!newCollQText.trim()) return;
                  const newQ = {
                    id: Date.now() + Math.random(),
                    text: newCollQText,
                    type: newCollQType,
                    options: newCollQType === 'mc' ? [...newCollQOptions] : [],
                    correctOption: newCollQType === 'mc' ? newCollQCorrectOpt : null,
                    correctText: newCollQType === 'freetext' ? newCollQCorrectText : ''
                  };
                  setCollQuestions([...collQuestions, newQ]);
                  setNewCollQText('');
                  setNewCollQOptions(['', '', '', '']);
                  setNewCollQCorrectText('');
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4"/> {t.addQToColl}
              </button>
            </div>
          </div>

          {collQuestions.length > 0 && (
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-slate-400">{t.includedQuestions} ({collQuestions.length})</h3>
              <div className="space-y-2">
                {collQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between text-sm">
                    <div>
                      <p className="text-white font-medium">{idx + 1}. {q.text}</p>
                      <span className="text-xs text-slate-500">[{q.type === 'mc' ? t.mc : q.type === 'buzzer' ? t.buzzer : t.freetext}]</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCollQuestions(collQuestions.filter(item => item.id !== q.id));
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestions = roomData?.questions || [];
  const liveQIndex = roomData?.currentQuestionIndex ?? -1;
  const liveQ = liveQIndex >= 0 ? currentQuestions[liveQIndex] : null;

  const previewQ = currentQuestions[hostPreviewIndex] || null;
  const isPreviewLive = hostPreviewIndex === liveQIndex;

  const playerList = roomData?.players ? Object.values(roomData.players) : [];
  const editRequests = roomData?.editRequests || {};

  // --- MODERATOR VIEW ---
  if (role === 'host') {
    const currentRoomCorrectPts = roomData?.correctPoints !== undefined ? roomData.correctPoints : 5;
    const currentRoomWrongPts = roomData?.wrongPoints !== undefined ? roomData.wrongPoints : 1;

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative">
        {renderLanguageSelector()}

        <div className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6 pt-6">
          <div>
            <span className="text-xs text-indigo-400 font-semibold uppercase">{t.moderatorControl}</span>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {t.roomCode}: <span className="font-mono bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/30">{roomCode}</span>
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
              <LogOut className="w-4 h-4"/> {t.closeAndDelete}
            </button>
          </div>
        </div>

        {Object.entries(editRequests).filter(([_, status]) => status === 'pending').map(([pName]) => (
          <div key={pName} className="mb-6 p-4 bg-indigo-600/20 border border-indigo-500 rounded-xl flex items-center justify-between animate-pulse">
            <span className="text-sm font-semibold text-indigo-200">
              ✏️ <strong>{pName}</strong> {t.editRequestMsg}
            </span>
            <div className="flex gap-2">
              <button onClick={() => handleRespondEditRequest(pName, true)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">{t.allow}</button>
              <button onClick={() => handleRespondEditRequest(pName, false)} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold">{t.deny}</button>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2"><Eye className="w-5 h-5"/> {t.modPreview}</h2>
                  {isPreviewLive ? (
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                      <Radio className="w-3 h-3 animate-pulse" /> {t.live}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-slate-700 text-slate-400 text-xs font-medium rounded-full">
                      {t.previewOnly}
                    </span>
                  )}
                </div>

                {currentQuestions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHostPreviewIndex(Math.max(0, hostPreviewIndex - 1))}
                      disabled={hostPreviewIndex <= 0}
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1 text-xs font-semibold"
                    >
                      <ChevronLeft className="w-4 h-4"/> {t.prev}
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      {hostPreviewIndex + 1} / {currentQuestions.length}
                    </span>
                    <button
                      onClick={() => setHostPreviewIndex(Math.min(currentQuestions.length - 1, hostPreviewIndex + 1))}
                      disabled={hostPreviewIndex >= currentQuestions.length - 1}
                      className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1 text-xs font-semibold"
                    >
                      {t.next} <ChevronRight className="w-4 h-4"/>
                    </button>
                  </div>
                )}
              </div>

              {previewQ ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                    <span className="text-xs text-indigo-400 font-semibold uppercase block mb-1">
                      {previewQ.type === 'mc' ? t.mc : previewQ.type === 'buzzer' ? t.buzzer : t.freetext} | {t.correct}: +{previewQ.points || currentRoomCorrectPts} / {t.wrong}: -{previewQ.wrongPoints !== undefined ? previewQ.wrongPoints : currentRoomWrongPts} Pkt.
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
                      <p className="text-xs text-emerald-400 mt-2 font-mono">{t.modelAnswer} {previewQ.correctText}</p>
                    )}
                  </div>

                  {!isPreviewLive ? (
                    <button
                      onClick={() => releaseQuestionToLive(hostPreviewIndex)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                    >
                      <Radio className="w-5 h-5" /> {t.releaseLive}
                    </button>
                  ) : (
                    <div className="space-y-3 pt-2">
                      {liveQ?.type === 'buzzer' && (
                        <div className="p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-amber-300">
                              {roomData?.buzzedPlayer ? `🔔 ${roomData.buzzedPlayer}` : t.waitingBuzzer}
                            </span>
                            {roomData?.buzzedPlayer && (
                              <button onClick={resetBuzzerOnly} className="text-xs underline text-amber-200 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3"/> {t.resetBuzzer}
                              </button>
                            )}
                          </div>

                          {roomData?.buzzedPlayer && (
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => handleEvaluateBuzzer(true)} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                                <Check className="w-5 h-5"/> {t.correct} (+{liveQ?.points || currentRoomCorrectPts})
                              </button>
                              <button onClick={() => handleEvaluateBuzzer(false)} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                                <X className="w-5 h-5"/> {t.wrong} (-{liveQ?.wrongPoints !== undefined ? liveQ.wrongPoints : currentRoomWrongPts})
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button onClick={toggleReveal} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">
                          {roomData?.revealedAnswer ? t.hideAnswer : t.revealAnswer}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Keine Frage vorhanden.</p>
              )}
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-indigo-400 flex items-center gap-2"><Plus className="w-5 h-5"/> {t.createNewQuestion}</h2>
              <form onSubmit={addQuestion} className="space-y-4">
                <input
                  type="text"
                  placeholder={t.questionTextPlaceholder}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white"
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t.questionType}</label>
                    <select
                      value={newQuestionType}
                      onChange={(e) => setNewQuestionType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm"
                    >
                      <option value="mc">{t.mc}</option>
                      <option value="buzzer">{t.buzzer}</option>
                      <option value="freetext">{t.freetext}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">{t.correct} (+)</label>
                    <input
                      type="number"
                      value={newPoints}
                      onChange={(e) => setNewPoints(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-400 mb-1">{t.wrong} (-)</label>
                    <input
                      type="number"
                      value={newWrongPoints}
                      onChange={(e) => setNewWrongPoints(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm"
                    />
                  </div>
                </div>

                {newQuestionType === 'freetext' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t.correctAnswerText}</label>
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
                  {t.saveQuestion}
                </button>
              </form>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 mb-3">{t.createdQuestions} ({currentQuestions.length})</h3>
              <div className="space-y-2">
                {currentQuestions.map((q, idx) => (
                  <div key={q.id} className={`p-3 rounded-xl border flex items-center justify-between ${idx === liveQIndex ? 'bg-emerald-950/30 border-emerald-500' : idx === hostPreviewIndex ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-900 border-slate-700'}`}>
                    <div>
                      <p className="text-sm text-white truncate">{idx + 1}. {q.text}</p>
                      <span className="text-xs text-slate-500">[{q.type === 'mc' ? t.mc : q.type === 'buzzer' ? t.buzzer : t.freetext}] {idx === liveQIndex && '• [LIVE]'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setHostPreviewIndex(idx)} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg font-semibold hover:bg-indigo-500">
                        {t.viewPreview}
                      </button>
                      <button onClick={() => deleteQuestion(q.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-bold mb-4 text-indigo-400 flex items-center gap-2"><UserCheck className="w-5 h-5"/> {t.playersLive} ({playerList.length})</h2>

            <div className="space-y-3">
              {playerList.length === 0 ? (
                <p className="text-slate-500 text-xs">{t.noPlayers}</p>
              ) : (
                playerList.map(p => {
                  const isRevealed = roomData?.revealedPlayers?.[p.name];
                  const qPts = liveQ?.points || currentRoomCorrectPts;
                  const qWrongPts = liveQ?.wrongPoints !== undefined ? liveQ.wrongPoints : currentRoomWrongPts;
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
                            <p className="text-xs text-indigo-400">{p.score} Pkt.</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => handleAwardPoints(p.name, qPts)} className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-600/30">+{qPts}</button>
                          <button onClick={() => handleAwardPoints(p.name, -qWrongPts)} className="px-2.5 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold hover:bg-rose-600/30">-{qWrongPts}</button>
                        </div>
                      </div>

                      {p.answer !== null && p.answer !== undefined && (
                        <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-500 block">{t.answerLabel}</span>
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
                              {isRevealed ? t.activeOnTV : t.showOnTV}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
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
      <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col justify-between relative">
        {renderLanguageSelector()}

        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 pt-3">
          <div>
            <span className="text-xs text-slate-400">{t.mitspieler}</span>
            <p className="font-bold">{playerName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400">{t.roomCode}</span>
              <p className="font-mono font-bold text-indigo-400">{roomCode}</p>
            </div>
            <button 
              onClick={handleLeavePlayer}
              className="px-3 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-rose-600/30"
            >
              <LogOut className="w-4 h-4" /> {t.leave}
            </button>
          </div>
        </div>

        <div className="my-auto space-y-6 text-center">
          {liveQ ? (
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
              <span className="text-xs text-indigo-400 font-semibold uppercase">{t.currentQuestion}</span>
              <p className="text-xl font-bold">{liveQ.text}</p>

              {liveQ.type === 'mc' && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {liveQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmitAnswer(idx)}
                      disabled={hasAnswered}
                      className={`w-full p-3 rounded-xl border text-left text-sm font-medium transition ${
                        playerObj?.answer === idx 
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                          : hasAnswered
                          ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
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
                        placeholder="Deine Antwort..."
                        value={playerTextAnswer}
                        onChange={(e) => setPlayerTextAnswer(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleSubmitAnswer(playerTextAnswer)}
                        disabled={!playerTextAnswer.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4"/> {t.submitAnswer}
                      </button>
                    </>
                  ) : (
                    <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                        <span>{t.answerSubmitted}</span>
                        <Lock className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-lg font-bold text-white font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">{playerObj.answer}</p>
                      
                      {editStatus === 'pending' ? (
                        <p className="text-xs text-amber-400 animate-pulse">{t.waitingHostEdit}</p>
                      ) : editStatus === 'rejected' ? (
                        <p className="text-xs text-rose-400">{t.editRejected}</p>
                      ) : (
                        <button
                          onClick={handleRequestEdit}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-semibold flex items-center justify-center gap-1 border border-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> {t.requestEdit}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500">{t.waitingHostRelease}</p>
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
              {roomData?.buzzedPlayer === playerName ? t.buzzedState : roomData?.buzzerLocked ? t.locked : roomData?.buzzedPlayer ? t.blocked : t.buzzerBtn}
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- TV VIEW ---
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col justify-between relative">
      {renderLanguageSelector()}

      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 pt-4">
        <h1 className="text-2xl font-black tracking-wider uppercase">{t.appName}</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase block">{t.roomCode}</span>
            <span className="font-mono text-2xl font-bold text-indigo-400">{roomCode}</span>
          </div>
          <button 
            onClick={() => setRole(null)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 text-xs flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" /> {t.leave}
          </button>
        </div>
      </div>

      <div className="my-auto max-w-4xl mx-auto text-center space-y-8">
        {liveQ ? (
          <div className="space-y-6">
            <span className="inline-block px-4 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-sm font-semibold">
              {liveQ.points || roomData?.correctPoints || 5} Pkt.
            </span>
            <h2 className="text-4xl font-extrabold">{liveQ.text}</h2>

            {liveQ.type === 'mc' && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {liveQ.options.map((opt, idx) => {
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
                    </div>
                  );
                })}
              </div>
            )}

            {liveQ.type === 'freetext' && roomData?.revealedAnswer && (
              <div className="p-6 bg-emerald-600/20 border-2 border-emerald-500 rounded-2xl text-emerald-200 text-2xl font-bold inline-block">
                {t.modelAnswer} {liveQ.correctText || t.noAnswer}
              </div>
            )}

            {liveQ.type === 'freetext' && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {playerList.filter(p => roomData?.revealedPlayers?.[p.name]).map(p => (
                  <div key={p.name} className="p-4 bg-slate-900 border-2 border-indigo-500 rounded-xl text-left">
                    <span className="text-xs text-indigo-400 font-bold block">{p.name}:</span>
                    <span className="text-xl font-semibold text-white">{p.answer || t.noAnswer}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-600 text-xl font-bold">{t.waitingHostRelease}</p>
        )}

        {liveQ?.type === 'buzzer' && roomData?.buzzedPlayer && (
          <div className="p-6 bg-amber-500/20 border-2 border-amber-500 rounded-2xl text-amber-300 text-2xl font-black animate-bounce inline-block">
            🔔 {roomData.buzzedPlayer} {t.buzzedState}
          </div>
        )}
      </div>

      {/* Leaderboard mit Status-Kvačicom für predate odgovore */}
      <div className="grid grid-cols-4 gap-4">
        {playerList.map(p => {
          const hasSubmitted = p.answer !== null && p.answer !== undefined;
          return (
            <div key={p.name} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center relative overflow-hidden flex items-center justify-between px-5">
              <div className="text-left truncate">
                <p className="text-xs text-slate-400 truncate">{p.name}</p>
                <p className="text-xl font-black text-indigo-400">{p.score} Pkt.</p>
              </div>
              <div className="shrink-0">
                {hasSubmitted ? (
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold shadow-sm" title="Odgovor predat">
                    ✓
                  </span>
                ) : (
                  <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600 text-xs">
                    ...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
