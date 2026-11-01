// Realiza o UC09 (submeter solução), que inclui o UC10 (verificar solução).
// O navegador envia só o texto do programa; quem executa e decide é o servidor.
const { converterPrograma } = require('../../compartilhado/hex');

class SubmissaoController {
    constructor(repositorio, verificador) {
        this.repositorio = repositorio;
        this.verificador = verificador;
    }

    submeter(req, res) {
        const desafio = this.repositorio.buscar(Number(req.params.id));

        if (desafio === undefined) {
            res.status(404).send('Desafio não encontrado.');
            return;
        }

        // A mesma conversão do editor do laboratório: com erro de digitação, o programa nem executa
        const programa = converterPrograma(req.body.programa || '');

        if (programa.erros.length > 0) {
            res.render('resultado', { desafio: desafio, resultado: null, erros: programa.erros });
            return;
        }

        const resultado = this.verificador.verificar(programa.bytes, desafio);
        res.render('resultado', { desafio: desafio, resultado: resultado, erros: [] });
    }
}

module.exports = SubmissaoController;
