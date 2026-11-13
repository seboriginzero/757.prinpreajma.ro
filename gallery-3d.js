// gallery-3d.js — 3D Spatial Modern Photo Gallery Engine for 757
// Luxury Biomechanical Surrealism WebGL Experience via Three.js
(function () {
  'use strict';

  // State Management
  const state3D = {
    isOpen: false,
    initialized: false,
    mode: 'helix', // Strictly Tunel Biomecanic Z-Axis
    allItems: [],
    activeItems: [],
    meshes: [],
    // Tunnel Kinematics
    currentZ: 0,
    targetZ: 0,
    tunnelYaw: 0,
    targetTunnelYaw: 0,
    tunnelPitch: 0,
    targetTunnelPitch: 0,
    // Pointer Drag Physics
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    velocity: 0,
    isAutoSpin: false,
    lastInteractionTime: Date.now(),
    // Inspection Focus
    hoveredMesh: null,
    focusedMesh: null,
    cameraStartPos: null,
    cameraTargetPos: null,
    cameraStartLookAt: null,
    cameraTargetLookAt: null,
    focusProgress: 1,
    isUnfocusing: false,
    unfocusProgress: 1,
    isDetailModalOpen: false,
    theme: 'dark'
  };

  // Three.js References
  let scene, camera, renderer, container;
  let artGroup, particlesMesh;
  let infiniteMirrorMesh, abyssGroup, skyGroup;
  let skyMedallions = [], skySpirals = [], skyStarsMesh;
  let ambientLight, dirLight, pointLight;
  let raycaster, mouse;
  let animFrameId = null;

  // Shared Artist Portrait for Verso of all frames
  let sharedArtistTexture = null;
  let sharedVersoMaterial = null;

  // Tunnel Geometry Constants
  const HELIX_SPACING = 5.0;
  const HELIX_OFFSET_X = 3.3;

  // DOM Elements
  let gallery3dOverlay, canvasContainer;
  let modeLabel, counterLabel, spinBtn, themeBtn, closeBtn;
  let focusCard, cardId, cardWing, cardTitle, cardMedium, cardNote, cardDetailBtn, cardBackBtn, cardDismissBtn;

  // Initialize trigger from header button
  function initTrigger() {
    const triggerBtn = document.getElementById('gallery-3d-toggle');
    if (!triggerBtn) return;

    triggerBtn.addEventListener('click', open3DGallery);

    // Global keyboard shortcut: '3' opens 3D gallery
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '3' && !state3D.isOpen) {
        e.preventDefault();
        open3DGallery();
      }
    });

    // Direct deep-link support: #3d or ?view=3d opens directly into the 3D Tunnel
    if (window.location.hash === '#3d' || window.location.search.includes('view=3d')) {
      setTimeout(open3DGallery, 250);
    }

    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#3d' && !state3D.isOpen) {
        open3DGallery();
      } else if (window.location.hash !== '#3d' && state3D.isOpen) {
        close3DGallery();
      }
    });
  }

  // Open 3D Spatial Gallery (Directly into the 3D Tunnel)
  function open3DGallery() {
    if (state3D.isOpen) return;
    state3D.isOpen = true;
    state3D.mode = 'helix';

    if (!gallery3dOverlay) {
      cacheDOMElements();
    }

    if (gallery3dOverlay) {
      gallery3dOverlay.classList.add('is-active');
      gallery3dOverlay.setAttribute('aria-hidden', 'false');
    }

    if (window.location.hash !== '#3d') {
      try { history.replaceState(null, '', '#3d'); } catch (e) {}
    }

    document.body.style.overflow = 'hidden';

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    state3D.theme = currentTheme;

    if (!state3D.initialized) {
      if (typeof THREE === 'undefined') {
        setTimeout(open3DGallery, 80);
        return;
      }
      initThreeScene();
      state3D.initialized = true;
    } else {
      updateThemeInScene(state3D.theme);
      onWindowResize();
    }

    // Direct entry into Tunel Z Runway
    state3D.currentZ = 0;
    state3D.targetZ = 0;
    state3D.tunnelYaw = 0;
    state3D.targetTunnelYaw = 0;
    state3D.tunnelPitch = 0;
    state3D.targetTunnelPitch = 0;
    if (camera) {
      camera.position.set(0, 0, 0);
      camera.rotation.set(0, 0, 0);
    }
    if (artGroup) {
      artGroup.position.set(0, 0, 0);
      artGroup.rotation.set(0, 0, 0);
    }

    state3D.lastInteractionTime = Date.now();
    startAnimationLoop();
  }

  // Close 3D Spatial Gallery
  function close3DGallery() {
    if (!state3D.isOpen) return;
    state3D.isOpen = false;

    if (gallery3dOverlay) {
      gallery3dOverlay.classList.remove('is-active');
      gallery3dOverlay.classList.remove('is-focused');
      gallery3dOverlay.setAttribute('aria-hidden', 'true');
    }

    if (window.location.hash === '#3d') {
      try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
    }

    dismissFocusCard();
    document.body.style.overflow = '';

    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  // Cache DOM references
  function cacheDOMElements() {
    gallery3dOverlay = document.getElementById('spatial-3d-gallery');
    canvasContainer = document.getElementById('spatial-3d-canvas-container');
    modeLabel = document.getElementById('spatial-3d-mode-label');
    counterLabel = document.getElementById('spatial-3d-counter');
    spinBtn = document.getElementById('spatial-3d-spin-btn');
    themeBtn = document.getElementById('spatial-3d-theme-btn');
    closeBtn = document.getElementById('spatial-3d-close-btn');

    focusCard = document.getElementById('spatial-3d-focus-card');
    cardId = document.getElementById('spatial-card-id');
    cardWing = document.getElementById('spatial-card-wing');
    cardTitle = document.getElementById('spatial-card-title');
    cardMedium = document.getElementById('spatial-card-medium');
    cardNote = document.getElementById('spatial-card-note');
    cardDetailBtn = document.getElementById('spatial-card-detail-btn');
    cardBackBtn = document.getElementById('spatial-card-back-btn');
    cardDismissBtn = document.getElementById('spatial-card-dismiss-btn');

    setupDOMEyents();
  }

  // Setup DOM Interactions
  function setupDOMEyents() {
    if (closeBtn) closeBtn.addEventListener('click', close3DGallery);

    // Auto-flight toggle in Tunnel
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        state3D.isAutoSpin = !state3D.isAutoSpin;
        spinBtn.classList.toggle('is-spinning', state3D.isAutoSpin);
      });
    }

    // Theme toggle in 3D
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextTheme = state3D.theme === 'dark' ? 'light' : 'dark';
        state3D.theme = nextTheme;
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme_757', nextTheme);
        updateThemeInScene(nextTheme);
      });
    }

    if (cardDismissBtn) cardDismissBtn.addEventListener('click', dismissFocusCard);
    if (cardBackBtn) cardBackBtn.addEventListener('click', dismissFocusCard);

    if (cardDetailBtn) {
      cardDetailBtn.addEventListener('click', () => {
        if (state3D.focusedMesh && state3D.focusedMesh.userData.item) {
          const item = state3D.focusedMesh.userData.item;
          state3D.isDetailModalOpen = true;
          // Open high-res modal ON TOP of 3D without closing the 3D gallery
          if (window.openArtworkModalById) {
            window.openArtworkModalById(item.id);
          }
        }
      });
    }

    // Keyboard Shortcuts inside 3D Tunnel
    window.addEventListener('keydown', (e) => {
      if (!state3D.isOpen) return;

      if (e.key === 'Escape') {
        const modal = document.getElementById('artwork-modal');
        if (modal && modal.open) {
          // Modal handles its own Escape; keep 3D gallery intact
          return;
        }
        if (state3D.focusedMesh) {
          dismissFocusCard();
        } else {
          close3DGallery();
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        state3D.isAutoSpin = !state3D.isAutoSpin;
        if (spinBtn) spinBtn.classList.toggle('is-spinning', state3D.isAutoSpin);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        state3D.targetTunnelYaw += 0.22;
        state3D.lastInteractionTime = Date.now();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        state3D.targetTunnelYaw -= 0.22;
        state3D.lastInteractionTime = Date.now();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        const maxZ = Math.ceil(state3D.meshes.length / 2) * HELIX_SPACING + 6;
        state3D.targetZ = Math.min(maxZ, state3D.targetZ + 4.5);
        state3D.lastInteractionTime = Date.now();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        state3D.targetZ = Math.max(-2, state3D.targetZ - 4.5);
        state3D.lastInteractionTime = Date.now();
      }
    });
  }

  // Load complete collection into Tunnel (ALL 167 ARTWORKS!)
  function rebuildActiveItems() {
    state3D.allItems = window.COLLECTION_DATA || [];
    if (state3D.allItems.length === 0) return;

    // Load full collection unconditionally into the 3D Tunnel
    state3D.activeItems = [...state3D.allItems];

    if (counterLabel) {
      counterLabel.textContent = `${state3D.activeItems.length} LUCRĂRI`;
    }

    buildArtworkMeshes();
  }

  // =========================================================================
  // CELESTIAL FIBONACCI SYMBOLS & SACRED GEOMETRY CANVAS TEXTURES
  // =========================================================================

  // 1. Golden Ratio (Phi) & Astrolabe Sigil
  function createFibonacciPhiCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256;
    const cy = 256;

    ctx.clearRect(0, 0, 512, 512);

    // Glowing outer celestial compass rings
    ctx.strokeStyle = 'rgba(212, 163, 89, 0.85)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 226, 0, Math.PI * 2);
    ctx.stroke();

    // 144 ticks around perimeter (144 is a Fibonacci number!)
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 144; i++) {
      const ang = (i / 144) * Math.PI * 2;
      const r1 = i % 12 === 0 ? 212 : i % 4 === 0 ? 218 : 222;
      const r2 = 226;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
      ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
      ctx.stroke();
    }

    // Glowing Golden Spiral logarithmic curve
    ctx.strokeStyle = '#06b6d4'; // Cybernetic cyan
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    const phi = 1.6180339887;
    const b = Math.log(phi) / (Math.PI / 2);
    for (let t = 0; t <= Math.PI * 3.8; t += 0.04) {
      const r = 2.4 * Math.exp(b * t);
      if (r > 205) break;
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Central Greek Letter Φ (Phi)
    ctx.fillStyle = '#d4a359';
    ctx.font = 'bold 125px "Cinzel", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Φ', cx, cy - 20);

    // Text labels
    ctx.font = 'bold 20px monospace';
    ctx.fillText('φ = 1.6180339887', cx, cy + 85);
    ctx.font = '600 15px monospace';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
    ctx.fillText('(1 + √5) / 2 · SECTIO AUREA', cx, cy + 120);

    return canvas;
  }

  // 2. Sacred Fibonacci Rectangles & Spira Mirabilis
  function createFibonacciRectanglesCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256;
    const cy = 256;

    ctx.clearRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(212, 163, 89, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 235, 0, Math.PI * 2);
    ctx.stroke();

    // Golden Rectangles subdivision centered
    const s = 6.2;
    ctx.save();
    ctx.translate(cx - 30, cy - 10);

    ctx.strokeStyle = 'rgba(212, 163, 89, 0.65)';
    ctx.lineWidth = 1.8;

    const squares = [
      { x: 0, y: 0, w: 21 * s, h: 21 * s },
      { x: 0, y: 21 * s, w: 13 * s, h: 13 * s },
      { x: 13 * s, y: 26 * s, w: 8 * s, h: 8 * s },
      { x: 16 * s, y: 21 * s, w: 5 * s, h: 5 * s }
    ];

    ctx.translate(-10 * s, -14 * s);

    squares.forEach(sq => {
      ctx.strokeRect(sq.x, sq.y, sq.w, sq.h);
    });

    // Glowing Golden Spiral Arc connecting them
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    const phi = 1.6180339887;
    const b = Math.log(phi) / (Math.PI / 2);
    for (let t = 0; t <= Math.PI * 3.5; t += 0.05) {
      const r = 2.8 * Math.exp(b * t);
      if (r > 210) break;
      const px = 14 * s + r * Math.cos(t - 1.2);
      const py = 18 * s + r * Math.sin(t - 1.2);
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.restore();

    ctx.textAlign = 'center';
    ctx.font = '700 22px monospace';
    ctx.fillStyle = '#d4a359';
    ctx.fillText('SPIRA MIRABILIS', cx, cy + 180);
    ctx.font = '600 15px monospace';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
    ctx.fillText('1 · 1 · 2 · 3 · 5 · 8 · 13 · 21 · 34 · 55', cx, cy + 208);

    return canvas;
  }

  // 3. Fibonacci Sequence & Harmonia Universalis Mandala
  function createFibonacciSequenceCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256;
    const cy = 256;

    ctx.clearRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(212, 163, 89, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 235, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 180, 0, Math.PI * 2);
    ctx.stroke();

    // 12-pointed star in center
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
    ctx.lineWidth = 1.6;
    for (let k = 0; k < 3; k++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((k * Math.PI) / 6);
      ctx.strokeRect(-65, -65, 130, 130);
      ctx.restore();
    }

    // Sequence numbers distributed around circle
    const fibNums = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
    ctx.font = 'bold 17px monospace';
    ctx.fillStyle = '#d4a359';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    fibNums.forEach((num, idx) => {
      const ang = (idx / fibNums.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(ang) * 208;
      const y = cy + Math.sin(ang) * 208;
      ctx.fillText(String(num), x, y);
    });

    // Central formula
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Fn = Fn-1 + Fn-2', cx, cy - 10);
    ctx.font = '600 16px monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('HARMONIA UNIVERSALIS', cx, cy + 22);

    return canvas;
  }

  // =========================================================================
  // REAL-TIME PLANAR REFLECTOR (Three.js High-Performance Mirror)
  // =========================================================================
  function createReflectorMesh(geometry, options = {}) {
    const scope = new THREE.Mesh(geometry);
    scope.type = 'Reflector';

    const color = options.color !== undefined ? new THREE.Color(options.color) : new THREE.Color(0x070a12);
    const textureWidth = options.textureWidth || 512;
    const textureHeight = options.textureHeight || 512;
    const clipBias = options.clipBias || 0.003;

    const reflectorPlane = new THREE.Plane();
    const normal = new THREE.Vector3();
    const reflectorWorldPosition = new THREE.Vector3();
    const cameraWorldPosition = new THREE.Vector3();
    const rotationMatrix = new THREE.Matrix4();
    const lookAtPosition = new THREE.Vector3(0, 0, -1);
    const clipPlane = new THREE.Vector4();

    const view = new THREE.Vector3();
    const target = new THREE.Vector3();
    const q = new THREE.Vector4();

    const virtualCamera = new THREE.PerspectiveCamera();

    const renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat
    });

    const shader = {
      uniforms: {
        color: { value: color },
        tDiffuse: { value: renderTarget.texture },
        textureMatrix: { value: new THREE.Matrix4() },
        opacity: { value: options.opacity || 0.82 }
      },
      vertexShader: `
        uniform mat4 textureMatrix;
        varying vec4 vUv;
        void main() {
          vUv = textureMatrix * vec4( position, 1.0 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform sampler2D tDiffuse;
        uniform float opacity;
        varying vec4 vUv;
        void main() {
          vec4 ref = texture2DProj( tDiffuse, vUv );
          // Mix dark obsidian floor tint with vivid reflection of artworks
          vec3 finalCol = mix( color, ref.rgb, 0.65 );
          gl_FragColor = vec4( finalCol, opacity );
        }
      `
    };

    const material = new THREE.ShaderMaterial({
      uniforms: shader.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
      depthWrite: false
    });

    scope.material = material;

    scope.onBeforeRender = function (renderer, scene, camera) {
      reflectorWorldPosition.setFromMatrixPosition(scope.matrixWorld);
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

      rotationMatrix.extractRotation(scope.matrixWorld);

      normal.set(0, 0, 1);
      normal.applyMatrix4(rotationMatrix);

      view.subVectors(reflectorWorldPosition, cameraWorldPosition);

      // Avoid rendering when camera is facing back of reflector
      if (view.dot(normal) > 0) return;

      view.reflect(normal).negate();
      view.add(reflectorWorldPosition);

      rotationMatrix.extractRotation(camera.matrixWorld);

      lookAtPosition.set(0, 0, -1);
      lookAtPosition.applyMatrix4(rotationMatrix);
      lookAtPosition.add(cameraWorldPosition);

      target.subVectors(reflectorWorldPosition, lookAtPosition);
      target.reflect(normal).negate();
      target.add(reflectorWorldPosition);

      virtualCamera.position.copy(view);
      virtualCamera.up.set(0, 1, 0);
      virtualCamera.up.applyMatrix4(rotationMatrix);
      virtualCamera.up.reflect(normal);
      virtualCamera.lookAt(target);

      virtualCamera.far = camera.far;

      virtualCamera.updateMatrixWorld();
      virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

      // Update texture matrix
      material.uniforms.textureMatrix.value.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
      );
      material.uniforms.textureMatrix.value.multiply(virtualCamera.projectionMatrix);
      material.uniforms.textureMatrix.value.multiply(virtualCamera.matrixWorldInverse);
      material.uniforms.textureMatrix.value.multiply(scope.matrixWorld);

      // Oblique near-plane clipping
      reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition);
      reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);

      clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant);

      const projectionMatrix = virtualCamera.projectionMatrix;

      q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
      q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
      q.z = -1.0;
      q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

      clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

      projectionMatrix.elements[2] = clipPlane.x;
      projectionMatrix.elements[6] = clipPlane.y;
      projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias;
      projectionMatrix.elements[14] = clipPlane.w;

      // Render reflection pass
      scope.visible = false;

      const currentRenderTarget = renderer.getRenderTarget();
      const currentXrEnabled = renderer.xr.enabled;
      const currentShadowMapEnabled = renderer.shadowMap.enabled;

      renderer.xr.enabled = false;
      renderer.shadowMap.enabled = false;

      renderer.setRenderTarget(renderTarget);
      renderer.state.buffers.depth.setMask(true);
      if (renderer.autoClear === false) renderer.clear();
      renderer.render(scene, virtualCamera);

      renderer.xr.enabled = currentXrEnabled;
      renderer.shadowMap.enabled = currentShadowMapEnabled;

      renderer.setRenderTarget(currentRenderTarget);

      const viewport = camera.viewport;
      if (viewport !== undefined) {
        renderer.state.viewport(viewport);
      }

      scope.visible = true;
    };

    return scope;
  }

  // =========================================================================
  // INFINITE MIRROR FLOOR & ABYSS DEPTH
  // =========================================================================
  function createInfiniteMirrorFloor() {
    // 1. Planar Obsidian Reflector (Surface mirror)
    const mirrorGeo = new THREE.PlaneGeometry(36, 160, 1, 1);
    infiniteMirrorMesh = createReflectorMesh(mirrorGeo, {
      color: 0x070a12,
      opacity: 0.84,
      textureWidth: 512,
      textureHeight: 512
    });
    infiniteMirrorMesh.rotation.x = -Math.PI / 2;
    infiniteMirrorMesh.position.set(0, -2.2, 0);
    scene.add(infiniteMirrorMesh);

    // 2. Infinite Abyss Tiers (Deep layered light frames descending into the void)
    abyssGroup = new THREE.Group();
    abyssGroup.position.set(0, 0, 0);

    const tiers = 7;
    const abyssPoints = [];
    const len = 150;

    for (let t = 0; t < tiers; t++) {
      const y = -2.6 - t * 2.2; // -2.6, -4.8, -7.0, -9.2, -11.4, -13.6, -15.8
      const hw = 3.2 - t * 0.32; // Tapers inward towards bottom vanishing point

      // Longitudinal left & right rails
      abyssPoints.push(-hw, y, -len / 2, -hw, y, len / 2);
      abyssPoints.push(hw, y, -len / 2, hw, y, len / 2);

      // Transverse crossbars every 10m
      for (let z = -len / 2; z <= len / 2; z += 10) {
        abyssPoints.push(-hw, y, z, hw, y, z);
      }

      // Vertical drop struts every 25m connecting tiers
      if (t < tiers - 1) {
        const nextY = -2.6 - (t + 1) * 2.2;
        const nextHw = 3.2 - (t + 1) * 0.32;
        for (let z = -len / 2; z <= len / 2; z += 25) {
          abyssPoints.push(-hw, y, z, -nextHw, nextY, z);
          abyssPoints.push(hw, y, z, nextHw, nextY, z);
        }
      }
    }

    const abyssGeo = new THREE.BufferGeometry();
    abyssGeo.setAttribute('position', new THREE.Float32BufferAttribute(abyssPoints, 3));
    const abyssMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4, // Neon cyan cybernetic grid
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });
    const abyssLines = new THREE.LineSegments(abyssGeo, abyssMat);
    abyssGroup.add(abyssLines);

    // 3. Glowing surface runway guide beams at x = -2.8 and x = +2.8
    const railPoints = [
      -2.8, -2.18, -len / 2, -2.8, -2.18, len / 2,
       2.8, -2.18, -len / 2,  2.8, -2.18, len / 2
    ];
    const railGeo = new THREE.BufferGeometry();
    railGeo.setAttribute('position', new THREE.Float32BufferAttribute(railPoints, 3));
    const railMat = new THREE.LineBasicMaterial({
      color: 0xd4a359, // Gold laser runway boundary
      transparent: true,
      opacity: 0.85
    });
    const railLines = new THREE.LineSegments(railGeo, railMat);
    abyssGroup.add(railLines);

    scene.add(abyssGroup);
  }

  // =========================================================================
  // CELESTIAL FIBONACCI SKY VAULT
  // =========================================================================
  function createFibonacciSky() {
    skyGroup = new THREE.Group();
    skyGroup.position.set(0, 0, 0);

    // 1. Procedural High-Res Fibonacci Canvas Sigil Textures
    const canvasPhi = createFibonacciPhiCanvas();
    const canvasRect = createFibonacciRectanglesCanvas();
    const canvasSeq = createFibonacciSequenceCanvas();

    const texPhi = new THREE.CanvasTexture(canvasPhi);
    texPhi.encoding = THREE.sRGBEncoding;
    const texRect = new THREE.CanvasTexture(canvasRect);
    texRect.encoding = THREE.sRGBEncoding;
    const texSeq = new THREE.CanvasTexture(canvasSeq);
    texSeq.encoding = THREE.sRGBEncoding;

    const textures = [texPhi, texRect, texSeq];

    // 2. Place 12 Celestial Fibonacci Medallions facing down from the ceiling
    const medallionGeo = new THREE.PlaneGeometry(8.5, 8.5);
    skyMedallions = [];

    // Distribute medallions along the corridor
    for (let k = 0; k < 12; k++) {
      const tex = textures[k % 3];
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(medallionGeo, mat);
      // Height 6.8 (above artworks which top out at 1.25)
      mesh.position.set(0, 6.8, (k - 1) * 38);
      // Face downwards towards viewer on the runway
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.z = (k * 0.45);
      skyGroup.add(mesh);
      skyMedallions.push(mesh);
    }

    // 3. 3D Glowing Golden Spiral Curves (Spira Mirabilis) in the vault
    skySpirals = [];
    const phi = (1 + Math.sqrt(5)) / 2;
    const b = Math.log(phi) / (Math.PI / 2);
    const spiralPoints = [];
    for (let t = 0; t <= Math.PI * 3.8; t += 0.05) {
      const r = 0.5 * Math.exp(b * t);
      spiralPoints.push(new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)));
    }
    const spiralCurveGeo = new THREE.BufferGeometry().setFromPoints(spiralPoints);

    for (let k = 0; k < 8; k++) {
      const spiralMat = new THREE.LineBasicMaterial({
        color: k % 2 === 0 ? 0xd4a359 : 0x06b6d4,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      });
      const spiralLine = new THREE.Line(spiralCurveGeo, spiralMat);
      // Alternating slightly left and right along the sky vault
      const xOffset = k % 2 === 0 ? -3.5 : 3.5;
      spiralLine.position.set(xOffset, 7.8, (k - 1) * 55);
      spiralLine.rotation.x = Math.PI / 2;
      spiralLine.rotation.z = k * 0.8;
      skyGroup.add(spiralLine);
      skySpirals.push(spiralLine);
    }

    // 4. Phyllotaxis (Golden Angle) Starlight Constellation Dome
    const starCount = 280;
    const starPositions = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.508 deg

    for (let i = 1; i <= starCount; i++) {
      const th = i * goldenAngle;
      const r = Math.sqrt(i) * 1.35;
      const y = 8.5 + Math.sin(i * 0.35) * 2.2; // Vault arch
      const z = ((i * 7) % 180) - 90;
      starPositions.push(r * Math.cos(th), y, z);
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xd4a359,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    skyStarsMesh = new THREE.Points(starGeo, starMat);
    skyGroup.add(skyStarsMesh);

    scene.add(skyGroup);
  }

  // Initialize Three.js Scene
  function initThreeScene() {
    container = canvasContainer;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    scene = new THREE.Scene();
    // Atmospheric fog for background only (paintings use fog: false to remain ultra-crisp!)
    scene.fog = new THREE.Fog(0x030406, 30, 110);

    // 2. Camera (FOV 52 for cinematic, wide museum perspective)
    camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);

    // 3. High Performance Renderer with sRGB Output
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // 4. Lights
    ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xd4a359, 0.7);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    pointLight = new THREE.PointLight(0x06b6d4, 1.2, 45);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 5. Infinite Mirror Runway Floor & Deep Abyss
    createInfiniteMirrorFloor();

    // 6. Celestial Fibonacci Sky Vault
    createFibonacciSky();

    // 7. Dust Particles
    createParticles();

    // 7. Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-999, -999);

    // 8. Artworks Group
    artGroup = new THREE.Group();
    scene.add(artGroup);

    rebuildActiveItems();

    setupCanvasInteractions();
    window.addEventListener('resize', onWindowResize);

    updateThemeInScene(state3D.theme);
  }

  // Floating Dust Particles
  function createParticles() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 70;
      positions[i + 1] = (Math.random() - 0.5) * 45;
      positions[i + 2] = (Math.random() - 0.5) * 70;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xd4a359,
      size: 0.22,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
  }

  // Build 3D Artworks with Luxury Museum Frame & Crisp Textures (Front: Artwork, Verso: Artist Portrait)
  function buildArtworkMeshes() {
    // Clear existing meshes
    while (artGroup.children.length > 0) {
      const obj = artGroup.children[0];
      artGroup.remove(obj);
      if (obj.children) {
        while (obj.children.length > 0) {
          const child = obj.children[0];
          obj.remove(child);
          if (child.geometry) child.geometry.dispose();
          if (child.material && child.material !== sharedVersoMaterial && child.material !== frameMat) {
            if (child.material.map && child.material.map !== sharedArtistTexture) child.material.map.dispose();
            child.material.dispose();
          }
        }
      }
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material && obj.material !== sharedVersoMaterial && obj.material !== frameMat) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    }
    state3D.meshes = [];

    const textureLoader = new THREE.TextureLoader();

    // 1. Shared frame shadowbox material
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x14161c,
      roughness: 0.55,
      metalness: 0.65
    });

    // 2. Canonical Artist Portrait for Verso (Rear) of all picture frames
    if (!sharedArtistTexture) {
      sharedArtistTexture = textureLoader.load('data/web-images/ART-0103.webp');
      sharedArtistTexture.encoding = THREE.sRGBEncoding;
      sharedArtistTexture.generateMipmaps = true;
      sharedArtistTexture.minFilter = THREE.LinearMipmapLinearFilter;
      sharedArtistTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    }
    if (!sharedVersoMaterial) {
      sharedVersoMaterial = new THREE.MeshBasicMaterial({
        map: sharedArtistTexture,
        color: 0xffffff,
        side: THREE.FrontSide,
        fog: false // Crucial: Keeps the ink portrait crisp, high-contrast, pure museum paper
      });
    }

    state3D.activeItems.forEach((item, index) => {
      const w = item.width || 1080;
      const h = item.height || 1350;
      const aspect = w / h;

      // Base height 2.5 units
      const planeH = 2.5;
      const planeW = planeH * aspect;

      // Root Artwork Object
      const artworkPivot = new THREE.Group();

      // 1. Front Picture Mesh (artwork)
      const planeGeo = new THREE.PlaneGeometry(planeW, planeH);
      const picMaterial = new THREE.MeshBasicMaterial({
        color: 0x222222,
        side: THREE.FrontSide,
        fog: false // Crucial: Keeps paintings saturated, sharp, and deep black!
      });
      const picMesh = new THREE.Mesh(planeGeo, picMaterial);
      picMesh.position.z = 0.042;
      artworkPivot.add(picMesh);

      // 2. Museum Shadowbox Frame (depth 0.07: front at +0.035, back at -0.035)
      const frameGeo = new THREE.BoxGeometry(planeW + 0.12, planeH + 0.12, 0.07);
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.z = 0;
      artworkPivot.add(frameMesh);

      // 3. Verso Mesh (back face: Canonical Artist Portrait of Mugurel Emanuel Manea)
      // Maintain portrait aspect ratio (1366 / 1710 ~ 0.7988) so the artist's face is never distorted
      const portraitAspect = 1366 / 1710;
      let versoW = planeW;
      let versoH = planeH;
      if (aspect > portraitAspect) {
        versoW = planeH * portraitAspect;
      } else {
        versoH = planeW / portraitAspect;
      }
      const versoGeo = new THREE.PlaneGeometry(versoW, versoH);
      const versoMesh = new THREE.Mesh(versoGeo, sharedVersoMaterial);
      versoMesh.position.z = -0.042;
      versoMesh.rotation.y = Math.PI; // Face backwards toward oncoming viewer from behind
      artworkPivot.add(versoMesh);

      // User data for raycasting & animations
      artworkPivot.userData = {
        item: item,
        index: index,
        picMesh: picMesh,
        versoMesh: versoMesh,
        targetPos: new THREE.Vector3(),
        targetRot: new THREE.Euler(),
        currentScale: 1,
        targetScale: 1
      };

      picMesh.userData.parentPivot = artworkPivot;
      versoMesh.userData.parentPivot = artworkPivot;

      // Load texture with correct sRGB encoding for the artwork
      const thumbUrl = 'data/web-images/' + (item.thumbnail_file || (item.id + '_thumb.webp'));
      textureLoader.load(
        thumbUrl,
        (tex) => {
          tex.encoding = THREE.sRGBEncoding;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
          picMaterial.map = tex;
          picMaterial.color.setHex(0xffffff);
          picMaterial.needsUpdate = true;
        },
        undefined,
        () => {
          // Fallback to full webp
          textureLoader.load('data/web-images/' + item.id + '.webp', (tex) => {
            tex.encoding = THREE.sRGBEncoding;
            picMaterial.map = tex;
            picMaterial.color.setHex(0xffffff);
            picMaterial.needsUpdate = true;
          });
        }
      );

      artGroup.add(artworkPivot);
      state3D.meshes.push(artworkPivot);
    });

    computeLayoutTargets(true);
  }

  // Calculate target positions & rotations for Tunel 3D
  function computeLayoutTargets(instant) {
    const total = state3D.meshes.length;
    if (total === 0) return;

    // Mode: Tunel Biomecanic Z-Axis (Runway Corridor — ALL 167 ARTWORKS!)
    state3D.meshes.forEach((mesh, i) => {
      const isLeft = i % 2 === 0;
      const pairIndex = Math.floor(i / 2);
      const tPos = mesh.userData.targetPos;
      const tRot = mesh.userData.targetRot;

      tPos.x = isLeft ? -HELIX_OFFSET_X : HELIX_OFFSET_X;
      tPos.y = 0; // Pure eye-level alignment
      tPos.z = pairIndex * HELIX_SPACING + 4.5;
      // Inward tilt towards oncoming viewer (front face faces camera looking down +Z)
      const inwardAngle = 0.28; // ~16° tilt towards center runway
      tRot.set(0, isLeft ? (Math.PI - inwardAngle) : (Math.PI + inwardAngle), 0);

      if (instant) {
        mesh.position.copy(tPos);
        mesh.rotation.copy(tRot);
      }
    });
  }

  // Update Theme Colors in WebGL
  function updateThemeInScene(theme) {
    if (!scene) return;

    if (theme === 'light') {
      scene.background = new THREE.Color(0xf7f6f2);
      scene.fog.color.setHex(0xf7f6f2);
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 1.25;
      dirLight.color.setHex(0xb45309);
      pointLight.color.setHex(0x0284c7);
      if (infiniteMirrorMesh && infiniteMirrorMesh.material && infiniteMirrorMesh.material.uniforms && infiniteMirrorMesh.material.uniforms.color) {
        infiniteMirrorMesh.material.uniforms.color.value.setHex(0xd0cfc8);
      }
      if (particlesMesh) {
        particlesMesh.material.color.setHex(0xb45309);
        particlesMesh.material.opacity = 0.35;
      }
    } else {
      scene.background = new THREE.Color(0x030406);
      scene.fog.color.setHex(0x030406);
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 1.1;
      dirLight.color.setHex(0xd4a359);
      pointLight.color.setHex(0x06b6d4);
      if (infiniteMirrorMesh && infiniteMirrorMesh.material && infiniteMirrorMesh.material.uniforms && infiniteMirrorMesh.material.uniforms.color) {
        infiniteMirrorMesh.material.uniforms.color.value.setHex(0x070a12);
      }
      if (particlesMesh) {
        particlesMesh.material.color.setHex(0xd4a359);
        particlesMesh.material.opacity = 0.6;
      }
    }
  }

  // Mouse & Touch Pointer Interactions
  function setupCanvasInteractions() {
    const el = canvasContainer;

    el.addEventListener('pointerdown', (e) => {
      state3D.isDragging = true;
      state3D.dragStartX = e.clientX;
      state3D.dragStartY = e.clientY;
      state3D.lastPointerX = e.clientX;
      state3D.lastPointerY = e.clientY;
      state3D.velocity = 0;
      state3D.lastInteractionTime = Date.now();
    });

    window.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!state3D.isDragging) return;

      const deltaX = e.clientX - state3D.lastPointerX;
      const deltaY = e.clientY - state3D.lastPointerY;
      state3D.lastPointerX = e.clientX;
      state3D.lastPointerY = e.clientY;

      // If user drags while an artwork is focused, smoothly dismiss the card and resume navigation
      if (state3D.focusedMesh) {
        const totalDrag = Math.hypot(e.clientX - state3D.dragStartX, e.clientY - state3D.dragStartY);
        if (totalDrag > 12) {
          dismissFocusCard();
        }
      }

      // Rotire 3D lină și stabilă a privirii în tunel (Yaw & Pitch)
      state3D.targetTunnelYaw += deltaX * 0.0035;
      state3D.targetTunnelPitch = Math.max(-0.35, Math.min(0.35, state3D.targetTunnelPitch + deltaY * 0.002));

      state3D.velocity = deltaX * 0.0035;
      state3D.lastInteractionTime = Date.now();
    });

    window.addEventListener('pointerup', (e) => {
      if (!state3D.isDragging) return;
      state3D.isDragging = false;

      const dist = Math.hypot(e.clientX - state3D.dragStartX, e.clientY - state3D.dragStartY);
      if (dist < 6) {
        handleClickRaycast();
      }
    });

    // Wheel Scroll Navigation along Tunnel Z
    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        state3D.lastInteractionTime = Date.now();

        if (state3D.focusedMesh) {
          dismissFocusCard();
        }

        // Deplasare lină și controlată prin tunel
        state3D.targetZ += e.deltaY * 0.025;
        const maxZ = Math.ceil(state3D.meshes.length / 2) * HELIX_SPACING + 6;
        state3D.targetZ = Math.max(0, Math.min(maxZ, state3D.targetZ));
      },
      { passive: false }
    );
  }

  // Click on Artwork Mesh -> Focus Camera & Open Curatorial HUD
  function handleClickRaycast() {
    raycaster.setFromCamera(mouse, camera);

    const hitTargets = [];
    state3D.meshes.forEach((mesh) => {
      const picMesh = mesh.userData.picMesh;
      if (picMesh) hitTargets.push(picMesh);
      const versoMesh = mesh.userData.versoMesh;
      if (versoMesh) hitTargets.push(versoMesh);
    });

    const intersects = raycaster.intersectObjects(hitTargets, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const pivot = hit.userData.parentPivot;
      if (pivot) {
        if (state3D.focusedMesh === pivot && state3D.focusProgress >= 0.8) {
          // Double-clicking focused artwork opens full high-res detail inspection on top
          state3D.isDetailModalOpen = true;
          if (window.openArtworkModalById && pivot.userData.item) {
            window.openArtworkModalById(pivot.userData.item.id);
          }
        } else {
          focusArtwork(pivot);
        }
      }
    } else {
      if (state3D.focusedMesh) {
        dismissFocusCard();
      }
    }
  }

  // Focus Artwork with Smooth Camera Glide & ZERO TEXT OVERLAY ON ART
  function focusArtwork(pivot) {
    state3D.focusedMesh = pivot;
    state3D.isUnfocusing = false;
    const item = pivot.userData.item;
    if (!item) return;

    if (gallery3dOverlay) {
      gallery3dOverlay.classList.add('is-focused');
    }

    const WING_BADGES = {
      'biomechanical-osteology': 'SALA I',
      'cryptic-totems': 'SALA II',
      'chromatic-expressions': 'SALA III',
      'cybernetic-assemblages': 'SALA IV',
      'monumental-perspectives': 'SALA V'
    };
    const firstCat = (item.categories && item.categories[0]) || '';
    const wingBadge = WING_BADGES[firstCat] || (item.category_name ? item.category_name.split(' ')[0] : 'SALA I');

    if (cardId) cardId.textContent = item.id || 'ART-757';
    if (cardWing) cardWing.textContent = wingBadge;
    if (cardTitle) {
      // If title is just ART-XXXX, display the curatorial category title to avoid duplicate ART ID badge!
      const isGenericId = !item.title || item.title === item.id || /^ART-\d+/i.test(item.title);
      cardTitle.textContent = isGenericId ? (item.category_name || 'Compoziție Biomecanică') : item.title;
    }
    if (cardMedium) {
      const med = (item.medium_hypothesis && item.medium_hypothesis !== 'unknown')
        ? item.medium_hypothesis
        : ((item.medium && item.medium !== 'unknown') ? item.medium : 'Tehnică mixtă pe hârtie');
      const dim = (item.dimensions && item.dimensions !== 'unknown') ? ` · ${item.dimensions}` : '';
      cardMedium.textContent = med + dim;
    }
    if (cardNote) {
      cardNote.textContent = item.curatorial_note || item.critic_note || 'Compoziție din arhiva de anatomie biomecanică a artistului Mugurel Emanuel Manea.';
    }

    if (focusCard) {
      focusCard.classList.add('is-visible');
      focusCard.setAttribute('aria-hidden', 'false');
    }

    state3D.cameraStartPos = camera.position.clone();

    // Get TRUE world transform of the artwork
    const meshWorldPos = new THREE.Vector3();
    pivot.getWorldPosition(meshWorldPos);

    const worldQuat = new THREE.Quaternion();
    pivot.getWorldQuaternion(worldQuat);

    // Normal facing outward from artwork canvas face (in world space)
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuat);
    // Right tangent vector along artwork width (in world space)
    const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(worldQuat);

    // Camera framing:
    // Distance 4.4 gives ample margin so the top of artwork is never covered by top HUD bar
    const camDist = 4.4;
    const isDesktop = window.innerWidth >= 900;
    // On desktop, shift camera right so the artwork is rendered on the left 60% of screen
    // completely clear of the right-docked curatorial card!
    const horizontalShift = isDesktop ? 1.05 : 0;
    // Slight vertical shift: on mobile raise slightly, on desktop keep centered below top bar
    const verticalShift = isDesktop ? -0.1 : 0.45;

    const targetCamPos = meshWorldPos.clone()
      .add(normal.clone().multiplyScalar(camDist))
      .add(rightVec.clone().multiplyScalar(horizontalShift))
      .add(new THREE.Vector3(0, verticalShift, 0));

    state3D.cameraTargetPos = targetCamPos;

    // Start looking along current camera forward vector
    const currentForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    state3D.cameraStartLookAt = camera.position.clone().add(currentForward.multiplyScalar(10));

    // Look slightly to the right of artwork center so artwork sits cleanly in the left 65% of screen
    state3D.cameraTargetLookAt = meshWorldPos.clone().add(rightVec.clone().multiplyScalar(horizontalShift * 0.45));
    state3D.focusProgress = 0;
  }

  // Dismiss Focus Card with smooth glide back
  function dismissFocusCard() {
    if (!state3D.focusedMesh && !state3D.isUnfocusing) return;

    if (gallery3dOverlay) {
      gallery3dOverlay.classList.remove('is-focused');
    }

    if (focusCard) {
      focusCard.classList.remove('is-visible');
      focusCard.setAttribute('aria-hidden', 'true');
    }

    state3D.cameraStartPos = camera.position.clone();
    const currentForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    state3D.cameraStartLookAt = camera.position.clone().add(currentForward.multiplyScalar(10));

    state3D.cameraTargetPos = new THREE.Vector3(0, 0, state3D.currentZ);
    state3D.cameraTargetLookAt = new THREE.Vector3(0, 0, state3D.currentZ + 15);

    state3D.isUnfocusing = true;
    state3D.unfocusProgress = 0;
  }

  // Window Resize
  function onWindowResize() {
    if (!renderer || !camera || !container) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // 60 FPS Animation & Physics Loop
  function startAnimationLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const clock = new THREE.Clock();

    function render() {
      animFrameId = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // 1. Auto-Flight in Tunnel (Activ exclusiv dacă utilizatorul apasă butonul de redare)
      if (
        state3D.isAutoSpin &&
        !state3D.isDragging &&
        !state3D.focusedMesh
      ) {
        const maxZ = Math.ceil(state3D.meshes.length / 2) * HELIX_SPACING + 6;
        if (state3D.targetZ < maxZ) {
          state3D.targetZ += 0.04;
        } else {
          state3D.targetZ = 0;
        }
      }

      // 2. Damping & Lerping along Tunnel Runway
      state3D.currentZ += (state3D.targetZ - state3D.currentZ) * 0.08;
      state3D.tunnelYaw += (state3D.targetTunnelYaw - state3D.tunnelYaw) * 0.08;
      state3D.tunnelPitch += (state3D.targetTunnelPitch - state3D.tunnelPitch) * 0.08;

      // 3. Smooth Mesh Morphing to Layout Targets
      state3D.meshes.forEach((mesh) => {
        const u = mesh.userData;
        mesh.position.lerp(u.targetPos, 0.1);
        mesh.rotation.x += (u.targetRot.x - mesh.rotation.x) * 0.1;
        mesh.rotation.y += (u.targetRot.y - mesh.rotation.y) * 0.1;
        mesh.rotation.z += (u.targetRot.z - mesh.rotation.z) * 0.1;

        u.currentScale += (u.targetScale - u.currentScale) * 0.14;
        mesh.scale.set(u.currentScale, u.currentScale, u.currentScale);
      });

      // 4. Camera Dynamics in Tunnel (Complet stabilă — fără tremur sau înclinare la mișcarea cursorului)
      if (!state3D.focusedMesh && !state3D.isUnfocusing) {
        artGroup.rotation.y = 0;
        camera.position.set(0, 0, state3D.currentZ);

        // Direcția privirii este dictată STRICT de rotația deliberată a utilizatorului (drag / taste)
        const totalYaw = state3D.tunnelYaw;
        const totalPitch = state3D.tunnelPitch;
        const dirX = Math.sin(totalYaw) * Math.cos(totalPitch);
        const dirY = Math.sin(totalPitch);
        const dirZ = Math.cos(totalYaw) * Math.cos(totalPitch);
        camera.lookAt(
          camera.position.x + dirX * 15,
          camera.position.y + dirY * 15,
          camera.position.z + dirZ * 15
        );
      } else if (state3D.isUnfocusing) {
        state3D.unfocusProgress = Math.min(1, state3D.unfocusProgress + delta * 2.8);
        const t = state3D.unfocusProgress;
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        camera.position.lerpVectors(state3D.cameraStartPos, state3D.cameraTargetPos, ease);
        if (state3D.cameraStartLookAt && state3D.cameraTargetLookAt) {
          const currentLook = new THREE.Vector3().lerpVectors(state3D.cameraStartLookAt, state3D.cameraTargetLookAt, ease);
          camera.lookAt(currentLook);
        }
        if (state3D.unfocusProgress >= 1) {
          state3D.isUnfocusing = false;
          state3D.focusedMesh = null;
        }
      } else {
        // Camera smooth ease-in-out to focused painting
        if (state3D.focusProgress < 1 && state3D.cameraStartPos && state3D.cameraTargetPos) {
          state3D.focusProgress = Math.min(1, state3D.focusProgress + delta * 2.4);
          const t = state3D.focusProgress;
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          camera.position.lerpVectors(state3D.cameraStartPos, state3D.cameraTargetPos, ease);
          if (state3D.cameraStartLookAt && state3D.cameraTargetLookAt) {
            const currentLook = new THREE.Vector3().lerpVectors(state3D.cameraStartLookAt, state3D.cameraTargetLookAt, ease);
            camera.lookAt(currentLook);
          }
        } else if (state3D.cameraTargetLookAt) {
          camera.lookAt(state3D.cameraTargetLookAt);
        }
      }

      // 5. Hover Detection via Raycaster (Front & Verso)
      if (!state3D.isDragging && !state3D.focusedMesh) {
        raycaster.setFromCamera(mouse, camera);
        const hitTargets = [];
        state3D.meshes.forEach((mesh) => {
          if (mesh.userData.picMesh) hitTargets.push(mesh.userData.picMesh);
          if (mesh.userData.versoMesh) hitTargets.push(mesh.userData.versoMesh);
        });

        const intersects = raycaster.intersectObjects(hitTargets, false);

        if (intersects.length > 0) {
          const hitPivot = intersects[0].object.userData.parentPivot;
          if (state3D.hoveredMesh !== hitPivot) {
            if (state3D.hoveredMesh) state3D.hoveredMesh.userData.targetScale = 1;
            state3D.hoveredMesh = hitPivot;
            hitPivot.userData.targetScale = 1.02; // Evidențiere discretă, fără deformări bruște
            if (canvasContainer) canvasContainer.classList.add('is-hovering');
          }
        } else {
          if (state3D.hoveredMesh) {
            state3D.hoveredMesh.userData.targetScale = 1;
            state3D.hoveredMesh = null;
            if (canvasContainer) canvasContainer.classList.remove('is-hovering');
          }
        }
      }

      // 6. Infinite Mirror Runway & Deep Abyss follow camera along Z-axis
      if (infiniteMirrorMesh) {
        infiniteMirrorMesh.position.z = camera.position.z;
      }
      if (abyssGroup) {
        abyssGroup.position.z = camera.position.z;
      }

      // 7. Celestial Fibonacci Sky Vault follows camera along Z-axis
      if (skyGroup) {
        skyGroup.position.z = camera.position.z;
      }
      // Gentle cosmic rotation of the celestial Fibonacci symbols
      skyMedallions.forEach((m, idx) => {
        m.rotation.z += (idx % 2 === 0 ? 0.0006 : -0.0006);
      });
      skySpirals.forEach((sp, idx) => {
        sp.rotation.y += (idx % 2 === 0 ? 0.0008 : -0.0008);
      });
      if (skyStarsMesh) {
        skyStarsMesh.rotation.y = time * 0.002;
      }

      // 8. Dust Particles
      if (particlesMesh) {
        particlesMesh.position.z = camera.position.z;
        particlesMesh.rotation.y = time * 0.02;
        particlesMesh.rotation.x = time * 0.01;
      }

      // 9. Iluminare stabilă de muzeu (fără oscilații generate de cursor)
      if (pointLight) {
        pointLight.position.set(camera.position.x, camera.position.y + 1.2, camera.position.z + 2.0);
      }
      if (dirLight) {
        dirLight.position.set(camera.position.x, camera.position.y + 12, camera.position.z + 5);
      }

      renderer.render(scene, camera);
    }

    render();
  }

  // Export public methods
  window.openSpatial3DGallery = open3DGallery;
  window.closeSpatial3DGallery = close3DGallery;

  // Sync 3D view when returning from modal or switching items in modal
  window.sync3DToArtworkId = function (artId) {
    if (!state3D.isOpen) return;
    state3D.isDetailModalOpen = false;
    state3D.lastInteractionTime = Date.now();
    const mesh = state3D.meshes.find((m) => m.userData && m.userData.item && m.userData.item.id === artId);
    if (mesh) {
      focusArtwork(mesh);
    }
  };

  window.onCloseDetailModalFrom3D = function () {
    state3D.isDetailModalOpen = false;
    state3D.lastInteractionTime = Date.now();
    if (state3D.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  };

  // Init trigger on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrigger);
  } else {
    initTrigger();
  }
})();
