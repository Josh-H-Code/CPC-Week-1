// GSAP Animation Orchestrator for Pan Tossing, Ballistic Trajectories, and Page Synchronization

class TossAnimator {
    constructor(panScene, ingredientManager) {
        this.scene = panScene;
        this.manager = ingredientManager;
        this.isTossed = false;
        this.activeTimeline = null;
        this.tossedCount = 0;

        // Custom landing offsets for the ingredients when thrown toward camera / down onto page
        this.landingTargets = {
            tomatoes: { x: -2.2, y: -2.8, z: 4.8, rotX: 1.2, rotY: 0.8, rotZ: 0.4 },
            feta:     { x: -0.8, y: -2.9, z: 5.1, rotX: 0.9, rotY: 1.4, rotZ: -0.6 },
            basil:    { x:  0.4, y: -2.7, z: 4.9, rotX: 1.5, rotY: -0.5, rotZ: 1.1 },
            garlic:   { x:  1.6, y: -3.0, z: 5.0, rotX: 0.4, rotY: 2.1, rotZ: 0.8 },
            pasta:    { x:  2.6, y: -2.8, z: 4.7, rotX: -0.8, rotY: 1.1, rotZ: -0.9 },
            chili:    { x:  0.0, y: -3.1, z: 5.2, rotX: 0.5, rotY: 0.0, rotZ: 0.3 }
        };
    }

    tossAll() {
        if (this.scene.isTossing) return;
        this.scene.isTossing = true;
        this.isTossed = true;

        if (window.kitchenAudio) {
            window.kitchenAudio.playTossSound();
        }

        // Show floating banner HUD
        this.showHUDMessage('🍳 KITCHEN FLICK! Tossing ingredients from skillet onto the prep counter...');

        const tl = gsap.timeline({
            onComplete: () => {
                this.scene.isTossing = false;
                this.updateTossControls(true);
            }
        });

        // 1. Pan Wind-up (anticipation dip)
        tl.to(this.scene.panRig.position, {
            y: -0.35,
            z: 0.4,
            duration: 0.18,
            ease: 'power1.in'
        }, 0);
        tl.to(this.scene.panRig.rotation, {
            x: -0.18,
            duration: 0.18,
            ease: 'power1.in'
        }, 0);

        // 2. Powerful Pan Flick Upward & Forward
        tl.to(this.scene.panRig.position, {
            y: 0.9,
            z: -0.8,
            duration: 0.22,
            ease: 'power3.out'
        }, 0.18);
        tl.to(this.scene.panRig.rotation, {
            x: 0.48,
            duration: 0.22,
            ease: 'power3.out'
        }, 0.18);

        // 3. Pan Spring Recovery & Settle
        tl.to(this.scene.panRig.position, {
            y: 0,
            z: 0,
            duration: 0.65,
            ease: 'elastic.out(1, 0.45)'
        }, 0.40);
        tl.to(this.scene.panRig.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.65,
            ease: 'elastic.out(1, 0.45)'
        }, 0.40);

        // 4. Ballistic Launch of each ingredient cluster
        const ingredients = this.manager.getAll();
        ingredients.forEach((group, idx) => {
            const data = group.userData.meta;
            const target = this.landingTargets[data.id] || { x: 0, y: -3, z: 5, rotX: 0, rotY: 0, rotZ: 0 };
            const delayOffset = 0.20 + idx * 0.04;

            // Group arc trajectory: shoot up high into air, then swoop down toward the page
            // Arc apex (peak height)
            tl.to(group.position, {
                x: (group.userData.initialGroupPos.x + target.x) * 0.5 + (Math.random() - 0.5) * 0.5,
                y: 4.8 + Math.random() * 0.8,
                z: 2.2,
                duration: 0.38,
                ease: 'power2.out'
            }, delayOffset);

            // Arc descent toward the bottom landing frame
            tl.to(group.position, {
                x: target.x,
                y: target.y,
                z: target.z,
                duration: 0.52,
                ease: 'power2.in'
            }, delayOffset + 0.38);

            // Tumbling spin during flight
            tl.to(group.rotation, {
                x: target.rotX + Math.PI * 2,
                y: target.rotY + Math.PI * 2,
                z: target.rotZ + Math.PI,
                duration: 0.9,
                ease: 'power1.out'
            }, delayOffset);

            // Animate individual pieces fanning out naturally
            group.userData.pieces.forEach((piece, pIdx) => {
                const spreadX = (Math.random() - 0.5) * 0.6;
                const spreadY = (Math.random() - 0.5) * 0.4;
                const spreadZ = (Math.random() - 0.5) * 0.6;

                tl.to(piece.position, {
                    x: piece.userData.basePos.x + spreadX,
                    y: piece.userData.basePos.y + spreadY,
                    z: piece.userData.basePos.z + spreadZ,
                    duration: 0.8,
                    ease: 'power1.out'
                }, delayOffset + 0.1);

                tl.to(piece.rotation, {
                    x: piece.userData.baseRot.x + (Math.random() - 0.5) * 4,
                    y: piece.userData.baseRot.y + (Math.random() - 0.5) * 4,
                    duration: 0.85,
                    ease: 'power1.out'
                }, delayOffset + 0.1);
            });

            // Spawn flying title tag that visually travels from pan down onto page
            setTimeout(() => {
                this.spawnFlyingTitle(data, idx);
            }, (delayOffset + 0.15) * 1000);

            // Trigger corresponding HTML card landing animation on page!
            const landingDelay = (delayOffset + 0.75) * 1000;
            setTimeout(() => {
                this.triggerCardLanding(data.id, idx);
            }, landingDelay);
        });

        // Smooth scroll user toward the ingredient landing board
        setTimeout(() => {
            const boardSection = document.getElementById('prep-board-section');
            if (boardSection) {
                const navHeight = 70;
                const y = boardSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 900);
    }

    tossSingle(ingredientId) {
        if (this.scene.isTossing) return;
        const group = this.manager.get(ingredientId);
        if (!group) return;

        const isCurrentlyTossed = group.userData.isTossed;
        if (isCurrentlyTossed) {
            this.resetSingle(ingredientId);
            return;
        }

        this.scene.isTossing = true;
        group.userData.isTossed = true;

        if (window.kitchenAudio) {
            window.kitchenAudio.playTossSound();
        }

        const data = group.userData.meta;
        this.showHUDMessage(`🚀 Flinging ${data.shortTitle} from the skillet!`);

        const tl = gsap.timeline({
            onComplete: () => {
                this.scene.isTossing = false;
                this.updateTossControls();
            }
        });

        // Pan mini flick
        tl.to(this.scene.panRig.position, { y: 0.45, z: -0.3, duration: 0.18, ease: 'power2.out' }, 0);
        tl.to(this.scene.panRig.rotation, { x: 0.25, duration: 0.18, ease: 'power2.out' }, 0);
        tl.to(this.scene.panRig.position, { y: 0, z: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' }, 0.18);
        tl.to(this.scene.panRig.rotation, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' }, 0.18);

        const target = this.landingTargets[ingredientId] || { x: 0, y: -3, z: 5, rotX: 0, rotY: 0, rotZ: 0 };

        tl.to(group.position, {
            x: (group.userData.initialGroupPos.x + target.x) * 0.5,
            y: 4.2,
            z: 2.5,
            duration: 0.35,
            ease: 'power2.out'
        }, 0.12);

        tl.to(group.position, {
            x: target.x,
            y: target.y,
            z: target.z,
            duration: 0.48,
            ease: 'power2.in'
        }, 0.47);

        tl.to(group.rotation, {
            x: target.rotX + Math.PI * 2,
            y: target.rotY + Math.PI * 2,
            z: target.rotZ,
            duration: 0.8,
            ease: 'power1.out'
        }, 0.12);

        // Spawn flying title tag down onto page
        setTimeout(() => {
            this.spawnFlyingTitle(data, 0);
        }, 160);

        setTimeout(() => {
            this.triggerCardLanding(ingredientId, 0);
            const card = document.querySelector(data.cardSelector);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 820);
    }

    resetSingle(ingredientId) {
        const group = this.manager.get(ingredientId);
        if (!group) return;

        group.userData.isTossed = false;
        if (window.kitchenAudio) {
            window.kitchenAudio.playResetSound();
        }

        const data = group.userData.meta;
        this.showHUDMessage(`↩ Returning ${data.shortTitle} back to sizzling pan...`);

        const tl = gsap.timeline();

        // Arc back into pan
        tl.to(group.position, {
            x: group.userData.initialGroupPos.x,
            y: 3.2,
            z: 1.0,
            duration: 0.38,
            ease: 'power2.out'
        }, 0);

        tl.to(group.position, {
            x: group.userData.initialGroupPos.x,
            y: group.userData.initialGroupPos.y,
            z: group.userData.initialGroupPos.z,
            duration: 0.35,
            ease: 'bounce.out'
        }, 0.38);

        tl.to(group.rotation, {
            x: group.userData.initialGroupRot.x,
            y: group.userData.initialGroupRot.y,
            z: group.userData.initialGroupRot.z,
            duration: 0.6,
            ease: 'power2.out'
        }, 0);

        // Reset piece offsets
        group.userData.pieces.forEach((piece) => {
            tl.to(piece.position, {
                x: piece.userData.basePos.x,
                y: piece.userData.basePos.y,
                z: piece.userData.basePos.z,
                duration: 0.5,
                ease: 'power2.out'
            }, 0.1);

            tl.to(piece.rotation, {
                x: piece.userData.baseRot.x,
                y: piece.userData.baseRot.y,
                z: piece.userData.baseRot.z,
                duration: 0.5,
                ease: 'power2.out'
            }, 0.1);
        });

        // Reset Card state on page
        this.resetCardState(ingredientId);
        this.updateTossControls();
    }

    resetAll() {
        if (this.scene.isTossing) return;
        this.scene.isTossing = true;
        this.isTossed = false;

        if (window.kitchenAudio) {
            window.kitchenAudio.playResetSound();
        }

        this.showHUDMessage('↩ Returning all ingredients back to the sizzling pan...');

        const tl = gsap.timeline({
            onComplete: () => {
                this.scene.isTossing = false;
                this.updateTossControls(false);
            }
        });

        const ingredients = this.manager.getAll();
        ingredients.forEach((group, idx) => {
            group.userData.isTossed = false;
            const delay = idx * 0.05;

            // Arc back up
            tl.to(group.position, {
                x: group.userData.initialGroupPos.x,
                y: 3.5 + Math.random() * 0.5,
                z: 1.0,
                duration: 0.42,
                ease: 'power2.out'
            }, delay);

            // Plop into pan
            tl.to(group.position, {
                x: group.userData.initialGroupPos.x,
                y: group.userData.initialGroupPos.y,
                z: group.userData.initialGroupPos.z,
                duration: 0.4,
                ease: 'bounce.out'
            }, delay + 0.42);

            tl.to(group.rotation, {
                x: group.userData.initialGroupRot.x,
                y: group.userData.initialGroupRot.y,
                z: group.userData.initialGroupRot.z,
                duration: 0.75,
                ease: 'power2.out'
            }, delay);

            // Pieces reset
            group.userData.pieces.forEach((piece) => {
                tl.to(piece.position, {
                    x: piece.userData.basePos.x,
                    y: piece.userData.basePos.y,
                    z: piece.userData.basePos.z,
                    duration: 0.6,
                    ease: 'power2.out'
                }, delay + 0.1);

                tl.to(piece.rotation, {
                    x: piece.userData.baseRot.x,
                    y: piece.userData.baseRot.y,
                    z: piece.userData.baseRot.z,
                    duration: 0.6,
                    ease: 'power2.out'
                }, delay + 0.1);
            });

            this.resetCardState(group.userData.meta.id);
        });

        // Pan catching wobble
        tl.to(this.scene.panRig.position, {
            y: -0.15,
            duration: 0.15,
            ease: 'power1.in'
        }, 0.55);
        tl.to(this.scene.panRig.position, {
            y: 0,
            duration: 0.4,
            ease: 'elastic.out(1, 0.5)'
        }, 0.7);

        // Scroll smoothly back up to pan stage
        const panSection = document.getElementById('pan-showcase');
        if (panSection) {
            panSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    triggerCardLanding(id, index) {
        const card = document.querySelector(`#card-${id}`);
        const statusBadge = document.querySelector(`#status-${id}`);
        const singleBtn = document.querySelector(`.toss-single-btn[data-id="${id}"]`);

        if (window.kitchenAudio) {
            const pitch = 0.85 + (index % 5) * 0.12;
            window.kitchenAudio.playLandSound(pitch);
        }

        if (card) {
            card.classList.add('landed');
            // GSAP punchy bounce down onto board
            gsap.fromTo(card, 
                { scale: 0.7, opacity: 0.4, y: -60, rotateX: 20 },
                { scale: 1.0, opacity: 1.0, y: 0, rotateX: 0, duration: 0.55, ease: 'back.out(1.8)' }
            );

            // Shimmer / impact pulse
            card.classList.add('impact-pulse');
            setTimeout(() => card.classList.remove('impact-pulse'), 900);
        }

        if (statusBadge) {
            statusBadge.textContent = '✨ Landed on Counter';
            statusBadge.className = 'status-pill landed';
        }

        if (singleBtn) {
            singleBtn.classList.add('active');
            singleBtn.innerHTML = `↩ Return ${singleBtn.dataset.name}`;
        }
    }

    resetCardState(id) {
        const card = document.querySelector(`#card-${id}`);
        const statusBadge = document.querySelector(`#status-${id}`);
        const singleBtn = document.querySelector(`.toss-single-btn[data-id="${id}"]`);

        if (card) {
            card.classList.remove('landed');
            gsap.to(card, {
                scale: 1,
                opacity: 0.88,
                y: 0,
                duration: 0.35
            });
        }

        if (statusBadge) {
            statusBadge.textContent = '🔥 Sizzling in Skillet';
            statusBadge.className = 'status-pill in-pan';
        }

        if (singleBtn) {
            singleBtn.classList.remove('active');
            singleBtn.innerHTML = `Toss ${singleBtn.dataset.name}`;
        }
    }

    updateTossControls(isAllTossed = null) {
        const tossBtn = document.getElementById('btn-toss-all');
        const resetBtn = document.getElementById('btn-reset-all');

        let anyTossed = false;
        let allTossed = true;
        this.manager.getAll().forEach(g => {
            if (g.userData.isTossed) anyTossed = true;
            else allTossed = false;
        });

        if (tossBtn) {
            if (allTossed) {
                tossBtn.classList.add('disabled');
            } else {
                tossBtn.classList.remove('disabled');
            }
        }

        if (resetBtn) {
            if (anyTossed) {
                resetBtn.classList.remove('disabled');
            } else {
                resetBtn.classList.add('disabled');
            }
        }
    }

    showHUDMessage(msg) {
        const hud = document.getElementById('pan-hud-alert');
        if (!hud) return;
        hud.textContent = msg;
        hud.classList.add('visible');

        clearTimeout(this.hudTimeout);
        this.hudTimeout = setTimeout(() => {
            hud.classList.remove('visible');
        }, 3200);
    }

    getIcon(id) {
        const icons = {
            tomatoes: '🍅',
            feta: '🧀',
            basil: '🌿',
            garlic: '🧄',
            pasta: '🍝',
            chili: '🌶️'
        };
        return icons[id] || '✨';
    }

    spawnFlyingTitle(data, index) {
        if (typeof document === 'undefined') return;
        const tag = document.createElement('div');
        tag.className = 'flying-ingredient-tag';
        tag.innerHTML = `<span style="font-size: 18px;">${this.getIcon(data.id)}</span> <span>${data.title}</span> <span class="tag-arrow">↓</span>`;
        document.body.appendChild(tag);

        const canvasRect = this.scene.container.getBoundingClientRect();
        const startX = canvasRect.left + canvasRect.width * (0.35 + (index % 3) * 0.15) + (window.scrollX || 0);
        const startY = canvasRect.top + canvasRect.height * 0.45 + (window.scrollY || 0);

        const targetCard = document.querySelector(data.cardSelector);
        let destX = startX;
        let destY = startY + 320;

        if (targetCard) {
            const cardRect = targetCard.getBoundingClientRect();
            destX = cardRect.left + cardRect.width * 0.5 + (window.scrollX || 0);
            destY = cardRect.top + 50 + (window.scrollY || 0);
        }

        tag.style.left = `${startX}px`;
        tag.style.top = `${startY}px`;

        const tagTl = gsap.timeline({
            onComplete: () => {
                if (tag.parentNode) tag.parentNode.removeChild(tag);
            }
        });

        // Launch up into the air
        tagTl.fromTo(tag, 
            { opacity: 0, scale: 0.4, y: 0 },
            { opacity: 1, scale: 1.12, y: -75 - (index % 3) * 20, duration: 0.35, ease: 'power2.out' }
        );

        // Arc swoop down towards the card on the page
        tagTl.to(tag, {
            left: destX,
            top: destY,
            y: 0,
            scale: 0.85,
            opacity: 0,
            duration: 0.55,
            ease: 'power2.in'
        }, '+=0.05');
    }
}

window.TossAnimator = TossAnimator;
