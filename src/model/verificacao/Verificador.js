// Executa a solução do aluno no núcleo e confere o resultado esperado do desafio (UC10).
const ResultadoVerificacao = require('../dominio/ResultadoVerificacao');
const Falha = require('../dominio/Falha');
const { hex2 } = require('../../../compartilhado/hex');

// O que dizer ao aluno quando o programa para por erro
const MOTIVOS_DE_ERRO = {
    pilha: 'Erro de pilha: um retorno (00EE) sem chamada, ou chamadas demais.',
    salto_invalido: 'Um salto (BNNN) foi para fora da memória.',
    indice_invalido: 'O registrador I apontou para fora da memória.',
    pc_fora_da_memoria: 'O PC passou do fim da memória.'
};

class Verificador {
    constructor(nucleo) {
        this.nucleo = nucleo;
    }

    verificar(programa, desafio) {
        const estado = this.nucleo.executar(programa, desafio.limiteDeInstrucoes);

        // Se o programa não terminou normalmente, nem confere as condições
        if (!estado.terminou()) {
            return new ResultadoVerificacao(false, this.motivoDaParada(estado, desafio), []);
        }

        const falhas = [];

        for (const condicao of desafio.condicoes) {
            const obtido = estado.valor(condicao.tipo, condicao.alvo);

            if (!condicao.confere(obtido)) {
                falhas.push(new Falha(condicao, obtido));
            }
        }

        const n = estado.instrucoesExecutadas;
        const motivo = `O programa terminou em ${n} ${n === 1 ? 'instrução' : 'instruções'}.`;
        return new ResultadoVerificacao(falhas.length === 0, motivo, falhas);
    }

    motivoDaParada(estado, desafio) {
        if (estado.parada === 'limite') {
            return `O programa não terminou em ${desafio.limiteDeInstrucoes} instruções. ` +
                   'Termine com um salto para o próprio endereço.';
        }

        if (estado.parada === 'instrucao_desconhecida') {
            const endereco = estado.pc - 2; // o PC já tinha passado da instrução
            const instrucao = hex2(estado.memoria[endereco]) + hex2(estado.memoria[endereco + 1]);
            return `Instrução desconhecida ${instrucao} no endereço 0x${endereco.toString(16).toUpperCase()}.`;
        }

        return MOTIVOS_DE_ERRO[estado.parada];
    }
}

module.exports = Verificador;
