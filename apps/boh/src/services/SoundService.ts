/**
 * @author Hyphae BOH Team
 * @description Programmatic sound effects for the Kitchen Display System using Web Audio API.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

class SoundService {
    private ctx: AudioContext | null = null;

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    /**
     * Sound for a new incoming order.
     * High-pitched "Ding" to grab attention.
     */
    playNewOrder() {
        try {
            this.init();
            if (this.ctx?.state === 'suspended') {
                this.ctx.resume();
            }

            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, this.ctx!.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, this.ctx!.currentTime + 0.2);

            gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start();
            osc.stop(this.ctx!.currentTime + 0.2);
        } catch (e) {
            console.warn('[SoundService] Audio error:', e);
        }
    }

    /**
     * Sound for completing (bumping) an order.
     * Satisfying low "Pop" to confirm action.
     */
    playOrderComplete() {
        try {
            this.init();
            if (this.ctx?.state === 'suspended') {
                this.ctx.resume();
            }

            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, this.ctx!.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, this.ctx!.currentTime + 0.1);

            gain.gain.setValueAtTime(0.15, this.ctx!.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start();
            osc.stop(this.ctx!.currentTime + 0.1);
        } catch (e) {
            console.warn('[SoundService] Audio error:', e);
        }
    }
}

export const soundService = new SoundService();
