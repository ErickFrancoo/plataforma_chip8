// Testes do verificador (UC10): roda programas no núcleo e confere o resultado esperado dos desafios.
const test = require('node:test');
const assert = require('node:assert');
const { converterPrograma } = require('../compartilhado/hex.js');
const Nucleo = require('../src/model/verificacao/Nucleo');
const Verificador = require('../src/model/verificacao/Verificador');
const DesafioRepositorio = require('../src/model/dados/DesafioRepositorio');
const { abrirBanco } = require('../src/model/dados/banco');
const { Condicao, TIPO_REGISTRADOR } = require('../src/model/dominio/Condicao');

// Os desafios vêm de um banco só na memória, com os três desafios iniciais
const repositorio = new DesafioRepositorio(abrirBanco(':memory:'));
repositorio.criarDesafiosIniciais();
const somar = repositorio.buscar(1);
const memoria = repositorio.buscar(2);

// O núcleo é carregado uma vez e usado por todos os testes
let verificador = null;

async function verificar(texto, desafio) {
    if (verificador === null) {
        verificador = new Verificador(await Nucleo.carregar());
    }

    return verificador.verificar(converterPrograma(texto).bytes, desafio);
}

test('a condição compara o valor e se descreve para o aluno', () => {
    const condicao = new Condicao(TIPO_REGISTRADOR, 'V2', 0x0A);
    assert.strictEqual(condicao.confere(0x0A), true);
    assert.strictEqual(condicao.confere(0xFC), false);
    assert.strictEqual(condicao.descricao(), 'V2 = 0x0A');
});

test('as soluções de referência de todos os desafios são aprovadas', async () => {
    for (const desafio of repositorio.listarTodos()) {
        const resultado = await verificar(desafio.solucaoDeReferencia, desafio);
        assert.strictEqual(resultado.aprovado, true, desafio.titulo + ': ' + resultado.motivo);
    }
});

test('a solução certa conta as instruções executadas', async () => {
    const resultado = await verificar('6003 6107 8200 8214 1208', somar);
    assert.strictEqual(resultado.motivo, 'O programa terminou em 5 instruções.');
});

test('resultado errado é reprovado e mostra o que ficou diferente', async () => {
    const resultado = await verificar('6003 6107 8200 8215 1208', somar); // subtrai em vez de somar
    assert.strictEqual(resultado.aprovado, false);
    assert.deepStrictEqual(resultado.falhas.map((f) => f.texto()), ['V2: esperado 0x0A, obtido 0xFC']);
});

test('condição na memória mostra o endereço', async () => {
    const resultado = await verificar('6004 A300 F055 1206', memoria); // guarda 4 em vez de 5
    assert.deepStrictEqual(resultado.falhas.map((f) => f.texto()), ['memória[0x300]: esperado 0x05, obtido 0x04']);
});

test('programa que não termina é reprovado, mesmo deixando o resultado certo', async () => {
    const resultado = await verificar('620A 7301 1202', somar); // V2 = 0x0A e depois um laço sem fim
    assert.strictEqual(resultado.aprovado, false);
    assert.strictEqual(resultado.motivo,
        'O programa não terminou em 1000 instruções. Termine com um salto para o próprio endereço.');
});

test('instrução desconhecida é reprovada com a instrução e o endereço', async () => {
    const resultado = await verificar('5121', somar);
    assert.strictEqual(resultado.aprovado, false);
    assert.strictEqual(resultado.motivo, 'Instrução desconhecida 5121 no endereço 0x200.');
});

test('o mesmo programa dá sempre o mesmo resultado, até com sorteio', async () => {
    const primeiro = await verificar('C2FF 1202', somar); // V2 recebe um número sorteado
    const segundo = await verificar('C2FF 1202', somar);
    assert.deepStrictEqual(primeiro.falhas.map((f) => f.texto()), segundo.falhas.map((f) => f.texto()));
});

test('o repositório não encontra um desafio que não existe', () => {
    assert.strictEqual(repositorio.buscar(99), undefined);
});
