// Programas de exemplo do laboratório. Cada um mostra uma parte da CPU funcionando.
// Nos comentários, o endereço de cada instrução: o programa começa em 0x200 e cada instrução ocupa 2 bytes.

const EXEMPLOS = [
    {
        nome: 'Soma 3 + 7 (registradores)',
        codigo:
`// Soma 3 + 7 e deixa o resultado em V2. Veja o painel de registradores.
6003  // 0x200: V0 = 3
6107  // 0x202: V1 = 7
8200  // 0x204: V2 = V0
8214  // 0x206: V2 = V2 + V1, e VF recebe o vai-um
1208  // 0x208: salta para si mesmo: fim do programa`
    },
    {
        nome: 'Desenhar dígitos (fonte e tela)',
        codigo:
`// Desenha os dígitos 1, 2 e 3 usando a fonte que fica na memória.
00E0  // 0x200: limpa a tela
6A01  // 0x202: VA = 1, o dígito a desenhar
6B14  // 0x204: VB = 20, a coluna (x)
6C0D  // 0x206: VC = 13, a linha (y)
FA29  // 0x208: I = endereço do desenho do dígito que está em VA
DBC5  // 0x20A: desenha 5 linhas a partir de I na posição (VB, VC)
7A01  // 0x20C: próximo dígito
7B08  // 0x20E: anda 8 pixels para a direita
3A04  // 0x210: se VA == 4, pula a próxima instrução
1208  // 0x212: volta para 0x208 e desenha o próximo
1214  // 0x214: fim do programa`
    },
    {
        nome: 'Desenho próprio (dados na memória)',
        codigo:
`// Desenha uma carinha de 8 x 8 pixels. O desenho são bytes guardados logo depois do código:
// cada byte é uma linha, e cada bit 1 é um pixel aceso.
00E0  // 0x200: limpa a tela
A20C  // 0x202: I = 0x20C, onde está o desenho
601C  // 0x204: V0 = 28 (x)
610C  // 0x206: V1 = 12 (y)
D018  // 0x208: desenha 8 linhas a partir de I na posição (V0, V1)
120A  // 0x20A: fim do programa
3C42  // 0x20C: dados  00111100  01000010
A581  // 0x20E: dados  10100101  10000001
A599  // 0x210: dados  10100101  10011001
423C  // 0x212: dados  01000010  00111100`
    },
    {
        nome: 'Contador com timer (1 por segundo)',
        codigo:
`// Conta de 0 a 9, um número por segundo, usando o timer de atraso.
// O timer desce 60 vezes por segundo, então 60 é um segundo.
6000  // 0x200: V0 = 0, o contador
6B1C  // 0x202: VB = 28 (x)
6C0D  // 0x204: VC = 13 (y)
00E0  // 0x206: limpa a tela
F029  // 0x208: I = desenho do dígito que está em V0
DBC5  // 0x20A: desenha o dígito
613C  // 0x20C: V1 = 60
F115  // 0x20E: timer de atraso = 60
F107  // 0x210: V1 = valor atual do timer
3100  // 0x212: se V1 == 0, pula a próxima instrução
1210  // 0x214: senão, volta para 0x210 e continua esperando
7001  // 0x216: contador + 1
300A  // 0x218: se o contador chegou a 10, pula a próxima instrução
1206  // 0x21A: volta para 0x206 e mostra o próximo número
121C  // 0x21C: fim do programa`
    },
    {
        nome: 'Tecla pressionada (teclado)',
        codigo:
`// Mostra na tela a tecla do CHIP-8 que você apertar. Clique fora do editor antes de usar o teclado.
6B1C  // 0x200: VB = 28 (x)
6C0D  // 0x202: VC = 13 (y)
F00A  // 0x204: espera uma tecla e guarda o número dela em V0
00E0  // 0x206: limpa a tela
F029  // 0x208: I = desenho do dígito que está em V0
DBC5  // 0x20A: desenha o dígito
1204  // 0x20C: volta para 0x204 e espera outra tecla`
    }
];

if (typeof module !== 'undefined') {
    module.exports = { EXEMPLOS };
}
