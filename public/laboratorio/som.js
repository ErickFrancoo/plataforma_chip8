// Bipe do CHIP-8: um tom de 440 Hz enquanto o timer de som for maior que zero.
// O tom fica sempre tocando, e o volume liga e desliga.

class Som {
    constructor() {
        this.volume = null;
    }

    // O navegador só libera o áudio depois de um clique, por isso o som é preparado no botão Executar
    preparar() {
        if (this.volume !== null) {
            return;
        }

        const contexto = new AudioContext();
        this.volume = contexto.createGain();
        this.volume.gain.value = 0;
        this.volume.connect(contexto.destination);

        const oscilador = contexto.createOscillator();
        oscilador.type = 'square';
        oscilador.frequency.value = 440;
        oscilador.connect(this.volume);
        oscilador.start();
    }

    tocar(ligado) {
        if (this.volume !== null) {
            this.volume.gain.value = ligado ? 0.05 : 0;
        }
    }
}
