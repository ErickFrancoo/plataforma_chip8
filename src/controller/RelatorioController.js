// Realiza o UC12 (consultar progresso): o aprendiz vê quantos desafios já resolveu, no total e por conceito.
const Progresso = require('../model/dominio/Progresso');

class RelatorioController {
    constructor(desafios, resolvidos) {
        this.desafios = desafios;
        this.resolvidos = resolvidos;
    }

    progresso(req, res) {
        const usuario = res.locals.usuario;

        // O progresso é de uma conta: quem não entrou vai para a página Entrar
        if (usuario === null) {
            res.redirect('/entrar');
            return;
        }

        const progresso = new Progresso(this.desafios.listarPublicados(), this.resolvidos.resolvidosComData(usuario.id));
        res.render('progresso', { progresso: progresso, formatarData: Progresso.formatarData });
    }
}

module.exports = RelatorioController;
