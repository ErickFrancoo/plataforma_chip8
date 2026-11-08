// Testes dos desafios resolvidos: o que fica gravado quando uma solução é aprovada.
const test = require('node:test');
const assert = require('node:assert');
const { Usuario, PAPEL_APRENDIZ } = require('../src/model/dominio/Usuario');
const UsuarioRepositorio = require('../src/model/dados/UsuarioRepositorio');
const ResolvidoRepositorio = require('../src/model/dados/ResolvidoRepositorio');
const DesafioRepositorio = require('../src/model/dados/DesafioRepositorio');
const { abrirBanco } = require('../src/model/dados/banco');

// Cada teste começa com um banco vazio, os três desafios iniciais e duas contas: Ana (id 1) e Bruno (id 2)
function prepararBanco() {
    const banco = abrirBanco(':memory:');
    const usuarios = new UsuarioRepositorio(banco);
    new DesafioRepositorio(banco).criarDesafiosIniciais();

    for (const email of ['ana@exemplo.com', 'bruno@exemplo.com']) {
        usuarios.salvar(new Usuario(null, 'Teste', email, Usuario.resumirSenha('segredo123'), PAPEL_APRENDIZ, false));
    }

    return { banco: banco, resolvidos: new ResolvidoRepositorio(banco) };
}

test('um desafio resolvido fica gravado', () => {
    const { resolvidos } = prepararBanco();

    assert.deepStrictEqual(resolvidos.desafiosResolvidos(1), []);
    resolvidos.registrar(1, 2, '6005 A300 F055 1206');
    resolvidos.registrar(1, 3, '6000 6101 8014 7101 3106 1204 120C');
    assert.deepStrictEqual(resolvidos.desafiosResolvidos(1), [2, 3]);
});

test('resolver o mesmo desafio de novo não grava outra linha e mantém a primeira solução', () => {
    const { banco, resolvidos } = prepararBanco();

    resolvidos.registrar(1, 1, 'primeira solução');
    resolvidos.registrar(1, 1, 'segunda solução');

    const linhas = banco.prepare('SELECT programa FROM desafios_resolvidos').all();
    assert.strictEqual(linhas.length, 1);
    assert.strictEqual(linhas[0].programa, 'primeira solução');
});

test('os desafios resolvidos de uma pessoa não aparecem para outra', () => {
    const { resolvidos } = prepararBanco();

    resolvidos.registrar(1, 1, '620A 1202');
    assert.deepStrictEqual(resolvidos.desafiosResolvidos(1), [1]);
    assert.deepStrictEqual(resolvidos.desafiosResolvidos(2), []);
});

test('o banco não aceita um desafio resolvido por uma conta que não existe', () => {
    const { resolvidos } = prepararBanco();
    assert.throws(() => resolvidos.registrar(99, 1, '620A 1202'), /FOREIGN KEY/);
});
