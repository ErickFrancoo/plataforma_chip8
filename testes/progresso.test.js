// Testes do UC12 (consultar progresso): a conta do progresso e a leitura dos resolvidos no banco.
const test = require('node:test');
const assert = require('node:assert');
const Progresso = require('../src/model/dominio/Progresso');
const { Usuario, PAPEL_APRENDIZ } = require('../src/model/dominio/Usuario');
const DesafioRepositorio = require('../src/model/dados/DesafioRepositorio');
const UsuarioRepositorio = require('../src/model/dados/UsuarioRepositorio');
const ResolvidoRepositorio = require('../src/model/dados/ResolvidoRepositorio');
const { abrirBanco } = require('../src/model/dados/banco');

// Só os campos que o progresso usa
const desafios = [
    { id: 1, titulo: 'Somar 3 e 7', conceito: 'Registradores' },
    { id: 2, titulo: 'Trocar dois registradores', conceito: 'Registradores' },
    { id: 3, titulo: 'O vai-um', conceito: 'Flags' },
    { id: 4, titulo: 'Multiplicar com somas', conceito: 'Laços' }
];

test('sem nada resolvido, o progresso é zero', () => {
    const progresso = new Progresso(desafios, []);

    assert.strictEqual(progresso.total, 4);
    assert.strictEqual(progresso.resolvidos.length, 0);
    assert.strictEqual(progresso.porcentagem(), 0);
});

test('o progresso conta o total, a porcentagem e cada conceito', () => {
    const progresso = new Progresso(desafios, [
        { desafioId: 3, data: '2026-11-10T15:00:00.000Z' },
        { desafioId: 1, data: '2026-11-09T12:00:00.000Z' },
        { desafioId: 2, data: '2026-11-10T20:00:00.000Z' }
    ]);

    assert.strictEqual(progresso.porcentagem(), 75);
    assert.deepStrictEqual(progresso.porConceito, [
        { conceito: 'Registradores', total: 2, resolvidos: 2 },
        { conceito: 'Flags', total: 1, resolvidos: 1 },
        { conceito: 'Laços', total: 1, resolvidos: 0 }
    ]);

    // Do mais antigo para o mais recente
    assert.deepStrictEqual(progresso.resolvidos.map((r) => r.titulo),
        ['Somar 3 e 7', 'O vai-um', 'Trocar dois registradores']);
});

test('um desafio resolvido que deixou de ser publicado não entra na conta', () => {
    const progresso = new Progresso(desafios, [{ desafioId: 99, data: '2026-11-10T15:00:00.000Z' }]);
    assert.strictEqual(progresso.resolvidos.length, 0);
});

test('a data aparece no dia de Brasília, e não no dia em UTC', () => {
    // 01h em UTC ainda é 22h do dia anterior em Brasília
    assert.strictEqual(Progresso.formatarData('2026-11-11T01:00:00.000Z'), '10/11/2026');
});

test('o repositório devolve os resolvidos de uma pessoa com a data', () => {
    const banco = abrirBanco(':memory:');
    new DesafioRepositorio(banco).criarDesafiosIniciais();
    const ana = new UsuarioRepositorio(banco).salvar(new Usuario(null, 'Ana', 'ana@exemplo.com', 'sal:resumo', PAPEL_APRENDIZ, false));
    const resolvidos = new ResolvidoRepositorio(banco);

    resolvidos.registrar(ana.id, 2, '6005 A300 F055 1206');
    const lista = resolvidos.resolvidosComData(ana.id);

    assert.strictEqual(lista.length, 1);
    assert.strictEqual(lista[0].desafioId, 2);
    assert.match(lista[0].data, /^\d{4}-\d{2}-\d{2}T/);
});
