// Um desafio: o enunciado e o resultado esperado, descrito por uma lista de condições.
const { Condicao, TIPO_REGISTRADOR, TIPO_MEMORIA } = require('./Condicao');
const { PAPEL_INSTRUTOR } = require('./Usuario');
const { converterPrograma } = require('../../../compartilhado/hex');

// Só os desafios publicados aparecem para os aprendizes; os rascunhos, só para os instrutores
const SITUACAO_PUBLICADO = 'PUBLICADO';
const SITUACAO_RASCUNHO = 'RASCUNHO';

const DIFICULDADES = ['Fácil', 'Médio', 'Difícil'];
const LIMITE_MAXIMO = 100000;

class Desafio {
    constructor(dados) {
        this.id = dados.id; // undefined num desafio novo, que ainda não foi gravado
        this.titulo = dados.titulo;
        this.enunciado = dados.enunciado;
        this.conceito = dados.conceito;
        this.dificuldade = dados.dificuldade;
        this.limiteDeInstrucoes = dados.limiteDeInstrucoes;
        this.solucaoDeReferencia = dados.solucaoDeReferencia;
        this.situacao = dados.situacao;
        this.condicoes = dados.condicoes.map((c) => new Condicao(c.tipo, c.alvo, c.valorEsperado));
    }

    // Quem pode ver o desafio: todos, se ele está publicado; só os instrutores, se é um rascunho.
    // "usuario" é null para o visitante.
    visivelPara(usuario) {
        if (this.situacao === SITUACAO_PUBLICADO) {
            return true;
        }

        return usuario !== null && usuario.temPapel(PAPEL_INSTRUTOR);
    }

    // A regra do UC13: o desafio só é publicado se a solução de referência for aprovada pelo verificador
    publicar(resultado) {
        this.situacao = resultado.aprovado ? SITUACAO_PUBLICADO : SITUACAO_RASCUNHO;
    }

    // As regras do UC13 para o que o instrutor digitou. "valores" tem tudo como texto, inclusive as
    // condições: { tipo, alvo, valor }. Linhas de condição vazias são ignoradas.
    // Devolve a lista de erros; vazia quando está tudo certo.
    static validar(valores) {
        const erros = [];

        if (valores.titulo === '') {
            erros.push('Informe o título.');
        }

        if (valores.enunciado === '') {
            erros.push('Informe o enunciado.');
        }

        if (valores.conceito === '') {
            erros.push('Informe o conceito, como Registradores.');
        }

        if (!DIFICULDADES.includes(valores.dificuldade)) {
            erros.push('Escolha a dificuldade.');
        }

        const limite = Number(valores.limiteDeInstrucoes);

        if (!/^\d+$/.test(valores.limiteDeInstrucoes) || limite < 1 || limite > LIMITE_MAXIMO) {
            erros.push(`O limite de instruções vai de 1 a ${LIMITE_MAXIMO}.`);
        }

        const condicoes = Desafio.condicoesPreenchidas(valores);

        if (condicoes.length === 0) {
            erros.push('Informe pelo menos uma condição do resultado esperado.');
        }

        condicoes.forEach((condicao, i) => {
            const numero = i + 1;

            if (condicao.tipo === TIPO_REGISTRADOR && !/^V[0-9A-F]$/i.test(condicao.alvo)) {
                erros.push(`Condição ${numero}: o registrador vai de V0 a VF.`);
            }

            if (condicao.tipo === TIPO_MEMORIA && !/^0x[0-9A-F]{1,3}$/i.test(condicao.alvo)) {
                erros.push(`Condição ${numero}: o endereço vai de 0x000 a 0xFFF, como 0x300.`);
            }

            if (!/^[0-9A-F]{1,2}$/i.test(condicao.valor)) {
                erros.push(`Condição ${numero}: o valor é um byte em hexadecimal, de 00 a FF.`);
            }
        });

        // A mesma conversão do editor do laboratório
        for (const erro of converterPrograma(valores.solucaoDeReferencia).erros) {
            erros.push('Solução de referência: ' + erro + '.');
        }

        return erros;
    }

    // Cria o desafio a partir do que o instrutor digitou, depois de validar. Os alvos ficam sempre
    // no mesmo formato ('V2' e '0x300'), e os valores viram números.
    static criar(valores, id) {
        const condicoes = Desafio.condicoesPreenchidas(valores).map((condicao) => ({
            tipo: condicao.tipo,
            alvo: condicao.tipo === TIPO_REGISTRADOR
                ? condicao.alvo.toUpperCase()
                : '0x' + parseInt(condicao.alvo, 16).toString(16).toUpperCase().padStart(3, '0'),
            valorEsperado: parseInt(condicao.valor, 16)
        }));

        return new Desafio({
            id: id,
            titulo: valores.titulo,
            enunciado: valores.enunciado,
            conceito: valores.conceito,
            dificuldade: valores.dificuldade,
            limiteDeInstrucoes: Number(valores.limiteDeInstrucoes),
            solucaoDeReferencia: valores.solucaoDeReferencia,
            situacao: SITUACAO_RASCUNHO, // quem decide se publica é o publicar, depois da verificação
            condicoes: condicoes
        });
    }

    static condicoesPreenchidas(valores) {
        return valores.condicoes.filter((condicao) => condicao.alvo !== '' || condicao.valor !== '');
    }
}

module.exports = { Desafio, SITUACAO_PUBLICADO, SITUACAO_RASCUNHO, DIFICULDADES };
