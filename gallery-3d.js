// gallery-3d.js — 3D Spatial Modern Photo Gallery Engine for 757
// Luxury Biomechanical Surrealism WebGL Experience via Three.js
(function () {
  'use strict';

  // State Management
  const state3D = {
    isOpen: false,
    initialized: false,
    mode: 'cylinder', // 'cylinder', 'helix', 'wall'
    activeWing: 'all', // 'all', 'biomechanical-osteology', etc.
    allItems: [],
    activeItems: [],
    meshes: [],
    // Cylinder Kinematics
    currentAngle: 0,
    targetAngle: 0,
    currentCylinderY: 0,
    targetCylinderY: 0,
    // Helix / Tunnel Kinematics
    currentZ: 0,
    targetZ: 0,
    tunnelYaw: 0,
    targetTunnelYaw: 0,
    tunnelPitch: 0,
    targetTunnelPitch: 0,
    // Wall Kinematics
    wallPanX: 0,
    targetWallPanX: 0,
    wallPanY: 0,
    targetWallPanY: 0,
    wallZoomZ: 14.0,
    targetWallZoomZ: 14.0,
    // Pointer Drag Physics
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    velocity: 0,
    isAutoSpin: true,
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
    theme: 'dark'
  };

  // Three.js References
  let scene, camera, renderer, container;
  let artGroup, particlesMesh, gridFloor;
  let ambientLight, dirLight, pointLight;
  let raycaster, mouse;
  let animFrameId = null;

  // Geometry Constants
  const CYLINDER_RADIUS = 22.0;
  const HELIX_SPACING = 5.0;
  const HELIX_OFFSET_X = 3.3;

  // DOM Elements
  let gallery3dOverlay, canvasContainer;
  let modeLabel, counterLabel, modeBtns, wingBtns, spinBtn, themeBtn, closeBtn;
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
  }

  // Open 3D Spatial Gallery
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
    modeBtns = document.querySelectorAll('.spatial-mode-btn');
    wingBtns = document.querySelectorAll('.spatial-wing-btn');
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

    // Layout switcher
    if (modeBtns) {
      modeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const newMode = btn.getAttribute('data-mode');
          switchLayoutMode(newMode);
        });
      });
    }

    // Room / Wing Filter
    if (wingBtns) {
      wingBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const wing = btn.getAttribute('data-wing');
          switchWingFilter(wing);
        });
      });
    }

    // Auto-spin toggle
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        state3D.isAutoSpin = !state3D.isAutoSpin;
        spinBtn.classList.toggle('is-spinning', state3D.isAutoSpin);
      });
      spinBtn.classList.add('is-spinning');
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
          close3DGallery();
          if (window.openArtworkModalById) {
            window.openArtworkModalById(item.id);
          }
        }
      });
    }

    // Keyboard Shortcuts inside 3D
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
        if (state3D.mode === 'cylinder') state3D.targetAngle += 0.22;
        if (state3D.mode === 'helix') state3D.targetTunnelYaw += 0.22;
        if (state3D.mode === 'wall') state3D.targetWallPanX -= 2.2;
        state3D.lastInteractionTime = Date.now();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (state3D.mode === 'cylinder') state3D.targetAngle -= 0.22;
        if (state3D.mode === 'helix') state3D.targetTunnelYaw -= 0.22;
        if (state3D.mode === 'wall') state3D.targetWallPanX += 2.2;
        state3D.lastInteractionTime = Date.now();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (state3D.mode === 'cylinder') state3D.targetCylinderY = Math.min(5.5, state3D.targetCylinderY + 1.2);
        if (state3D.mode === 'helix') state3D.targetZ += 4.5;
        if (state3D.mode === 'wall') state3D.targetWallPanY -= 1.8;
        state3D.lastInteractionTime = Date.now();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (state3D.mode === 'cylinder') state3D.targetCylinderY = Math.max(-5.5, state3D.targetCylinderY - 1.2);
        if (state3D.mode === 'helix') state3D.targetZ -= 4.5;
        if (state3D.mode === 'wall') state3D.targetWallPanY += 1.8;
        state3D.lastInteractionTime = Date.now();
      }
    });
  }

  // Filter artworks by wing and rebuild 3D set
  function switchWingFilter(wingId) {
    if (state3D.activeWing === wingId) return;
    state3D.activeWing = wingId;

    if (wingBtns) {
      wingBtns.forEach((btn) => {
        btn.classList.toggle('is-active', btn.getAttribute('data-wing') === wingId);
      });
    }

    dismissFocusCard();
    rebuildActiveItems();
  }

  // Filter master items into active set (LOAD ALL 167 ARTWORKS!)
  function rebuildActiveItems() {
    state3D.allItems = window.COLLECTION_DATA || [];
    if (state3D.allItems.length === 0) return;

    if (state3D.activeWing === 'all') {
      // LOAD ALL 167 ARTWORKS!
      state3D.activeItems = [...state3D.allItems];
    } else {
      const filtered = state3D.allItems.filter((it) => it.categories && it.categories.includes(state3D.activeWing));
      state3D.activeItems = filtered.length > 0 ? filtered : [...state3D.allItems];
    }

    if (counterLabel) {
      counterLabel.textContent = `${state3D.activeItems.length} LUCRĂRI`;
    }

    buildArtworkMeshes();
  }

  // Switch Layout Modes
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
        wall: 'PERETE MATRIX'
      };
      modeLabel.textContent = labels[newMode] || 'GALERIE 3D';
    }

    dismissFocusCard();

    // Reset camera position and group orientation cleanly per mode
    if (newMode === 'cylinder') {
      camera.position.set(0, 0, 0);
      camera.rotation.set(0, 0, 0);
      artGroup.position.set(0, 0, 0);
      artGroup.rotation.set(0, 0, 0);
      state3D.currentAngle = 0;
      state3D.targetAngle = 0;
      state3D.currentCylinderY = 0;
      state3D.targetCylinderY = 0;
    } else if (newMode === 'helix') {
      camera.position.set(0, 0, 0);
      camera.rotation.set(0, 0, 0);
      artGroup.position.set(0, 0, 0);
      artGroup.rotation.set(0, 0, 0);
      state3D.currentZ = 0;
      state3D.targetZ = 0;
      state3D.tunnelYaw = 0;
      state3D.targetTunnelYaw = 0;
      state3D.tunnelPitch = 0;
      state3D.targetTunnelPitch = 0;
    } else if (newMode === 'wall') {
      camera.position.set(0, 0, 14.0);
      camera.rotation.set(0, 0, 0);
      artGroup.position.set(0, 0, 0);
      artGroup.rotation.set(0, 0, 0);
      state3D.wallPanX = 0;
      state3D.targetWallPanX = 0;
      state3D.wallPanY = 0;
      state3D.targetWallPanY = 0;
      state3D.wallZoomZ = 14.0;
      state3D.targetWallZoomZ = 14.0;
    }

    computeLayoutTargets();
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

    // 5. Specular Ground Plane
    const gridGeo = new THREE.PlaneGeometry(240, 240, 48, 48);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x0f141e,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    gridFloor = new THREE.Mesh(gridGeo, gridMat);
    gridFloor.rotation.x = -Math.PI / 2;
    gridFloor.position.y = -8.5;
    scene.add(gridFloor);

    // 6. Dust Particles
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

  // Build 3D Artworks with Luxury Museum Frame & Crisp Textures
  function buildArtworkMeshes() {
    // Clear existing meshes
    while (artGroup.children.length > 0) {
      const obj = artGroup.children[0];
      artGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    }
    state3D.meshes = [];

    const textureLoader = new THREE.TextureLoader();

    // Shared frame shadowbox material
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x14161c,
      roughness: 0.55,
      metalness: 0.65
    });

    state3D.activeItems.forEach((item, index) => {
      const w = item.width || 1080;
      const h = item.height || 1350;
      const aspect = w / h;

      // Base height 2.5 units
      const planeH = 2.5;
      const planeW = planeH * aspect;

      // Root Artwork Object
      const artworkPivot = new THREE.Group();

      // 1. Picture Mesh (fog: false ensures textures are NEVER washed out or hazy!)
      const planeGeo = new THREE.PlaneGeometry(planeW, planeH);
      const picMaterial = new THREE.MeshBasicMaterial({
        color: 0x222222,
        side: THREE.FrontSide,
        fog: false // Crucial: Keeps paintings saturated, sharp, and deep black!
      });
      const picMesh = new THREE.Mesh(planeGeo, picMaterial);
      picMesh.position.z = 0.04;
      artworkPivot.add(picMesh);

      // 2. Museum Shadowbox Frame (precise depth, zero clipping)
      const frameGeo = new THREE.BoxGeometry(planeW + 0.12, planeH + 0.12, 0.07);
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.z = 0;
      artworkPivot.add(frameMesh);

      // User data for raycasting & animations
      artworkPivot.userData = {
        item: item,
        index: index,
        picMesh: picMesh,
        targetPos: new THREE.Vector3(),
        targetRot: new THREE.Euler(),
        currentScale: 1,
        targetScale: 1
      };

      // Load texture with correct sRGB encoding
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
      picMesh.userData.parentPivot = artworkPivot;
      state3D.meshes.push(artworkPivot);
    });

    computeLayoutTargets(true);
  }

  // Calculate target positions & rotations for the active layout mode
  function computeLayoutTargets(instant) {
    const total = state3D.meshes.length;
    if (total === 0) return;

    if (state3D.mode === 'cylinder') {
      // Mode 1: Inel 360° — Grand 5-Tier Rotunda (ALL 167 ARTWORKS, ZERO OVERLAP!)
      const rows = 5;
      const itemsPerRow = Math.ceil(total / rows);
      const rad = CYLINDER_RADIUS;

      state3D.meshes.forEach((mesh, i) => {
        const row = i % rows; // 0, 1, 2, 3, 4
        const col = Math.floor(i / rows);
        const angle = (col / itemsPerRow) * Math.PI * 2;

        const tPos = mesh.userData.targetPos;
        const tRot = mesh.userData.targetRot;

        tPos.x = Math.sin(angle) * rad;
        tPos.z = Math.cos(angle) * rad;
        tPos.y = (row - 2) * 3.3; // -6.6, -3.3, 0, +3.3, +6.6
        tRot.set(0, angle + Math.PI, 0); // Face inward towards center

        if (instant) {
          mesh.position.copy(tPos);
          mesh.rotation.copy(tRot);
        }
      });
    } else if (state3D.mode === 'helix') {
      // Mode 2: Tunel Z — Runway Corridor along Z axis (ALL 167 ARTWORKS!)
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
    } else if (state3D.mode === 'wall') {
      // Mode 3: Perete Matrix — 5-Tier Curved Floating Wall (ALL 167 ARTWORKS!)
      const rows = 5;
      const totalCols = Math.ceil(total / rows);

      state3D.meshes.forEach((mesh, i) => {
        const row = i % rows;
        const col = Math.floor(i / rows);
        const tPos = mesh.userData.targetPos;
        const tRot = mesh.userData.targetRot;

        const colOffset = (col - (totalCols - 1) / 2) * 2.85;
        tPos.x = colOffset;
        tPos.y = (2 - row) * 3.35; // 5 rows centered around 0
        tPos.z = -Math.pow(colOffset / 20, 2) * 2.2;
        tRot.set(0, -colOffset * 0.02, 0);

        if (instant) {
          mesh.position.copy(tPos);
          mesh.rotation.copy(tRot);
        }
      });
    }
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
      if (gridFloor) {
        gridFloor.material.color.setHex(0xd0cfc8);
        gridFloor.material.opacity = 0.35;
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
      if (gridFloor) {
        gridFloor.material.color.setHex(0x0f141e);
        gridFloor.material.opacity = 0.22;
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

      if (state3D.mode === 'cylinder') {
        state3D.targetAngle += deltaX * 0.0035;
        // Drag vertical glisează între etaje
        state3D.targetCylinderY = Math.max(-5.5, Math.min(5.5, state3D.targetCylinderY + deltaY * 0.015));
      } else if (state3D.mode === 'helix') {
        // Rotire 3D completă (Yaw): drag orizontal rotește privirea spre stânga/dreapta
        state3D.targetTunnelYaw += deltaX * 0.005;
        // Înclinare verticală (Pitch) și deplasare lină de-a lungul axei Z
        state3D.targetTunnelPitch = Math.max(-0.55, Math.min(0.55, state3D.targetTunnelPitch + deltaY * 0.003));
        state3D.targetZ += deltaY * 0.06;
        const maxZ = Math.ceil(state3D.meshes.length / 2) * HELIX_SPACING + 6;
        state3D.targetZ = Math.max(-2, Math.min(maxZ, state3D.targetZ));
      } else if (state3D.mode === 'wall') {
        state3D.targetWallPanX -= deltaX * 0.02;
        state3D.targetWallPanY += deltaY * 0.02;
        state3D.targetWallPanY = Math.max(-8.0, Math.min(8.0, state3D.targetWallPanY));
      }

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

    // Wheel Scroll Navigation
    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        state3D.lastInteractionTime = Date.now();

        if (state3D.focusedMesh) {
          dismissFocusCard();
        }

        if (state3D.mode === 'cylinder') {
          state3D.targetAngle -= (e.deltaY + e.deltaX) * 0.0018;
        } else if (state3D.mode === 'helix') {
          state3D.targetZ += e.deltaY * 0.05;
          const maxZ = Math.ceil(state3D.meshes.length / 2) * HELIX_SPACING + 6;
          state3D.targetZ = Math.max(-2, Math.min(maxZ, state3D.targetZ));
        } else if (state3D.mode === 'wall') {
          state3D.targetWallZoomZ = Math.max(6.0, Math.min(24.0, state3D.targetWallZoomZ + e.deltaY * 0.018));
        }
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
    });

    const intersects = raycaster.intersectObjects(hitTargets, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const pivot = hit.userData.parentPivot;
      if (pivot) {
        if (state3D.focusedMesh === pivot && state3D.focusProgress >= 0.8) {
          // Double-clicking focused artwork opens full high-res detail inspection
          close3DGallery();
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

    if (state3D.mode === 'cylinder') {
      state3D.cameraTargetPos = new THREE.Vector3(0, state3D.currentCylinderY, 0);
      state3D.cameraTargetLookAt = new THREE.Vector3(0, state3D.currentCylinderY, -10);
    } else if (state3D.mode === 'helix') {
      state3D.cameraTargetPos = new THREE.Vector3(0, 0, state3D.currentZ);
      state3D.cameraTargetLookAt = new THREE.Vector3(0, 0, state3D.currentZ + 15);
    } else if (state3D.mode === 'wall') {
      state3D.cameraTargetPos = new THREE.Vector3(state3D.wallPanX, state3D.wallPanY, state3D.wallZoomZ);
      state3D.cameraTargetLookAt = new THREE.Vector3(state3D.wallPanX, state3D.wallPanY, 0);
    }

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

      // 1. Auto-Spin Logic
      if (
        state3D.isAutoSpin &&
        !state3D.isDragging &&
        !state3D.focusedMesh &&
        Date.now() - state3D.lastInteractionTime > 2000
      ) {
        if (state3D.mode === 'cylinder') {
          state3D.targetAngle -= 0.0012;
        } else if (state3D.mode === 'helix') {
          // Balansare cinematică lină stânga-dreapta între tablouri
          state3D.targetTunnelYaw = Math.sin(time * 0.45) * 0.35;
        }
      }

      // 2. Damping & Lerping
      state3D.currentAngle += (state3D.targetAngle - state3D.currentAngle) * 0.08;
      state3D.currentCylinderY += (state3D.targetCylinderY - state3D.currentCylinderY) * 0.08;
      state3D.currentZ += (state3D.targetZ - state3D.currentZ) * 0.08;
      state3D.tunnelYaw += (state3D.targetTunnelYaw - state3D.tunnelYaw) * 0.08;
      state3D.tunnelPitch += (state3D.targetTunnelPitch - state3D.tunnelPitch) * 0.08;
      state3D.wallPanX += (state3D.targetWallPanX - state3D.wallPanX) * 0.08;
      state3D.wallPanY += (state3D.targetWallPanY - state3D.wallPanY) * 0.08;
      state3D.wallZoomZ += (state3D.targetWallZoomZ - state3D.wallZoomZ) * 0.08;

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

      // 4. Camera Dynamics per Mode
      if (!state3D.focusedMesh && !state3D.isUnfocusing) {
        if (state3D.mode === 'cylinder') {
          artGroup.rotation.y = state3D.currentAngle;
          camera.position.set(0, state3D.currentCylinderY, 0);
          camera.rotation.x = mouse.y * 0.08;
          camera.rotation.y = -mouse.x * 0.08;
        } else if (state3D.mode === 'helix') {
          artGroup.rotation.y = 0;
          camera.position.set(0, 0, state3D.currentZ);
          // Rotație 3D completă (Yaw & Pitch) în tunel:
          const totalYaw = state3D.tunnelYaw - mouse.x * 0.08;
          const totalPitch = state3D.tunnelPitch + mouse.y * 0.06;
          const dirX = Math.sin(totalYaw) * Math.cos(totalPitch);
          const dirY = Math.sin(totalPitch);
          const dirZ = Math.cos(totalYaw) * Math.cos(totalPitch);
          camera.lookAt(
            camera.position.x + dirX * 15,
            camera.position.y + dirY * 15,
            camera.position.z + dirZ * 15
          );
        } else if (state3D.mode === 'wall') {
          artGroup.rotation.y = 0;
          camera.position.set(state3D.wallPanX, state3D.wallPanY, state3D.wallZoomZ);
          camera.lookAt(state3D.wallPanX, state3D.wallPanY, 0);
        }
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

      // 5. Hover Detection via Raycaster
      if (!state3D.isDragging && !state3D.focusedMesh) {
        raycaster.setFromCamera(mouse, camera);
        const hitTargets = [];
        state3D.meshes.forEach((mesh) => {
          if (mesh.userData.picMesh) hitTargets.push(mesh.userData.picMesh);
        });

        const intersects = raycaster.intersectObjects(hitTargets, false);

        if (intersects.length > 0) {
          const hitPivot = intersects[0].object.userData.parentPivot;
          if (state3D.hoveredMesh !== hitPivot) {
            if (state3D.hoveredMesh) state3D.hoveredMesh.userData.targetScale = 1;
            state3D.hoveredMesh = hitPivot;
            hitPivot.userData.targetScale = 1.08;
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

      // 6. Dust Particles Drift
      if (particlesMesh) {
        particlesMesh.rotation.y = time * 0.02;
        particlesMesh.rotation.x = time * 0.01;
      }

      // 7. Dynamic Point Light follows mouse and shines forward onto paintings
      if (pointLight) {
        pointLight.position.x = camera.position.x + mouse.x * 5;
        pointLight.position.y = camera.position.y + mouse.y * 5;
        pointLight.position.z = camera.position.z + 4;
      }
      if (dirLight) {
        dirLight.position.set(camera.position.x, camera.position.y + 12, camera.position.z + 4);
      }

      renderer.render(scene, camera);
    }

    render();
  }

  // Export public methods
  window.openSpatial3DGallery = open3DGallery;
  window.closeSpatial3DGallery = close3DGallery;

  // Init trigger on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrigger);
  } else {
    initTrigger();
  }
})();
