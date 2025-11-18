require('dotenv').config(); 

const express = require('express');
const app = express();
const mongoose = require('mongoose');

// --- CONEXÃO COM O BANCO DE DADOS ---

// Conecta ao MongoDB usando a string de conexão do .env.
mongoose.connect(process.env.CONNECTIONSTRING)
    .then(() => {
        // Emite um evento 'pronto' quando a conexão é bem-sucedida.
        app.emit('pronto');
    })
    // Imprime o erro se a conexão falhar.
    .catch(e => console.log(e)); 

const session = require('express-session');
// CORREÇÃO AQUI: Importação moderna do connect-mongo (v4+)
const MongoStore = require('connect-mongo'); 
const flash = require('connect-flash');// Middleware para mensagens temporárias (flash messages).

// Importa as rotas da aplicação (mapa de URLs).
const routes = require('./routes');

// Importa 'path' para trabalhar com caminhos de arquivos.
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');
// Importa o middleware global (função desestruturada).
const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middlewares/middleware');


// --- MIDDLEWARES GLOBAIS E CONFIGURAÇÕES DO EXPRESS ---
// Middleware para transformar dados de formulários (POST) em req.body.
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos (CSS, imagens, JS) da pasta 'public'.
app.use(express.static(path.resolve(__dirname, 'public')));

const sessionOptions = session({
    secret: 'lucaseduardo',
    // CORREÇÃO: No connect-mongo v4+, passamos 'mongoUrl' ou 'client'
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }), 
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
        httpOnly: true
    }
});
app.use(sessionOptions);
app.use(flash());

// Define o caminho e a engine de templates (EJS) para renderizar as views (arquivos html).
app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');// Configura o EJS como a engine de visualização.

// Nossos proprios Middlewares
app.use(csrf());
// Middleware que disponibiliza o token CSRF para as views (DEVE vir DEPOIS do csrf() mas ANTES das rotas)
app.use(csrfMiddleware);
// Aplica o middleware global que será executado em todas as requisições.
app.use(middlewareGlobal);
// Aplica todas as rotas definidas no arquivo 'routes'.
app.use(routes);
// Middleware de tratamento de erro DEVE vir DEPOIS das rotas
app.use(checkCsrfError);


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.on('pronto', () => {
    // Inicia o servidor na porta 3000 somente após o DB estar conectado.
    app.listen(3000, () => {
        console.log('Acessar http://localhost:3000');
        console.log('Servidor executando na porta 3000');
    });
});