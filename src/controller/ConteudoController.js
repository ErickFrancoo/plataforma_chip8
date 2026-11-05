// Realiza o UC04 (consultar conteúdo): a lista das páginas de Aprender e cada página.
class ConteudoController {
    constructor(repositorio) {
        this.repositorio = repositorio;
    }

    // O tema escolhido vem no endereço, como /aprender?tema=Tela
    listar(req, res) {
        const tema = req.query.tema || '';

        res.render('conteudos', {
            conteudos: this.repositorio.listar(tema),
            temas: this.repositorio.temas(),
            temaEscolhido: tema
        });
    }

    abrir(req, res) {
        const conteudo = this.repositorio.buscar(req.params.id);

        if (conteudo === undefined) {
            res.status(404).send('Página não encontrada.');
            return;
        }

        // A página anterior e a próxima, na ordem de leitura (undefined na primeira e na última)
        const todos = this.repositorio.listar();
        const posicao = todos.indexOf(conteudo);

        res.render('conteudo', {
            conteudo: conteudo,
            anterior: todos[posicao - 1],
            proximo: todos[posicao + 1]
        });
    }
}

module.exports = ConteudoController;
