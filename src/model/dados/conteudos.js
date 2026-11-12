// As páginas de Aprender (UC04), nível 1. Por enquanto ficam neste arquivo; com o UC14 vão para o banco de dados.
// O texto é HTML. "exemplos" são os exemplos do laboratório que a página indica (os ids de exemplos.js).
module.exports = [
    {
        id: 'como-usar-o-laboratorio',
        titulo: 'Como usar o laboratório',
        nivel: 1,
        tema: 'Laboratório',
        resumo: 'O editor, os botões, o painel e o teclado.',
        exemplos: [{ id: 'soma', nome: 'Soma' }],
        texto: `
<p>O laboratório é um computador CHIP-8 que roda no seu navegador. Você escreve um programa, executa e vê o que
acontece dentro da máquina.</p>

<h3>O editor</h3>
<p>Cada linha tem uma instrução de 4 dígitos hexadecimais, como <code>6003</code>. O que vem depois de
<code>//</code> é comentário e não é executado. Os botões acima do editor carregam programas de exemplo.</p>

<h3>Executar</h3>
<p>O laboratório confere o texto: se uma palavra não é uma instrução válida, ele mostra o erro com o número da
linha. Se estiver tudo certo, o programa é carregado na memória e começa a rodar. O editor vira uma
<strong>listagem</strong> com o endereço, o código e o comentário de cada instrução, e uma faixa verde marca a
próxima instrução. Para mudar o programa, clique em <strong>Editar</strong>.</p>

<h3>Os botões</h3>
<table>
    <tr><th>Botão</th><th>O que faz</th></tr>
    <tr><td>Pausar / Continuar</td><td>Para e retoma a execução.</td></tr>
    <tr><td>Próxima instrução</td><td>Com o programa pausado, executa uma única instrução.</td></tr>
    <tr><td>Reiniciar</td><td>Volta ao início do programa, já pausado.</td></tr>
    <tr><td>Velocidade</td><td>De 60 a 6.000 instruções por segundo (o normal é 600).</td></tr>
</table>

<h3>O painel</h3>
<p>Embaixo da tela ficam os registradores da máquina (a página "A máquina CHIP-8" explica cada um). O que mudou na
última instrução fica em <strong>laranja</strong>. Abaixo dos botões, uma frase diz o que a máquina está fazendo:
executando, pausada, ou parada, e por quê.</p>

<h3>O teclado</h3>
<p>O CHIP-8 tem 16 teclas. No laboratório, elas ficam nas teclas <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>
<kbd>4</kbd>, <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd>, <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>
<kbd>F</kbd> e <kbd>Z</kbd> <kbd>X</kbd> <kbd>C</kbd> <kbd>V</kbd>. Clique fora do editor antes de usá-las.</p>

<h3>Arquivos .ch8</h3>
<p>O botão <strong>Abrir .ch8</strong> carrega um programa do seu computador. Os bytes aparecem no editor como
texto, para você estudar e alterar.</p>

<div class="experimente">
    <span class="rotulo">EXPERIMENTE</span>
    <p>Abra o exemplo Soma, clique em <strong>Reiniciar</strong> e avance com <strong>Próxima instrução</strong>.
    Observe V0, V1 e V2 mudarem, um por vez.</p>
</div>`
    },
    {
        id: 'a-maquina-chip-8',
        titulo: 'A máquina CHIP-8',
        nivel: 1,
        tema: 'Arquitetura',
        resumo: 'Memória, registradores, pilha, tela e o ciclo de uma instrução.',
        exemplos: [{ id: 'soma', nome: 'Soma' }],
        texto: `
<p>O CHIP-8 foi criado em 1977 por Joseph Weisbecker, para facilitar a programação de jogos nos computadores da
época. Ele é uma máquina simples, com poucas peças, e por isso é ótimo para entender como qualquer processador
funciona.</p>

<h3>A memória</h3>
<p>São 4.096 bytes, numerados de <code>0x000</code> a <code>0xFFF</code>. Os programas começam no endereço
<code>0x200</code>. Antes disso fica, entre outras coisas, o desenho dos dígitos de 0 a F (a fonte), a partir de
<code>0x050</code>.</p>

<h3>Os registradores</h3>
<table>
    <tr><th>Registrador</th><th>Tamanho</th><th>Para que serve</th></tr>
    <tr><td>V0 a VF</td><td>8 bits (00 a FF)</td><td>16 registradores para os cálculos. O <strong>VF</strong> é
        especial: algumas instruções guardam nele um aviso, como o "vai-um" de uma soma. Evite usá-lo para guardar
        dados.</td></tr>
    <tr><td>I</td><td>16 bits</td><td>Guarda um endereço de memória, por exemplo onde está um desenho.</td></tr>
    <tr><td>PC</td><td>16 bits</td><td>O endereço da próxima instrução.</td></tr>
    <tr><td>SP</td><td></td><td>Quantos endereços de retorno estão guardados na pilha.</td></tr>
    <tr><td>DT e ST</td><td>8 bits</td><td>Os timers de atraso e de som (página "Timers e teclado").</td></tr>
</table>
<p>A <strong>pilha</strong> guarda até 16 endereços de retorno. Ela é usada quando o programa chama uma sub-rotina
(<code>2NNN</code>) e depois volta dela (<code>00EE</code>).</p>
<p>A <strong>tela</strong> tem 64 x 32 pixels, e cada pixel está aceso ou apagado. O <strong>teclado</strong> tem
16 teclas, de 0 a F.</p>

<h3>O ciclo de uma instrução</h3>
<p>O processador repete sempre os mesmos três passos:</p>
<ol>
    <li><strong>Busca:</strong> lê os 2 bytes que estão no endereço do PC, e o PC avança 2.</li>
    <li><strong>Decodifica:</strong> descobre que instrução é.</li>
    <li><strong>Executa:</strong> faz o que ela manda.</li>
</ol>

<div class="experimente">
    <span class="rotulo">EXPERIMENTE</span>
    <p>No exemplo Soma, avance uma instrução por vez e observe o PC: 200, 202, 204... Ele anda de 2 em 2, porque
    cada instrução ocupa 2 bytes.</p>
</div>`
    },
    {
        id: 'as-instrucoes',
        titulo: 'As instruções',
        nivel: 1,
        tema: 'Instruções',
        resumo: 'Como ler uma instrução e as mais usadas.',
        exemplos: [{ id: 'soma', nome: 'Soma' }],
        texto: `
<p>Cada instrução tem 2 bytes, escritos como 4 dígitos hexadecimais. O <strong>primeiro dígito</strong> diz o tipo
da instrução, e os outros são os dados dela:</p>
<ul>
    <li><strong>X</strong> e <strong>Y</strong>: o número de um registrador (de 0 a F);</li>
    <li><strong>N</strong>: um número de 4 bits;</li>
    <li><strong>NN</strong>: um byte;</li>
    <li><strong>NNN</strong>: um endereço de memória.</li>
</ul>
<p><strong>Como ler uma instrução:</strong> por exemplo <code>6107</code> segue o modelo <code>6XNN</code>. Então X = 1 e
NN = 07, e a instrução quer dizer <strong>V1 = 7</strong>.</p>

<h3>As instruções mais usadas</h3>
<table>
    <tr><th>Instrução</th><th>O que faz</th></tr>
    <tr><td><code>00E0</code></td><td>Limpa a tela.</td></tr>
    <tr><td><code>1NNN</code></td><td>Salta para o endereço NNN.</td></tr>
    <tr><td><code>2NNN</code> / <code>00EE</code></td><td>Chama a sub-rotina em NNN / volta dela.</td></tr>
    <tr><td><code>3XNN</code></td><td>Pula a próxima instrução se VX = NN.</td></tr>
    <tr><td><code>6XNN</code></td><td>VX = NN.</td></tr>
    <tr><td><code>7XNN</code></td><td>VX = VX + NN (não mexe no VF).</td></tr>
    <tr><td><code>8XY0</code></td><td>VX = VY.</td></tr>
    <tr><td><code>8XY4</code></td><td>VX = VX + VY; VF = 1 se o resultado passou de 255.</td></tr>
    <tr><td><code>8XY5</code></td><td>VX = VX − VY; VF = 1 se VX era maior ou igual a VY, senão 0.</td></tr>
    <tr><td><code>ANNN</code></td><td>I = NNN.</td></tr>
    <tr><td><code>DXYN</code></td><td>Desenha (página "Desenhando na tela").</td></tr>
    <tr><td><code>FX07</code> / <code>FX15</code> / <code>FX18</code></td><td>VX = DT / DT = VX / ST = VX.</td></tr>
    <tr><td><code>FX0A</code></td><td>Espera uma tecla e guarda o número dela em VX.</td></tr>
    <tr><td><code>FX29</code></td><td>I = endereço do desenho do dígito que está em VX.</td></tr>
    <tr><td><code>FX55</code></td><td>Grava V0 até VX na memória, a partir do endereço I.</td></tr>
</table>

<h3>Como um programa termina</h3>
<p>O CHIP-8 não tem uma instrução "parar". Por convenção, o programa termina com um salto para o próprio endereço,
e o laboratório reconhece isso como fim. Para achar o endereço de uma linha:
<strong>0x200 + 2 × (número da linha − 1)</strong>. A 5ª instrução fica em <code>0x208</code>, então o fim dela é
<code>1208</code>.</p>

<h3>Hexadecimal</h3>
<p>Os valores aparecem em base 16: <code>0A</code> é 10, <code>0F</code> é 15 e <code>FF</code> é 255.</p>

<div class="experimente">
    <span class="rotulo">EXPERIMENTE</span>
    <p>No exemplo Soma, troque <code>8214</code> por <code>8215</code> (subtração) e execute. V2 fica
    <code>FC</code>, porque 3 − 7 dá −4, que em 8 bits vira 252. E VF fica 0, porque 3 é menor que 7.</p>
</div>`
    },
    {
        id: 'desenhando-na-tela',
        titulo: 'Desenhando na tela',
        nivel: 1,
        tema: 'Tela',
        resumo: 'Como uma figura vira bytes e como a instrução DXYN desenha.',
        exemplos: [{ id: 'digitos', nome: 'Dígitos' }, { id: 'carinha', nome: 'Carinha' }],
        texto: `
<p>A tela tem 64 x 32 pixels. A posição (0, 0) é o canto de cima à esquerda: x vai até 63 para a direita, e y até
31 para baixo.</p>

<h3>Um desenho são bytes na memória</h3>
<p>Cada byte é uma linha de 8 pixels, e cada bit 1 é um pixel aceso:</p>
<pre>3C  =  0 0 1 1 1 1 0 0   →   ..████..
42  =  0 1 0 0 0 0 1 0   →   .█....█.</pre>

<h3>A instrução DXYN</h3>
<p>Ela lê N bytes a partir do endereço I e desenha esses N bytes na posição (VX, VY). O que passa da borda da
tela é cortado.</p>

<h3>Desenhar é inverter</h3>
<p>Cada bit 1 do desenho <strong>inverte</strong> o pixel da tela: o que estava apagado acende, e o que estava
aceso apaga. Por isso, desenhar a mesma figura duas vezes no mesmo lugar apaga a figura. Quando algum pixel
apaga, o VF fica 1. Os jogos usam isso para saber se duas figuras se encostaram (colisão).</p>

<h3>A fonte</h3>
<p>Os dígitos de 0 a F já estão na memória, cada um com 5 linhas. A instrução <code>FX29</code> coloca em I o
endereço do dígito que está em VX. Depois, <code>DXY5</code> desenha esse dígito.</p>

<h3>Um desenho seu</h3>
<p>Os bytes do desenho podem ficar logo depois do código, como no exemplo Carinha. O salto de fim tem que vir
<strong>antes</strong> dos dados. Senão, o processador tentaria executar o desenho como se fossem instruções.</p>

<div class="experimente">
    <span class="rotulo">EXPERIMENTE</span>
    <p>No exemplo Carinha, troque <code>3C42</code> por <code>FF42</code>: a primeira linha do desenho fica cheia.
    Depois, troque o fim <code>120A</code> por <code>1208</code>: o programa volta para o <code>D018</code> sem
    parar, e cada volta desenha a carinha de novo. Clique em <strong>Reiniciar</strong> e avance com
    <strong>Próxima instrução</strong>: a carinha aparece, some e aparece de novo, e o VF fica 1 quando ela some.</p>
</div>`
    },
    {
        id: 'timers-e-teclado',
        titulo: 'Timers e teclado',
        nivel: 1,
        tema: 'Tempo e entrada',
        resumo: 'Como medir o tempo, tocar o som e ler as teclas.',
        exemplos: [{ id: 'contador', nome: 'Contador' }, { id: 'tecla', nome: 'Tecla' }],
        texto: `
<h3>Os timers</h3>
<p>O CHIP-8 tem dois timers de 8 bits, que descem 1 unidade 60 vezes por segundo, até chegar a 0:</p>
<ul>
    <li><strong>DT</strong> (atraso): serve para medir o tempo. <code>FX15</code> coloca VX no DT, e
    <code>FX07</code> lê o DT em VX.</li>
    <li><strong>ST</strong> (som): enquanto for maior que 0, a máquina toca um bipe. <code>FX18</code> coloca VX no
    ST.</li>
</ul>

<h3>Esperar um segundo</h3>
<p>Coloque 60 no DT e fique lendo o valor até ele chegar a 0. É o que o exemplo Contador faz:</p>
<pre>613C  // V1 = 60
F115  // DT = 60
F107  // V1 = DT
3100  // se V1 == 0, pula a próxima instrução
1210  // senão, volta para 0x210 (o F107) e continua esperando</pre>

<h3>No laboratório, o tempo anda com as instruções</h3>
<p>O timer desce 1 a cada 10 instruções. Na velocidade normal (600 instruções por segundo), isso dá 60 vezes por
segundo, como no CHIP-8 de verdade. Se você aumentar a velocidade, o tempo do programa também corre mais rápido.
No passo a passo, o DT desce 1 a cada 10 cliques.</p>

<h3>O teclado</h3>
<p>As 16 teclas do CHIP-8 ficam assim no seu teclado. Em negrito, a tecla do CHIP-8; na caixinha, a do seu
teclado:</p>
<table class="teclado">
    <tr><td><strong>1</strong> <kbd>1</kbd></td><td><strong>2</strong> <kbd>2</kbd></td><td><strong>3</strong> <kbd>3</kbd></td><td><strong>C</strong> <kbd>4</kbd></td></tr>
    <tr><td><strong>4</strong> <kbd>Q</kbd></td><td><strong>5</strong> <kbd>W</kbd></td><td><strong>6</strong> <kbd>E</kbd></td><td><strong>D</strong> <kbd>R</kbd></td></tr>
    <tr><td><strong>7</strong> <kbd>A</kbd></td><td><strong>8</strong> <kbd>S</kbd></td><td><strong>9</strong> <kbd>D</kbd></td><td><strong>E</strong> <kbd>F</kbd></td></tr>
    <tr><td><strong>A</strong> <kbd>Z</kbd></td><td><strong>0</strong> <kbd>X</kbd></td><td><strong>B</strong> <kbd>C</kbd></td><td><strong>F</strong> <kbd>V</kbd></td></tr>
</table>
<p>Há dois jeitos de ler o teclado:</p>
<ul>
    <li><code>FX0A</code> <strong>para o programa</strong> até uma tecla ser apertada, e guarda o número dela em
    VX.</li>
    <li><code>EX9E</code> e <code>EXA1</code> <strong>não param</strong>: pulam a próxima instrução se a tecla de
    número VX estiver (ou não estiver) apertada. Os jogos usam essas duas, para o jogo continuar andando.</li>
</ul>

<div class="experimente">
    <span class="rotulo">EXPERIMENTE</span>
    <p>No exemplo Tecla, clique fora do editor e aperte <kbd>W</kbd>: aparece 5. No exemplo Contador, mude a
    velocidade durante a contagem e veja os números passarem mais rápido ou mais devagar.</p>
</div>`
    }
];
