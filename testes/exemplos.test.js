// Roda cada programa de exemplo do laboratório no núcleo (chip8.wasm) e confere o resultado.
const test = require('node:test');
const assert = require('node:assert');
const carregarNucleo = require('../nucleo/build/chip8.js');
const { converterPrograma } = require('../compartilhado/hex.js');
const { usarPerfilOriginal } = require('../compartilhado/perfil.js');
const { EXEMPLOS } = require('../public/laboratorio/exemplos.js');

// Carrega o exemplo, executa até `limite` instruções e devolve a máquina para os testes
async function rodarExemplo(nome, limite) {
    const exemplo = EXEMPLOS.find((e) => e.nome.startsWith(nome));
    const resultado = converterPrograma(exemplo.codigo);
    assert.deepStrictEqual(resultado.erros, []);

    const modulo = await carregarNucleo();
    const chip = new modulo.Chip8();
    usarPerfilOriginal(chip);
    chip.Load_ROM(resultado.bytes);
    chip.Run(limite);
    return { modulo, chip };
}

function pixelsAcesos(chip) {
    let total = 0;

    for (let i = 0; i < 64 * 32; i++) {
        if (chip.Get_Video(i)) {
            total++;
        }
    }

    return total;
}

test('soma 3 + 7 deixa 0x0A em V2', async () => {
    const { modulo, chip } = await rodarExemplo('Soma', 1000);
    assert.strictEqual(chip.Get_Register(2), 0x0A);
    assert.strictEqual(chip.Get_Last_Error(), modulo.PROGRAM_END);
    chip.delete();
});

test('desenhar dígitos termina com os três dígitos na tela', async () => {
    const { modulo, chip } = await rodarExemplo('Desenhar', 1000);
    assert.strictEqual(chip.Get_Last_Error(), modulo.PROGRAM_END);
    assert.strictEqual(chip.Get_Register(0xA), 4);
    assert.strictEqual(pixelsAcesos(chip), 8 + 14 + 14); // pixels dos desenhos de 1, 2 e 3 na fonte
    chip.delete();
});

test('desenho próprio acende os 26 pixels da carinha', async () => {
    const { modulo, chip } = await rodarExemplo('Desenho', 1000);
    assert.strictEqual(chip.Get_Last_Error(), modulo.PROGRAM_END);
    assert.strictEqual(pixelsAcesos(chip), 26);
    chip.delete();
});

test('contador chega a 10 e termina', async () => {
    const { modulo, chip } = await rodarExemplo('Contador', 100000);
    assert.strictEqual(chip.Get_Register(0), 10);
    assert.strictEqual(chip.Get_Last_Error(), modulo.PROGRAM_END);
    chip.delete();
});

test('tecla pressionada fica esperando enquanto ninguém aperta nada', async () => {
    const { modulo, chip } = await rodarExemplo('Tecla', 1000);
    assert.strictEqual(chip.Get_Last_Error(), modulo.RUNNING);
    assert.strictEqual(chip.Get_PC(), 0x204);
    chip.delete();
});
