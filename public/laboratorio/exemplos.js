// Programas de exemplo do laboratório. Cada um mostra uma parte da CPU funcionando.
// Cada instrução tem 4 dígitos hexadecimais; o que vem depois de // é o comentário que a listagem mostra.
// O id abre o exemplo pelo endereço, como /?exemplo=soma (usado pelas páginas de Aprender).

const EXEMPLOS = [
    {
        id: 'soma',
        nome: 'Soma 3 + 7 (registradores)',
        rotulo: 'Soma',
        codigo:
`// Soma 3 + 7 e deixa o resultado em V2. Veja o painel de registradores.
6003  // V0 = 3
6107  // V1 = 7
8200  // V2 = V0
8214  // V2 = V2 + V1, e VF recebe o vai-um
1208  // salta para si mesmo: fim do programa`
    },
    {
        id: 'digitos',
        nome: 'Desenhar dígitos (fonte e tela)',
        rotulo: 'Dígitos',
        codigo:
`// Desenha os dígitos 1, 2 e 3 usando a fonte que fica na memória.
00E0  // limpa a tela
6A01  // VA = 1, o dígito a desenhar
6B14  // VB = 20, a coluna (x)
6C0D  // VC = 13, a linha (y)
FA29  // I = endereço do desenho do dígito que está em VA
DBC5  // desenha 5 linhas a partir de I na posição (VB, VC)
7A01  // próximo dígito
7B08  // anda 8 pixels para a direita
3A04  // se VA == 4, pula a próxima instrução
1208  // volta para 0x208 e desenha o próximo
1214  // fim do programa`
    },
    {
        id: 'carinha',
        nome: 'Desenho próprio (dados na memória)',
        rotulo: 'Carinha',
        codigo:
`// Desenha uma carinha de 8 x 8 pixels. O desenho são bytes guardados logo depois do código:
// cada byte é uma linha, e cada bit 1 é um pixel aceso.
00E0  // limpa a tela
A20C  // I = 0x20C, onde está o desenho
601C  // V0 = 28 (x)
610C  // V1 = 12 (y)
D018  // desenha 8 linhas a partir de I na posição (V0, V1)
120A  // fim do programa
3C42  // dados  00111100  01000010
A581  // dados  10100101  10000001
A599  // dados  10100101  10011001
423C  // dados  01000010  00111100`
    },
    {
        id: 'contador',
        nome: 'Contador com timer (1 por segundo)',
        rotulo: 'Contador',
        codigo:
`// Conta de 0 a 9, um número por segundo, usando o timer de atraso.
// O timer desce 60 vezes por segundo, então 60 é um segundo.
6000  // V0 = 0, o contador
6B1C  // VB = 28 (x)
6C0D  // VC = 13 (y)
00E0  // limpa a tela
F029  // I = desenho do dígito que está em V0
DBC5  // desenha o dígito
613C  // V1 = 60
F115  // timer de atraso = 60
F107  // V1 = valor atual do timer
3100  // se V1 == 0, pula a próxima instrução
1210  // senão, volta para 0x210 e continua esperando
7001  // contador + 1
300A  // se o contador chegou a 10, pula a próxima instrução
1206  // volta para 0x206 e mostra o próximo número
121C  // fim do programa`
    },
    {
        id: 'tecla',
        nome: 'Tecla pressionada (teclado)',
        rotulo: 'Tecla',
        codigo:
`// Mostra na tela a tecla do CHIP-8 que você apertar. Clique fora do editor antes de usar o teclado.
6B1C  // VB = 28 (x)
6C0D  // VC = 13 (y)
F00A  // espera uma tecla e guarda o número dela em V0
00E0  // limpa a tela
F029  // I = desenho do dígito que está em V0
DBC5  // desenha o dígito
1204  // volta para 0x204 e espera outra tecla`
    }
];

if (typeof module !== 'undefined') {
    module.exports = { EXEMPLOS };
}
