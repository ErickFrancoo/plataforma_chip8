// Desenha a tela de 64 x 32 pixels do CHIP-8 no canvas da página.

const LARGURA_DA_TELA = 64;
const ALTURA_DA_TELA = 32;

class Tela {
    constructor(canvas) {
        this.contexto = canvas.getContext('2d');
        this.escala = canvas.width / LARGURA_DA_TELA; // cada pixel do CHIP-8 vira um quadrado

        // As cores ficam no estilo.css, junto com as do resto da página
        const estilo = getComputedStyle(document.documentElement);
        this.corDoFundo = estilo.getPropertyValue('--tela-fundo').trim();
        this.corDoPixel = estilo.getPropertyValue('--tela-pixel').trim();
    }

    desenhar(chip) {
        this.contexto.fillStyle = this.corDoFundo;
        this.contexto.fillRect(0, 0, LARGURA_DA_TELA * this.escala, ALTURA_DA_TELA * this.escala);
        this.contexto.fillStyle = this.corDoPixel;

        for (let y = 0; y < ALTURA_DA_TELA; y++) {
            for (let x = 0; x < LARGURA_DA_TELA; x++) {
                if (chip.Get_Video(y * LARGURA_DA_TELA + x)) {
                    // um pixel a menos de cada lado deixa uma fresta, como num display de LCD
                    this.contexto.fillRect(x * this.escala, y * this.escala, this.escala - 1, this.escala - 1);
                }
            }
        }
    }
}
