// Realiza o UC17 (gerenciar usuários e papéis): o administrador muda o papel das contas e as bloqueia.
// Quem não é administrador nem chega aqui: o servidor.js barra antes.
const { Usuario, PAPEIS } = require('../model/dominio/Usuario');

class UsuariosController {
    constructor(usuarios) {
        this.usuarios = usuarios;
    }

    listar(req, res) {
        this.mostrarLista(res, null, false);
    }

    alterarPapel(req, res) {
        const alvo = this.usuarios.buscarPorId(Number(req.params.id));

        if (alvo === undefined) {
            res.status(404).send('Usuário não encontrado.');
            return;
        }

        const papel = req.body.papel || '';
        const erro = Usuario.validarMudancaDePapel(res.locals.usuario, alvo, papel);

        if (erro !== null) {
            this.mostrarLista(res, erro, true);
            return;
        }

        this.usuarios.alterarPapel(alvo.id, papel);
        this.mostrarLista(res, `${alvo.nome} agora tem o papel ${nomeDoPapel(papel)}.`, false);
    }

    // O formulário envia bloquear = "sim" para bloquear e "nao" para desbloquear
    alterarBloqueio(req, res) {
        const alvo = this.usuarios.buscarPorId(Number(req.params.id));

        if (alvo === undefined) {
            res.status(404).send('Usuário não encontrado.');
            return;
        }

        const bloquear = req.body.bloquear === 'sim';
        const erro = bloquear ? Usuario.validarBloqueio(res.locals.usuario, alvo) : null;

        if (erro !== null) {
            this.mostrarLista(res, erro, true);
            return;
        }

        this.usuarios.alterarBloqueio(alvo.id, bloquear);
        this.mostrarLista(res, `A conta de ${alvo.nome} foi ${bloquear ? 'bloqueada' : 'desbloqueada'}.`, false);
    }

    // A lista de todas as contas, com uma mensagem (ou null)
    mostrarLista(res, mensagem, ehErro) {
        res.status(ehErro ? 400 : 200).render('usuarios', {
            contas: this.usuarios.listar(),
            papeis: PAPEIS,
            nomeDoPapel: nomeDoPapel,
            mensagem: mensagem,
            ehErro: ehErro
        });
    }
}

// 'INSTRUTOR' vira 'Instrutor'
function nomeDoPapel(papel) {
    return papel.charAt(0) + papel.slice(1).toLowerCase();
}

module.exports = UsuariosController;
