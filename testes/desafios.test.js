// Testes dos desafios no banco de dados: o repositório, as condições, as situações e as chaves estrangeiras.
const test = require('node:test');
const assert = require('node:assert');
const { Desafio, SITUACAO_RASCUNHO } = require('../src/model/dominio/Desafio');
const { Condicao, TIPO_REGISTRADOR } = require('../src/model/dominio/Condicao');
const { Usuario, PAPEL_APRENDIZ, PAPEL_INSTRUTOR, PAPEL_ADMINISTRADOR } = require('../src/model/dominio/Usuario');
const DesafioRepositorio = require('../src/model/dados/DesafioRepositorio');
const UsuarioRepositorio = require('../src/model/dados/UsuarioRepositorio');
const ResolvidoRepositorio = require('../src/model/dados/ResolvidoRepositorio');
const { abrirBanco } = require('../src/model/dados/banco');

// Cada teste começa com um banco vazio e os três desafios iniciais
function prepararBanco() {
    const banco = abrirBanco(':memory:');
    const desafios = new DesafioRepositorio(banco);
    desafios.criarDesafiosIniciais();
    return { banco: banco, desafios: desafios };
}

function novoRascunho() {
    return new Desafio({
        titulo: 'Contar até 15',
        enunciado: 'Deixe 15 em V0.',
        conceito: 'Laços',
        dificuldade: 'Médio',
        limiteDeInstrucoes: 1000,
        solucaoDeReferencia: '600F 1202',
        situacao: SITUACAO_RASCUNHO,
        condicoes: [{ tipo: 'REGISTRADOR', alvo: 'V0', valorEsperado: 0x0F }]
    });
}

function contarCondicoes(banco, desafioId) {
    return banco.prepare('SELECT COUNT(*) AS total FROM condicoes WHERE desafio_id = ?').get(desafioId).total;
}

test('os desafios iniciais são gravados uma vez só, já publicados', () => {
    const { desafios } = prepararBanco();
    desafios.criarDesafiosIniciais(); // a segunda chamada não grava de novo

    const titulos = desafios.listarPublicados().map((desafio) => desafio.id + ' ' + desafio.titulo);
    assert.deepStrictEqual(titulos, ['1 Somar 3 e 7', '2 Guardar 5 na memória', '3 Somar de 1 a 5']);
});

test('um desafio lido do banco vem com os campos e as condições', () => {
    const { desafios } = prepararBanco();
    const somar = desafios.buscar(1);

    assert.strictEqual(somar.limiteDeInstrucoes, 1000);
    assert.strictEqual(somar.solucaoDeReferencia, '6003 6107 8200 8214 1208');
    assert.strictEqual(somar.condicoes.length, 1);
    assert.strictEqual(somar.condicoes[0].descricao(), 'V2 = 0x0A');
    assert.strictEqual(desafios.buscar(99), undefined);
});

test('um rascunho aparece para os instrutores, mas não na lista dos aprendizes', () => {
    const { desafios } = prepararBanco();
    const rascunho = desafios.salvar(novoRascunho());

    assert.strictEqual(rascunho.id, 4);
    assert.strictEqual(desafios.listarTodos().length, 4);
    assert.strictEqual(desafios.listarPublicados().length, 3);

    const pessoa = (papel) => new Usuario(1, 'Ana', 'ana@exemplo.com', 'sal:resumo', papel, false);
    assert.strictEqual(rascunho.visivelPara(null), false);
    assert.strictEqual(rascunho.visivelPara(pessoa(PAPEL_APRENDIZ)), false);
    assert.strictEqual(rascunho.visivelPara(pessoa(PAPEL_INSTRUTOR)), true);
    assert.strictEqual(rascunho.visivelPara(pessoa(PAPEL_ADMINISTRADOR)), true);
    assert.strictEqual(desafios.buscar(1).visivelPara(null), true);
});

test('alterar um desafio troca as condições antigas pelas novas', () => {
    const { banco, desafios } = prepararBanco();
    const somar = desafios.buscar(1);

    somar.titulo = 'Somar 3 e 7 (versão 2)';
    somar.condicoes = [new Condicao(TIPO_REGISTRADOR, 'V0', 3), new Condicao(TIPO_REGISTRADOR, 'V2', 0x0A)];
    desafios.salvar(somar);

    const lido = desafios.buscar(1);
    assert.strictEqual(lido.titulo, 'Somar 3 e 7 (versão 2)');
    assert.deepStrictEqual(lido.condicoes.map((c) => c.descricao()), ['V0 = 0x03', 'V2 = 0x0A']);
    assert.strictEqual(contarCondicoes(banco, 1), 2);
});

test('se der erro no meio da gravação, nada muda (transação)', () => {
    const { desafios } = prepararBanco();
    const somar = desafios.buscar(1);

    somar.titulo = 'Título que não deve ficar';
    somar.condicoes[0].valorEsperado = null; // a coluna valor_esperado é NOT NULL: o banco recusa

    assert.throws(() => desafios.salvar(somar));
    const lido = desafios.buscar(1);
    assert.strictEqual(lido.titulo, 'Somar 3 e 7');
    assert.strictEqual(lido.condicoes[0].descricao(), 'V2 = 0x0A');
});

test('excluir um desafio apaga as condições dele (ON DELETE CASCADE)', () => {
    const { banco, desafios } = prepararBanco();
    const rascunho = desafios.salvar(novoRascunho());

    desafios.excluir(rascunho.id);
    assert.strictEqual(desafios.buscar(rascunho.id), undefined);
    assert.strictEqual(contarCondicoes(banco, rascunho.id), 0);
});

test('o banco não deixa excluir um desafio que alguém já resolveu', () => {
    const { banco, desafios } = prepararBanco();
    const usuarios = new UsuarioRepositorio(banco);
    const ana = usuarios.salvar(new Usuario(null, 'Ana', 'ana@exemplo.com', 'sal:resumo', PAPEL_APRENDIZ, false));
    const resolvidos = new ResolvidoRepositorio(banco);

    resolvidos.registrar(ana.id, 1, '6003 6107 8200 8214 1208');
    assert.throws(() => desafios.excluir(1), /FOREIGN KEY/);
    assert.notStrictEqual(desafios.buscar(1), undefined);

    // E também não aceita um desafio resolvido que não existe
    assert.throws(() => resolvidos.registrar(ana.id, 99, '620A 1202'), /FOREIGN KEY/);
});
