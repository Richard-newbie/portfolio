import { useEffect, useRef, useState } from 'react';
import { AudioLines, Check, Circle, Database, FileText, Play, Plus, RotateCcw, Square, Webhook, Workflow } from 'lucide-react';
import type { Discipline } from '../data';

export function BrowserChrome({ title, dark = false }: { title: string; dark?: boolean }) {
  return <div className={`browser-chrome ${dark ? 'is-dark' : ''}`}><span className="browser-dots"><i /><i /><i /></span><span>{title}</span><span className="browser-plus">+</span></div>;
}

function WebPreview({ interactive }: { interactive: boolean }) {
  const [article, setArticle] = useState(false);
  return (
    <div className="web-preview">
      <BrowserChrome title="formandfield.concept" />
      <div className="editorial-page">
        <div className="editorial-nav"><span className="editorial-logo">form & field</span><span>Journal &nbsp; Spaces &nbsp; About</span></div>
        <div className={`editorial-content ${article ? 'reading-article' : ''}`}>
          <div className="editorial-copy">
            <h4>{article ? <>A little more<br />intention.</> : <>A considered<br />way of living.</>}</h4>
            <p>{article ? 'There is something useful about a space that asks less of you. A little light. Natural materials. Room for the day to unfold.' : 'Spaces, objects and ideas for a little more intention.'}</p>
            {interactive ? <button type="button" onClick={() => setArticle(!article)} className="editorial-cta">{article ? 'Back to the journal' : 'Explore the journal'}</button> : <span className="editorial-cta">Explore the journal</span>}
          </div>
          <div className="editorial-image"><img src="/images/editorial-architecture.jpg" loading="lazy" alt="Sculptural concrete architecture surrounded by olive trees" /></div>
        </div>
        <div className="editorial-bottom"><span>An independent journal of thoughtful spaces.</span><span>01</span></div>
      </div>
    </div>
  );
}

const flowNodes = [
  { name: 'New inquiry', detail: 'Webhook', Icon: Webhook },
  { name: 'Understand', detail: 'AI workflow', Icon: Workflow },
  { name: 'Organize', detail: 'Airtable', Icon: Database },
  { name: 'Follow up', detail: 'Create a task', Icon: FileText },
];

function WorkflowPreview({ interactive }: { interactive: boolean }) {
  const [step, setStep] = useState(-1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const running = step >= 0 && step < flowNodes.length;

  const clearTimers = () => timers.current.forEach(clearTimeout);
  useEffect(() => () => clearTimers(), []);
  const run = () => {
    clearTimers();
    setStep(0);
    for (let i = 1; i <= flowNodes.length; i++) {
      timers.current.push(setTimeout(() => setStep(i), i * 850));
    }
  };

  return (
    <div className={`workflow-preview ${running ? 'is-running' : ''}`}>
      <BrowserChrome title="Inquiry workflow" dark />
      <div className="workflow-toolbar"><span><Workflow size={16} /> Everything, connected.</span><span className="workflow-mode">{interactive ? 'Local simulation' : 'Workflow concept'}</span></div>
      <div className="flow-environment">
        <svg className="flow-lines" viewBox="0 0 600 260" fill="none" preserveAspectRatio="none" aria-hidden="true"><path d="M83 82 H248 Q270 82 270 107 V174 Q270 190 290 190 H510" /><path className={step >= 2 ? 'is-travelled' : ''} d="M83 82 H248 Q270 82 270 107 V174 Q270 190 290 190 H510" pathLength="1" /></svg>
        {flowNodes.map(({ name, detail, Icon }, index) => <div key={name} className={`flow-node flow-node-${index} ${step > index ? 'is-complete' : ''} ${step === index ? 'is-active' : ''}`}>
          <div className="flow-node-icon">{step > index ? <Check size={22} /> : <Icon size={22} strokeWidth={1.5} />}</div>
          <strong>{name}</strong><span>{detail}</span>
          <i className="node-port port-left" /><i className="node-port port-right" />
        </div>)}
        <span className="flow-note">One less thing on your list.</span>
      </div>
      <div className="workflow-footer"><span role={interactive ? 'status' : undefined}>{step === flowNodes.length ? 'Sample workflow complete' : running ? `Running: ${flowNodes[step].name}` : 'Good systems make space for good work.'}</span>{interactive ? <button onClick={run} disabled={running} type="button" className="small-demo-button">{step === flowNodes.length ? <RotateCcw size={12} /> : <Play size={12} fill="currentColor" />}{step === flowNodes.length ? 'Run again' : running ? 'Running' : 'Run workflow'}</button> : <span className="flow-ready"><Circle size={7} fill="currentColor" /> Ready to connect</span>}</div>
    </div>
  );
}

const voiceScript = 'Hello, welcome to Festus Labs. I can help you explore a website, a smarter workflow, or a new creative idea. Tell me what you have in mind, and we can find the right place to start.';

function VoicePreview({ interactive }: { interactive: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [message, setMessage] = useState('');
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => () => {
    if (utterance.current && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const play = () => {
    if (!('speechSynthesis' in window)) {
      setMessage('Voice playback is not available in this browser. Read the script below.');
      setShowTranscript(true);
      return;
    }
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(voiceScript);
    speech.lang = 'en-US';
    speech.rate = 0.92;
    speech.onend = () => setPlaying(false);
    speech.onerror = (event) => {
      setPlaying(false);
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        setMessage('Voice playback is unavailable. You can still read the full script.');
        setShowTranscript(true);
      }
    };
    utterance.current = speech;
    window.speechSynthesis.speak(speech);
    setMessage('');
    setPlaying(true);
  };

  return (
    <div className={`voice-preview ${playing ? 'is-speaking' : ''}`}>
      <div className="voice-top"><span><AudioLines size={17} /> FESTUS VOICE</span><span>Conversation study</span></div>
      <div className="voice-main"><span className="voice-orbit"><span /><AudioLines size={35} strokeWidth={1} /></span><h4>A little more human.</h4><p>Thoughtful conversations. Useful answers.</p></div>
      <div className="waveform" aria-hidden="true">{Array.from({ length: 53 }, (_, i) => <i key={i} style={{ height: `${11 + Math.abs(Math.sin(i * 0.75) * Math.cos(i * 0.18)) * 56}px`, animationDelay: `${i * 0.036}s` }} />)}</div>
      <div className="voice-footer">{interactive ? <><button type="button" onClick={play} className="small-demo-button">{playing ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}{playing ? 'Stop preview' : 'Listen to the script'}</button><button className="text-button" onClick={() => setShowTranscript(!showTranscript)} aria-expanded={showTranscript} type="button">{showTranscript ? 'Hide transcript' : 'Read transcript'}</button></> : <><span>Designed to listen.</span><span className="voice-play"><Play size={14} fill="currentColor" /></span></>}</div>
      {interactive && <p className="demo-disclaimer">Scripted preview using your browser voice. No microphone is used.</p>}
      {message && <p role="status" className="voice-message">{message}</p>}
      {showTranscript && <p className="voice-transcript">{voiceScript}</p>}
    </div>
  );
}

const storyboard = [
  { image: '/images/creative-product.jpg', label: '01 / Atmosphere', text: 'An idea takes shape.' },
  { image: '/images/creative-detail.jpg', label: '02 / Detail', text: 'A closer kind of feeling.' },
  { image: '/images/creative-product.jpg', label: '03 / Identity', text: 'Beyond the ordinary.' },
];

function CreativePreview({ interactive }: { interactive: boolean }) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setFrame((value) => (value + 1) % storyboard.length), 3500);
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <div className={`creative-preview creative-frame-${frame}`}>
      <img src={storyboard[frame].image} loading="lazy" alt={frame === 1 ? 'Close study of olive glass and fragrance bottle details' : 'Concept fragrance bottle on volcanic stone and moss'} />
      <div className="creative-top"><span>FORM</span><span>AN EXPLORATION IN FEELING</span></div>
      <div className="creative-bottom"><span>{interactive ? storyboard[frame].text : 'Beyond the ordinary.'}</span>{interactive ? <button className="creative-play" type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause storyboard' : 'Play storyboard'}>{playing ? <Square size={15} /> : <Play size={15} fill="currentColor" />}</button> : <span className="creative-play"><Plus size={20} /></span>}</div>
      {interactive && <div className="storyboard-controls">{storyboard.map((item, index) => <button key={item.label} type="button" aria-pressed={index === frame} onClick={() => { setFrame(index); setPlaying(false); }}>{item.label}</button>)}</div>}
    </div>
  );
}

export default function ProjectVisual({ discipline, interactive = false }: { discipline: Discipline; interactive?: boolean }) {
  if (discipline === 'web') return <WebPreview interactive={interactive} />;
  if (discipline === 'automation') return <WorkflowPreview interactive={interactive} />;
  if (discipline === 'voice') return <VoicePreview interactive={interactive} />;
  return <CreativePreview interactive={interactive} />;
}