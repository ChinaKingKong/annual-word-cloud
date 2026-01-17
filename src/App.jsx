import React, { useState, useEffect, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { Icons } from './components/Icons';
import audioFile from './assets/audio.mp3';
import './index.css';

const App = () => {
  const [year, setYear] = useState(2025);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const captureAreaRef = useRef(null);
  const sphereRef = useRef(null);
  const requestRef = useRef();
  const rotationRef = useRef({ x: 0, y: 0 });
  const lastUpdateTimeRef = useRef(0);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const audioRef = useRef(null);

  const t = {
    zh: {
      title: '我的年度词云',
      subtitle: '个人记忆档案 / 动态生成模式',
      placeholder: '存入记忆...',
      add: '添加',
      tone: '色调',
      save: '保存截图',
      recording: '已记录词条 / 共',
      unit: '个',
      exportPrep: '正在捕获高清图像...',
      exportFail: '导出失败，请重试。',
      lang: 'EN / 中',
      zodiacs: ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐎', '🐏', '🐵', '🐔', '🐶', '🐷']
    },
    en: {
      title: 'Yearly WordCloud',
      subtitle: 'Personal Memory / Dynamic Mode',
      placeholder: 'Memory...',
      add: 'Add',
      tone: 'Tone',
      save: 'Save Screenshot',
      recording: 'Tokens /',
      unit: 'Total',
      exportPrep: 'Capturing HD Image...',
      exportFail: 'Failed. Please retry.',
      lang: '中 / EN',
      zodiacs: ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐎', '🐏', '🐵', '🐔', '🐶', '🐷']
    }
  };

  // 默认词条数据
  const defaultWords = [
    { text: 'AI', weight: 1.2 }, { text: 'AI应用元年', weight: 1.15 }, { text: 'AI Agent', weight: 1.1 },
    { text: '特朗普 2.0', weight: 1.1 }, { text: 'Vibe Coding', weight: 1.05 }, { text: 'DeepSeek', weight: 1.0 },
    { text: 'Manus', weight: 0.95 }, { text: 'Web3', weight: 0.9 }, { text: 'Solana', weight: 0.85 },
    { text: 'WaytoAGI', weight: 0.85 }, { text: 'OpenAI', weight: 0.8 }, { text: 'Gemini', weight: 0.8 },
    { text: 'MeMe', weight: 0.78 }, { text: '区块链', weight: 0.75 }, { text: '数字游民', weight: 0.75 },
    { text: '远程工作', weight: 0.7 }, { text: '求索', weight: 0.7 }, { text: '还债', weight: 0.35 },
  ];

  // 从 localStorage 加载数据
  const loadFromLocalStorage = () => {
    try {
      const savedWords = localStorage.getItem('wordcloud_words');
      const savedLanguage = localStorage.getItem('wordcloud_language');
      const savedPaletteIndex = localStorage.getItem('wordcloud_paletteIndex');

      return {
        words: savedWords ? JSON.parse(savedWords) : defaultWords,
        language: savedLanguage || 'zh',
        paletteIndex: savedPaletteIndex ? parseInt(savedPaletteIndex) : 0
      };
    } catch (error) {
      console.error('加载数据失败:', error);
      return {
        words: defaultWords,
        language: 'zh',
        paletteIndex: 0
      };
    }
  };

  // 初始化状态，从 localStorage 读取
  const initialData = loadFromLocalStorage();
  const [words, setWords] = useState(initialData.words);
  const [language, setLanguage] = useState(initialData.language);
  const [paletteIndex, setPaletteIndex] = useState(initialData.paletteIndex);

  // 生肖图标获取函数（需要在 language 状态定义之后）
  const getZodiacIcon = (y) => {
    const index = (y - 4) % 12;
    return t[language].zodiacs[index >= 0 ? index : index + 12];
  };

  const handleAddWord = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setWords([{ text: inputValue.trim(), weight: 0.5 + Math.random() * 0.5 }, ...words]);
    setInputValue('');
  };

  const handleDeleteWord = (indexToDelete) => {
    setWords(words.filter((_, index) => index !== indexToDelete));
  };

  // 清除缓存，恢复默认数据
  const handleClearCache = () => {
    if (window.confirm(language === 'zh' ? '确定要清除所有自定义词条并恢复默认设置吗？' : 'Clear all custom words and restore default settings?')) {
      localStorage.removeItem('wordcloud_words');
      localStorage.removeItem('wordcloud_language');
      localStorage.removeItem('wordcloud_paletteIndex');
      setWords(defaultWords);
      setLanguage('zh');
      setPaletteIndex(0);
      setStatusMessage(language === 'zh' ? '缓存已清除' : 'Cache cleared');
      setTimeout(() => setStatusMessage(null), 2000);
    }
  };

  const palettes = [
    { colors: ['#818cf8', '#ec4899', '#8b5cf6', '#22d3ee', '#34d399'], tone: 'rgba(99, 102, 241, 0.15)' },
    { colors: ['#38bdf8', '#6366f1', '#a855f7', '#ec4899', '#f43f5e'], tone: 'rgba(56, 189, 248, 0.15)' },
    { colors: ['#ffffff', '#cbd5e1', '#94a3b8', '#64748b', '#475569'], tone: 'rgba(255, 255, 255, 0.05)' }
  ];

  const spherePoints = useMemo(() => {
    const points = [];
    const n = words.length;
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(-1 + (2 * i) / n);
      const theta = Math.sqrt(n * Math.PI) * phi;
      points.push({ x: Math.cos(theta) * Math.sin(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(phi), ...words[i] });
    }
    return points;
  }, [words]);

  const textureParticles = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 60; i++) {
      const phi = Math.acos(-1 + (2 * i) / 60);
      const theta = Math.sqrt(60 * Math.PI) * phi;
      particles.push({ x: Math.cos(theta) * Math.sin(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(phi) });
    }
    return particles;
  }, []);

  // 优化动画：使用节流来减少 state 更新频率
  const animate = (currentTime) => {
    if (isAutoRotating && !isExporting) {
      rotationRef.current.x += 0.002;
      rotationRef.current.y += 0.004;
      
      // 每 16ms 更新一次 state（约 60fps），减少不必要的渲染
      if (currentTime - lastUpdateTimeRef.current >= 16) {
        setRotation({ x: rotationRef.current.x, y: rotationRef.current.y });
        lastUpdateTimeRef.current = currentTime;
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    lastUpdateTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isAutoRotating, isExporting]);

  // 初始化音频设置
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 设置音频属性
    audio.volume = 0.5; // 设置音量
    audio.preload = 'auto';

    // 监听播放状态变化
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // 切换音频播放/暂停
  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('音频播放失败:', error);
    }
  };

  // 自动保存词条到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wordcloud_words', JSON.stringify(words));
    } catch (error) {
      console.error('保存词条失败:', error);
    }
  }, [words]);

  // 自动保存语言设置到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wordcloud_language', language);
    } catch (error) {
      console.error('保存语言设置失败:', error);
    }
  }, [language]);

  // 自动保存调色板设置到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wordcloud_paletteIndex', paletteIndex.toString());
    } catch (error) {
      console.error('保存调色板设置失败:', error);
    }
  }, [paletteIndex]);

  // 缓存 sphereRadius 计算，避免每次渲染都重新计算
  const sphereRadius = useMemo(() => {
    return sphereRef.current ? Math.min(sphereRef.current.offsetWidth, sphereRef.current.offsetHeight) * 0.55 : 250;
  }, []);

  const project = (point) => {
    const { x, y, z } = point;
    const { x: rx, y: ry } = rotation;
    let nx = x * Math.cos(ry) - z * Math.sin(ry);
    let nz = x * Math.sin(ry) + z * Math.cos(ry);
    let ny = y * Math.cos(rx) - nz * Math.sin(rx);
    let finalZ = y * Math.sin(rx) + nz * Math.cos(rx);
    const scale = (finalZ + 2) / 3;
    const opacity = (finalZ + 1.5) / 2.5;
    return { x: nx * sphereRadius, y: ny * sphereRadius, scale, opacity, zIndex: Math.floor(finalZ * 1000) };
  };

  const saveAsImage = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setStatusMessage(t[language].exportPrep);
    try {
      await new Promise(r => setTimeout(r, 500));
      const canvas = await html2canvas(captureAreaRef.current, { backgroundColor: '#000000', scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `WordCloud_${year}.png`;
      link.click();
      setIsExporting(false);
      setStatusMessage(null);
    } catch (err) {
      setIsExporting(false);
      setStatusMessage(t[language].exportFail);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const currentT = t[language];

  return (
    <div className={`min-h-screen p-4 md:p-6 flex items-center justify-center text-slate-100 ${isExporting ? 'is-capturing' : ''}`}>
      <audio ref={audioRef} src={audioFile} loop preload="auto" />
      {statusMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-indigo-600/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3 animate-bounce">
          <Icons.Loader />
          <span className="text-xs font-bold uppercase tracking-widest">{statusMessage}</span>
        </div>
      )}

      <div className="w-full max-w-5xl bg-[#070b14] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 relative flex flex-col">

        {/* 顶部工具栏 */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-black/40 backdrop-blur-md relative z-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-inner">
              <button onClick={() => setYear(y => y - 1)} className="hover:bg-white/10 p-2 text-indigo-400 transition-colors border-r border-white/5"><Icons.ChevronLeft /></button>
              <div className="px-3"><span className="text-xs font-black text-white tracking-tighter">{year}</span></div>
              <button onClick={() => setYear(y => y + 1)} className="hover:bg-white/10 p-2 text-indigo-400 transition-colors border-l border-white/5"><Icons.ChevronRight /></button>
            </div>
            <button onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase transition-all hover:bg-white/10">
              {currentT.lang}
            </button>
          </div>

          <form onSubmit={handleAddWord} className="flex items-stretch max-w-[200px] h-9 bg-black/30 rounded-xl border border-white/10 overflow-hidden focus-within:border-indigo-500/50 transition-all mr-3">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={currentT.placeholder} className="flex-1 bg-transparent px-4 py-1 text-xs focus:outline-none text-slate-100 placeholder:text-slate-600 tracking-tight" />
            <button type="submit" className="w-8 bg-white/5 hover:bg-indigo-600 transition-colors flex items-center justify-center group flex-shrink-0" style={{ padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-white transition-colors">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </form>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsAutoRotating(!isAutoRotating)} className={`p-2 rounded-xl border transition-all ${isAutoRotating ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}>
              {isAutoRotating ? <Icons.Pause /> : <Icons.Play />}
            </button>
            <button onClick={toggleAudio} className={`p-2 rounded-xl border transition-all ${isPlaying ? 'bg-green-600/10 border-green-500/50 text-green-400 shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`} title={isPlaying ? (language === 'zh' ? '暂停音频' : 'Pause Audio') : (language === 'zh' ? '播放音频' : 'Play Audio')}>
              <Icons.Audio />
            </button>
            <button onClick={() => setPaletteIndex(prev => (prev + 1) % palettes.length)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"><Icons.Palette /></button>
            <button onClick={saveAsImage} className="relative group overflow-hidden px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg active:scale-95">
              <Icons.Camera /> {currentT.save}
            </button>
          </div>
        </div>

        {/* 展示截图区 */}
        <div ref={captureAreaRef} className="relative flex-grow h-[650px] w-full bg-black overflow-hidden select-none">
          <div className="absolute top-10 left-10 z-40 flex items-start gap-5">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl border border-white/10"><Icons.Globe /></div>
            <div className="flex flex-col">
              <h1 className={`text-2xl font-black tracking-widest uppercase italic leading-none ${isExporting ? 'text-slate-100' : 'bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent'}`}>{language === 'zh' ? `我的${year}年度词云` : `My ${year} WordCloud`}</h1>
              <p className="text-indigo-400/40 text-[11px] font-black uppercase tracking-[0.4em] mt-3">{currentT.subtitle}</p>
            </div>
          </div>

          <div ref={sphereRef} className="absolute inset-0 w-full h-full flex items-center justify-center translate-y-12">
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${palettes[paletteIndex].tone} 0%, transparent 60%)` }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className={`text-[12vw] font-black italic select-none leading-none px-10 transition-all ${isExporting ? 'text-white/20' : 'text-transparent bg-clip-text bg-gradient-to-b from-white/30 via-white/15 to-transparent'}`}>{year}</span>
              <span className="text-[6vw] leading-none mt-6 opacity-30" style={isExporting ? { color: 'rgba(255,255,255,0.2)' } : { filter: 'grayscale(1) brightness(1.5)', color: 'white' }}>{getZodiacIcon(year)}</span>
            </div>
            <div className="relative w-0 h-0 flex items-center justify-center z-20">
              {textureParticles.map((p, i) => {
                const proj = project(p);
                return (
                  <div 
                    key={`p-${i}`} 
                    className="absolute rounded-full" 
                    style={{ 
                      width: '1px', 
                      height: '1px', 
                      backgroundColor: palettes[paletteIndex].colors[i % palettes[paletteIndex].colors.length], 
                      transform: `translate3d(${proj.x}px, ${proj.y}px, 0) scale(${proj.scale})`, 
                      opacity: proj.opacity * 0.3, 
                      zIndex: proj.zIndex,
                      willChange: 'transform, opacity',
                      backfaceVisibility: 'hidden'
                    }} 
                  />
                );
              })}
              {spherePoints.map((point, i) => {
                const proj = project(point);
                const baseFontSize = 8 + (point.weight * 11 * proj.scale);
                return (
                  <div 
                    key={i + point.text} 
                    className="absolute word-node group flex items-center justify-center" 
                    style={{ 
                      transform: `translate3d(${proj.x}px, ${proj.y}px, 0) scale(${proj.scale})`, 
                      fontSize: `${baseFontSize}px`, 
                      color: palettes[paletteIndex].colors[i % palettes[paletteIndex].colors.length], 
                      opacity: proj.opacity, 
                      zIndex: proj.zIndex + 100, 
                      fontWeight: '900', 
                      whiteSpace: 'nowrap',
                      willChange: 'transform, opacity',
                      backfaceVisibility: 'hidden',
                      WebkitFontSmoothing: 'antialiased'
                    }}
                  >
                    <span className="word-inner text-center">{point.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none z-30 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.95)_100%)]"></div>
        </div>

        {/* 底部词条管理 */}
        <div className="px-8 py-6 bg-slate-950/95 border-t border-white/5 relative z-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icons.Cpu />
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] flex items-center gap-2">{currentT.recording} {words.length} {currentT.unit}</span>
            </div>
            <button
              onClick={handleClearCache}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/50 text-[10px] font-black uppercase tracking-wider transition-all"
              title={language === 'zh' ? '清除缓存并恢复默认' : 'Clear cache and reset'}
            >
              {language === 'zh' ? '清除缓存' : 'Reset'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
            {words.map((w, i) => (
              <div key={i + w.text} className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all cursor-default">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palettes[paletteIndex].colors[i % palettes[paletteIndex].colors.length] }} />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-tighter">{w.text}</span>
                <button onClick={() => handleDeleteWord(i)} className="p-0.5 rounded-md hover:bg-red-500 hover:text-white text-slate-600 transition-colors"><Icons.X /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
