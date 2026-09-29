import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type Props = { motionEnabled: boolean };

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, weight = 400) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Arial, sans-serif`;
  ctx.fillText(text, x, y);
}

function makeTexture(kind: 'browser' | 'workflow' | 'voice', image?: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = kind === 'voice' ? 340 : 820;
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  roundedRect(ctx, 0, 0, w, h, 18, kind === 'browser' ? '#eeeede' : '#191d18');
  roundedRect(ctx, 0, 0, w, 57, 18, kind === 'browser' ? '#dddcd1' : '#242a21');
  ctx.fillRect(0, 30, w, 27);
  ['#878b7b', '#a6aa97', '#c8ccbb'].forEach((color, i) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(29 + i * 25, 28, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  label(ctx, kind === 'browser' ? 'formandfield.concept' : kind === 'workflow' ? 'A connected way of working' : 'Voice exploration', 147, 36, 16, kind === 'browser' ? '#74776b' : '#a0aa97');

  if (kind === 'browser') {
    label(ctx, 'form & field', 54, 120, 31, '#252b1c', 600);
    label(ctx, 'Journal', 806, 115, 16, '#434939');
    label(ctx, 'Spaces', 907, 115, 16, '#434939');
    label(ctx, 'About', 1011, 115, 16, '#434939');
    ctx.strokeStyle = '#d1d2c3';
    ctx.beginPath(); ctx.moveTo(54, 151); ctx.lineTo(1146, 151); ctx.stroke();
    label(ctx, 'A considered', 54, 270, 67, '#252b1c', 500);
    label(ctx, 'way of living.', 54, 349, 67, '#252b1c', 500);
    label(ctx, 'Spaces, objects and ideas', 58, 412, 22, '#6b705e');
    label(ctx, 'for a little more intention.', 58, 444, 22, '#6b705e');
    roundedRect(ctx, 56, 491, 202, 55, 2, '#343e24');
    label(ctx, 'Explore the journal', 79, 525, 17, '#f5f5e9');
    roundedRect(ctx, 627, 190, 518, 497, 0, '#8e9973');
    if (image) {
      const sw = image.width * 0.68;
      ctx.drawImage(image, (image.width - sw) / 2, 0, sw, image.height, 627, 190, 518, 497);
    }
    label(ctx, 'An independent journal of thoughtful spaces.', 55, 744, 18, '#6b705e');
    label(ctx, '01', 1110, 744, 18, '#6b705e');
  }
  if (kind === 'workflow') {
    label(ctx, 'Everything, connected.', 65, 139, 41, '#ecf0e5', 500);
    label(ctx, 'An inquiry becomes a clear next step.', 67, 181, 22, '#858e7d');
    ctx.strokeStyle = '#586548';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(218, 430); ctx.lineTo(450, 430); ctx.lineTo(450, 325); ctx.lineTo(760, 325);
    ctx.moveTo(450, 430); ctx.lineTo(450, 575); ctx.lineTo(760, 575);
    ctx.stroke();
    [{ x: 83, y: 352, title: 'New inquiry', sub: 'Webhook trigger', symbol: '+' }, { x: 735, y: 247, title: 'Organize', sub: 'Airtable', symbol: '=' }, { x: 735, y: 497, title: 'Follow up', sub: 'Create a task', symbol: '+' }].forEach((node) => {
      roundedRect(ctx, node.x, node.y, 316, 155, 12, '#2b3225');
      roundedRect(ctx, node.x + 22, node.y + 26, 52, 52, 8, '#d2f76b');
      label(ctx, node.symbol, node.x + 37, node.y + 62, 31, '#273118');
      label(ctx, node.title, node.x + 91, node.y + 61, 27, '#edf3df', 500);
      label(ctx, node.sub, node.x + 25, node.y + 122, 19, '#99a98a');
    });
    ctx.beginPath(); ctx.fillStyle = '#d2f76b'; ctx.arc(450, 430, 10, 0, Math.PI * 2); ctx.fill();
    label(ctx, 'DESIGNED TO GIVE YOU TIME BACK', 68, 755, 17, '#859175');
  }
  if (kind === 'voice') {
    label(ctx, 'A little more human.', 47, 126, 39, '#edf3df', 500);
    label(ctx, 'Thoughtful conversations. Useful answers.', 49, 169, 20, '#96a18b');
    for (let i = 0; i < 57; i++) {
      const height = 13 + Math.abs(Math.sin(i * 0.77) * Math.cos(i * 0.18)) * 80;
      roundedRect(ctx, 50 + i * 19.3, 249 - height / 2, 6, height, 3, i < 35 ? '#d2f76b' : '#566044');
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function StudioScene({ motionEnabled }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    setReady(false);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return;
    }
    let disposed = false;
    let frame = 0;
    let visible = true;
    let contextLost = false;
    let compact = window.matchMedia('(max-width: 760px)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.35 : 1.7));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 80);
    camera.position.set(0, 0.65, 11);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const envTarget = pmrem.fromScene(environment, 0.04);
    scene.environment = envTarget.texture;
    environment.dispose();
    scene.add(new THREE.AmbientLight(0xeaf0da, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 5);
    key.position.set(0, 6, 6);
    scene.add(key);
    const accent = new THREE.DirectionalLight(0xd2f76b, 1.8);
    accent.position.set(5, -1, 4);
    scene.add(accent);

    const assembly = new THREE.Group();
    scene.add(assembly);
    const textures: THREE.Texture[] = [];
    const addScreen = (width: number, height: number, kind: 'browser' | 'workflow' | 'voice') => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.075, height + 0.075, 0.105),
        new THREE.MeshStandardMaterial({ color: 0x8b9482, roughness: 0.27, metalness: 0.92 }),
      );
      group.add(body);
      const texture = makeTexture(kind);
      textures.push(texture);
      const display = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
      );
      display.position.z = 0.057;
      group.add(display);
      assembly.add(group);
      return { group, display };
    };

    const workflow = addScreen(4.5, 3.075, 'workflow');
    workflow.group.position.set(-0.46, 0.92, -1.13);
    workflow.group.rotation.set(-0.08, -0.42, 0.1);
    const browser = addScreen(4.45, 3.041, 'browser');
    browser.group.position.set(0.1, -0.03, 0.1);
    browser.group.rotation.set(-0.04, -0.32, 0.035);
    const voice = addScreen(3.85, 1.091, 'voice');
    voice.group.position.set(0.69, -1.55, 1.23);
    voice.group.rotation.set(-0.04, -0.32, 0.035);
    if (compact) workflow.group.visible = false;

    const connection = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.5, 1.75, -1.0),
      new THREE.Vector3(-3.02, 1.05, -0.9),
      new THREE.Vector3(-2.9, -1.15, 0),
      new THREE.Vector3(-1.15, -1.57, 1.1),
    ]);
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(connection, 70, 0.018, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x96a67c, metalness: 0.65, roughness: 0.38 }),
    );
    assembly.add(cable);
    const signal = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xd2f76b }),
    );
    assembly.add(signal);

    const grid = new THREE.GridHelper(32, 64, 0x455038, 0x252c21);
    grid.position.set(3, -2.83, -2);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.34;
    scene.add(grid);
    scene.fog = new THREE.FogExp2(0x10120e, 0.045);

    let progress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    const clock = new THREE.Clock();

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      compact = window.matchMedia('(max-width: 760px)').matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.35 : 1.7));
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      assembly.position.set(compact ? 0 : Math.min(3.25, camera.aspect * 1.33), compact ? 0.18 : 0.08, 0);
      assembly.scale.setScalar(compact ? 0.91 : 1);
      workflow.group.visible = !compact;
      renderStill();
    };

    const renderStill = () => {
      if (disposed || contextLost) return;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    const onScroll = () => {
      const hero = host.closest('section');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      progress = Math.max(0, Math.min(1, -rect.top / rect.height));
    };
    const onPointer = (event: PointerEvent) => {
      if (compact) return;
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const animate = () => {
      if (disposed || contextLost || !visible || !motionEnabled || document.hidden) return;
      const time = clock.getElapsedTime();
      currentX += (pointerX - currentX) * 0.025;
      currentY += (pointerY - currentY) * 0.025;
      camera.position.z = 11 - progress * 2.25;
      camera.position.x = currentX * 0.13 + progress * 0.58;
      camera.position.y = 0.65 - currentY * 0.075 + progress * 0.2;
      assembly.rotation.y = Math.sin(time * 0.17) * 0.028 + currentX * 0.023 - progress * 0.12;
      browser.group.position.y = -0.03 + Math.sin(time * 0.45) * 0.045;
      voice.group.position.y = -1.55 + Math.sin(time * 0.45 + 1) * 0.035;
      signal.position.copy(connection.getPoint((time * 0.11) % 1));
      renderStill();
      frame = requestAnimationFrame(animate);
    };

    const image = new Image();
    image.onload = () => {
      if (disposed) return;
      const texture = makeTexture('browser', image);
      textures.push(texture);
      (browser.display.material as THREE.MeshBasicMaterial).map = texture;
      browser.display.material.needsUpdate = true;
      renderStill();
    };
    image.src = '/images/editorial-architecture.jpg';

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && motionEnabled && !document.hidden) animate();
    }, { rootMargin: '80px' });
    intersectionObserver.observe(host);
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && visible && motionEnabled) animate();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      cancelAnimationFrame(frame);
      renderer.domElement.style.visibility = 'hidden';
      setReady(false);
    };
    const onContextRestored = () => {
      contextLost = false;
      renderer.domElement.style.visibility = 'visible';
      renderStill();
      setReady(true);
      if (visible && motionEnabled) animate();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (motionEnabled) window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
    resize();
    onScroll();
    signal.position.copy(connection.getPoint(0.45));
    setReady(true);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      textures.forEach((texture) => texture.dispose());
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [motionEnabled]);

  return (
    <div className={`studio-canvas ${ready ? 'is-ready' : ''}`} ref={container} aria-hidden="true">
      {!ready && <div className="scene-fallback"><img src="/images/editorial-architecture.jpg" alt="" /><span>form & field</span></div>}
    </div>
  );
}