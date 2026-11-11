// Testes do UC17 (gerenciar usuários e papéis): as regras do administrador e o repositório.
const test = require('node:test');
const assert = require('node:assert');
const { Usuario, PAPEL_APRENDIZ, PAPEL_INSTRUTOR, PAPEL_ADMINISTRADOR } = require('../src/model/dominio/Usuario');
const UsuarioRepositorio = require('../src/model/dados/UsuarioRepositorio');
const { abrirBanco } = require('../src/model/dados/banco');

function conta(id, nome, papel) {
    return new Usuario(id, nome, nome.toLowerCase() + '@exemplo.com', 'sal:resumo', papel, false);
}

const administrador = conta(1, 'Carla', PAPEL_ADMINISTRADOR);
const ana = conta(2, 'Ana', PAPEL_APRENDIZ);

test('o administrador muda o papel de outra conta', () => {
    assert.strictEqual(Usuario.validarMudancaDePapel(administrador, ana, PAPEL_INSTRUTOR), null);
});

test('o administrador não muda o próprio papel nem escolhe um papel que não existe', () => {
    assert.strictEqual(Usuario.validarMudancaDePapel(administrador, administrador, PAPEL_APRENDIZ),
        'Você não pode mudar o seu próprio papel.');
    assert.strictEqual(Usuario.validarMudancaDePapel(administrador, ana, 'CHEFE'), 'Escolha um papel válido.');
});

test('o administrador bloqueia outra conta, mas não a própria', () => {
    assert.strictEqual(Usuario.validarBloqueio(administrador, ana), null);
    assert.strictEqual(Usuario.validarBloqueio(administrador, administrador),
        'Você não pode bloquear a sua própria conta.');
});

test('o repositório lista as contas em ordem alfabética e grava o bloqueio', () => {
    const usuarios = new UsuarioRepositorio(abrirBanco(':memory:'));
    usuarios.salvar(conta(null, 'Bruno', PAPEL_APRENDIZ));
    const salva = usuarios.salvar(conta(null, 'Ana', PAPEL_APRENDIZ));

    assert.deepStrictEqual(usuarios.listar().map((u) => u.nome), ['Ana', 'Bruno']);

    usuarios.alterarBloqueio(salva.id, true);
    assert.strictEqual(usuarios.buscarPorId(salva.id).bloqueado, true);
    usuarios.alterarBloqueio(salva.id, false);
    assert.strictEqual(usuarios.buscarPorId(salva.id).bloqueado, false);
});
