// Servidor da plataforma. Nesta etapa ele só entrega a página do laboratório
// e os arquivos que ela usa.
const path = require('path');
const express = require('express');
const LaboratorioController = require('./src/controller/LaboratorioController');

const PORTA = 3000;
const PASTA_NUCLEO = path.join(__dirname, 'nucleo', 'build');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'view'));

// Arquivos usados pela página: scripts do laboratório, código compartilhado e o núcleo
app.use('/laboratorio', express.static(path.join(__dirname, 'public', 'laboratorio')));
app.use('/compartilhado', express.static(path.join(__dirname, 'compartilhado')));
app.get('/nucleo/chip8.js', (req, res) => res.sendFile(path.join(PASTA_NUCLEO, 'chip8.js')));
app.get('/nucleo/chip8.wasm', (req, res) => res.sendFile(path.join(PASTA_NUCLEO, 'chip8.wasm')));

const laboratorio = new LaboratorioController();
app.get('/', (req, res) => laboratorio.abrir(req, res));

app.listen(PORTA, () => {
    console.log(`Laboratório em http://localhost:${PORTA}`);
});
