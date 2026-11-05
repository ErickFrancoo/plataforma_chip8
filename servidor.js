// Servidor da plataforma: entrega o laboratório e os desafios, verifica as soluções enviadas
// e cuida das contas de usuário.
const path = require('path');
const express = require('express');
const session = require('express-session');
const LaboratorioController = require('./src/controller/LaboratorioController');
const DesafioController = require('./src/controller/DesafioController');
const SubmissaoController = require('./src/controller/SubmissaoController');
const ContaController = require('./src/controller/ContaController');
const DesafioRepositorio = require('./src/model/dados/DesafioRepositorio');
const UsuarioRepositorio = require('./src/model/dados/UsuarioRepositorio');
const ResolvidoRepositorio = require('./src/model/dados/ResolvidoRepositorio');
const { abrirBanco } = require('./src/model/dados/banco');
const Nucleo = require('./src/model/verificacao/Nucleo');
const Verificador = require('./src/model/verificacao/Verificador');

const PORTA = 3000;
const PASTA_NUCLEO = path.join(__dirname, 'nucleo', 'build');

// O núcleo precisa terminar de carregar antes de o servidor começar a atender
async function iniciar() {
    const nucleo = await Nucleo.carregar();
    const repositorio = new DesafioRepositorio();
    const banco = abrirBanco();
    const usuarios = new UsuarioRepositorio(banco);
    const resolvidos = new ResolvidoRepositorio(banco);

    const laboratorio = new LaboratorioController();
    const desafios = new DesafioController(repositorio, resolvidos);
    const submissoes = new SubmissaoController(repositorio, new Verificador(nucleo), resolvidos);
    const contas = new ContaController(usuarios);

    const app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'src', 'view'));
    app.use(express.urlencoded({ extended: false })); // lê os formulários enviados pelo navegador

    // Arquivos usados pelas páginas: scripts do laboratório, código compartilhado e o núcleo
    app.use('/laboratorio', express.static(path.join(__dirname, 'public', 'laboratorio')));
    app.use('/compartilhado', express.static(path.join(__dirname, 'compartilhado')));
    app.get('/nucleo/chip8.js', (req, res) => res.sendFile(path.join(PASTA_NUCLEO, 'chip8.js')));
    app.get('/nucleo/chip8.wasm', (req, res) => res.sendFile(path.join(PASTA_NUCLEO, 'chip8.wasm')));

    // Sessão: depois do login, o navegador se identifica sozinho em cada pedido (por um cookie)
    app.use(session({
        secret: process.env.SEGREDO_DA_SESSAO || 'segredo-de-desenvolvimento', // troque ao publicar
        resave: false,
        saveUninitialized: false
    }));

    // Deixa quem está logado (ou null) disponível em todas as páginas, com o nome "usuario"
    app.use((req, res, next) => {
        res.locals.usuario = null;

        if (req.session.usuarioId) {
            res.locals.usuario = usuarios.buscarPorId(req.session.usuarioId) || null;
        }

        next();
    });

    // Páginas
    app.get('/', (req, res) => laboratorio.abrir(req, res));
    app.get('/entrar', (req, res) => contas.abrir(req, res));
    app.post('/entrar', (req, res) => contas.entrar(req, res));
    app.post('/cadastrar', (req, res) => contas.cadastrar(req, res));
    app.post('/sair', (req, res) => contas.sair(req, res));
    app.get('/desafios', (req, res) => desafios.listar(req, res));
    app.get('/desafios/:id', (req, res) => desafios.abrir(req, res));
    app.post('/desafios/:id/submeter', (req, res) => submissoes.submeter(req, res));

    app.listen(PORTA, () => {
        console.log(`Laboratório em http://localhost:${PORTA}`);
    });
}

iniciar();
