// Realiza o UC13 (manter desafios): o instrutor lista, cria, altera e exclui desafios.
// Quem não é instrutor nem chega aqui: o servidor.js barra antes (exigirInstrutor).
const { Desafio, DIFICULDADES } = require('../model/dominio/Desafio');
const { TIPO_REGISTRADOR, TIPO_MEMORIA } = require('../model/dominio/Condicao');
const { converterPrograma, hex2 } = require('../../compartilhado/hex');

const LINHAS_DE_CONDICAO = 4; // o formulário tem 4 linhas fixas para as condições

class GerenciarDesafiosController {
    constructor(repositorio, verificador, resolvidos) {
        this.repositorio = repositorio;
        this.verificador = verificador;
        this.resolvidos = resolvidos;
    }

    listar(req, res) {
        this.mostrarLista(res, null, false);
    }

    novo(req, res) {
        this.mostrarFormulario(res, undefined, valoresVazios(), []);
    }

    editar(req, res) {
        const desafio = this.repositorio.buscar(Number(req.params.id));

        if (desafio === undefined) {
            res.status(404).send('Desafio não encontrado.');
            return;
        }

        this.mostrarFormulario(res, desafio.id, valoresDoDesafio(desafio), []);
    }

    // Serve para criar (sem id no endereço) e para alterar (com id)
    salvar(req, res) {
        const id = req.params.id === undefined ? undefined : Number(req.params.id);

        if (id !== undefined && this.repositorio.buscar(id) === undefined) {
            res.status(404).send('Desafio não encontrado.');
            return;
        }

        const valores = lerFormulario(req.body);
        const erros = Desafio.validar(valores);

        if (erros.length > 0) {
            this.mostrarFormulario(res, id, valores, erros);
            return;
        }

        // A regra do UC13: executa a solução de referência no verificador (UC10) e só publica se ela passar
        const desafio = Desafio.criar(valores, id);
        const resultado = this.verificador.verificar(converterPrograma(desafio.solucaoDeReferencia).bytes, desafio);
        desafio.publicar(resultado);
        this.repositorio.salvar(desafio);

        res.render('desafio-salvo', { desafio: desafio, resultado: resultado });
    }

    // Um desafio que alguém já resolveu não pode ser excluído (o banco também não deixaria)
    excluir(req, res) {
        const desafio = this.repositorio.buscar(Number(req.params.id));

        if (desafio === undefined) {
            res.status(404).send('Desafio não encontrado.');
            return;
        }

        const quantos = this.resolvidos.quantosResolveram(desafio.id);

        if (quantos > 0) {
            const quem = quantos === 1 ? '1 pessoa já resolveu' : `${quantos} pessoas já resolveram`;
            this.mostrarLista(res, `"${desafio.titulo}" não foi excluído: ${quem} este desafio. ` +
                                   'Altere-o em vez de excluir.', true);
            return;
        }

        this.repositorio.excluir(desafio.id);
        this.mostrarLista(res, `"${desafio.titulo}" foi excluído.`, false);
    }

    // A lista de todos os desafios, com quantas pessoas resolveram cada um, e uma mensagem (ou null)
    mostrarLista(res, mensagem, ehErro) {
        const desafios = this.repositorio.listarTodos();
        const resolveram = desafios.map((desafio) => this.resolvidos.quantosResolveram(desafio.id));

        res.status(ehErro ? 400 : 200).render('gerenciar-desafios', {
            desafios: desafios,
            resolveram: resolveram,
            mensagem: mensagem,
            ehErro: ehErro
        });
    }

    // O formulário de criar (id undefined) ou de alterar um desafio
    mostrarFormulario(res, id, valores, erros) {
        res.status(erros.length > 0 ? 400 : 200).render('desafio-formulario', {
            id: id,
            valores: valores,
            erros: erros,
            dificuldades: DIFICULDADES
        });
    }
}

// O formulário trabalha com texto. Estas funções montam os "valores" que ele mostra e que o Desafio valida.

function valoresVazios() {
    return {
        titulo: '',
        enunciado: '',
        conceito: '',
        dificuldade: 'Fácil',
        limiteDeInstrucoes: '1000',
        solucaoDeReferencia: '',
        condicoes: completarLinhas([])
    };
}

function valoresDoDesafio(desafio) {
    return {
        titulo: desafio.titulo,
        enunciado: desafio.enunciado,
        conceito: desafio.conceito,
        dificuldade: desafio.dificuldade,
        limiteDeInstrucoes: String(desafio.limiteDeInstrucoes),
        solucaoDeReferencia: desafio.solucaoDeReferencia,
        condicoes: completarLinhas(desafio.condicoes.map((condicao) => ({
            tipo: condicao.tipo,
            alvo: condicao.alvo,
            valor: hex2(condicao.valorEsperado)
        })))
    };
}

// O que veio do formulário. Os campos das condições se chamam tipo0, alvo0, valor0, tipo1...
function lerFormulario(corpo) {
    const texto = (campo) => (corpo[campo] || '').trim();
    const condicoes = [];

    for (let i = 0; i < LINHAS_DE_CONDICAO; i++) {
        condicoes.push({
            tipo: corpo['tipo' + i] === TIPO_MEMORIA ? TIPO_MEMORIA : TIPO_REGISTRADOR,
            alvo: texto('alvo' + i),
            valor: texto('valor' + i)
        });
    }

    return {
        titulo: texto('titulo'),
        enunciado: texto('enunciado'),
        conceito: texto('conceito'),
        dificuldade: texto('dificuldade'),
        limiteDeInstrucoes: texto('limiteDeInstrucoes'),
        solucaoDeReferencia: texto('solucaoDeReferencia'),
        condicoes: condicoes
    };
}

// Completa com linhas vazias até ter as 4 linhas do formulário
function completarLinhas(condicoes) {
    const linhas = condicoes.slice();

    while (linhas.length < LINHAS_DE_CONDICAO) {
        linhas.push({ tipo: TIPO_REGISTRADOR, alvo: '', valor: '' });
    }

    return linhas;
}

module.exports = GerenciarDesafiosController;
