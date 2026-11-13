// gallery-3d.js — 3D Spatial Modern Photo Gallery Engine for 757
// Luxury Biomechanical Surrealism WebGL Experience via Three.js
(function () {
  'use strict';

  // State Management
  const state3D = {
    isOpen: false,
    initialized: false,
    mode: 'cylinder', // 'cylinder', 'helix', 'wall'
    items: [],
    meshes: [],
    currentAngle: 0,
    targetAngle: 0,
    targetZ: 0,
    currentZ: 0,
    targetY: 0,
    currentY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    velocity: 0,
    isAutoSpin: true,
    lastInteractionTime: Date.now(),
    hoveredMesh: null,
    focusedMesh: null,
    cameraStartPos: null,
    cameraTargetPos: null,
    focusProgress: 1, // 1 = fully stationary
    theme: 'dark'
  };

  // Three.js References
  let scene, camera, renderer, container;
  let artGroup, particlesMesh, gridFloor;
  let ambientLight, dirLight, pointLight;
  let raycaster, mouse;
  let animFrameId = null;

  // Layout Configuration
  const CYLINDER_RADIUS = 13.5;
  const HELIX_SPACING = 3.6;
  const WALL_COLUMNS = 12;

  // DOM Elements
  let gallery3dOverlay, canvasContainer;
  let modeLabel, modeBtns, spinBtn, themeBtn, closeBtn;
  let focusCard, cardId, cardWing, cardTitle, cardMedium, cardNote, cardDetailBtn, cardBackBtn, cardDismissBtn;

  // Wait for DOM to wire up trigger button
  function initTrigger() {
    const triggerBtn = document.getElementById('gallery-3d-toggle');
    if (!triggerBtn) return;

    triggerBtn.addEventListener('click', () => {
      open3DGallery();
    });

    // Global shortcut: press '3' on keyboard to open 3D gallery
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '3' && !state3D.isOpen) {
        e.preventDefault();
        open3DGallery();
      }
    });
  }

  // Open the 3D Gallery
  function open3DGallery() {
    if (state3D.isOpen) return;
    state3D.isOpen = true;

    if (!gallery3dOverlay) {
      cacheDOMElements();
    }

    if (gallery3dOverlay) {
      gallery3dOverlay.classList.add('is-active');
      gallery3dOverlay.setAttribute('aria-hidden', 'false');
    }

    // Disable main body scroll
    document.body.style.overflow = 'hidden';

    // Synchronize theme with main page
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    state3D.theme = currentTheme;

    // Initialize WebGL scene if not already done
    if (!state3D.initialized) {
      if (typeof THREE === 'undefined') {
        console.warn('Three.js is still loading. Retrying in 100ms...');
        setTimeout(open3DGallery, 100);
        return;
      }
      initThreeScene();
      state3D.initialized = true;
    } else {
      updateThemeInScene(state3D.theme);
      onWindowResize();
    }

    // Start render loop
    state3D.lastInteractionTime = Date.now();
    startAnimationLoop();
  }

  // Close the 3D Gallery
  function close3DGallery() {
    if (!state3D.isOpen) return;
    state3D.isOpen = false;

    if (gallery3dOverlay) {
      gallery3dOverlay.classList.remove('is-active');
      gallery3dOverlay.setAttribute('aria-hidden', 'true');
    }

    dismissFocusCard();
    document.body.style.overflow = '';

    // Stop render loop to save GPU
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
    modeBtns = document.querySelectorAll('.spatial-mode-btn');
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

  // Bind HUD DOM Events
  function setupDOMEyents() {
    if (closeBtn) closeBtn.addEventListener('click', close3DGallery);

    if (modeBtns) {
      modeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const newMode = btn.getAttribute('data-mode');
          switchLayoutMode(newMode);
        });
      });
    }

    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        state3D.isAutoSpin = !state3D.isAutoSpin;
        spinBtn.classList.toggle('is-spinning', state3D.isAutoSpin);
      });
      spinBtn.classList.add('is-spinning');
    }

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
          close3DGallery();
          // Open main detail modal
          if (window.openArtworkModalById) {
            window.openArtworkModalById(item.id);
          }
        }
      });
    }

    // Keyboard Shortcuts inside 3D Gallery
    window.addEventListener('keydown', (e) => {
      if (!state3D.isOpen) return;

      if (e.key === 'Escape') {
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
        state3D.targetAngle += 0.2;
        state3D.lastInteractionTime = Date.now();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        state3D.targetAngle -= 0.2;
        state3D.lastInteractionTime = Date.now();
      } else if (e.key === '1') {
        switchLayoutMode('cylinder');
      } else if (e.key === '2') {
        switchLayoutMode('helix');
      } else if (e.key === '3') {
        switchLayoutMode('wall');
      }
    });
  }

  // Switch Layout Modes with Smooth Interpolation
  function switchLayoutMode(newMode) {
    if (state3D.mode === newMode) return;
    state3D.mode = newMode;

    if (modeBtns) {
      modeBtns.forEach((btn) => {
        btn.classList.toggle('is-active', btn.getAttribute('data-mode') === newMode);
      });
    }

    if (modeLabel) {
      const labels = {
        cylinder: 'INEL PANORAMIC 360°',
        helix: 'TUNEL BIOMECANIC Z-AXIS',
        wall: 'PERETE CURBAT MATRIX'
      };
      modeLabel.textContent = labels[newMode] || 'GALERIE 3D';
    }

    dismissFocusCard();
    computeLayoutTargets();
  }

  // Initialize Three.js WebGL Scene
  function initThreeScene() {
    container = canvasContainer;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Fog
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040507, 0.018);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (renderer.outputColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if (renderer.outputEncoding) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }
    container.appendChild(renderer.domElement);

    // 4. Lights
    ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xd4a359, 0.8);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    pointLight = new THREE.PointLight(0x06b6d4, 1.2, 35);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 5. Specular Ground Plane
    const gridGeo = new THREE.PlaneGeometry(160, 160, 40, 40);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x111622,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    gridFloor = new THREE.Mesh(gridGeo, gridMat);
    gridFloor.rotation.x = -Math.PI / 2;
    gridFloor.position.y = -6.5;
    scene.add(gridFloor);

    // 6. Dust Particles
    createParticles();

    // 7. Raycasting & Mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-999, -999);

    // 8. Artwork Group
    artGroup = new THREE.Group();
    scene.add(artGroup);

    // Load and build artworks
    buildArtworkMeshes();

    // Listeners
    setupCanvasInteractions();
    window.addEventListener('resize', onWindowResize);

    updateThemeInScene(state3D.theme);
  }

  // Floating Atmospheric Dust Particles
  function createParticles() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 50;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xd4a359,
      size: 0.18,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
  }

  // Build 3D Artworks from Master Dataset
  function buildArtworkMeshes() {
    state3D.items = window.COLLECTION_DATA || [];
    if (!state3D.items || state3D.items.length === 0) return;

    const textureLoader = new THREE.TextureLoader();

    // Reusable materials
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x14161d,
      roughness: 0.4,
      metalness: 0.7
    });

    state3D.items.forEach((item, index) => {
      // Determine aspect ratio
      const w = item.width || 1080;
      const h = item.height || 1350;
      const aspect = w / h;

      // Base dimension: height ~ 2.8 units
      const planeH = 2.8;
      const planeW = planeH * aspect;

      // 1. Picture Mesh
      const planeGeo = new THREE.PlaneGeometry(planeW, planeH);
      const picMaterial = new THREE.MeshBasicMaterial({
        color: 0x222222,
        side: THREE.DoubleSide
      });

      const picMesh = new THREE.Mesh(planeGeo, picMaterial);
      picMesh.userData = {
        item: item,
        index: index,
        textureLoaded: false,
        targetPos: new THREE.Vector3(),
        targetRot: new THREE.Euler(),
        currentScale: 1,
        targetScale: 1
      };

      // 2. Beveled Backing / Frame
      const frameGeo = new THREE.PlaneGeometry(planeW + 0.16, planeH + 0.16);
      const frameMesh = new THREE.Mesh(frameGeo, frameMaterial);
      frameMesh.position.z = -0.02;
      picMesh.add(frameMesh);

      // 3. Lazy texture loading
      const thumbUrl = 'data/web-images/' + (item.thumbnail_file || (item.id + '_thumb.webp'));
      textureLoader.load(
        thumbUrl,
        (tex) => {
          if (tex.colorSpace) tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          picMaterial.map = tex;
          picMaterial.color.setHex(0xffffff);
          picMaterial.needsUpdate = true;
          picMesh.userData.textureLoaded = true;
        },
        undefined,
        () => {
          // Fallback to web-images full webp if thumb fails
          textureLoader.load('data/web-images/' + item.id + '.webp', (tex) => {
            picMaterial.map = tex;
            picMaterial.color.setHex(0xffffff);
            picMaterial.needsUpdate = true;
          });
        }
      );

      artGroup.add(picMesh);
      state3D.meshes.push(picMesh);
    });

    computeLayoutTargets(true);
  }

  // Calculate target positions and rotations for each layout
  function computeLayoutTargets(instant) {
    const total = state3D.meshes.length;
    if (total === 0) return;

    state3D.meshes.forEach((mesh, i) => {
      const tPos = mesh.userData.targetPos;
      const tRot = mesh.userData.targetRot;

      if (state3D.mode === 'cylinder') {
        // Mode 1: Cylindrical Ring Carousel
        const angle = (i / total) * Math.PI * 2;
        tPos.x = Math.sin(angle) * CYLINDER_RADIUS;
        tPos.z = Math.cos(angle) * CYLINDER_RADIUS;
        tPos.y = (i % 2 === 0 ? 0.3 : -0.3); // subtle rhythmic stagger
        tRot.set(0, angle + Math.PI, 0); // Face the center camera
      } else if (state3D.mode === 'helix') {
        // Mode 2: Biomechanical Corridor / Spinal Tunnel
        const side = (i % 2 === 0 ? -1 : 1);
        tPos.x = side * 4.6;
        tPos.y = Math.sin(i * 0.4) * 1.6;
        tPos.z = (i - total / 2) * HELIX_SPACING;
        tRot.set(0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0); // Face inward towards runway
      } else if (state3D.mode === 'wall') {
        // Mode 3: Curved Matrix Wall
        const row = i % 3; // 3 tiers
        const col = Math.floor(i / 3);
        const colAngle = ((col - total / 6) / total) * Math.PI * 1.5;
        const r = 16;
        tPos.x = Math.sin(colAngle) * r;
        tPos.z = Math.cos(colAngle) * r - 5;
        tPos.y = (row - 1) * 3.4;
        tRot.set(0, colAngle + Math.PI, 0);
      }

      if (instant) {
        mesh.position.copy(tPos);
        mesh.rotation.copy(tRot);
      }
    });

    if (instant) {
      if (state3D.mode === 'cylinder') {
        camera.position.set(0, 0, 0);
      } else if (state3D.mode === 'helix') {
        camera.position.set(0, 0, -20);
      } else if (state3D.mode === 'wall') {
        camera.position.set(0, 0, 0);
      }
    }
  }

  // Update Theme Palette in 3D Scene
  function updateThemeInScene(theme) {
    if (!scene) return;

    if (theme === 'light') {
      scene.background = new THREE.Color(0xf7f6f2);
      scene.fog.color.setHex(0xf7f6f2);
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 1.2;
      dirLight.color.setHex(0xb45309);
      pointLight.color.setHex(0x0284c7);
      if (gridFloor) {
        gridFloor.material.color.setHex(0xcccccc);
        gridFloor.material.opacity = 0.25;
      }
      if (particlesMesh) {
        particlesMesh.material.color.setHex(0xb45309);
        particlesMesh.material.opacity = 0.35;
      }
    } else {
      scene.background = new THREE.Color(0x040507);
      scene.fog.color.setHex(0x040507);
      ambientLight.color.setHex(0xffffff);
      ambientLight.intensity = 0.9;
      dirLight.color.setHex(0xd4a359);
      pointLight.color.setHex(0x06b6d4);
      if (gridFloor) {
        gridFloor.material.color.setHex(0x111622);
        gridFloor.material.opacity = 0.15;
      }
      if (particlesMesh) {
        particlesMesh.material.color.setHex(0xd4a359);
        particlesMesh.material.opacity = 0.55;
      }
    }
  }

  // Canvas Mouse & Touch Interactions
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
      // Raycasting coordinates
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!state3D.isDragging) return;

      const deltaX = e.clientX - state3D.lastPointerX;
      const deltaY = e.clientY - state3D.lastPointerY;
      state3D.lastPointerX = e.clientX;
      state3D.lastPointerY = e.clientY;

      if (state3D.mode === 'cylinder' || state3D.mode === 'wall') {
        state3D.targetAngle += deltaX * 0.0035;
        state3D.targetY = Math.max(-2, Math.min(2, state3D.targetY + deltaY * 0.005));
      } else if (state3D.mode === 'helix') {
        state3D.targetZ += deltaY * 0.08 + deltaX * 0.04;
      }

      state3D.velocity = deltaX * 0.0035;
      state3D.lastInteractionTime = Date.now();
    });

    window.addEventListener('pointerup', (e) => {
      if (!state3D.isDragging) return;
      state3D.isDragging = false;

      // Click detection threshold
      const dist = Math.hypot(e.clientX - state3D.dragStartX, e.clientY - state3D.dragStartY);
      if (dist < 6) {
        handleClickRaycast();
      }
    });

    // Mouse Wheel / Trackpad Scroll
    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        state3D.lastInteractionTime = Date.now();

        if (state3D.mode === 'cylinder' || state3D.mode === 'wall') {
          state3D.targetAngle -= e.deltaY * 0.0015;
          state3D.targetAngle -= e.deltaX * 0.0015;
        } else if (state3D.mode === 'helix') {
          state3D.targetZ -= e.deltaY * 0.05;
        }
      },
      { passive: false }
    );
  }

  // Click on Artwork Mesh -> Focus Camera & Display HUD Card
  function handleClickRaycast() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(state3D.meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      focusArtwork(hit);
    } else {
      if (state3D.focusedMesh) {
        dismissFocusCard();
      }
    }
  }

  // Focus Artwork with Smooth Camera Translation
  function focusArtwork(mesh) {
    state3D.focusedMesh = mesh;
    const item = mesh.userData.item;
    if (!item) return;

    // Fill Focus Card Metadata
    if (cardId) cardId.textContent = item.id || 'ART-757';
    if (cardWing) cardWing.textContent = item.category_name || 'SALA I';
    if (cardTitle) cardTitle.textContent = item.title || 'Fără titlu';
    if (cardMedium) {
      cardMedium.textContent = (item.medium || 'Tehnică mixtă') + (item.dimensions ? ' · ' + item.dimensions : '');
    }
    if (cardNote) {
      cardNote.textContent = item.curatorial_note || item.critic_note || 'Compoziție din arhiva de anatomie biomecanică.';
    }

    if (focusCard) {
      focusCard.classList.add('is-visible');
      focusCard.setAttribute('aria-hidden', 'false');
    }

    // Set camera animation towards front of mesh
    state3D.cameraStartPos = camera.position.clone();
    const meshWorldPos = new THREE.Vector3();
    mesh.getWorldPosition(meshWorldPos);

    // Compute normal direction facing outward
    const normal = new THREE.Vector3(0, 0, 1).applyEuler(mesh.rotation);
    const targetCamPos = meshWorldPos.clone().add(normal.multiplyScalar(3.2));

    state3D.cameraTargetPos = targetCamPos;
    state3D.focusProgress = 0;
  }

  // Dismiss Focus Card & Return Camera
  function dismissFocusCard() {
    if (!state3D.focusedMesh) return;
    state3D.focusedMesh = null;

    if (focusCard) {
      focusCard.classList.remove('is-visible');
      focusCard.setAttribute('aria-hidden', 'true');
    }

    state3D.cameraStartPos = camera.position.clone();
    state3D.cameraTargetPos = new THREE.Vector3(0, 0, 0);
    state3D.focusProgress = 0;
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

  // Main 60 FPS Render Loop
  function startAnimationLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const clock = new THREE.Clock();

    function render() {
      animFrameId = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // 1. Idle Auto-Spin Logic
      if (
        state3D.isAutoSpin &&
        !state3D.isDragging &&
        !state3D.focusedMesh &&
        Date.now() - state3D.lastInteractionTime > 2200
      ) {
        state3D.targetAngle -= 0.0014;
      }

      // 2. Physics & Damping (Lerping)
      state3D.currentAngle += (state3D.targetAngle - state3D.currentAngle) * 0.08;
      state3D.currentZ += (state3D.targetZ - state3D.currentZ) * 0.08;
      state3D.currentY += (state3D.targetY - state3D.currentY) * 0.08;

      // 3. Artwork Mesh Positions & Rotations Morphing
      state3D.meshes.forEach((mesh) => {
        const u = mesh.userData;
        mesh.position.lerp(u.targetPos, 0.08);

        // Smooth rotation slerp / lerp
        mesh.rotation.x += (u.targetRot.x - mesh.rotation.x) * 0.08;
        mesh.rotation.y += (u.targetRot.y - mesh.rotation.y) * 0.08;
        mesh.rotation.z += (u.targetRot.z - mesh.rotation.z) * 0.08;

        // Hover scale lerp
        u.currentScale += (u.targetScale - u.currentScale) * 0.12;
        mesh.scale.set(u.currentScale, u.currentScale, u.currentScale);
      });

      // 4. Group Rotation & Camera Dynamics
      if (!state3D.focusedMesh) {
        if (state3D.mode === 'cylinder' || state3D.mode === 'wall') {
          artGroup.rotation.y = state3D.currentAngle;
          camera.position.y = state3D.currentY;
          // Mouse parallax
          camera.rotation.x = mouse.y * 0.06;
          camera.rotation.y = -mouse.x * 0.06;
        } else if (state3D.mode === 'helix') {
          artGroup.rotation.y = 0;
          camera.position.z = state3D.currentZ;
          camera.position.y = Math.sin(state3D.currentZ * 0.1) * 0.6;
        }
      } else {
        // Camera smooth fly-to transition
        if (state3D.focusProgress < 1 && state3D.cameraStartPos && state3D.cameraTargetPos) {
          state3D.focusProgress = Math.min(1, state3D.focusProgress + delta * 2.2);
          // Ease in-out cubic
          const t = state3D.focusProgress;
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          camera.position.lerpVectors(state3D.cameraStartPos, state3D.cameraTargetPos, ease);
          camera.lookAt(state3D.focusedMesh.position);
        }
      }

      // 5. Hover Detection via Raycaster
      if (!state3D.isDragging && !state3D.focusedMesh) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(state3D.meshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (state3D.hoveredMesh !== hit) {
            if (state3D.hoveredMesh) state3D.hoveredMesh.userData.targetScale = 1;
            state3D.hoveredMesh = hit;
            hit.userData.targetScale = 1.08;
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

      // 6. Dust Particle Drift
      if (particlesMesh) {
        particlesMesh.rotation.y = time * 0.03;
        particlesMesh.rotation.x = time * 0.015;
      }

      // 7. Dynamic Point Light following cursor
      if (pointLight) {
        pointLight.position.x = mouse.x * 6;
        pointLight.position.y = mouse.y * 6;
      }

      renderer.render(scene, camera);
    }

    render();
  }

  // Export public bridge for external triggers
  window.openSpatial3DGallery = open3DGallery;
  window.closeSpatial3DGallery = close3DGallery;

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrigger);
  } else {
    initTrigger();
  }
})();
