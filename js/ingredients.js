// Procedural 3D Ingredients Builder for Three.js
// Models: Cherry Tomatoes, Greek Feta, Basil Leaves, Garlic Slices, Rigatoni Pasta, Chili & Salt

const IngredientsData = [
    {
        id: 'tomatoes',
        title: 'Somerset Organic Vine Cherry Tomatoes',
        shortTitle: 'Vine Tomatoes',
        amount: '400g local on-the-vine',
        tag: 'Sweet & Bursting',
        color: '#e02828',
        desc: 'Organic cherry tomatoes from local Somerset soil. When blistered in screaming-hot extra virgin olive oil, their taut skins burst into an instant sweet, jammy pan sauce.',
        chefTip: 'Keep the tiny green calyx caps attached! They infuse the hot oil with an intoxicating, peppery fresh greenhouse aroma.',
        panOffset: { x: -0.9, y: 0.35, z: -0.4 },
        cardSelector: '#card-tomatoes',
        count: 5
    },
    {
        id: 'feta',
        title: 'Cultured Artisan Vegan Feta Blocks',
        shortTitle: 'Artisan Vegan Feta',
        amount: '200g almond-milk cultured block',
        tag: 'Tangy & Creamy (100% Vegan)',
        color: '#fff3db',
        desc: 'Our kitchen’s favourite cultured plant-based feta with Greek oregano and lemon brine. Sizzled directly on the cast-iron base until golden-crusted.',
        chefTip: 'Keep generous rustic chunks in the pan; as you toss with starchy pasta water, it emulsifies into luscious velvet silk.',
        panOffset: { x: 0.8, y: 0.32, z: -0.5 },
        cardSelector: '#card-feta',
        count: 4
    },
    {
        id: 'basil',
        title: 'Fresh Sweet Genovese Basil Leaves',
        shortTitle: 'Sweet Basil',
        amount: '1 generous bunch, hand-picked',
        tag: 'Fragrant & Herbal',
        color: '#2ea44f',
        desc: 'Aromatic broad basil leaves. Folded in right at the tossing climax so the residual skillet heat gently wilts them into glossy emerald ribbons.',
        chefTip: 'Tear gently with warm fingers instead of chopping with steel to avoid bruising the delicate essential oils.',
        panOffset: { x: -0.4, y: 0.36, z: 0.7 },
        cardSelector: '#card-basil',
        count: 6
    },
    {
        id: 'garlic',
        title: 'Crispy Sautéed Garlic Slivers',
        shortTitle: 'Golden Garlic',
        amount: '4 fat cloves, paper-thin sliced',
        tag: 'Nutty & Caramelized',
        color: '#f0cf85',
        desc: 'Translucent garlic slivers that dance in simmering extra virgin olive oil until pale straw-golden and crisp, imparting deep aromatic warmth.',
        chefTip: 'Watch like a hawk: garlic travels from aromatic gold to acrid bitter charcoal in seconds. Keep your skillet swirling.',
        panOffset: { x: 0.2, y: 0.25, z: 0.1 },
        cardSelector: '#card-garlic',
        count: 7
    },
    {
        id: 'pasta',
        title: 'Bronze-Die Ribbed Durum Rigatoni',
        shortTitle: 'Artisan Rigatoni',
        amount: '350g bronze-extruded pasta',
        tag: 'Al Dente & Coarse',
        color: '#e7c679',
        desc: 'Coarse-surfaced durum wheat pasta tubes with wide ridges designed specifically to cup bubbling tomato juices and molten vegan feta inside the tube.',
        chefTip: 'Boil 2 minutes shy of al dente in salted water; finish cooking directly in the smoking skillet with a ladle of starchy pasta water.',
        panOffset: { x: 0.6, y: 0.38, z: 0.6 },
        cardSelector: '#card-pasta',
        count: 6
    },
    {
        id: 'chili',
        title: 'Calabrian Chili Flakes & Cornish Sea Salt',
        shortTitle: 'Chili & Sea Salt',
        amount: '1 tsp dried flakes + mineral salt',
        tag: 'Fiery & Mineral',
        color: '#c92a2a',
        desc: 'Crushed dried pepper flakes giving warming citrus-tinged heat, paired with pyramid crystals of Cornish sea salt for crisp textural punch.',
        chefTip: 'That tiny touch of fiery heat cuts through the creamy richness of the cultured vegan feta for perfect harmony.',
        panOffset: { x: -0.1, y: 0.22, z: -0.8 },
        cardSelector: '#card-chili',
        count: 14
    }
];

class IngredientFactory {
    // 1. Cherry Tomato Builder
    static createTomato() {
        const group = new THREE.Group();

        // Tomato flesh
        const tomatoGeo = new THREE.SphereGeometry(0.38, 24, 20);
        // Slightly squash top & bottom for organic tomato shape
        tomatoGeo.scale(1.04, 0.94, 1.02);

        const tomatoMat = new THREE.MeshStandardMaterial({
            color: 0xd92323,
            roughness: 0.18,
            metalness: 0.08,
            clearcoat: 0.6,
            clearcoatRoughness: 0.15
        });

        const tomatoMesh = new THREE.Mesh(tomatoGeo, tomatoMat);
        tomatoMesh.castShadow = true;
        tomatoMesh.receiveShadow = true;
        group.add(tomatoMesh);

        // Blister mark on one side
        const blisterGeo = new THREE.SphereGeometry(0.12, 12, 12);
        blisterGeo.scale(1.3, 0.4, 0.9);
        const blisterMat = new THREE.MeshStandardMaterial({
            color: 0x4a1805,
            roughness: 0.8
        });
        const blister = new THREE.Mesh(blisterGeo, blisterMat);
        blister.position.set(0.28, -0.1, 0.18);
        blister.rotation.set(0.3, 0.5, 0.2);
        group.add(blister);

        // Green calyx stem
        const stemGroup = new THREE.Group();
        stemGroup.position.set(0, 0.35, 0);

        const calyxMat = new THREE.MeshStandardMaterial({
            color: 0x2e6b22,
            roughness: 0.5
        });

        // 5 star leaf sepals
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const sepalGeo = new THREE.ConeGeometry(0.06, 0.24, 6);
            sepalGeo.rotateX(Math.PI / 2.3);
            const sepal = new THREE.Mesh(sepalGeo, calyxMat);
            sepal.rotation.y = angle;
            sepal.position.set(Math.cos(angle) * 0.08, 0.01, Math.sin(angle) * 0.08);
            stemGroup.add(sepal);
        }

        // Little curved stalk
        const stalkCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.04, 0.16, 0.03),
            new THREE.Vector3(0.12, 0.28, -0.02)
        ]);
        const stalkGeo = new THREE.TubeGeometry(stalkCurve, 8, 0.03, 6, false);
        const stalk = new THREE.Mesh(stalkGeo, calyxMat);
        stemGroup.add(stalk);

        group.add(stemGroup);
        return group;
    }

    // 2. Feta Cheese Cube Builder
    static createFeta() {
        const group = new THREE.Group();

        const w = 0.52 + Math.random() * 0.15;
        const h = 0.42 + Math.random() * 0.1;
        const d = 0.48 + Math.random() * 0.12;
        const fetaGeo = new THREE.BoxGeometry(w, h, d, 2, 2, 2);

        // Perturb vertices slightly for rustic cheese crumble
        const pos = fetaGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            pos.setXYZ(
                i,
                pos.getX(i) + (Math.random() - 0.5) * 0.04,
                pos.getY(i) + (Math.random() - 0.5) * 0.03,
                pos.getZ(i) + (Math.random() - 0.5) * 0.04
            );
        }
        fetaGeo.computeVertexNormals();

        const fetaMat = new THREE.MeshStandardMaterial({
            color: 0xfdfaf0,
            roughness: 0.92,
            metalness: 0.0
        });

        const fetaMesh = new THREE.Mesh(fetaGeo, fetaMat);
        fetaMesh.castShadow = true;
        fetaMesh.receiveShadow = true;
        group.add(fetaMesh);

        // Golden browned bottom edge (where it seared in the pan)
        const searGeo = new THREE.PlaneGeometry(w * 0.9, d * 0.9);
        const searMat = new THREE.MeshStandardMaterial({
            color: 0xb5782a,
            roughness: 0.85
        });
        const sear = new THREE.Mesh(searGeo, searMat);
        sear.rotation.x = Math.PI / 2;
        sear.position.y = -h / 2 + 0.01;
        group.add(sear);

        // Dried oregano / pepper flecks
        const fleckGeo = new THREE.DodecahedronGeometry(0.02, 0);
        const fleckMat = new THREE.MeshBasicMaterial({ color: 0x223616 });
        for (let j = 0; j < 6; j++) {
            const fleck = new THREE.Mesh(fleckGeo, fleckMat);
            fleck.position.set(
                (Math.random() - 0.5) * (w - 0.06),
                h / 2 + 0.005,
                (Math.random() - 0.5) * (d - 0.06)
            );
            group.add(fleck);
        }

        return group;
    }

    // 3. Fresh Basil Leaf Builder
    static createBasil() {
        const group = new THREE.Group();

        // Parametric curved leaf shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(0.25, 0.25, 0.35, 0.7, 0, 1.1);
        shape.bezierCurveTo(-0.35, 0.7, -0.25, 0.25, 0, 0);

        const extrudeSettings = {
            depth: 0.012,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.01,
            bevelThickness: 0.01
        };

        const leafGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        leafGeo.center();

        // Subtle organic curvature
        const pos = leafGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            // Cup the leaf inwards
            const zCurve = Math.sin((y + 0.5) * 2.5) * 0.12 - Math.abs(x) * 0.2;
            pos.setZ(i, pos.getZ(i) + zCurve);
        }
        leafGeo.computeVertexNormals();

        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x248a3d,
            roughness: 0.35,
            metalness: 0.05,
            side: THREE.DoubleSide
        });

        const leafMesh = new THREE.Mesh(leafGeo, leafMat);
        leafMesh.scale.set(0.65, 0.65, 0.65);
        leafMesh.castShadow = true;
        group.add(leafMesh);

        // Central vein spine
        const veinCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, -0.35, 0.02),
            new THREE.Vector3(0, 0.0, 0.04),
            new THREE.Vector3(0, 0.32, 0.01)
        ]);
        const veinGeo = new THREE.TubeGeometry(veinCurve, 10, 0.015, 4, false);
        const veinMat = new THREE.MeshStandardMaterial({ color: 0x56a644, roughness: 0.5 });
        const vein = new THREE.Mesh(veinGeo, veinMat);
        group.add(vein);

        return group;
    }

    // 4. Golden Garlic Slice Builder
    static createGarlic() {
        const group = new THREE.Group();

        // Oval cylinder
        const garlicGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.04, 16);
        garlicGeo.scale(1.3, 1.0, 0.9);

        const garlicMat = new THREE.MeshStandardMaterial({
            color: 0xf6e5b6,
            roughness: 0.4,
            metalness: 0.05,
            transparent: true,
            opacity: 0.95
        });

        const garlicMesh = new THREE.Mesh(garlicGeo, garlicMat);
        garlicMesh.castShadow = true;
        group.add(garlicMesh);

        // Browned caramelized border ring
        const ringGeo = new THREE.TorusGeometry(0.25, 0.02, 8, 20);
        ringGeo.scale(1.25, 0.88, 1.0);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x9e601c,
            roughness: 0.7
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        return group;
    }

    // 5. Rigatoni Pasta Tube Builder
    static createRigatoni() {
        const group = new THREE.Group();

        const length = 0.85;
        const outerRadius = 0.24;
        const innerRadius = 0.17;

        // Custom hollow cylinder with fluted ribs
        const shape = new THREE.Shape();
        const ribs = 18;
        for (let i = 0; i <= ribs; i++) {
            const angle = (i / ribs) * Math.PI * 2;
            const r = outerRadius + (i % 2 === 0 ? 0.025 : 0.0);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }

        // Inner hollow hole
        const hole = new THREE.Path();
        for (let i = ribs; i >= 0; i--) {
            const angle = (i / ribs) * Math.PI * 2;
            const x = Math.cos(angle) * innerRadius;
            const y = Math.sin(angle) * innerRadius;
            if (i === ribs) hole.moveTo(x, y);
            else hole.lineTo(x, y);
        }
        shape.holes.push(hole);

        const extrudeSettings = {
            depth: length,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 2,
            bevelSize: 0.012,
            bevelThickness: 0.012
        };

        const pastaGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        pastaGeo.center();

        const pastaMat = new THREE.MeshStandardMaterial({
            color: 0xebcb86,
            roughness: 0.65,
            metalness: 0.0
        });

        const pastaMesh = new THREE.Mesh(pastaGeo, pastaMat);
        pastaMesh.castShadow = true;
        pastaMesh.receiveShadow = true;
        group.add(pastaMesh);

        return group;
    }

    // 6. Chili Flake & Salt Crystal Builder
    static createChiliFlake(isSalt = false) {
        const group = new THREE.Group();

        if (isSalt) {
            // Cubic sea salt crystal
            const size = 0.06 + Math.random() * 0.04;
            const geo = new THREE.BoxGeometry(size, size * 0.8, size);
            const mat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.1,
                metalness: 0.1,
                transparent: true,
                opacity: 0.88
            });
            const mesh = new THREE.Mesh(geo, mat);
            group.add(mesh);
        } else {
            // Irregular chili flake
            const geo = new THREE.DodecahedronGeometry(0.06 + Math.random() * 0.04, 0);
            geo.scale(1.2, 0.25, 0.9);
            const mat = new THREE.MeshStandardMaterial({
                color: Math.random() > 0.4 ? 0xb51e1e : 0xd9381e,
                roughness: 0.5
            });
            const mesh = new THREE.Mesh(geo, mat);
            group.add(mesh);
        }

        return group;
    }
}

// Master Ingredients Manager
class IngredientManager {
    constructor(scene) {
        this.scene = scene;
        this.ingredients = [];
        this.itemsMap = new Map();
        this.tossedStates = new Map();
    }

    buildAll(panGroup) {
        this.panGroup = panGroup;

        IngredientsData.forEach(data => {
            const group = new THREE.Group();
            group.name = data.id;

            const pieces = [];

            for (let i = 0; i < data.count; i++) {
                let piece;
                if (data.id === 'tomatoes') {
                    piece = IngredientFactory.createTomato();
                    const jitter = 0.28;
                    piece.position.set(
                        (Math.random() - 0.5) * jitter,
                        i * 0.12,
                        (Math.random() - 0.5) * jitter
                    );
                    piece.rotation.set(
                        Math.random() * 0.4,
                        Math.random() * Math.PI * 2,
                        Math.random() * 0.4
                    );
                } else if (data.id === 'feta') {
                    piece = IngredientFactory.createFeta();
                    piece.position.set(
                        (Math.random() - 0.5) * 0.4,
                        i * 0.09,
                        (Math.random() - 0.5) * 0.35
                    );
                    piece.rotation.set(
                        (Math.random() - 0.5) * 0.2,
                        Math.random() * Math.PI,
                        (Math.random() - 0.5) * 0.2
                    );
                } else if (data.id === 'basil') {
                    piece = IngredientFactory.createBasil();
                    piece.position.set(
                        (Math.random() - 0.5) * 0.6,
                        0.05 + i * 0.05,
                        (Math.random() - 0.5) * 0.5
                    );
                    piece.rotation.set(
                        -Math.PI / 2 + (Math.random() - 0.5) * 0.4,
                        (Math.random() - 0.5) * 0.3,
                        Math.random() * Math.PI * 2
                    );
                } else if (data.id === 'garlic') {
                    piece = IngredientFactory.createGarlic();
                    piece.position.set(
                        (Math.random() - 0.5) * 0.7,
                        0.02 + i * 0.02,
                        (Math.random() - 0.5) * 0.7
                    );
                    piece.rotation.set(
                        (Math.random() - 0.5) * 0.15,
                        Math.random() * Math.PI * 2,
                        (Math.random() - 0.5) * 0.15
                    );
                } else if (data.id === 'pasta') {
                    piece = IngredientFactory.createRigatoni();
                    piece.position.set(
                        (Math.random() - 0.5) * 0.6,
                        0.08 + i * 0.06,
                        (Math.random() - 0.5) * 0.6
                    );
                    piece.rotation.set(
                        Math.PI / 2 + (Math.random() - 0.5) * 0.3,
                        (Math.random() - 0.5) * 0.4,
                        Math.random() * Math.PI * 2
                    );
                } else if (data.id === 'chili') {
                    const isSalt = i % 3 === 0;
                    piece = IngredientFactory.createChiliFlake(isSalt);
                    piece.position.set(
                        (Math.random() - 0.5) * 1.4,
                        0.02 + Math.random() * 0.08,
                        (Math.random() - 0.5) * 1.4
                    );
                    piece.rotation.set(
                        Math.random() * Math.PI,
                        Math.random() * Math.PI,
                        Math.random() * Math.PI
                    );
                }

                // Store piece initial rest transforms
                piece.userData = {
                    basePos: piece.position.clone(),
                    baseRot: piece.rotation.clone(),
                    index: i,
                    parentId: data.id
                };

                group.add(piece);
                pieces.push(piece);
            }

            // Offset the group cluster inside the pan
            group.position.set(data.panOffset.x, data.panOffset.y, data.panOffset.z);
            group.userData = {
                id: data.id,
                meta: data,
                initialGroupPos: group.position.clone(),
                initialGroupRot: group.rotation.clone(),
                isTossed: false,
                pieces: pieces
            };

            this.panGroup.add(group);
            this.ingredients.push(group);
            this.itemsMap.set(data.id, group);
            this.tossedStates.set(data.id, false);
        });

        return this.ingredients;
    }

    get(id) {
        return this.itemsMap.get(id);
    }

    getAll() {
        return this.ingredients;
    }
}

window.IngredientsData = IngredientsData;
window.IngredientManager = IngredientManager;
