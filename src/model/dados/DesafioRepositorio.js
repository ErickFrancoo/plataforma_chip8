// Busca os desafios. Hoje eles vêm de um arquivo; quando houver banco de dados, só este arquivo muda.
const Desafio = require('../dominio/Desafio');
const DADOS = require('./desafios');

class DesafioRepositorio {
    constructor() {
        this.desafios = DADOS.map((dados) => new Desafio(dados));
    }

    listar() {
        return this.desafios;
    }

    // Devolve undefined se não existir um desafio com esse id
    buscar(id) {
        return this.desafios.find((desafio) => desafio.id === id);
    }
}

module.exports = DesafioRepositorio;
