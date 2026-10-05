// Web Audio API Synthesizer for Kitchen Sizzle, Toss Whooshes, and Board Landing
class KitchenAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isSizzling = false;
        this.sizzleNode = null;
        this.sizzleGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
            this.createSizzleLoop();
        } catch (e) {
            console.warn('Web Audio not supported or blocked:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createSizzleLoop() {
        if (!this.ctx) return;

        // Generate pink noise buffer for realistic pan sizzle
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass filter centered around hot oil frying frequency (1800Hz - 3200Hz)
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 2400;
        bandpass.Q.value = 1.2;

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 800;

        this.sizzleGain = this.ctx.createGain();
        this.sizzleGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        whiteNoise.connect(bandpass);
        bandpass.connect(highpass);
        highpass.connect(this.sizzleGain);
        this.sizzleGain.connect(this.ctx.destination);

        whiteNoise.start(0);
        this.sizzleNode = whiteNoise;
        this.isSizzling = true;

        // Random subtle crackle bursts for oil pops
        this.startOilCrackles();
    }

    startOilCrackles() {
        const triggerCrackle = () => {
            if (this.initialized && !this.isMuted && this.isSizzling && this.ctx) {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1200 + Math.random() * 2400, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

                filter.type = 'highpass';
                filter.frequency.value = 1400;

                const popVol = 0.015 + Math.random() * 0.035;
                gain.gain.setValueAtTime(popVol, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.04);
            }
            const nextTime = 120 + Math.random() * 380;
            setTimeout(triggerCrackle, nextTime);
        };
        triggerCrackle();
    }

    playTossSound() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;

        // 1. Pan flick metal clink
        const metalOsc = this.ctx.createOscillator();
        const metalGain = this.ctx.createGain();
        metalOsc.type = 'sine';
        metalOsc.frequency.setValueAtTime(380, now);
        metalOsc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

        metalGain.gain.setValueAtTime(0.18, now);
        metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        metalOsc.connect(metalGain);
        metalGain.connect(this.ctx.destination);
        metalOsc.start(now);
        metalOsc.stop(now + 0.22);

        // 2. Air whoosh (filtered noise sweep)
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(250, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.38);
        filter.Q.value = 3.0;

        const whooshGain = this.ctx.createGain();
        whooshGain.gain.setValueAtTime(0.01, now);
        whooshGain.gain.linearRampToValueAtTime(0.25, now + 0.14);
        whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.connect(filter);
        filter.connect(whooshGain);
        whooshGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.4);

        // Boost sizzle momentarily
        if (this.sizzleGain) {
            this.sizzleGain.gain.cancelScheduledValues(now);
            this.sizzleGain.gain.setValueAtTime(0.12, now);
            this.sizzleGain.gain.exponentialRampToValueAtTime(0.03, now + 0.8);
        }
    }

    playLandSound(pitchMod = 1.0) {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Wood chopping board impact 'thud'
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180 * pitchMod, now);
        osc.frequency.exponentialRampToValueAtTime(45 * pitchMod, now + 0.12);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);

        // Crisp surface tap
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(950 * pitchMod, now);
        clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

        clickGain.gain.setValueAtTime(0.08, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);

        clickOsc.start(now);
        clickOsc.stop(now + 0.05);
    }

    playResetSound() {
        if (!this.initialized || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Reverse whoosh / return clatter
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.28);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.sizzleGain && this.ctx) {
            this.sizzleGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx.currentTime);
        }
        return this.isMuted;
    }
}

window.kitchenAudio = new KitchenAudio();
