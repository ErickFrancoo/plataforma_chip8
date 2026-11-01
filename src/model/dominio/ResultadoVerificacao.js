// O que a verificação devolve: se o programa foi aprovado, o motivo e as condições que falharam.
class ResultadoVerificacao {
    constructor(aprovado, motivo, falhas) {
        this.aprovado = aprovado;
        this.motivo = motivo;   // frase para o aluno, como "O programa terminou em 5 instruções."
        this.falhas = falhas;   // lista de Falha; vazia quando o programa foi aprovado
    }
}

module.exports = ResultadoVerificacao;
