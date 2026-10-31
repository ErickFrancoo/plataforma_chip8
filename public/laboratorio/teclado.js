// Liga o teclado do computador às 16 teclas do CHIP-8, no mesmo arranjo do emulador de desktop:
//
//   computador      CHIP-8
//   1 2 3 4         1 2 3 C
//   Q W E R         4 5 6 D
//   A S D F         7 8 9 E
//   Z X C V         A 0 B F

const MAPA_DE_TECLAS = {
    Digit1: 0x1, Digit2: 0x2, Digit3: 0x3, Digit4: 0xC,
    KeyQ: 0x4, KeyW: 0x5, KeyE: 0x6, KeyR: 0xD,
    KeyA: 0x7, KeyS: 0x8, KeyD: 0x9, KeyF: 0xE,
    KeyZ: 0xA, KeyX: 0x0, KeyC: 0xB, KeyV: 0xF
};

class Teclado {
    constructor() {
        this.pressionadas = new Array(16).fill(false);
        this.soltas = new Array(16).fill(false);
        window.addEventListener('keydown', (evento) => this.mudar(evento, true));
        window.addEventListener('keyup', (evento) => this.mudar(evento, false));
    }

    mudar(evento, pressionada) {
        if (evento.target.tagName === 'TEXTAREA') {
            return; // a pessoa está digitando no editor
        }

        const tecla = MAPA_DE_TECLAS[evento.code];

        if (tecla === undefined) {
            return;
        }

        if (pressionada) {
            this.pressionadas[tecla] = true;
        } else {
            this.soltas[tecla] = true;
        }

        evento.preventDefault();
    }

    // Passa para o núcleo quais teclas estão pressionadas agora.
    // Uma tecla solta só é liberada depois que o núcleo a viu pressionada,
    // para que um toque rápido, mais curto que um quadro, não se perca.
    atualizar(chip) {
        for (let tecla = 0; tecla < 16; tecla++) {
            chip.Set_KeyPad(tecla, this.pressionadas[tecla]);

            if (this.soltas[tecla]) {
                this.pressionadas[tecla] = false;
                this.soltas[tecla] = false;
            }
        }
    }
}
