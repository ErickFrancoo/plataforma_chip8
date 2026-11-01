// Laboratório: liga o núcleo (chip8.wasm) à página.
// A cada quadro, 60 vezes por segundo, ele lê o teclado, executa um bloco de instruções
// e redesenha a tela, o painel e a listagem. É a regra da primeira etapa: Run(10) por quadro
// dá 600 instruções e 60 descidas dos timers por segundo.
//
// A página tem dois modos: editando (o texto do programa) e executando (a listagem com a
// próxima instrução destacada). O modo fica na classe "editando" do body.
//
// A mesma página serve ao laboratório livre e aos desafios. Num desafio, o body traz o id dele
// (data-desafio), não há exemplos nem escolha de perfil, e o programa é enviado ao servidor.

const QUADROS_POR_SEGUNDO = 60;
const INSTRUCOES_POR_QUADRO = [1, 5, 10, 25, 50, 100]; // as posições da barra de velocidade

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

const desafioId = document.body.dataset.desafio; // vazio no laboratório livre

const TEXTO_INICIAL_DO_DESAFIO =
`// Escreva aqui a sua solução, uma instrução de 4 dígitos hexadecimais por vez.
// Teste com Executar e, quando estiver pronta, clique em Submeter solução.
// Lembre-se de terminar com um salto para o próprio endereço.
`;

const editor = document.getElementById('editor');
const listaDeErros = document.getElementById('erros');
const situacao = document.getElementById('situacao');
const barraDeVelocidade = document.getElementById('velocidade');
const textoDaVelocidade = document.getElementById('velocidade-texto');
const seletorDePerfil = document.getElementById('perfil');
const botoesDeExemplo = document.getElementById('exemplos');
const botaoExecutar = document.getElementById('botao-executar');
const botaoPausar = document.getElementById('botao-pausar');
const botaoPasso = document.getElementById('botao-passo');
const botaoReiniciar = document.getElementById('botao-reiniciar');
const botaoEditar = document.getElementById('botao-editar');

const tela = new Tela(document.getElementById('tela'));
const teclado = new Teclado();
const som = new Som();
const painel = new Painel();
const listagem = new Listagem(
    document.getElementById('listagem'),
    document.getElementById('destaque'),
    document.getElementById('agora')
);

let modulo = null;      // o núcleo carregado, com as constantes de parada
let chip = null;        // a máquina CHIP-8
let programa = null;    // bytes do programa carregado, guardados para reiniciar
let executando = false;
let editando = true;

// Lê o editor e, se o programa estiver certo, passa para a listagem e começa a executar do início
function executar() {
    const resultado = converterPrograma(editor.value);
    mostrarErros(resultado.erros);

    if (resultado.erros.length > 0) {
        return;
    }

    programa = resultado.bytes;
    definirModo(false);
    listagem.montar(resultado.instrucoes);
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

function definirModo(modoEdicao) {
    editando = modoEdicao;
    document.body.classList.toggle('editando', editando);
}

function editar() {
    pausar();
    definirModo(true);
}

// Nos desafios não há seletor de perfil: vale o original, o mesmo que o verificador usa
function aplicarPerfil() {
    if (seletorDePerfil === null || seletorDePerfil.value === 'original') {
        usarPerfilOriginal(chip);
    } else {
        usarPerfilModerno(chip);
    }
}

function instrucoesPorQuadro() {
    return INSTRUCOES_POR_QUADRO[Number(barraDeVelocidade.value)];
}

function mostrarVelocidade() {
    textoDaVelocidade.textContent = `${instrucoesPorQuadro() * QUADROS_POR_SEGUNDO} instruções por segundo`;
}

function quadro() {
    teclado.atualizar(chip);

    if (executando) {
        const continua = chip.Run(instrucoesPorQuadro());

        if (!continua) {
            executando = false;
        }
    }

    som.tocar(executando && chip.Is_Sound_Active());
    tela.desenhar(chip);

    if (programa !== null) {
        painel.atualizar(chip);
        listagem.atualizar(chip.Get_PC());
    }

    atualizarBotoes();
    situacao.textContent = textoDaSituacao();
}

function textoDaSituacao() {
    if (programa === null && desafioId) {
        return 'Pronto. Escreva a sua solução e clique em Executar para testar.';
    }

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
    const rotuloDoPausar = executando ? 'Pausar' : 'Continuar';

    botaoPausar.disabled = !podeContinuar;
    botaoPausar.classList.toggle('em-pausa', !executando);
    botaoPausar.title = rotuloDoPausar;
    botaoPausar.setAttribute('aria-label', rotuloDoPausar);
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

// Um botão por exemplo; escolher um exemplo coloca o programa no editor, sem executar
function preencherExemplos() {
    for (let i = 0; i < EXEMPLOS.length; i++) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'chip';
        botao.textContent = EXEMPLOS[i].rotulo;
        botao.title = EXEMPLOS[i].nome;
        botao.addEventListener('click', () => escolherExemplo(i));
        botoesDeExemplo.appendChild(botao);
    }

    escolherExemplo(0);
}

function escolherExemplo(posicao) {
    editor.value = EXEMPLOS[posicao].codigo;
    mostrarErros([]);
    editar();

    botoesDeExemplo.querySelectorAll('.chip').forEach((botao, i) => {
        botao.classList.toggle('ativo', i === posicao);
    });
}

// Num desafio, o editor começa com a última solução do aluno (guardada enquanto a aba está aberta)
// ou com o texto de orientação
function prepararDesafio() {
    const salva = sessionStorage.getItem('solucao-desafio-' + desafioId);
    editor.value = salva !== null ? salva : TEXTO_INICIAL_DO_DESAFIO;
}

// Ao submeter, o texto do editor vai no formulário e fica guardado para o "Tentar de novo"
function enviarSolucao() {
    document.getElementById('programa-enviado').value = editor.value;
    sessionStorage.setItem('solucao-desafio-' + desafioId, editor.value);
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
botaoEditar.addEventListener('click', editar);
barraDeVelocidade.addEventListener('input', mostrarVelocidade);

if (seletorDePerfil !== null) {
    seletorDePerfil.addEventListener('change', aplicarPerfil);
}

if (desafioId) {
    document.getElementById('form-submeter').addEventListener('submit', enviarSolucao);
}
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

    if (desafioId) {
        prepararDesafio();
    } else {
        preencherExemplos();
    }

    mostrarVelocidade();
    botaoExecutar.disabled = false;
    setInterval(quadro, 1000 / QUADROS_POR_SEGUNDO);
});
