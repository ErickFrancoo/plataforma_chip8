// Uma página de Aprender (UC04): um texto de um nível e de um tema, com os exemplos do laboratório que ele indica.
class Conteudo {
    constructor(dados) {
        this.id = dados.id;             // o nome que aparece no endereço, como 'as-instrucoes'
        this.titulo = dados.titulo;
        this.nivel = dados.nivel;       // 1: introdução ao CHIP-8
        this.tema = dados.tema;
        this.resumo = dados.resumo;
        this.exemplos = dados.exemplos; // lista de { id, nome }
        this.texto = dados.texto;       // HTML
    }
}

module.exports = Conteudo;
