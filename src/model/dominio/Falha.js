// Uma condição que não foi cumprida, junto com o valor que o programa deixou.
const { hex2 } = require('../../../compartilhado/hex');

class Falha {
    constructor(condicao, valorObtido) {
        this.condicao = condicao;
        this.valorObtido = valorObtido;
    }

    // Por exemplo: "V2: esperado 0x0A, obtido 0xFC"
    texto() {
        const esperado = hex2(this.condicao.valorEsperado);
        const obtido = hex2(this.valorObtido);
        return `${this.condicao.nomeDoAlvo()}: esperado 0x${esperado}, obtido 0x${obtido}`;
    }
}

module.exports = Falha;
