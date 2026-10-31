// Desenha a tela de 64 x 32 pixels do CHIP-8 no canvas da página.

const LARGURA_DA_TELA = 64;
const ALTURA_DA_TELA = 32;
const COR_DO_FUNDO = '#1d2b53';
const COR_DO_PIXEL = '#7fdbff';

class Tela {
    constructor(canvas) {
        this.contexto = canvas.getContext('2d');
        this.escala = canvas.width / LARGURA_DA_TELA; // cada pixel do CHIP-8 vira um quadrado
    }

    desenhar(chip) {
        this.contexto.fillStyle = COR_DO_FUNDO;
        this.contexto.fillRect(0, 0, LARGURA_DA_TELA * this.escala, ALTURA_DA_TELA * this.escala);
        this.contexto.fillStyle = COR_DO_PIXEL;

        for (let y = 0; y < ALTURA_DA_TELA; y++) {
            for (let x = 0; x < LARGURA_DA_TELA; x++) {
                if (chip.Get_Video(y * LARGURA_DA_TELA + x)) {
                    this.contexto.fillRect(x * this.escala, y * this.escala, this.escala, this.escala);
                }
            }
        }
    }
}
