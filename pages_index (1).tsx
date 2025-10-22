import React, { useState, ChangeEvent, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Image as ImageIcon, 
  Upload, 
  Layers, 
  Menu, 
  X, 
  MonitorPlay,
  Palette,
  RefreshCcw,
  Globe,
  Plus,
  Minus,
  HelpCircle
} from 'lucide-react';

// --- Types & Translations ---
type Language = 'CAST' | 'CAT' | 'ENG';
type PhaseId = 'fase1' | 'fase2' | 'fase3' | 'fase4';
type ViewId = PhaseId | 'settings';

const TRANSLATIONS = {
  CAST: {
    appTitle: 'Dinámica de Clase',
    sidebarTitle: 'Las apariencias engañan',
    phasesHeader: 'Fases de la actividad',
    configHeader: 'Configuración',
    settingsLabel: 'Ajustes',
    languageHeader: 'Idioma',
    imageCounter: (current: number, total: number) => `Imagen ${current} de ${total}`,
    noImage: 'Sin imagen',
    noImageAssigned: 'Sin imagen asignada',
    prev: 'Anterior',
    next: 'Siguiente',
    resetPhase: 'Reiniciar Fase',
    settingsTitle: 'Ajustes de la Dinámica',
    settingsSubtitle: 'Personaliza los colores de fondo y las imágenes para cada fase.',
    bgColorLabel: 'Color de Fondo',
    selectColor: 'Selecciona un color',
    galleryLabel: 'Galería de Imágenes',
    imageUrlLabel: 'URL de Imagen',
    uploadFileLabel: 'Subir archivo',
    votes: 'Votos',
    fase1: 'Fase 1', fase2: 'Fase 2', fase3: 'Fase 3', fase4: 'Fase 4'
  },
  CAT: {
    appTitle: 'Dinàmica de Classe',
    sidebarTitle: 'Les aparences enganyen',
    phasesHeader: "Fases de l'activitat",
    configHeader: 'Configuració',
    settingsLabel: 'Ajustaments',
    languageHeader: 'Idioma',
    imageCounter: (current: number, total: number) => `Imatge ${current} de ${total}`,
    noImage: 'Sense imatge',
    noImageAssigned: 'Sense imatge assignada',
    prev: 'Anterior',
    next: 'Següent',
    resetPhase: 'Reiniciar Fase',
    settingsTitle: 'Ajustaments de la Dinàmica',
    settingsSubtitle: 'Personalitza els colors de fons i les imatges per a cada fase.',
    bgColorLabel: 'Color de Fons',
    selectColor: 'Selecciona un color',
    galleryLabel: "Galeria d'Imatges",
    imageUrlLabel: 'URL de la Imatge',
    uploadFileLabel: 'Pujar arxiu',
    votes: 'Vots',
    fase1: 'Fase 1', fase2: 'Fase 2', fase3: 'Fase 3', fase4: 'Fase 4'
  },
  ENG: {
    appTitle: 'Classroom Dynamics',
    sidebarTitle: 'Appearances are deceptive',
    phasesHeader: 'Activity phases',
    configHeader: 'Configuration',
    settingsLabel: 'Settings',
    languageHeader: 'Language',
    imageCounter: (current: number, total: number) => `Image ${current} of ${total}`,
    noImage: 'No image',
    noImageAssigned: 'No image assigned',
    prev: 'Previous',
    next: 'Next',
    resetPhase: 'Reset Phase',
    settingsTitle: 'Dynamics Settings',
    settingsSubtitle: 'Customize background colors and images for each phase.',
    bgColorLabel: 'Background Color',
    selectColor: 'Select a color',
    galleryLabel: 'Image Gallery',
    imageUrlLabel: 'Image URL',
    uploadFileLabel: 'Upload file',
    votes: 'Votes',
    fase1: 'Phase 1', fase2: 'Phase 2', fase3: 'Phase 3', fase4: 'Phase 4'
  }
};

interface PhaseConfig {
  id: PhaseId;
  bgColor: string;
  images: string[];
  votes: number[];
  revealed: boolean[];
}

type AppState = Record<PhaseId, PhaseConfig>;

// --- Initial Data Helper ---
const createInitialPhase = (id: PhaseId, bgColor: string, seed: string): PhaseConfig => {
  const count = 16;
  return {
    id,
    bgColor,
    images: Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seed}_${i + 1}/800/600`),
    votes: new Array(count).fill(0),
    // Start with only the first image revealed
    revealed: new Array(count).fill(false).map((_, i) => i === 0)
  };
};

const INITIAL_STATE: AppState = {
  fase1: createInitialPhase('fase1', '#e0f2fe', 'f1'), // sky-100
  fase2: createInitialPhase('fase2', '#fce7f3', 'f2'), // pink-100
  fase3: createInitialPhase('fase3', '#dcfce7', 'f3'), // green-100
  fase4: createInitialPhase('fase4', '#f3e8ff', 'f4'), // purple-100
};

// --- Main Component ---
export default function ClassroomApp() {
  const [currentLang, setCurrentLang] = useState<Language>('CAST');
  const [currentView, setCurrentView] = useState<ViewId>('fase1');
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const t = TRANSLATIONS[currentLang];
  const LANGUAGES: Language[] = ['CAST', 'CAT', 'ENG'];
  const currentLangIndex = LANGUAGES.indexOf(currentLang);

  // --- State Updaters ---
  const updatePhaseColor = (phaseId: PhaseId, color: string) => {
    setAppState(prev => ({
      ...prev,
      [phaseId]: { ...prev[phaseId], bgColor: color }
    }));
  };

  const updatePhaseImage = (phaseId: PhaseId, imageIndex: number, newUrl: string) => {
    setAppState(prev => {
      const newImages = [...prev[phaseId].images];
      newImages[imageIndex] = newUrl;
      return {
        ...prev,
        [phaseId]: { ...prev[phaseId], images: newImages }
      };
    });
  };

  const handleVote = (phaseId: PhaseId, imageIndex: number, delta: number) => {
    setAppState(prev => {
      const newVotes = [...prev[phaseId].votes];
      newVotes[imageIndex] = (newVotes[imageIndex] || 0) + delta;
      return {
        ...prev,
        [phaseId]: { ...prev[phaseId], votes: newVotes }
      };
    });
  };

  const markRevealed = (phaseId: PhaseId, imageIndex: number) => {
    setAppState(prev => {
      const newRevealed = [...prev[phaseId].revealed];
      if (!newRevealed[imageIndex]) {
        newRevealed[imageIndex] = true;
        return { ...prev, [phaseId]: { ...prev[phaseId], revealed: newRevealed } };
      }
      return prev;
    });
  };

  const resetPhaseState = (phaseId: PhaseId) => {
    setAppState(prev => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        votes: new Array(prev[phaseId].images.length).fill(0),
        revealed: new Array(prev[phaseId].images.length).fill(false).map((_, i) => i === 0)
      }
    }));
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 flex items-center px-4 justify-between">
        <h1 className="font-bold text-gray-800 text-lg">{t.appTitle}</h1>
        <button onClick={toggleSidebar} className="p-2 bg-gray-50 rounded-md">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
           <Layers className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" />
           <span className="text-lg font-bold text-gray-900 tracking-tight truncate" title={t.sidebarTitle}>
             {t.sidebarTitle}
           </span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">{t.phasesHeader}</div>
          {(['fase1', 'fase2', 'fase3', 'fase4'] as PhaseId[]).map((id) => (
            <button
              key={id}
              onClick={() => { setCurrentView(id); closeSidebar(); }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${currentView === id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <MonitorPlay className={`w-5 h-5 mr-3 ${currentView === id ? 'text-indigo-500' : 'text-gray-400'}`} />
              {t[id]}
            </button>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">{t.configHeader}</div>
            <button
              onClick={() => { setCurrentView('settings'); closeSidebar(); }}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${currentView === 'settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Settings className={`w-5 h-5 mr-3 ${currentView === 'settings' ? 'text-gray-800' : 'text-gray-400'}`} />
              {t.settingsLabel}
            </button>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 px-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
              <Globe className="w-3 h-3" />
              {t.languageHeader}
            </div>
            <div className="relative flex bg-gray-100 p-1 rounded-xl isolate">
              <div
                className="absolute top-1 bottom-1 left-1 bg-white rounded-lg shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] -z-10"
                style={{ width: `calc((100% - 8px) / 3)`, transform: `translateX(${currentLangIndex * 100}%)` }}
              />
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors duration-300 ${currentLang === lang ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-auto pt-16 lg:pt-0 relative">
        {currentView === 'settings' ? (
          <SettingsView 
            appState={appState} 
            onColorChange={updatePhaseColor} 
            onImageChange={updatePhaseImage}
            t={t}
          />
        ) : (
          <PhaseSlideshow 
            key={currentView} 
            phaseId={currentView}
            config={appState[currentView]} 
            phaseName={t[currentView]}
            t={t}
            onVote={handleVote}
            onReveal={markRevealed}
            onReset={resetPhaseState}
          />
        )}
      </main>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={closeSidebar} />
      )}
    </div>
  );
}

// --- Sub-Component: Slideshow View ---
interface SlideshowProps {
  phaseId: PhaseId;
  config: PhaseConfig;
  phaseName: string;
  t: typeof TRANSLATIONS['CAST'];
  onVote: (phaseId: PhaseId, index: number, delta: number) => void;
  onReveal: (phaseId: PhaseId, index: number) => void;
  onReset: (phaseId: PhaseId) => void;
}

function PhaseSlideshow({ phaseId, config, phaseName, t, onVote, onReveal, onReset }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalImages = config.images.length;
  const showVoting = phaseId === 'fase1' || phaseId === 'fase2';

  // Ensure current index is revealed if somehow it isn't (defensive)
  useEffect(() => {
    if (!config.revealed[currentIndex]) {
      onReveal(phaseId, currentIndex);
    }
  }, [currentIndex, phaseId, config.revealed, onReveal]);

  const handleNext = () => {
    if (currentIndex < totalImages - 1) {
      const nextIndex = currentIndex + 1;
      onReveal(phaseId, nextIndex);
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  const handleResetClick = () => {
    onReset(phaseId);
    setCurrentIndex(0);
  };

  const currentImage = config.images[currentIndex];
  const currentVotes = config.votes[currentIndex];

  return (
    <div 
      className="w-full h-full flex flex-col p-4 sm:p-6 transition-colors duration-500 overflow-hidden"
      style={{ backgroundColor: config.bgColor }}
    >
      <div className="flex-1 w-full max-w-5xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{phaseName}</h2>
          <span className="px-3 py-1 bg-gray-900/10 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap ml-4">
            {t.imageCounter(currentIndex + 1, totalImages)}
          </span>
        </div>

        {/* Main Content Area (Image + Optional Voting Sidebar) */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Image Container */}
          <div className="flex-1 relative bg-gray-50/50 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            {currentImage ? (
               <img 
                 key={currentIndex} // Force re-render for animation
                 src={currentImage} 
                 alt={`${phaseName} slide ${currentIndex + 1}`} 
                 className="w-full h-full object-contain drop-shadow-xl rounded-lg animate-in fade-in zoom-in-95 duration-300"
               />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>{t.noImageAssigned}</p>
              </div>
            )}
          </div>

          {/* Voting Sidebar (Only for Phase 1 & 2) */}
          {showVoting && (
            <div className="w-24 sm:w-32 border-l border-gray-100 bg-white/50 flex flex-col items-center justify-center p-4 gap-6 animate-in slide-in-from-right duration-300">
              <button 
                onClick={() => onVote(phaseId, currentIndex, 1)}
                className="p-3 bg-green-100 text-green-600 rounded-2xl hover:bg-green-200 transition-colors active:scale-95"
              >
                <Plus className="w-8 h-8" />
              </button>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-gray-800 tabular-nums">
                  {currentVotes}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase mt-1">{t.votes}</div>
              </div>
              <button 
                onClick={() => onVote(phaseId, currentIndex, -1)}
                className="p-3 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition-colors active:scale-95"
              >
                <Minus className="w-8 h-8" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Bar with Thumbnails */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white/80 flex flex-col">
            
            {/* Thumbnails Scroll Area */}
            <div className="flex items-center gap-2 p-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {config.images.map((img, idx) => {
                const isRevealed = config.revealed[idx];
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    disabled={!isRevealed}
                    onClick={() => isRevealed && setCurrentIndex(idx)}
                    className={`
                      relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-500 perspective-1000
                      ${isActive ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105 z-10' : ''}
                      ${!isRevealed ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:opacity-100 opacity-80'}
                    `}
                  >
                    {/* Inner container for flip effect */}
                     <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${isRevealed ? 'rotate-y-0' : 'rotate-y-180'}`}>
                        {/* Front (Revealed Image) */}
                        <div className="absolute inset-0 backface-hidden">
                          <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                        {/* Back (Question Mark) */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gray-200 flex items-center justify-center text-gray-400">
                          <HelpCircle className="w-6 h-6" />
                        </div>
                     </div>
                     {/* Index Badge */}
                     <div className={`absolute bottom-0 right-0 text-[8px] font-bold px-1 py-0.5 rounded-tl-md ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-900/50 text-white'}`}>
                       {idx + 1}
                     </div>
                  </button>
                );
              })}
            </div>

            {/* Main Controls */}
            <div className="px-4 py-3 sm:px-8 sm:py-4 border-t border-gray-50 flex justify-between items-center">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-semibold transition-all ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-gray-100 hover:bg-white hover:shadow-md text-gray-700'}`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">{t.prev}</span>
              </button>

              {currentIndex === totalImages - 1 ? (
                <button 
                  onClick={handleResetClick}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <RefreshCcw className="w-5 h-5" />
                  <span className="hidden sm:inline">{t.resetPhase}</span>
                  <span className="sm:hidden">Reiniciar</span>
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <span className="hidden sm:inline">{t.next}</span>
                  <span className="sm:hidden">Siguiente</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
        </div>

      </div>
      
      {/* Add needed CSS for 3D flip effect if standard Tailwind doesn't have it fully configured by default */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .rotate-y-0 { transform: rotateY(0deg); }
      `}} />
    </div>
  );
}

// --- Sub-Component: Settings View ---
function SettingsView({
  appState,
  onColorChange,
  onImageChange,
  t
}: {
  appState: AppState;
  onColorChange: (id: PhaseId, color: string) => void;
  onImageChange: (id: PhaseId, idx: number, url: string) => void;
  t: typeof TRANSLATIONS['CAST'];
}) {
  const [activeTab, setActiveTab] = useState<PhaseId>('fase1');
  const phases: PhaseId[] = ['fase1', 'fase2', 'fase3', 'fase4'];

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, phaseId: PhaseId, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onImageChange(phaseId, index, url);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.settingsTitle}</h1>
        <p className="text-gray-500">{t.settingsSubtitle}</p>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] gap-2 p-1 bg-gray-200/50 rounded-2xl mb-8">
        {phases.map(phaseId => (
          <button
            key={phaseId}
            onClick={() => setActiveTab(phaseId)}
            className={`flex-1 min-w-24 py-2.5 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === phaseId ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
          >
            {t[phaseId]}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-indigo-500" />
            {t.bgColorLabel} - {t[activeTab]}
          </h2>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              value={appState[activeTab].bgColor}
              onChange={(e) => onColorChange(activeTab, e.target.value)}
              className="w-16 h-16 p-1 rounded-xl border-2 cursor-pointer"
            />
            <div>
              <p className="font-medium text-gray-700">{t.selectColor}</p>
              <p className="text-sm text-gray-500 uppercase">{appState[activeTab].bgColor}</p>
            </div>
            <div 
              className="ml-auto w-24 sm:w-32 h-16 rounded-lg shadow-inner border border-gray-200 transition-colors"
              style={{ backgroundColor: appState[activeTab].bgColor }}
            />
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5 text-indigo-500" />
            {t.galleryLabel} ({appState[activeTab].images.length})
          </h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {appState[activeTab].images.map((imgUrl, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
                <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[0.625rem] font-bold px-2 py-1 rounded-br-lg">
                    #{idx + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{t.imageUrlLabel}</label>
                    <input
                      type="text"
                      value={imgUrl}
                      onChange={(e) => onImageChange(activeTab, idx, e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                      <Upload className="w-4 h-4" />
                      {t.uploadFileLabel}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, activeTab, idx)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
