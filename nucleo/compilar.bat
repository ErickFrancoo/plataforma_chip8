@echo off
rem Compila o nucleo de duas formas:
rem   build\teste_nativo.exe       -> testes em C++ (g++)
rem   build\chip8.js + chip8.wasm  -> nucleo para o navegador e o Node (Emscripten)
rem Uso, na raiz do repositorio: nucleo\compilar.bat
setlocal

set NUCLEO=%~dp0
set FONTES="%NUCLEO%src\chip8.cpp" "%NUCLEO%src\instructions.cpp"

if not exist "%NUCLEO%build" mkdir "%NUCLEO%build"

echo Compilando o testador nativo...
g++ -std=c++17 -Wall -O2 %FONTES% "%NUCLEO%testes\teste_nativo.cpp" -o "%NUCLEO%build\teste_nativo.exe"
if errorlevel 1 exit /b 1

rem Se o em++ ainda nao estiver no PATH, carrega o Emscripten instalado em %USERPROFILE%\emsdk
where em++ >nul 2>nul || call "%USERPROFILE%\emsdk\emsdk_env.bat" >nul 2>nul

echo Compilando para WebAssembly...
rem No Windows o em++ e um .bat, por isso o "call"
call em++ -std=c++17 -O2 %FONTES% "%NUCLEO%wasm\ponte.cpp" -lembind -sMODULARIZE=1 -sEXPORT_NAME=carregarNucleo -sENVIRONMENT=web,node -o "%NUCLEO%build\chip8.js"
if errorlevel 1 exit /b 1

echo Pronto: build\teste_nativo.exe, build\chip8.js e build\chip8.wasm
