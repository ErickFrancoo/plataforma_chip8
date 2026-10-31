// Laboratório: liga o núcleo (chip8.wasm) à página.
// A cada quadro, 60 vezes por segundo, ele lê o teclado, executa um bloco de instruções
// e redesenha a tela e o painel. É a regra da primeira etapa: Run(10) por quadro dá
// 600 instruções e 60 descidas dos timers por segundo.

const QUADROS_POR_SEGUNDO = 60;

// Mesma ordem dos códigos de parada do núcleo (chip8.hpp)
const MOTIVOS_DE_PARADA = [
    'executando',
    'fim do programa',
    'instrução desconhecida',
    'erro de pilha',
    'salto para fora da memória',
    'o registrador I aponta para fora da memória',
    'o PC passou do fim da memória'
];

const editor = document.getElementById('editor');
const listaDeErros = document.getElementById('erros');
const situacao = document.getElementById('situacao');
const seletorDeVelocidade = document.getElementById('velocidade');
const seletorDePerfil = document.getElementById('perfil');
const seletorDeExemplos = document.getElementById('exemplos');
const botaoExecutar = document.getElementById('botao-executar');
const botaoPausar = document.getElementById('botao-pausar');
const botaoPasso = document.getElementById('botao-passo');
const botaoReiniciar = document.getElementById('botao-reiniciar');

const tela = new Tela(document.getElementById('tela'));
const teclado = new Teclado();
const som = new Som();
const painel = new Painel();

let modulo = null;      // o núcleo carregado, com as constantes de parada
let chip = null;        // a máquina CHIP-8
let programa = null;    // bytes do programa carregado, guardados para reiniciar
let executando = false;

// Lê o editor e, se o programa estiver certo, começa a executá-lo do início
function executar() {
    const resultado = converterPrograma(editor.value);
    mostrarErros(resultado.erros);

    if (resultado.erros.length > 0) {
        return;
    }

    programa = resultado.bytes;
    reiniciar();
    continuar();
}

// Volta o programa carregado para o início, pausado
function reiniciar() {
    chip.Reset();
    chip.Load_ROM(programa);
    executando = false;
    painel.esquecerEstado();
}

function continuar() {
    som.preparar();
    painel.esquecerEstado();
    executando = true;
}

function pausar() {
    executando = false;
}

// Executa uma única instrução. Run(1) conta para a regra dos timers, como no modo normal.
function proximaInstrucao() {
    painel.guardarEstado(chip);
    chip.Run(1);
}

function aplicarPerfil() {
    if (seletorDePerfil.value === 'original') {
        usarPerfilOriginal(chip);
    } else {
        usarPerfilModerno(chip);
    }
}

function quadro() {
    teclado.atualizar(chip);

    if (executando) {
        const instrucoesPorQuadro = Number(seletorDeVelocidade.value);
        const continua = chip.Run(instrucoesPorQuadro);

        if (!continua) {
            executando = false;
        }
    }

    som.tocar(executando && chip.Is_Sound_Active());
    tela.desenhar(chip);

    if (programa !== null) {
        painel.atualizar(chip);
    }

    atualizarBotoes();
    situacao.textContent = textoDaSituacao();
}

function textoDaSituacao() {
    if (programa === null) {
        return 'Pronto. Escolha um exemplo ou escreva um programa e clique em Executar.';
    }

    const codigo = chip.Get_Last_Error();

    if (codigo === modulo.RUNNING) {
        if (executando) {
            return 'Executando...';
        }
        return 'Pausado. Use "Próxima instrução" para avançar uma instrução por vez.';
    }

    if (codigo === modulo.UNKNOWN_INSTRUCTION) {
        const endereco = chip.Get_PC() - 2; // o PC já tinha avançado para a instrução seguinte
        const instrucao = hex2(chip.Get_Memory(endereco)) + hex2(chip.Get_Memory(endereco + 1));
        return `Parou: instrução desconhecida ${instrucao} no endereço 0x${endereco.toString(16).toUpperCase()}.`;
    }

    return 'Parou: ' + MOTIVOS_DE_PARADA[codigo] + '.';
}

function atualizarBotoes() {
    const carregado = programa !== null;
    const podeContinuar = carregado && chip.Get_Last_Error() === modulo.RUNNING;

    botaoPausar.disabled = !podeContinuar;
    botaoPausar.textContent = executando ? 'Pausar' : 'Continuar';
    botaoPasso.disabled = !podeContinuar || executando;
    botaoReiniciar.disabled = !carregado;
}

function mostrarErros(erros) {
    listaDeErros.innerHTML = '';

    for (const erro of erros) {
        const item = document.createElement('li');
        item.textContent = erro;
        listaDeErros.appendChild(item);
    }
}

function preencherExemplos() {
    for (let i = 0; i < EXEMPLOS.length; i++) {
        const opcao = document.createElement('option');
        opcao.value = i;
        opcao.textContent = EXEMPLOS[i].nome;
        seletorDeExemplos.appendChild(opcao);
    }

    editor.value = EXEMPLOS[0].codigo;
}

// Um arquivo .ch8 vira texto no editor e já começa a executar
function abrirArquivo(arquivo) {
    arquivo.arrayBuffer().then((conteudo) => {
        editor.value = textoDoPrograma(new Uint8Array(conteudo));
        executar();
    });
}

botaoExecutar.addEventListener('click', executar);
botaoPausar.addEventListener('click', () => (executando ? pausar() : continuar()));
botaoPasso.addEventListener('click', proximaInstrucao);
botaoReiniciar.addEventListener('click', reiniciar);
seletorDePerfil.addEventListener('change', aplicarPerfil);
seletorDeExemplos.addEventListener('change', () => {
    editor.value = EXEMPLOS[seletorDeExemplos.value].codigo;
    mostrarErros([]);
});
document.getElementById('arquivo').addEventListener('change', (evento) => {
    if (evento.target.files.length > 0) {
        abrirArquivo(evento.target.files[0]);
    }
});

// O núcleo carrega o chip8.wasm em segundo plano; o laboratório começa quando ele estiver pronto
carregarNucleo().then((nucleo) => {
    modulo = nucleo;
    chip = new modulo.Chip8();
    aplicarPerfil();
    preencherExemplos();
    botaoExecutar.disabled = false;
    setInterval(quadro, 1000 / QUADROS_POR_SEGUNDO);
});
