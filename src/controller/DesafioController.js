// Realiza o UC05 (consultar desafios): a lista e a página de um desafio.
// A página do desafio é o próprio laboratório, com o enunciado e o botão de submeter.
class DesafioController {
    constructor(repositorio, resolvidos) {
        this.repositorio = repositorio;
        this.resolvidos = resolvidos;
    }

    listar(req, res) {
        // Quem não entrou não tem desafios resolvidos
        const usuario = res.locals.usuario;
        const resolvidos = usuario === null ? [] : this.resolvidos.desafiosResolvidos(usuario.id);

        res.render('desafios', { desafios: this.repositorio.listar(), resolvidos: resolvidos });
    }

    abrir(req, res) {
        const desafio = this.repositorio.buscar(Number(req.params.id));

        if (desafio === undefined) {
            res.status(404).send('Desafio não encontrado.');
            return;
        }

        res.render('laboratorio', { desafio: desafio });
    }
}

module.exports = DesafioController;
