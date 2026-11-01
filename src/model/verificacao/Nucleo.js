// Liga o servidor ao núcleo do emulador: o mesmo chip8.wasm que o laboratório usa no navegador.
const carregarNucleo = require('../../../nucleo/build/chip8.js');
const { usarPerfilOriginal } = require('../../../compartilhado/perfil');
const EstadoFinal = require('./EstadoFinal');

const SEMENTE = 1; // semente fixa do sorteio (CXNN): o mesmo programa sempre dá o mesmo resultado

// Mesma ordem dos códigos de parada em chip8.hpp. O código 0 (RUNNING) depois da execução
// quer dizer que o programa ainda estava rodando quando o limite de instruções acabou.
const PARADAS = ['limite', 'fim', 'instrucao_desconhecida', 'pilha',
                 'salto_invalido', 'indice_invalido', 'pc_fora_da_memoria'];

class Nucleo {
    constructor(modulo) {
        this.modulo = modulo;
    }

    // O chip8.wasm é carregado em segundo plano, por isso o núcleo é criado com: await Nucleo.carregar()
    static async carregar() {
        const modulo = await carregarNucleo();
        return new Nucleo(modulo);
    }

    // Executa o programa (bytes) até ele parar ou até o limite de instruções, e devolve o estado final
    executar(programa, limite) {
        const chip = new this.modulo.Chip8();
        usarPerfilOriginal(chip);
        chip.Set_Seed(SEMENTE);
        chip.Load_ROM(programa);

        // Uma instrução por vez, para contar quantas foram executadas.
        // Run(1) segue a mesma regra dos timers do laboratório.
        let executadas = 0;

        while (executadas < limite) {
            executadas++;

            if (!chip.Run(1)) {
                break;
            }
        }

        const registradores = [];

        for (let i = 0; i < 16; i++) {
            registradores.push(chip.Get_Register(i));
        }

        const memoria = new Uint8Array(4096);

        for (let i = 0; i < 4096; i++) {
            memoria[i] = chip.Get_Memory(i);
        }

        const estado = new EstadoFinal(registradores, chip.Get_PC(), memoria,
                                       PARADAS[chip.Get_Last_Error()], executadas);
        chip.delete(); // objetos do embind precisam ser liberados à mão
        return estado;
    }
}

module.exports = Nucleo;
