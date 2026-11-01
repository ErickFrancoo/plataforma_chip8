// Realiza o UC01 (executar programa), o UC02 (passo a passo) e o UC03 (escrever em hexadecimal).
// Os três acontecem no navegador, então o controller só entrega a página do laboratório.
class LaboratorioController {
    abrir(req, res) {
        res.render('laboratorio', { desafio: null }); // laboratório livre: sem desafio
    }
}

module.exports = LaboratorioController;
