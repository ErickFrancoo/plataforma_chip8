// O estado da máquina quando a execução acabou, lido do núcleo.
const { TIPO_REGISTRADOR, TIPO_MEMORIA } = require('../dominio/Condicao');

class EstadoFinal {
    constructor(registradores, pc, memoria, parada, instrucoesExecutadas) {
        this.registradores = registradores; // V0 a VF
        this.pc = pc;
        this.memoria = memoria;             // os 4096 bytes da memória
        this.parada = parada;               // por que parou: 'fim', 'limite', 'instrucao_desconhecida'...
        this.instrucoesExecutadas = instrucoesExecutadas;
    }

    // Terminou normalmente: chegou ao salto para o próprio endereço
    terminou() {
        return this.parada === 'fim';
    }

    // O valor que uma condição vai conferir: um registrador ou um byte da memória
    valor(tipo, alvo) {
        if (tipo === TIPO_REGISTRADOR) {
            return this.registradores[parseInt(alvo.slice(1), 16)]; // 'V2' -> registrador 2
        }

        if (tipo === TIPO_MEMORIA) {
            return this.memoria[parseInt(alvo, 16)]; // '0x300' -> endereço 768
        }

        return undefined;
    }
}

module.exports = EstadoFinal;
