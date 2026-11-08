// Testes do UC13 (manter desafios): as regras do formulário e a publicação depois da verificação.
const test = require('node:test');
const assert = require('node:assert');
const { Desafio, SITUACAO_PUBLICADO, SITUACAO_RASCUNHO } = require('../src/model/dominio/Desafio');
const { Usuario, PAPEL_APRENDIZ } = require('../src/model/dominio/Usuario');
const DesafioRepositorio = require('../src/model/dados/DesafioRepositorio');
const UsuarioRepositorio = require('../src/model/dados/UsuarioRepositorio');
const ResolvidoRepositorio = require('../src/model/dados/ResolvidoRepositorio');
const { abrirBanco } = require('../src/model/dados/banco');
const { converterPrograma } = require('../compartilhado/hex.js');
const Nucleo = require('../src/model/verificacao/Nucleo');
const Verificador = require('../src/model/verificacao/Verificador');

// O que o instrutor digitaria num desafio certo; cada teste muda o que precisa
function valoresValidos() {
    return {
        titulo: 'Contar até 15',
        enunciado: 'Deixe 15 em V0.',
        conceito: 'Laços',
        dificuldade: 'Médio',
        limiteDeInstrucoes: '1000',
        solucaoDeReferencia: '600F 1202',
        condicoes: [
            { tipo: 'REGISTRADOR', alvo: 'v0', valor: '0f' },
            { tipo: 'REGISTRADOR', alvo: '', valor: '' },
            { tipo: 'MEMORIA', alvo: '', valor: '' },
            { tipo: 'REGISTRADOR', alvo: '', valor: '' }
        ]
    };
}

// Faz o que o controller faz ao salvar: verifica a solução de referência e publica (ou não)
async function salvarEVerificar(valores) {
    const verificador = new Verificador(await Nucleo.carregar());
    const desafio = Desafio.criar(valores, undefined);
    const resultado = verificador.verificar(converterPrograma(desafio.solucaoDeReferencia).bytes, desafio);
    desafio.publicar(resultado);
    return { desafio, resultado };
}

test('um desafio preenchido certo não tem erros, e as linhas vazias são ignoradas', () => {
    assert.deepStrictEqual(Desafio.validar(valoresValidos()), []);
});

test('o formulário vazio mostra o que falta', () => {
    const valores = valoresValidos();
    valores.titulo = '';
    valores.enunciado = '';
    valores.conceito = '';
    valores.dificuldade = 'Impossível';
    valores.limiteDeInstrucoes = '0';
    valores.solucaoDeReferencia = '';
    valores.condicoes[0] = { tipo: 'REGISTRADOR', alvo: '', valor: '' };

    assert.deepStrictEqual(Desafio.validar(valores), [
        'Informe o título.',
        'Informe o enunciado.',
        'Informe o conceito, como Registradores.',
        'Escolha a dificuldade.',
        'O limite de instruções vai de 1 a 100000.',
        'Informe pelo menos uma condição do resultado esperado.',
        'Solução de referência: o programa está vazio.'
    ]);
});

test('as condições e a solução de referência são conferidas', () => {
    const valores = valoresValidos();
    valores.condicoes[0] = { tipo: 'REGISTRADOR', alvo: 'V16', valor: '0F' };
    valores.condicoes[1] = { tipo: 'MEMORIA', alvo: '300', valor: '1FF' };
    valores.solucaoDeReferencia = '600F 12G2';

    assert.deepStrictEqual(Desafio.validar(valores), [
        'Condição 1: o registrador vai de V0 a VF.',
        'Condição 2: o endereço vai de 0x000 a 0xFFF, como 0x300.',
        'Condição 2: o valor é um byte em hexadecimal, de 00 a FF.',
        'Solução de referência: linha 1: "12G2" não é uma instrução de 4 dígitos hexadecimais.'
    ]);
});

test('o desafio criado do formulário tem os alvos no formato de sempre e os valores como números', () => {
    const valores = valoresValidos();
    valores.condicoes[1] = { tipo: 'MEMORIA', alvo: '0x30', valor: 'a' };
    const desafio = Desafio.criar(valores, 7);

    assert.strictEqual(desafio.id, 7);
    assert.strictEqual(desafio.limiteDeInstrucoes, 1000);
    assert.strictEqual(desafio.situacao, SITUACAO_RASCUNHO);
    assert.deepStrictEqual(desafio.condicoes.map((c) => c.descricao()), ['V0 = 0x0F', 'memória[0x030] = 0x0A']);
});

test('com a solução de referência aprovada, o desafio é publicado', async () => {
    const { desafio, resultado } = await salvarEVerificar(valoresValidos());

    assert.strictEqual(resultado.aprovado, true);
    assert.strictEqual(desafio.situacao, SITUACAO_PUBLICADO);
});

test('com a solução de referência reprovada, o desafio fica como rascunho e mostra o que falhou', async () => {
    const valores = valoresValidos();
    valores.solucaoDeReferencia = '600E 1202'; // deixa 14 em V0, e não 15
    const { desafio, resultado } = await salvarEVerificar(valores);

    assert.strictEqual(desafio.situacao, SITUACAO_RASCUNHO);
    assert.deepStrictEqual(resultado.falhas.map((f) => f.texto()), ['V0: esperado 0x0F, obtido 0x0E']);
});

test('o rascunho gravado só aparece para os aprendizes depois de publicado', async () => {
    const desafios = new DesafioRepositorio(abrirBanco(':memory:'));
    const valores = valoresValidos();
    valores.solucaoDeReferencia = '600E 1202';

    const { desafio } = await salvarEVerificar(valores);
    desafios.salvar(desafio);
    assert.strictEqual(desafios.listarPublicados().length, 0);

    // O instrutor corrige a solução e salva de novo, com o mesmo id
    valores.solucaoDeReferencia = '600F 1202';
    const corrigido = (await salvarEVerificar(valores)).desafio;
    corrigido.id = desafio.id;
    desafios.salvar(corrigido);
    assert.deepStrictEqual(desafios.listarPublicados().map((d) => d.titulo), ['Contar até 15']);
});

test('o instrutor vê quantas pessoas resolveram cada desafio', () => {
    const banco = abrirBanco(':memory:');
    new DesafioRepositorio(banco).criarDesafiosIniciais();
    const usuarios = new UsuarioRepositorio(banco);
    const resolvidos = new ResolvidoRepositorio(banco);

    for (const email of ['ana@exemplo.com', 'bruno@exemplo.com']) {
        const pessoa = usuarios.salvar(new Usuario(null, 'Teste', email, 'sal:resumo', PAPEL_APRENDIZ, false));
        resolvidos.registrar(pessoa.id, 1, '6003 6107 8200 8214 1208');
    }

    assert.strictEqual(resolvidos.quantosResolveram(1), 2);
    assert.strictEqual(resolvidos.quantosResolveram(2), 0);
});
