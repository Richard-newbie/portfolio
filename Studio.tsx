import { lazy, Suspense, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Camera, Check, Copy, Download, Menu, Pause, Play, Plus, X } from 'lucide-react';
import ProjectVisual from './components/ProjectVisual';
import { processSteps, projects, services, studio, technology, testimonials, type Discipline, type Project } from './data';

const StudioScene = lazy(() => import('./components/StudioScene'));
const navigation = ['Home', 'About', 'Services', 'Work', 'Skills', 'Testimonials', 'Contact'];

function BrandMark({ className = '' }: { className?: string }) {
  return <svg className={className} width="31" height="34" viewBox="0 0 31 34" fill="none" aria-hidden="true"><path d="M3 29V5H26V10H9V15H22V20H9V29H3Z" fill="currentColor" /><path d="M14 24V29H28V24H14Z" fill="currentColor" /></svg>;
}

function usePortrait() {
  const [portrait, setPortrait] = useState(() => {
    try { return localStorage.getItem('festus-studio-portrait') || studio.portraitUrl; }
    catch { return studio.portraitUrl; }
  });
  const [portraitMessage, setPortraitMessage] = useState('');
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPortraitMessage('Please choose a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setPortraitMessage('Please choose a photograph smaller than 12 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setPortraitMessage('This file could not be read. Please try another copy.');
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => setPortraitMessage('This image could not be opened. Please choose another file.');
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1500 / Math.max(image.width, image.height));
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const source = canvas.toDataURL('image/jpeg', 0.92);
        setPortrait(source);
        try {
          localStorage.setItem('festus-studio-portrait', source);
          setPortraitMessage('Your original portrait is now used across this studio preview. It is saved only in this browser.');
        } catch {
          setPortraitMessage('Your portrait is ready for this visit. Browser storage is unavailable.');
        }
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };
  return { portrait, upload, portraitMessage };
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-18% 0px -65% 0px', threshold: 0 });
    navigation.forEach((name) => {
      const section = document.getElementById(name.toLowerCase());
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); document.getElementById('menu-toggle')?.focus(); }
      if (event.key === 'Tab') {
        const focusable = Array.from(headerRef.current?.querySelectorAll<HTMLElement>('a[href], button') || []).filter((element) => element.offsetParent !== null);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const background = Array.from(document.querySelectorAll<HTMLElement>('main, .site-footer'));
    background.forEach((element) => { element.inert = true; });
    const focusFrame = requestAnimationFrame(() => document.querySelector<HTMLElement>('#mobile-navigation a')?.focus());
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    const media = window.matchMedia('(min-width: 1081px)');
    const closeOnDesktop = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener('change', closeOnDesktop);
    return () => {
      cancelAnimationFrame(focusFrame);
      background.forEach((element) => { element.inert = false; });
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', closeOnEscape);
      media.removeEventListener('change', closeOnDesktop);
    };
  }, [menuOpen]);

  return (
    <header className={`site-header ${menuOpen ? 'menu-is-open' : ''}`} ref={headerRef}>
      <div className="nav-inner">
        <a className="brand" href="#home" aria-label="Festus Labs home" onClick={() => setMenuOpen(false)}><BrandMark /><span>FESTUS LABS<span className="brand-period">.</span></span></a>
        <nav className="desktop-navigation" aria-label="Main navigation">{navigation.map((name) => <a key={name} href={`#${name.toLowerCase()}`} className={active === name.toLowerCase() ? 'active' : ''} aria-current={active === name.toLowerCase() ? 'location' : undefined}>{name}</a>)}</nav>
        <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Let's talk <span /></a>
        <button type="button" className="menu-toggle" id="menu-toggle" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
      </div>
      {menuOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">{navigation.map((name, index) => <a key={name} href={`#${name.toLowerCase()}`} onClick={() => setMenuOpen(false)}><span className="mobile-nav-number">0{index + 1}</span>{name}</a>)}</nav>}
    </header>
  );
}

function Hero({ motionEnabled, portrait }: { motionEnabled: boolean; portrait: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 65]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  return (
    <section id="home" className={`hero ${portrait ? 'has-portrait' : ''}`} ref={ref}>
      <div className="hero-scene"><Suspense fallback={<div className="scene-fallback"><img src="/images/editorial-architecture.jpg" alt="" /><span>form & field</span></div>}><StudioScene motionEnabled={motionEnabled} /></Suspense></div>
      {portrait && <motion.div className="hero-portrait" style={motionEnabled ? { scale: portraitScale } : undefined}><img src={portrait} alt="Oluwatobi Festus, the person behind Festus Labs" fetchPriority="high" /></motion.div>}
      <div className="hero-grain" aria-hidden="true" />
      <div className="page-width hero-inner">
        <motion.div style={motionEnabled ? { y: titleY } : undefined} className="hero-wordmark-wrap"><motion.h1 className="hero-wordmark" initial={motionEnabled ? { clipPath: 'inset(0 0 100% 0)', y: 25 } : false} animate={{ clipPath: 'inset(0 0 0% 0)', y: 0 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>FESTUS LABS<span className="wordmark-dot">.</span></motion.h1></motion.div>
        <motion.div className="hero-copy" style={motionEnabled ? { y: contentY } : undefined}>
          <p className="personal-intro">Hi, I'm <span>Oluwatobi Festus.</span></p>
          <h2>I build digital experiences,<br className="desktop-break" /> intelligent systems and<br className="desktop-break" /> <span>AI powered solutions.</span></h2>
          <p className="hero-description">An independent technology studio bringing web development, AI automation, voice and creative AI together. Human ideas. Practical solutions.</p>
          <div className="hero-actions"><a href="#work" className="button button-primary">View my work</a><a href="#contact" className="button button-text">Let's work together<span className="text-button-line" /></a></div>
        </motion.div>
        <div className="hero-bottom"><a href="#about" className="scroll-cue"><span className="scroll-track"><i /></span>Step inside the studio</a></div>
      </div>
    </section>
  );
}

function SpatialPortrait({ children, motionEnabled }: { children: ReactNode; motionEnabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [35, -35]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, -3]);
  return <div className="portrait-perspective" ref={ref}><motion.div className="about-portrait" style={motionEnabled ? { y, rotateX } : undefined}>{children}</motion.div></div>;
}

function About({ portrait, upload, portraitMessage, motionEnabled }: { portrait: string; upload: (event: ChangeEvent<HTMLInputElement>) => void; portraitMessage: string; motionEnabled: boolean }) {
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <section className="about-section section-space page-width" id="about">
      <div className="about-visual">
        <SpatialPortrait motionEnabled={motionEnabled}>
          {portrait ? <img className="owner-portrait" src={portrait} alt="Portrait of Oluwatobi Festus" loading="lazy" /> : <div className="portrait-placeholder" aria-label="Oluwatobi Festus personal monogram"><div className="portrait-grid" /><span className="portrait-monogram">OF<span>.</span></span><div className="portrait-bottom"><span>A HUMAN BEHIND<br />THE TECHNOLOGY.</span><BrandMark /></div></div>}
          <button className="portrait-upload" type="button" onClick={() => fileInput.current?.click()}><Camera size={15} />{portrait ? 'Change portrait' : 'Add original portrait'}</button>
        </SpatialPortrait>
        <input ref={fileInput} type="file" className="sr-only" tabIndex={-1} accept="image/jpeg,image/png,image/webp" aria-label="Upload the original portrait of Oluwatobi Festus" onChange={upload} />
        {portraitMessage && <p className="portrait-message" role="status">{portraitMessage}</p>}
        <div className="portrait-caption"><span>Oluwatobi Festus</span><span>The person behind Festus Labs</span></div>
      </div>
      <div className="about-copy"><h2>Built around<br />technology.<br /><span className="text-muted">Driven by practical<br />solutions.</span></h2><div className="about-body"><p>Festus Labs is my personal technology studio. Not a faceless agency. Just a curious mind, a considered approach and a belief that technology should make life a little better.</p><p>I work across web development, AI automation, voice technology and AI powered creative production, helping businesses turn ideas and repetitive processes into useful digital experiences.</p></div><div className="about-signature"><span>Oluwatobi.</span><span>DESIGNER. DEVELOPER. PROBLEM SOLVER.</span></div></div>
    </section>
  );
}

function Services({ motionEnabled, onExplore, onProject }: { motionEnabled: boolean; onExplore: (discipline: Discipline) => void; onProject: (project: Project) => void }) {
  const [active, setActive] = useState<Discipline>('web');
  const [open, setOpen] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const stageY = useTransform(scrollYProgress, [0, 0.5, 1], [38, 0, -35]);
  const stageZ = useTransform(scrollYProgress, [0, 0.5, 1], [-100, 0, 60]);
  const selected = services.find((service) => service.id === active)!;
  const activeIndex = services.findIndex((service) => service.id === active);
  return (
    <section id="services" className="services-section section-space" ref={ref}>
      <div className="page-width">
        <div className="section-heading"><h2>Four disciplines.<br /><span className="text-muted">One connected studio.</span></h2><p>Different tools. Shared purpose.<br />Making your next idea work in the real world.</p></div>
        <div className="services-composition" style={{ '--service-accent': selected.color } as CSSProperties}>
          <div className="service-list">{services.map((service, index) => <div className={`service-item ${active === service.id && open ? 'is-active' : ''}`} key={service.id} style={{ '--item-accent': service.color } as CSSProperties}>
            <h3><button type="button" aria-expanded={active === service.id && open} aria-controls={`service-${service.id}`} onClick={() => { if (active === service.id) setOpen(!open); else { setActive(service.id); setOpen(true); } }}><span className="service-number">0{index + 1}</span><span>{service.name}</span><Plus size={20} className="service-plus" /></button></h3>
            <div className="service-description" id={`service-${service.id}`} hidden={active !== service.id || !open}><p>{service.description}</p><ul className="service-tools">{service.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul><button className="service-explore" type="button" onClick={() => onExplore(service.id)}>Explore the work</button></div>
          </div>)}</div>
          <div className={`service-environment environment-${active}`}>
            <div className="environment-grid" aria-hidden="true" />
            <span className="environment-number" aria-hidden="true">0{activeIndex + 1}</span>
            <motion.div className="service-stage" style={motionEnabled ? { y: stageY, z: stageZ } : undefined}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.button type="button" key={active} className="service-object" aria-label={`Explore the ${selected.name} concept`} onClick={() => onProject(projects.find((project) => project.discipline === active)!)} initial={motionEnabled ? { z: -160, x: 40, rotateY: 12, opacity: 0 } : false} animate={{ z: 0, x: 0, rotateY: motionEnabled ? -5 : 0, opacity: 1 }} exit={motionEnabled ? { z: 90, x: -25, opacity: 0 } : undefined} transition={{ duration: motionEnabled ? 0.5 : 0, ease: [0.22, 1, 0.36, 1] }}>
                  <div aria-hidden="true"><ProjectVisual discipline={active} /></div>
                </motion.button>
              </AnimatePresence>
            </motion.div>
            <div className="environment-caption"><span>{selected.name}</span><span>Ideas, brought into focus.</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryVisual({ project, onProject, motionEnabled }: { project: Project; onProject: (project: Project) => void; motionEnabled: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const depth = useTransform(scrollYProgress, [0, 1], [-65, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [18, 0]);
  return (
    <button ref={ref} className="project-preview-button" type="button" onClick={() => onProject(project)} aria-label={`Explore ${project.name}, a ${project.category.toLowerCase()} concept`}>
      <motion.div className="project-preview" style={motionEnabled ? { z: depth, y } : undefined} aria-hidden="true"><ProjectVisual discipline={project.discipline} /></motion.div>
      <span className="project-open" aria-hidden="true"><Plus size={22} strokeWidth={1.5} /></span>
    </button>
  );
}

function Work({ filter, setFilter, onProject, motionEnabled }: { filter: Discipline | 'all'; setFilter: (value: Discipline | 'all') => void; onProject: (project: Project) => void; motionEnabled: boolean }) {
  const filteredProjects = projects.filter((project) => filter === 'all' || project.discipline === filter);
  return (
    <section id="work" className="work-section section-space page-width">
      <div className="section-heading"><h2>A look inside<br /><span className="text-muted">the lab</span><span className="heading-period">.</span></h2><p>A few directions worth exploring.<br />Independent concepts that show what is possible.</p></div>
      <div className="work-filters" role="group" aria-label="Filter projects by discipline">{[{ id: 'all', shortName: 'All work' }, ...services].map((item) => <button key={item.id} onClick={() => setFilter(item.id as Discipline | 'all')} type="button" aria-pressed={filter === item.id} className={filter === item.id ? 'is-active' : ''}>{item.shortName}{item.id === 'all' && <span>04</span>}</button>)}</div>
      <motion.div className={`work-gallery ${filteredProjects.length === 1 ? 'is-filtered' : ''}`} layout={motionEnabled}>
        <AnimatePresence mode="popLayout" initial={false}>{filteredProjects.map((project) => <motion.article key={project.id} className={`project-item project-${project.discipline}`} layout={motionEnabled} initial={motionEnabled ? { opacity: 0, scale: 0.96, y: 20 } : false} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4 }}>
          <GalleryVisual project={project} onProject={onProject} motionEnabled={motionEnabled} />
          <div className="project-meta"><div><p className="project-category">{project.category}<span>/</span>Concept study</p><h3><button type="button" onClick={() => onProject(project)}>{project.name}</button></h3></div><p>{project.summary}</p></div>
        </motion.article>)}</AnimatePresence>
      </motion.div>
      <p className="work-note">Independent explorations of what is possible. Real project stories will be added as they are ready to share.</p>
    </section>
  );
}

function Skills({ motionEnabled }: { motionEnabled: boolean }) {
  const [active, setActive] = useState<Discipline>('web');
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rotateX = useTransform(scrollYProgress, [0, 0.45, 1], [9, 0, -4]);
  return (
    <section id="skills" ref={ref} className="skills-section section-space">
      <div className="page-width"><div className="section-heading"><h2>The right tools.<br /><span className="text-muted">Not just more tools.</span></h2><p>A considered toolkit, chosen around the problem.<br />Explore the disciplines.</p></div>
        <motion.div className="technology-space" style={motionEnabled ? { rotateX } : undefined}>{technology.map((group, index) => <button key={group.discipline} type="button" aria-pressed={active === group.discipline} onClick={() => setActive(group.discipline)} className={`technology-group ${active === group.discipline ? 'is-active' : ''}`} style={{ '--tech-color': services[index].color } as CSSProperties}><span className="technology-heading"><span>0{index + 1}</span>{group.name}</span><span className="technology-cluster">{group.tools.map((tool, toolIndex) => <span className={`technology-name technology-name-${toolIndex}`} key={tool}>{tool}</span>)}</span><span className="technology-note">{group.note}</span></button>)}</motion.div>
      </div>
    </section>
  );
}

function Process({ motionEnabled }: { motionEnabled: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <section className="process-section section-space page-width" id="process"><div className="section-heading"><h2>Clear thinking.<br /><span className="text-muted">From start to finish.</span></h2><p>No unnecessary complexity.<br />Just a thoughtful path from problem to possibility.</p></div><div className="process-journey"><div className="process-track" aria-hidden="true"><motion.span animate={{ width: `${active * 33.333}%` }} transition={{ duration: motionEnabled ? 0.65 : 0 }} /><motion.i animate={{ left: `${active * 33.333}%` }} transition={{ type: 'spring', stiffness: 90, damping: 21, duration: motionEnabled ? undefined : 0 }} /></div><div className="process-steps">{processSteps.map((step, index) => <button key={step.title} className={`process-step ${active === index ? 'is-active' : ''}`} type="button" aria-pressed={active === index} aria-controls="process-detail" onClick={() => setActive(index)}><span className="process-number">0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p></button>)}</div></div><div className="process-detail" id="process-detail" aria-live="polite"><span>0{active + 1} / {processSteps[active].title}</span><p>{processSteps[active].detail}</p></div></section>
  );
}

function Testimonials({ motionEnabled }: { motionEnabled: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <section className="testimonials-section section-space" id="testimonials"><div className="page-width testimonials-layout"><h2>Good work.<br /><span className="text-muted">Real words.</span></h2>{testimonials.length ? <div className="testimonial-space"><AnimatePresence mode="wait"><motion.blockquote key={active} initial={motionEnabled ? { z: -120, x: 50, opacity: 0 } : false} animate={{ z: 0, x: 0, opacity: 1 }} exit={{ z: -120, x: -50, opacity: 0 }}><p>{testimonials[active].quote}</p><footer>{testimonials[active].name}<span>{testimonials[active].role}</span></footer></motion.blockquote></AnimatePresence>{testimonials.length > 1 && <div className="testimonial-controls"><button type="button" onClick={() => setActive((active + testimonials.length - 1) % testimonials.length)}>Previous</button><span aria-live="polite">{active + 1} / {testimonials.length}</span><button type="button" onClick={() => setActive((active + 1) % testimonials.length)}>Next</button></div>}</div> : <div className="testimonials-empty"><p>Trust should be earned, not invented.</p><p>Client stories will live here when they are available, shared in their own words and with their permission.</p><a className="inline-link" href="#contact">Let's build something worth sharing</a><span className="testimonial-status">No testimonials published yet.</span></div>}</div></section>
  );
}

function Contact({ service, onServiceChange }: { service: Discipline | ''; onServiceChange: (value: Discipline | '') => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [brief, setBrief] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [formError, setFormError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { setBrief(''); }, [service]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (message.trim().length < 20) {
      setFormError('Please share at least 20 characters about your idea.');
      formRef.current?.querySelector<HTMLTextAreaElement>('textarea[name="message"]')?.focus();
      return;
    }
    setFormError('');
    const discipline = services.find((item) => item.id === service)?.name || 'Open to guidance';
    setBrief(`FESTUS LABS\nPROJECT INQUIRY\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nDiscipline: ${discipline}\n\nProject idea\n${message.trim()}`);
    setCopyStatus('');
    requestAnimationFrame(() => resultRef.current?.focus({ preventScroll: true }));
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(brief); setCopyStatus('Copied. Your brief is ready to share.'); }
    catch { setCopyStatus('Copy is unavailable in this browser. Select the brief text or download it instead.'); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Festus Labs Project Brief.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section id="contact" className="contact-section section-space">
      <div className="page-width contact-layout">
        <div className="contact-copy">
          <h2>Have a project<br />in mind?<br /><span>Let's build it.</span></h2>
          <p>Tell me what you are building, improving or automating. Let's explore the right solution.</p>
          <span className="contact-signature">Your idea. My curiosity. Something useful.</span>
          {studio.email && <a className="contact-email" href={`mailto:${studio.email}`}>{studio.email}</a>}
        </div>
        <div className="contact-form-area">
          {brief ? (
            <div className="brief-result" ref={resultRef} tabIndex={-1} aria-labelledby="brief-result-heading">
              <span className="brief-check"><Check size={22} /></span>
              <h3 id="brief-result-heading">Your project starts here.</h3>
              <p>Your brief is ready. Download it or copy it to share. No message has been sent.</p>
              <label htmlFor="prepared-brief" className="sr-only">Your prepared project brief</label>
              <textarea id="prepared-brief" readOnly value={brief} rows={9} />
              <div className="brief-actions">
                <button type="button" className="button button-primary" onClick={download}><Download size={15} />Download brief</button>
                <button type="button" className="button button-outline" onClick={copy}><Copy size={15} />Copy brief</button>
              </div>
              {studio.email && <a className="inline-link" href={`mailto:${studio.email}?subject=${encodeURIComponent(`Project inquiry from ${name}`)}&body=${encodeURIComponent(brief)}`}>Open email draft</a>}
              {copyStatus && <p className="form-status" role="status">{copyStatus}</p>}
              <button type="button" className="text-button edit-brief" onClick={() => {
                setBrief('');
                requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true }));
              }}>Edit my project details</button>
            </div>
          ) : (
            <form className="contact-form" ref={formRef} onSubmit={submit} aria-describedby="form-privacy">
              <div className="form-intro"><span>Good things start with a conversation.</span><BrandMark /></div>
              <div className="form-row">
                <label>Your name
                  <input type="text" name="name" placeholder="What should I call you?" autoComplete="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} pattern=".*\S.*" />
                </label>
                <label>Email address
                  <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required maxLength={160} value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
              </div>
              <label>What can I help with?
                <select name="service" id="contact-service" value={service} onChange={(event) => onServiceChange(event.target.value as Discipline | '')}>
                  <option value="">Let's figure it out together</option>
                  {services.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>A little about your idea
                <textarea name="message" placeholder="The idea, the challenge, the thing you wish worked better..." required minLength={20} maxLength={4000} rows={4} value={message} aria-invalid={Boolean(formError)} aria-describedby={formError ? 'project-form-error' : undefined} onChange={(event) => { setMessage(event.target.value); setFormError(''); }} />
              </label>
              {formError && <p className="form-error" id="project-form-error" role="alert">{formError}</p>}
              <button type="submit" className="button button-primary contact-submit">Prepare project brief</button>
              <p className="form-privacy" id="form-privacy">This studio preview prepares a brief you can save and share. It does not send a message. Your details stay in this browser.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectDialog({ project, onClose, onStart, onChange }: { project: Project; onClose: () => void; onStart: (discipline: Discipline) => void; onChange: (project: Project) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const index = projects.findIndex((item) => item.id === project.id);
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  useEffect(() => { ref.current?.scrollTo({ top: 0 }); }, [project.id]);
  return (
    <dialog ref={ref} className="project-dialog" aria-labelledby="project-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="project-dialog-content"><button autoFocus type="button" className="dialog-close" aria-label="Close project" onClick={onClose}><X size={21} /></button><div className="dialog-heading"><p>{project.category} / Independent concept</p><h2 id="project-dialog-title">{project.name}</h2><span>{project.summary}</span></div><div className={`dialog-preview dialog-preview-${project.discipline}`} key={project.id}><ProjectVisual discipline={project.discipline} interactive /></div><div className="dialog-details"><div><h3>The idea</h3><p>{project.description}</p></div><div><h3>What was built</h3><p>{project.built}</p><h3>Technology direction</h3><p>{project.tools.join(' / ')}</p></div></div><div className="dialog-bottom"><button type="button" className="button button-primary" onClick={() => onStart(project.discipline)}>Build something like this</button><div className="gallery-navigation"><button type="button" onClick={() => onChange(projects[(index + projects.length - 1) % projects.length])}>Previous</button><span>{index + 1} / {projects.length}</span><button type="button" onClick={() => onChange(projects[(index + 1) % projects.length])}>Next</button></div></div></div></dialog>
  );
}

function Footer({ motionEnabled, toggleMotion, reducedMotion }: { motionEnabled: boolean; toggleMotion: () => void; reducedMotion: boolean }) {
  return <footer className="site-footer page-width"><div className="footer-top"><p>A personal technology studio.<br />Built with intention by Oluwatobi Festus.</p><div className="footer-links"><a href="#work">The work</a><a href="#about">The person</a><a href="#home">Back to top</a></div></div><a className="footer-wordmark" href="#home" aria-label="Festus Labs, back to top">FESTUS LABS<span>.</span></a><div className="footer-bottom"><span>&copy; {new Date().getFullYear()} Festus Labs</span><span>HUMAN IDEAS. PRACTICAL TECHNOLOGY.</span><button type="button" onClick={toggleMotion} disabled={reducedMotion} aria-pressed={motionEnabled} aria-label={reducedMotion ? 'Reduced motion follows your system preference' : motionEnabled ? 'Turn motion off' : 'Turn motion on'}>{motionEnabled ? <Pause size={12} /> : <Play size={12} />}{reducedMotion ? 'Reduced motion' : motionEnabled ? 'Motion on' : 'Motion off'}</button></div></footer>;
}

export default function Studio() {
  const prefersReducedMotion = useReducedMotion();
  const [motionPreference, setMotionPreference] = useState(() => {
    try { return localStorage.getItem('festus-motion') !== 'off'; }
    catch { return true; }
  });
  const motionEnabled = motionPreference && !prefersReducedMotion;
  const { portrait, upload, portraitMessage } = usePortrait();
  const [filter, setFilter] = useState<Discipline | 'all'>('all');
  const [project, setProject] = useState<Project | null>(null);
  const [contactService, setContactService] = useState<Discipline | ''>('');
  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? 'on' : 'off';
    return () => { delete document.documentElement.dataset.motion; };
  }, [motionEnabled]);
  const toggleMotion = () => {
    setMotionPreference((value) => {
      try { localStorage.setItem('festus-motion', value ? 'off' : 'on'); } catch { /* Motion still works without persistent storage. */ }
      return !value;
    });
  };
  const explore = (discipline: Discipline) => {
    setFilter(discipline);
    requestAnimationFrame(() => document.getElementById('work')?.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'instant' }));
  };
  const startProject = (discipline: Discipline) => {
    setProject(null);
    setContactService(discipline);
    requestAnimationFrame(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'instant' });
      document.getElementById('contact-service')?.focus({ preventScroll: true });
    });
  };
  return (
    <MotionConfig reducedMotion={motionEnabled ? 'user' : 'always'}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero motionEnabled={motionEnabled} portrait={portrait} />
        <About portrait={portrait} upload={upload} portraitMessage={portraitMessage} motionEnabled={motionEnabled} />
        <Services motionEnabled={motionEnabled} onExplore={explore} onProject={setProject} />
        <Work filter={filter} setFilter={setFilter} onProject={setProject} motionEnabled={motionEnabled} />
        <Skills motionEnabled={motionEnabled} />
        <Process motionEnabled={motionEnabled} />
        <Testimonials motionEnabled={motionEnabled} />
        <Contact service={contactService} onServiceChange={setContactService} />
      </main>
      <Footer motionEnabled={motionEnabled} toggleMotion={toggleMotion} reducedMotion={Boolean(prefersReducedMotion)} />
      {project && <ProjectDialog project={project} onClose={() => setProject(null)} onStart={startProject} onChange={setProject} />}
    </MotionConfig>
  );
}