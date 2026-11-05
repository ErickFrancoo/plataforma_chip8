// Busca as páginas de Aprender. Hoje elas vêm de um arquivo; quando houver o UC14, só este arquivo muda.
const Conteudo = require('../dominio/Conteudo');
const DADOS = require('./conteudos');

class ConteudoRepositorio {
    constructor() {
        this.conteudos = DADOS.map((dados) => new Conteudo(dados));
    }

    // Todas as páginas, na ordem de leitura; com um tema, só as daquele tema
    listar(tema) {
        if (!tema) {
            return this.conteudos;
        }

        return this.conteudos.filter((conteudo) => conteudo.tema === tema);
    }

    // Devolve undefined se não existir uma página com esse id
    buscar(id) {
        return this.conteudos.find((conteudo) => conteudo.id === id);
    }

    // Os temas, sem repetição e na ordem em que aparecem
    temas() {
        const temas = [];

        for (const conteudo of this.conteudos) {
            if (!temas.includes(conteudo.tema)) {
                temas.push(conteudo.tema);
            }
        }

        return temas;
    }
}

module.exports = ConteudoRepositorio;
