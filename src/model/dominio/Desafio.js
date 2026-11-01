// Um desafio: o enunciado e o resultado esperado, descrito por uma lista de condições.
const { Condicao } = require('./Condicao');

class Desafio {
    constructor(dados) {
        this.id = dados.id;
        this.titulo = dados.titulo;
        this.enunciado = dados.enunciado;
        this.conceito = dados.conceito;
        this.dificuldade = dados.dificuldade;
        this.limiteDeInstrucoes = dados.limiteDeInstrucoes;
        this.solucaoDeReferencia = dados.solucaoDeReferencia;
        this.condicoes = dados.condicoes.map((c) => new Condicao(c.tipo, c.alvo, c.valorEsperado));
    }
}

module.exports = Desafio;
