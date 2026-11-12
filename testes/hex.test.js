// Testes da conversão entre o texto do editor e os bytes do programa.
const test = require('node:test');
const assert = require('node:assert');
const { converterPrograma, textoDoPrograma, enderecosDasLinhas } = require('../compartilhado/hex.js');

test('converte instruções em bytes', () => {
    const resultado = converterPrograma('6003 6107');
    assert.deepStrictEqual(resultado.erros, []);
    assert.deepStrictEqual(Array.from(resultado.bytes), [0x60, 0x03, 0x61, 0x07]);
});

test('aceita letras minúsculas, várias linhas e comentários', () => {
    const resultado = converterPrograma('// soma\n6003  // V0 = 3\n\n  8214\n');
    assert.deepStrictEqual(resultado.erros, []);
    assert.deepStrictEqual(Array.from(resultado.bytes), [0x60, 0x03, 0x82, 0x14]);
});

test('aponta a linha de uma instrução inválida', () => {
    const resultado = converterPrograma('6003\n60G3 123');
    assert.deepStrictEqual(resultado.erros, [
        'linha 2: "60G3" não é uma instrução de 4 dígitos hexadecimais',
        'linha 2: "123" não é uma instrução de 4 dígitos hexadecimais'
    ]);
});

test('recusa programa vazio', () => {
    const resultado = converterPrograma('// só comentário\n');
    assert.deepStrictEqual(resultado.erros, ['o programa está vazio']);
});

test('recusa programa maior que a memória livre', () => {
    const resultado = converterPrograma('0000 '.repeat(1793)); // 3.586 bytes
    assert.deepStrictEqual(resultado.erros, ['o programa tem 3586 bytes, e o máximo é 3584']);
});

test('transforma os bytes de um arquivo em texto, com 8 instruções por linha', () => {
    const bytes = new Uint8Array([0x60, 0x03, 0x61, 0x07, 0x82, 0x00, 0x82, 0x14, 0x12, 0x08,
                                  0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0, 0x00, 0xE0]);
    assert.strictEqual(textoDoPrograma(bytes), '6003 6107 8200 8214 1208 00E0 00E0 00E0\n00E0');
});

test('completa com 00 um arquivo de tamanho ímpar', () => {
    assert.strictEqual(textoDoPrograma(new Uint8Array([0x60, 0x03, 0x12])), '6003 1200');
});

test('texto e bytes vão e voltam sem mudar', () => {
    const original = new Uint8Array([0xA2, 0x0C, 0xD0, 0x18, 0x12, 0x0A]);
    const resultado = converterPrograma(textoDoPrograma(original));
    assert.deepStrictEqual(Array.from(resultado.bytes), Array.from(original));
});

test('devolve endereço, código e comentário de cada instrução', () => {
    const resultado = converterPrograma('// título\n6003  // V0 = 3\n\n8a14  // soma');
    assert.deepStrictEqual(resultado.instrucoes, [
        { linha: 2, endereco: 0x200, codigo: '6003', comentario: 'V0 = 3' },
        { linha: 4, endereco: 0x202, codigo: '8A14', comentario: 'soma' }
    ]);
});

test('mostra endereços de memória por linha e ignora vazias, espaços e comentários', () => {
    const resultado = enderecosDasLinhas('// título\n6003\n\n  6107\n// outra\n8A14');
    assert.deepStrictEqual(resultado, [null, 0x200, null, null, null, 0x202]);
});

test('instrução sem comentário fica com o comentário vazio', () => {
    const resultado = converterPrograma('6003');
    assert.strictEqual(resultado.instrucoes[0].comentario, '');
});

test('várias instruções na mesma linha dividem o comentário da linha', () => {
    const resultado = converterPrograma('6003 6107 // dois valores');
    assert.deepStrictEqual(resultado.instrucoes.map((i) => [i.endereco, i.comentario]),
        [[0x200, 'dois valores'], [0x202, 'dois valores']]);
});
