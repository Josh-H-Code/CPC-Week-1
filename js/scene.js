// Three.js Scene Setup: Cast-Iron Pan, Burner Glow, Steam Particles & Lighting

class PanScene {
    constructor(canvasContainer) {
        this.container = canvasContainer;
        this.width = canvasContainer.clientWidth;
        this.height = canvasContainer.clientHeight;

        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.isInteracting = true;
        this.isTossing = false;

        this.init();
        this.createLighting();
        this.createPan();
        this.createSteam();
        this.createRaycaster();
        this.addEvents();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        // Atmospheric gradient/dark editorial studio ambiance behind the pan
        this.scene.background = null; // transparent to blend with Guardian editorial background!

        // Camera
        this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 5.2, 7.8);
        this.camera.lookAt(0, 0.4, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        this.container.appendChild(this.renderer.domElement);

        // Master groups
        this.panRig = new THREE.Group(); // Handles tilt/pan motion
        this.panMeshGroup = new THREE.Group(); // The physical skillet
        this.panRig.add(this.panMeshGroup);
        this.scene.add(this.panRig);

        // World landing zone marker (invisible helper / target plane)
        this.landingTargetGroup = new THREE.Group();
        this.landingTargetGroup.position.set(0, -3.5, 3.8);
        this.scene.add(this.landingTargetGroup);
    }

    createLighting() {
        // Soft warm ambient fill (morning cafe light)
        const ambientLight = new THREE.AmbientLight(0xfffaee, 0.88);
        this.scene.add(ambientLight);

        // Primary key light (warm daylight / kitchen window)
        this.keyLight = new THREE.DirectionalLight(0xffeedd, 1.4);
        this.keyLight.position.set(4, 9, 5);
        this.keyLight.castShadow = true;
        this.keyLight.shadow.mapSize.width = 2048;
        this.keyLight.shadow.mapSize.height = 2048;
        this.keyLight.shadow.camera.near = 0.5;
        this.keyLight.shadow.camera.far = 25;
        this.keyLight.shadow.camera.left = -4;
        this.keyLight.shadow.camera.right = 4;
        this.keyLight.shadow.camera.top = 4;
        this.keyLight.shadow.camera.bottom = -4;
        this.keyLight.shadow.bias = -0.0005;
        this.scene.add(this.keyLight);

        // Rim / Back light for crisp metallic edge definition
        const rimLight = new THREE.DirectionalLight(0x90c5ff, 0.6);
        rimLight.position.set(-6, 4, -5);
        this.scene.add(rimLight);

        // Sizzling stove burner warm glow under the pan
        this.burnerLight = new THREE.PointLight(0xff6a00, 2.5, 6);
        this.burnerLight.position.set(0, -0.6, 0);
        this.panRig.add(this.burnerLight);

        // Soft spotlight into the pan interior
        this.skilletSpot = new THREE.SpotLight(0xfff1d6, 1.8, 12, Math.PI / 4, 0.4);
        this.skilletSpot.position.set(0, 7, 1);
        this.skilletSpot.target = this.panMeshGroup;
        this.scene.add(this.skilletSpot);
    }

    createPan() {
        // Cast Iron Skillet Body using LatheGeometry for authentic curvature
        const points = [];
        // Pan cross section profile (x: radius, y: height)
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(2.1, 0));        // base center to bottom radius
        points.push(new THREE.Vector2(2.4, 0.08));     // rounded lower corner
        points.push(new THREE.Vector2(2.75, 0.85));    // flared wall
        points.push(new THREE.Vector2(2.82, 0.95));    // top rounded rim outer
        points.push(new THREE.Vector2(2.75, 0.98));    // rim top edge
        points.push(new THREE.Vector2(2.65, 0.92));    // rim inner
        points.push(new THREE.Vector2(2.32, 0.16));    // inner wall slope
        points.push(new THREE.Vector2(2.0, 0.12));     // inner corner
        points.push(new THREE.Vector2(0, 0.12));       // inner flat floor

        const panGeo = new THREE.LatheGeometry(points, 48);
        panGeo.computeVertexNormals();

        // Cast iron material with heavy metallic micro-roughness
        this.panMaterial = new THREE.MeshStandardMaterial({
            color: 0x222428,
            roughness: 0.52,
            metalness: 0.68,
            bumpScale: 0.04
        });

        this.panBody = new THREE.Mesh(panGeo, this.panMaterial);
        this.panBody.castShadow = true;
        this.panBody.receiveShadow = true;
        this.panMeshGroup.add(this.panBody);

        // Simmering olive oil pool
        const oilGeo = new THREE.CircleGeometry(2.15, 36);
        this.oilMat = new THREE.MeshStandardMaterial({
            color: 0xd9b329,
            roughness: 0.1,
            metalness: 0.15,
            transparent: true,
            opacity: 0.72
        });
        this.oilMesh = new THREE.Mesh(oilGeo, this.oilMat);
        this.oilMesh.rotation.x = -Math.PI / 2;
        this.oilMesh.position.y = 0.14;
        this.oilMesh.receiveShadow = true;
        this.panMeshGroup.add(this.oilMesh);

        // Pan Handle (curved cast iron handle with hanging hole)
        const handleShape = new THREE.Shape();
        handleShape.moveTo(-0.24, 0);
        handleShape.lineTo(0.24, 0);
        handleShape.lineTo(0.18, 3.2);
        handleShape.lineTo(0.26, 3.5);
        handleShape.absarc(0, 3.5, 0.26, 0, Math.PI, false);
        handleShape.lineTo(-0.18, 3.2);
        handleShape.closePath();

        // Hanging eyelet hole
        const holePath = new THREE.Path();
        holePath.absarc(0, 3.48, 0.11, 0, Math.PI * 2, true);
        handleShape.holes.push(holePath);

        const handleExtrude = {
            depth: 0.16,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 2,
            bevelSize: 0.04,
            bevelThickness: 0.04
        };
        const handleGeo = new THREE.ExtrudeGeometry(handleShape, handleExtrude);
        handleGeo.center();

        const handleMesh = new THREE.Mesh(handleGeo, this.panMaterial);
        handleMesh.position.set(0, 0.65, 4.3);
        handleMesh.rotation.x = Math.PI / 2 - 0.08;
        handleMesh.castShadow = true;
        this.panMeshGroup.add(handleMesh);

        // Brass rivets on handle attachment
        const rivetGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.28, 12);
        const rivetMat = new THREE.MeshStandardMaterial({ color: 0xb58c3a, metalness: 0.8, roughness: 0.3 });
        const rivet1 = new THREE.Mesh(rivetGeo, rivetMat);
        rivet1.position.set(-0.11, 0.72, 2.9);
        rivet1.rotation.x = Math.PI / 2;
        const rivet2 = new THREE.Mesh(rivetGeo, rivetMat);
        rivet2.position.set(0.11, 0.72, 2.9);
        rivet2.rotation.x = Math.PI / 2;
        this.panMeshGroup.add(rivet1, rivet2);

        // Cooktop Burner Ring beneath pan
        const ringGeo = new THREE.TorusGeometry(2.1, 0.04, 16, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4e00 });
        this.burnerRing = new THREE.Mesh(ringGeo, ringMat);
        this.burnerRing.rotation.x = Math.PI / 2;
        this.burnerRing.position.y = -0.06;
        this.panRig.add(this.burnerRing);

        // Inner blue gas flame ring
        const blueFlameGeo = new THREE.TorusGeometry(1.4, 0.03, 16, 48);
        const blueFlameMat = new THREE.MeshBasicMaterial({ color: 0x00bbff });
        this.innerBurner = new THREE.Mesh(blueFlameGeo, blueFlameMat);
        this.innerBurner.rotation.x = Math.PI / 2;
        this.innerBurner.position.y = -0.07;
        this.panRig.add(this.innerBurner);

        // Contact shadow receiver plane underneath pan
        const shadowPlaneGeo = new THREE.PlaneGeometry(12, 12);
        const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.16 });
        const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -0.15;
        shadowPlane.receiveShadow = true;
        this.scene.add(shadowPlane);
    }

    createSteam() {
        // Subtle rising steam particle puff system
        const particleCount = 45;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);
        const opacities = new Float32Array(particleCount);

        this.steamData = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 1.8;
            const x = Math.cos(angle) * r;
            const y = 0.2 + Math.random() * 2.5;
            const z = Math.sin(angle) * r;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            scales[i] = 0.3 + Math.random() * 0.5;
            opacities[i] = Math.random() * 0.4;

            this.steamData.push({
                x, y, z,
                speedY: 0.015 + Math.random() * 0.025,
                driftX: (Math.random() - 0.5) * 0.008,
                driftZ: (Math.random() - 0.5) * 0.008,
                life: Math.random(),
                maxLife: 1.0 + Math.random() * 0.8
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Procedural soft circular steam particle canvas
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(0.5, 'rgba(240, 240, 240, 0.2)');
        grad.addColorStop(1, 'rgba(240, 240, 240, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.PointsMaterial({
            size: 0.7,
            map: texture,
            transparent: true,
            opacity: 0.22,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        this.steamPoints = new THREE.Points(geometry, material);
        this.panMeshGroup.add(this.steamPoints);
    }

    createRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mousePos2D = new THREE.Vector2(-999, -999);
    }

    addEvents() {
        window.addEventListener('resize', () => this.onResize());

        // Mouse tilt
        window.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            if (e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right) {
                const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
                this.mouse.targetX = normX;
                this.mouse.targetY = normY;
                this.mousePos2D.x = normX;
                this.mousePos2D.y = normY;
            } else {
                this.mouse.targetX = 0;
                this.mouse.targetY = 0;
            }
        });

        // Touch tilt
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.container.getBoundingClientRect();
                if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    const normX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                    const normY = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
                    this.mouse.targetX = normX;
                    this.mouse.targetY = normY;
                }
            }
        }, { passive: true });
    }

    onResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    animate() {
        requestAnimationFrame(this.animate);

        const time = performance.now() * 0.001;

        // Smooth mouse tilt inertia (when not executing automated GSAP toss)
        if (!this.isTossing) {
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

            this.panRig.rotation.z = -this.mouse.x * 0.12;
            this.panRig.rotation.x = this.mouse.y * 0.15;
            this.panRig.position.x = this.mouse.x * 0.25;
            this.panRig.position.z = -this.mouse.y * 0.25;
        }

        // Simmering oil ripple & burner flicker
        if (this.oilMat) {
            this.oilMat.opacity = 0.65 + Math.sin(time * 6) * 0.05;
        }
        if (this.burnerLight) {
            this.burnerLight.intensity = 2.2 + Math.sin(time * 14) * 0.35 + Math.cos(time * 23) * 0.2;
        }
        if (this.burnerRing) {
            this.burnerRing.material.opacity = 0.8 + Math.sin(time * 12) * 0.2;
        }

        // Animate rising steam
        if (this.steamPoints && this.steamData) {
            const positions = this.steamPoints.geometry.attributes.position.array;
            for (let i = 0; i < this.steamData.length; i++) {
                const s = this.steamData[i];
                s.life += 0.012;
                s.y += s.speedY;
                s.x += s.driftX;
                s.z += s.driftZ;

                if (s.life > s.maxLife || s.y > 3.4) {
                    s.life = 0;
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * 1.8;
                    s.x = Math.cos(angle) * r;
                    s.y = 0.2;
                    s.z = Math.sin(angle) * r;
                }

                positions[i * 3] = s.x;
                positions[i * 3 + 1] = s.y;
                positions[i * 3 + 2] = s.z;
            }
            this.steamPoints.geometry.attributes.position.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.PanScene = PanScene;
