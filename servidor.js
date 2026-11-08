// Servidor da plataforma: entrega o laboratório e os desafios, verifica as soluções enviadas,
// cuida das contas de usuário e das páginas do instrutor.
const path = require('path');
const express = require('express');
const session = require('express-session');
const LaboratorioController = require('./src/controller/LaboratorioController');
const DesafioController = require('./src/controller/DesafioController');
const SubmissaoController = require('./src/controller/SubmissaoController');
const ContaController = require('./src/controller/ContaController');
const ConteudoController = require('./src/controller/ConteudoController');
const GerenciarDesafiosController = require('./src/controller/GerenciarDesafiosController');
const { PAPEL_INSTRUTOR } = require('./src/model/dominio/Usuario');
const DesafioRepositorio = require('./src/model/dados/DesafioRepositorio');
const ConteudoRepositorio = require('./src/model/dados/ConteudoRepositorio');
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
    const banco = abrirBanco();
    const repositorio = new DesafioRepositorio(banco);
    repositorio.criarDesafiosIniciais(); // só grava alguma coisa na primeira vez, com a tabela vazia
    const usuarios = new UsuarioRepositorio(banco);
    const resolvidos = new ResolvidoRepositorio(banco);
    const verificador = new Verificador(nucleo);

    const laboratorio = new LaboratorioController();
    const desafios = new DesafioController(repositorio, resolvidos);
    const submissoes = new SubmissaoController(repositorio, verificador, resolvidos);
    const contas = new ContaController(usuarios);
    const conteudos = new ConteudoController(new ConteudoRepositorio());
    const gerenciar = new GerenciarDesafiosController(repositorio, verificador, resolvidos);

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

    // Deixa quem está logado (ou null) disponível em todas as páginas, com o nome "usuario",
    // e se a pessoa é instrutor (ou administrador), com o nome "ehInstrutor"
    app.use((req, res, next) => {
        res.locals.usuario = null;

        if (req.session.usuarioId) {
            res.locals.usuario = usuarios.buscarPorId(req.session.usuarioId) || null;
        }

        res.locals.ehInstrutor = res.locals.usuario !== null && res.locals.usuario.temPapel(PAPEL_INSTRUTOR);
        next();
    });

    // Todas as páginas que começam com /instrutor são só para instrutores
    app.use('/instrutor', (req, res, next) => {
        if (!res.locals.ehInstrutor) {
            res.status(403).send('Esta página é só para instrutores.');
            return;
        }

        next();
    });

    // Páginas
    app.get('/', (req, res) => laboratorio.abrir(req, res));
    app.get('/entrar', (req, res) => contas.abrir(req, res));
    app.post('/entrar', (req, res) => contas.entrar(req, res));
    app.post('/cadastrar', (req, res) => contas.cadastrar(req, res));
    app.post('/sair', (req, res) => contas.sair(req, res));
    app.get('/aprender', (req, res) => conteudos.listar(req, res));
    app.get('/aprender/:id', (req, res) => conteudos.abrir(req, res));
    app.get('/desafios', (req, res) => desafios.listar(req, res));
    app.get('/desafios/:id', (req, res) => desafios.abrir(req, res));
    app.post('/desafios/:id/submeter', (req, res) => submissoes.submeter(req, res));
    app.get('/instrutor/desafios', (req, res) => gerenciar.listar(req, res));
    app.get('/instrutor/desafios/novo', (req, res) => gerenciar.novo(req, res));
    app.post('/instrutor/desafios', (req, res) => gerenciar.salvar(req, res));
    app.get('/instrutor/desafios/:id/editar', (req, res) => gerenciar.editar(req, res));
    app.post('/instrutor/desafios/:id', (req, res) => gerenciar.salvar(req, res));
    app.post('/instrutor/desafios/:id/excluir', (req, res) => gerenciar.excluir(req, res));

    app.listen(PORTA, () => {
        console.log(`Laboratório em http://localhost:${PORTA}`);
    });
}

iniciar();
