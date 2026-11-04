// Realiza o UC07 (cadastrar-se) e o UC08 (entrar no sistema), além de sair.
// A sessão guarda só o id de quem entrou; o resto é buscado no banco a cada pedido.
const { Usuario, PAPEL_APRENDIZ } = require('../model/dominio/Usuario');

class ContaController {
    constructor(usuarios) {
        this.usuarios = usuarios;
    }

    abrir(req, res) {
        this.mostrarPagina(res, null, [], {});
    }

    entrar(req, res) {
        const email = Usuario.normalizarEmail(req.body.email || '');
        const usuario = this.usuarios.buscarPorEmail(email);

        // A mesma mensagem para e-mail ou senha errados, para não revelar quais e-mails têm conta
        if (usuario === undefined || !usuario.conferirSenha(req.body.senha || '')) {
            this.mostrarPagina(res, 'E-mail ou senha incorretos.', [], { emailEntrar: email });
            return;
        }

        if (usuario.bloqueado) {
            this.mostrarPagina(res, 'Esta conta está bloqueada.', [], { emailEntrar: email });
            return;
        }

        this.iniciarSessao(req, res, usuario);
    }

    cadastrar(req, res) {
        const nome = (req.body.nome || '').trim();
        const email = Usuario.normalizarEmail(req.body.email || '');
        const senha = req.body.senha || '';

        const erros = Usuario.validarCadastro(nome, email, senha);

        if (erros.length === 0 && this.usuarios.emailEmUso(email)) {
            erros.push('Já existe uma conta com este e-mail. Use o formulário "Entrar".');
        }

        if (erros.length > 0) {
            this.mostrarPagina(res, null, erros, { nome: nome, emailCadastro: email });
            return;
        }

        // Toda conta nova é de aprendiz; só um administrador promove alguém a instrutor
        const novo = new Usuario(null, nome, email, Usuario.resumirSenha(senha), PAPEL_APRENDIZ, false);
        this.iniciarSessao(req, res, this.usuarios.salvar(novo));
    }

    sair(req, res) {
        req.session.destroy(() => res.redirect('/'));
    }

    // Guarda na sessão quem entrou. regenerate troca a sessão por uma nova, para que ninguém
    // consiga aproveitar uma sessão criada antes do login.
    iniciarSessao(req, res, usuario) {
        req.session.regenerate(() => {
            req.session.usuarioId = usuario.id;
            res.redirect('/desafios');
        });
    }

    // A página tem os dois formulários; "valores" devolve o que a pessoa já tinha digitado
    mostrarPagina(res, erroAoEntrar, errosDoCadastro, valores) {
        const status = erroAoEntrar || errosDoCadastro.length > 0 ? 400 : 200;
        res.status(status).render('entrar', {
            erroAoEntrar: erroAoEntrar,
            errosDoCadastro: errosDoCadastro,
            valores: { emailEntrar: '', nome: '', emailCadastro: '', ...valores }
        });
    }
}

module.exports = ContaController;
