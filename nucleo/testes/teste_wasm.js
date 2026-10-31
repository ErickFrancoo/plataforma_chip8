// Testador WebAssembly: roda os casos de casos.txt e os mesmos testes extras do
// testador nativo, agora no núcleo compilado com o Emscripten.
// Uso, na raiz do repositório: node nucleo/testes/teste_wasm.js
const fs = require('fs');
const path = require('path');
const carregarNucleo = require('../build/chip8.js');

const LIMITE_DE_INSTRUCOES = 1000;

// Mesma ordem dos códigos de parada em chip8.hpp
const PARADAS = ['rodando', 'fim', 'instrucao_desconhecida', 'pilha',
                 'salto_invalido', 'indice_invalido', 'pc_fora_da_memoria'];

let total = 0;
let falhas = 0;

function verificar(nome, passou, detalhe = '') {
    total++;

    if (passou) {
        console.log('ok      ' + nome);
    } else {
        falhas++;
        console.log('FALHOU  ' + nome + detalhe);
    }
}

// "6003 6107" vira [0x60, 0x03, 0x61, 0x07]
function bytesDoTexto(texto) {
    const bytes = [];

    for (const instrucao of texto.trim().split(/\s+/)) {
        bytes.push(parseInt(instrucao.slice(0, 2), 16));
        bytes.push(parseInt(instrucao.slice(2, 4), 16));
    }

    return new Uint8Array(bytes);
}

// chave: V0 a VF, I, PC, SP, DT, ST ou parada
function valorObtido(chip, chave) {
    if (chave === 'I') return chip.Get_Index();
    if (chave === 'PC') return chip.Get_PC();
    if (chave === 'SP') return chip.Get_SP();
    if (chave === 'DT') return chip.Get_Delay_Timer();
    if (chave === 'ST') return chip.Get_Sound_Timer();
    if (chave === 'parada') return chip.Get_Last_Error();

    return chip.Get_Register(parseInt(chave.slice(1), 16));
}

// Os valores vêm em hexadecimal, exceto a parada, que vem pelo nome
function valorEsperado(chave, valor) {
    if (chave === 'parada') return PARADAS.indexOf(valor);

    return parseInt(valor, 16);
}

function textoDoValor(chave, valor) {
    if (chave === 'parada') return PARADAS[valor];

    return valor.toString(16).toUpperCase();
}

// Linha no formato: nome; programa; estado esperado
function rodarCaso(modulo, linha) {
    const [nome, programa, esperado] = linha.split(';').map(parte => parte.trim());
    const chip = new modulo.Chip8();
    chip.Load_ROM(bytesDoTexto(programa));
    chip.Run(LIMITE_DE_INSTRUCOES);

    let diferencas = '';

    for (const condicao of esperado.split(/\s+/)) { // cada condição tem a forma chave=valor, como V2=0A
        const [chave, valor] = condicao.split('=');
        const obtido = valorObtido(chip, chave);

        if (obtido !== valorEsperado(chave, valor)) {
            diferencas += ` | ${chave} esperado ${valor}, obtido ${textoDoValor(chave, obtido)}`;
        }
    }

    chip.delete(); // objetos criados pelo embind precisam ser liberados à mão
    verificar(nome, diferencas === '', diferencas);
}

function testarLoadRom(modulo) {
    const chip = new modulo.Chip8();
    verificar('Load_ROM recusa programa vazio', !chip.Load_ROM(new Uint8Array(0)));
    verificar('Load_ROM recusa programa com mais de 3584 bytes', !chip.Load_ROM(new Uint8Array(3585)));
    verificar('Load_ROM aceita programa com 3584 bytes', chip.Load_ROM(new Uint8Array(3584)));
    chip.delete();
}

function testarReset(modulo) {
    const chip = new modulo.Chip8();
    chip.Load_ROM(bytesDoTexto('6003 6107 8200 8214 1208'));
    chip.Run(LIMITE_DE_INSTRUCOES);
    chip.Reset();

    verificar('Reset limpa registradores, PC, memoria e parada',
              chip.Get_Register(2) === 0 && chip.Get_PC() === 0x200 &&
              chip.Get_Memory(0x200) === 0 && chip.Get_Last_Error() === modulo.RUNNING);
    verificar('Reset mantem a fonte na memoria', chip.Get_Memory(0x050) === 0xF0);
    chip.delete();
}

// Roda C0FF (V0 recebe um número sorteado) e devolve V0
function sortear(chip, semente) {
    chip.Reset();
    chip.Set_Seed(semente);
    chip.Load_ROM(bytesDoTexto('C0FF 1202'));
    chip.Run(LIMITE_DE_INSTRUCOES);
    return chip.Get_Register(0);
}

function testarSemente(modulo) {
    const chip = new modulo.Chip8();
    const primeiro = sortear(chip, 42);
    const segundo = sortear(chip, 42);
    verificar('mesma semente gera o mesmo sorteio', primeiro === segundo);
    chip.delete();
}

async function main() {
    const modulo = await carregarNucleo();
    const linhas = fs.readFileSync(path.join(__dirname, 'casos.txt'), 'utf8').split('\n');

    for (const linha of linhas) {
        if (linha.startsWith('#') || !linha.includes(';')) continue;
        rodarCaso(modulo, linha);
    }

    testarLoadRom(modulo);
    testarReset(modulo);
    testarSemente(modulo);

    console.log(`\n${total - falhas} de ${total} testes passaram`);
    process.exitCode = falhas === 0 ? 0 : 1;
}

main();
