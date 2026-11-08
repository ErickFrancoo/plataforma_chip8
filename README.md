# Plataforma de ensino CHIP-8

Plataforma web para ensinar arquitetura de computadores com o CHIP-8: um laboratório onde se escreve um programa
em hexadecimal e se vê a CPU funcionando, páginas para aprender, desafios corrigidos automaticamente e contas de
aprendiz e de instrutor. Projeto final de INF01127 (Engenharia de Software).

## Créditos do emulador

O **emulador CHIP-8** que roda dentro da plataforma foi desenvolvido por
**Luiz Roberto Rolian Schardosim** ([@FqNlR](https://github.com/FqNlR)), no projeto
[Chip8-Emulator](https://github.com/FqNlR/Chip8-Emulator), sob a licença MIT ([`nucleo/LICENSE`](nucleo/LICENSE)).

Ele é a base de tudo: a classe `chip8`, em `nucleo/src`, executa os programas no laboratório (no navegador) e na
correção dos desafios (no servidor), compilada para WebAssembly. Para a plataforma, ela ganhou alguns acréscimos:
carregar o programa da memória, executar N instruções por vez, ler o estado da máquina, códigos de parada (o fim
do programa é um salto para o próprio endereço) e timers contados por instruções.

## Como rodar

Precisa do [Node.js](https://nodejs.org) 24. O banco de dados é o SQLite que já vem nele.

```
npm install
npm start
```

Abra http://localhost:3000. No PowerShell, use `npm.cmd` no lugar de `npm`.

O banco fica em `banco-de-dados/plataforma.db` e é criado no primeiro `npm start`, já com 3 desafios. Ele não vai
para o Git: cada pessoa tem o seu. Para recomeçar do zero, pare o servidor e apague a pasta `banco-de-dados`.

Toda conta nova é de aprendiz. Para usar as páginas do instrutor, cadastre-se e depois:

```
npm run promover -- seu@email.com INSTRUTOR
```

## Testes

```
npm test
```

## O que já funciona

| Área | Casos de uso |
|---|---|
| Laboratório | Executar, passo a passo e escrever em hexadecimal (UC01, UC02, UC03) |
| Aprender | Cinco páginas de introdução ao CHIP-8 (UC04, nível 1) |
| Desafios | Lista, submissão e verificação automática (UC05, UC09, UC10) |
| Contas | Cadastro e login (UC07, UC08) |
| Instrutor | Criar, editar, publicar e excluir desafios (UC13) |

## Pastas

| Pasta | Conteúdo |
|---|---|
| `servidor.js` | Inicia o servidor e liga as rotas aos controllers |
| `src/controller` | Um controller por caso de uso |
| `src/model/dominio` | As classes e as regras: `Desafio`, `Usuario`, `Condicao`... |
| `src/model/dados` | O banco de dados e os repositórios |
| `src/model/verificacao` | Executa e confere as soluções no servidor |
| `src/view` | As páginas (EJS) |
| `public/laboratorio` | O laboratório no navegador: tela, teclado, som, painel e editor |
| `compartilhado` | Código usado pelo navegador e pelo servidor |
| `nucleo` | O emulador (C++) e o `chip8.wasm` já compilado |
| `ferramentas` | O comando `promover` |
| `testes` | Testes automáticos |

O `chip8.wasm` já está pronto no repositório. Só quem mexer no C++ precisa recompilar, no Windows, com g++ e
[Emscripten](https://emscripten.org/docs/getting_started/downloads.html): `nucleo\compilar.bat`.
