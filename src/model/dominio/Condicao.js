// Uma condição do resultado esperado de um desafio, como "V2 = 0x0A" ou "memória[0x300] = 0x05".
const { hex2 } = require('../../../compartilhado/hex');

const TIPO_REGISTRADOR = 'REGISTRADOR';
const TIPO_MEMORIA = 'MEMORIA';

class Condicao {
    constructor(tipo, alvo, valorEsperado) {
        this.tipo = tipo;                   // TIPO_REGISTRADOR ou TIPO_MEMORIA
        this.alvo = alvo;                   // 'V0' a 'VF', ou um endereço como '0x300'
        this.valorEsperado = valorEsperado; // um byte, de 0 a 255
    }

    confere(obtido) {
        return obtido === this.valorEsperado;
    }

    // Como o alvo aparece para o aluno: "V2" ou "memória[0x300]"
    nomeDoAlvo() {
        if (this.tipo === TIPO_MEMORIA) {
            return `memória[${this.alvo}]`;
        }

        return this.alvo;
    }

    descricao() {
        return `${this.nomeDoAlvo()} = 0x${hex2(this.valorEsperado)}`;
    }
}

module.exports = { Condicao, TIPO_REGISTRADOR, TIPO_MEMORIA };
