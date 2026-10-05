// Application Controller: Initializing Three.js, GSAP, Audio & Guardian UI Interactions

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize 3D Scene
    const canvasContainer = document.getElementById('three-canvas-container');
    if (!canvasContainer) {
        console.error('Canvas container not found');
        return;
    }

    const panScene = new PanScene(canvasContainer);
    const ingredientManager = new IngredientManager(panScene.scene);
    ingredientManager.buildAll(panScene.panMeshGroup);

    const tossAnimator = new TossAnimator(panScene, ingredientManager);

    // 2. Wire Control Buttons
    const btnTossAll = document.getElementById('btn-toss-all');
    const btnResetAll = document.getElementById('btn-reset-all');
    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    const tempValue = document.getElementById('pan-temp-value');

    if (btnTossAll) {
        btnTossAll.addEventListener('click', () => {
            if (window.kitchenAudio && !window.kitchenAudio.initialized) {
                window.kitchenAudio.init();
            }
            tossAnimator.tossAll();
        });
    }

    if (btnResetAll) {
        btnResetAll.addEventListener('click', () => {
            tossAnimator.resetAll();
        });
    }

    // Single Ingredient Toss buttons on the page & in HUD
    document.querySelectorAll('.toss-single-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.kitchenAudio && !window.kitchenAudio.initialized) {
                window.kitchenAudio.init();
            }
            const id = btn.getAttribute('data-id');
            tossAnimator.tossSingle(id);
        });
    });

    // 3. Audio Toggle
    if (btnAudioToggle) {
        btnAudioToggle.addEventListener('click', () => {
            if (window.kitchenAudio) {
                if (!window.kitchenAudio.initialized) {
                    window.kitchenAudio.init();
                } else {
                    const isMuted = window.kitchenAudio.toggleMute();
                    btnAudioToggle.classList.toggle('muted', isMuted);
                    const icon = btnAudioToggle.querySelector('.audio-icon');
                    const label = btnAudioToggle.querySelector('.audio-label');
                    if (icon && label) {
                        icon.textContent = isMuted ? '🔇' : '🔊';
                        label.textContent = isMuted ? 'Sound: Muted' : 'Sizzle: Sizzling';
                    }
                }
            }
        });
    }

    // Initialize audio on first click anywhere on page
    const userAudioInit = () => {
        if (window.kitchenAudio && !window.kitchenAudio.initialized) {
            window.kitchenAudio.init();
        }
        window.removeEventListener('click', userAudioInit);
        window.removeEventListener('keydown', userAudioInit);
    };
    window.addEventListener('click', userAudioInit);
    window.addEventListener('keydown', userAudioInit);

    // 4. Raycasting on 3D Canvas: Click or hover directly on ingredients in the pan!
    const canvas = panScene.renderer.domElement;
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        panScene.mousePos2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        panScene.mousePos2D.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        panScene.raycaster.setFromCamera(panScene.mousePos2D, panScene.camera);

        const allIngredients = ingredientManager.getAll();
        const intersects = panScene.raycaster.intersectObjects(allIngredients, true);

        if (intersects.length > 0) {
            // Find parent group
            let hitObj = intersects[0].object;
            while (hitObj.parent && !hitObj.userData.id && hitObj.parent !== panScene.panMeshGroup) {
                hitObj = hitObj.parent;
            }
            if (hitObj && hitObj.userData && hitObj.userData.id) {
                tossAnimator.tossSingle(hitObj.userData.id);
            }
        }
    });

    // 5. Simmering Pan Temperature Simulation
    let currentTemp = 210;
    setInterval(() => {
        currentTemp += (Math.random() - 0.48) * 1.5;
        if (currentTemp < 198) currentTemp = 202;
        if (currentTemp > 228) currentTemp = 224;
        if (tempValue) {
            tempValue.textContent = `${Math.round(currentTemp)}°C`;
        }
    }, 1800);

    // 6. Interactive Method Timers (e.g. 2-min pasta boil)
    const timerBtn = document.getElementById('btn-step-timer');
    if (timerBtn) {
        let timerSeconds = 120;
        let timerInterval = null;
        timerBtn.addEventListener('click', () => {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerBtn.textContent = '⏱️ Start 2-min Pasta Timer';
                timerBtn.classList.remove('running');
                return;
            }

            timerBtn.classList.add('running');
            timerSeconds = 120;
            timerBtn.textContent = `⏳ ${timerSeconds}s remaining...`;

            timerInterval = setInterval(() => {
                timerSeconds--;
                if (timerSeconds <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    timerBtn.textContent = '✅ Al Dente! Toss into pan!';
                    timerBtn.classList.remove('running');
                    if (window.kitchenAudio) window.kitchenAudio.playLandSound(1.4);
                } else {
                    timerBtn.textContent = `⏳ ${timerSeconds}s remaining...`;
                }
            }, 1000);
        });
    }

    // 7. Ingredient Checkbox checklist interactions
    document.querySelectorAll('.ingredient-checkbox').forEach(box => {
        box.addEventListener('change', (e) => {
            const card = e.target.closest('.editorial-ingredient-card');
            if (card) {
                card.classList.toggle('checked', e.target.checked);
            }
        });
    });

    // 8. Bookmark / Save Button toggle
    const saveBtn = document.getElementById('btn-save-recipe');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveBtn.classList.toggle('saved');
            const label = saveBtn.querySelector('.save-label');
            if (label) {
                label.textContent = saveBtn.classList.contains('saved') ? 'Saved to Kino Favourites' : 'Save Recipe';
            }
        });
    }

    // 9. GSAP ScrollTrigger enhancements
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Subtle parallax on pan stage as user scrolls
        gsap.to(panScene.panRig.position, {
            scrollTrigger: {
                trigger: '#pan-showcase',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: -0.8,
            ease: 'none'
        });

        // Reveal editorial sections
        gsap.utils.toArray('.method-step').forEach((step, idx) => {
            gsap.from(step, {
                scrollTrigger: {
                    trigger: step,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 35,
                duration: 0.6,
                ease: 'power2.out',
                delay: idx * 0.08
            });
        });
    }
});
