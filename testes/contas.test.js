// Testes das contas de usuário (UC07 e UC08): senha, regras do cadastro, papéis e o repositório.
const test = require('node:test');
const assert = require('node:assert');
const { Usuario, PAPEL_APRENDIZ, PAPEL_INSTRUTOR, PAPEL_ADMINISTRADOR } = require('../src/model/dominio/Usuario');
const UsuarioRepositorio = require('../src/model/dados/UsuarioRepositorio');
const { abrirBanco } = require('../src/model/dados/banco');

function novoUsuario(email, papel) {
    return new Usuario(null, 'Ana', email, Usuario.resumirSenha('segredo123'), papel, false);
}

test('a senha certa confere e a errada não', () => {
    const ana = novoUsuario('ana@exemplo.com', PAPEL_APRENDIZ);
    assert.strictEqual(ana.conferirSenha('segredo123'), true);
    assert.strictEqual(ana.conferirSenha('segredo124'), false);
});

test('a senha não é guardada, e a mesma senha gera resumos diferentes', () => {
    const primeiro = Usuario.resumirSenha('segredo123');
    const segundo = Usuario.resumirSenha('segredo123');
    assert.ok(!primeiro.includes('segredo123'));
    assert.notStrictEqual(primeiro, segundo);
});

test('o cadastro exige nome, e-mail válido e senha de 6 caracteres', () => {
    assert.deepStrictEqual(Usuario.validarCadastro('Ana', 'ana@exemplo.com', 'segredo'), []);
    assert.deepStrictEqual(Usuario.validarCadastro(' ', 'ana@exemplo', '123'), [
        'Informe o seu nome.',
        'Informe um e-mail válido.',
        'A senha precisa ter pelo menos 6 caracteres.'
    ]);
});

test('o e-mail é comparado sem espaços e em minúsculas', () => {
    assert.strictEqual(Usuario.normalizarEmail('  Ana@Exemplo.COM '), 'ana@exemplo.com');
});

test('cada papel tem as permissões dos anteriores', () => {
    const aprendiz = novoUsuario('a@x.com', PAPEL_APRENDIZ);
    const administrador = novoUsuario('b@x.com', PAPEL_ADMINISTRADOR);
    assert.strictEqual(aprendiz.temPapel(PAPEL_APRENDIZ), true);
    assert.strictEqual(aprendiz.temPapel(PAPEL_INSTRUTOR), false);
    assert.strictEqual(administrador.temPapel(PAPEL_INSTRUTOR), true);
});

test('o repositório grava, busca e confere se o e-mail está em uso', () => {
    const usuarios = new UsuarioRepositorio(abrirBanco(':memory:'));
    const ana = usuarios.salvar(novoUsuario('ana@exemplo.com', PAPEL_APRENDIZ));

    assert.strictEqual(ana.id, 1);
    assert.strictEqual(usuarios.buscarPorEmail('ana@exemplo.com').nome, 'Ana');
    assert.strictEqual(usuarios.buscarPorId(1).email, 'ana@exemplo.com');
    assert.strictEqual(usuarios.buscarPorId(1).conferirSenha('segredo123'), true);
    assert.strictEqual(usuarios.emailEmUso('ana@exemplo.com'), true);
    assert.strictEqual(usuarios.emailEmUso('bruno@exemplo.com'), false);
    assert.strictEqual(usuarios.buscarPorEmail('bruno@exemplo.com'), undefined);
});

test('o banco não aceita dois usuários com o mesmo e-mail', () => {
    const usuarios = new UsuarioRepositorio(abrirBanco(':memory:'));
    usuarios.salvar(novoUsuario('ana@exemplo.com', PAPEL_APRENDIZ));
    assert.throws(() => usuarios.salvar(novoUsuario('ana@exemplo.com', PAPEL_APRENDIZ)));
});
