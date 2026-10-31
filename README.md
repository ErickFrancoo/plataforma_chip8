# Plataforma CHIP-8

Plataforma web de ensino de arquitetura de computadores, projeto final de INF01127.
O emulador de CHIP-8 da equipe roda no navegador, em um laboratório onde se escreve um
programa em hexadecimal e se vê a CPU funcionando.

## Como rodar

Precisa do Node.js 22 ou mais novo.

```
npm install
npm start
```

Abra http://localhost:3000.

No Windows PowerShell, se aparecer "a execução de scripts foi desabilitada", use `npm.cmd` no lugar de `npm`.

## Testes

```
npm test
```

## Pastas

| Pasta | Conteúdo |
|---|---|
| `nucleo` | o emulador (classe `chip8`, em C++) e o `chip8.wasm`, que o navegador usa |
| `src` | o servidor (Express) |
| `public/laboratorio` | o laboratório: tela, teclado, som e painel |
| `compartilhado` | código usado pelo navegador e, depois, pelo servidor |
| `testes` | testes automáticos |

## Núcleo

A classe `chip8` vem do emulador da equipe ([FqNlR/Chip8-Emulator](https://github.com/FqNlR/Chip8-Emulator)).
O `chip8.wasm` já está pronto no repositório. Só é preciso recompilar quem mexer no C++, no Windows, com g++ e
[Emscripten](https://emscripten.org/docs/getting_started/downloads.html): `nucleo\compilar.bat`.
