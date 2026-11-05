// Testes das páginas de Aprender (UC04): o repositório, os exemplos indicados e um experimento do texto.
const test = require('node:test');
const assert = require('node:assert');
const ConteudoRepositorio = require('../src/model/dados/ConteudoRepositorio');
const { EXEMPLOS } = require('../public/laboratorio/exemplos.js');
const { converterPrograma } = require('../compartilhado/hex.js');
const Nucleo = require('../src/model/verificacao/Nucleo');
const carregarNucleo = require('../nucleo/build/chip8.js');
const { usarPerfilOriginal } = require('../compartilhado/perfil.js');

const repositorio = new ConteudoRepositorio();

test('as cinco páginas do nível 1 estão na ordem de leitura', () => {
    const titulos = repositorio.listar().map((conteudo) => conteudo.titulo);
    assert.deepStrictEqual(titulos, [
        'Como usar o laboratório',
        'A máquina CHIP-8',
        'As instruções',
        'Desenhando na tela',
        'Timers e teclado'
    ]);
});

test('o repositório busca pelo id e não encontra uma página que não existe', () => {
    assert.strictEqual(repositorio.buscar('as-instrucoes').titulo, 'As instruções');
    assert.strictEqual(repositorio.buscar('nao-existe'), undefined);
});

test('o filtro por tema mostra só as páginas daquele tema', () => {
    const tela = repositorio.listar('Tela');
    assert.deepStrictEqual(tela.map((conteudo) => conteudo.id), ['desenhando-na-tela']);
    assert.strictEqual(repositorio.listar('').length, 5);
    assert.deepStrictEqual(repositorio.temas(), ['Laboratório', 'Arquitetura', 'Instruções', 'Tela', 'Tempo e entrada']);
});

test('todo exemplo indicado por uma página existe no laboratório', () => {
    const ids = EXEMPLOS.map((exemplo) => exemplo.id);

    for (const conteudo of repositorio.listar()) {
        for (const exemplo of conteudo.exemplos) {
            assert.ok(ids.includes(exemplo.id), conteudo.titulo + ': exemplo ' + exemplo.id);
        }
    }
});

test('o experimento da página As instruções dá o que o texto diz: V2 = 0xFC e VF = 0', async () => {
    const nucleo = await Nucleo.carregar();
    const estado = nucleo.executar(converterPrograma('6003 6107 8200 8215 1208').bytes, 1000);

    assert.strictEqual(estado.registradores[0x2], 0xFC);
    assert.strictEqual(estado.registradores[0xF], 0);
});

test('o experimento da página Desenhando na tela faz a carinha aparecer e sumir', async () => {
    const modulo = await carregarNucleo();
    const chip = new modulo.Chip8();
    const carinha = EXEMPLOS.find((exemplo) => exemplo.id === 'carinha').codigo;

    usarPerfilOriginal(chip);
    chip.Load_ROM(converterPrograma(carinha.replace('120A', '1208')).bytes);

    // As 4 primeiras instruções preparam; depois o D018 e o 1208 se repetem
    chip.Run(5);
    assert.strictEqual(chip.Get_Video(12 * 64 + 30), true); // um pixel aceso da carinha
    chip.Run(2);
    assert.strictEqual(chip.Get_Video(12 * 64 + 30), false); // desenhada de novo: apagou
    assert.strictEqual(chip.Get_Register(0xF), 1);
    chip.delete();
});
