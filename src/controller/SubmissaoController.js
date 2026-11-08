// Realiza o UC09 (submeter solução), que inclui o UC10 (verificar solução).
// O navegador envia só o texto do programa; quem executa e decide é o servidor.
const { converterPrograma } = require('../../compartilhado/hex');

class SubmissaoController {
    constructor(repositorio, verificador, resolvidos) {
        this.repositorio = repositorio;
        this.verificador = verificador;
        this.resolvidos = resolvidos;
    }

    submeter(req, res) {
        const desafio = this.repositorio.buscar(Number(req.params.id));

        // Um rascunho só recebe submissões dos instrutores, que testam o desafio antes de publicá-lo
        if (desafio === undefined || !desafio.visivelPara(res.locals.usuario)) {
            res.status(404).send('Desafio não encontrado.');
            return;
        }

        // A mesma conversão do editor do laboratório: com erro de digitação, o programa nem executa
        const texto = req.body.programa || '';
        const programa = converterPrograma(texto);

        if (programa.erros.length > 0) {
            res.render('resultado', { desafio: desafio, resultado: null, erros: programa.erros });
            return;
        }

        const resultado = this.verificador.verificar(programa.bytes, desafio);

        // Qualquer pessoa pode submeter, mas só fica guardado o desafio resolvido por quem entrou
        const usuario = res.locals.usuario;

        if (resultado.aprovado && usuario !== null) {
            this.resolvidos.registrar(usuario.id, desafio.id, texto);
        }

        res.render('resultado', { desafio: desafio, resultado: resultado, erros: [] });
    }
}

module.exports = SubmissaoController;
