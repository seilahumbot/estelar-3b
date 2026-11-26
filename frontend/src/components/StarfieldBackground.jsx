import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Fundo 3D: campo de estrelas coloridas + "nebulosa" translúcida.
// Respeita prefers-reduced-motion e libera toda a memória da GPU ao desmontar.
export default function StarfieldBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      // Dispositivo sem suporte a WebGL: não renderiza nada, o CSS de fundo já cobre.
      console.warn('WebGL indisponível, usando apenas o fundo em CSS.', err);
      return undefined;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const palette = [
      new THREE.Color('#c084fc'),
      new THREE.Color('#f472b6'),
      new THREE.Color('#22d3ee'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const nebulaGeometry = new THREE.SphereGeometry(40, 32, 32);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#4c1d95'),
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);

    let frameId;
    const animate = () => {
      if (!prefersReducedMotion) {
        stars.rotation.y += 0.0006;
        stars.rotation.x += 0.0002;
        camera.position.x = Math.sin(Date.now() * 0.00005) * 0.5;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      starGeometry.dispose();
      starMaterial.dispose();
      nebulaGeometry.dispose();
      nebulaMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="starfield-background" aria-hidden="true" />;
}
