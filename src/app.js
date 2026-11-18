require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Serve arquivos estáticos (CSS, JS, imagens do front-end)
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true
};

const db = mysql.createPool(dbConfig);

// Middleware para suportar PUT e DELETE via formulários HTML (<input type="hidden" name="_method" value="PUT">)
app.use((req, res, next) => {
    const metodo = String(req.body?._method || '').toUpperCase();

    if (req.method === 'POST' && ['PUT', 'DELETE'].includes(metodo)) {
        req.method = metodo;
    }

    next();
});

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

// =========================================================================
// FUNÇÕES AUXILIARES
// =========================================================================
function mostrar(tela, dados = {}) {
    const caminho = path.join(__dirname, 'views', `${tela}.html`);
    let html = fs.readFileSync(caminho, 'utf8');

    for (const [chave, valor] of Object.entries(dados)) {
        if (typeof valor === 'string' || typeof valor === 'number') {
            html = html.replaceAll(`{{${chave}}}`, valor);
        }
    }
    return html;
}

// Chave de 32 bytes para AES-256 (defina CRYPTO_KEY no seu .env)
const CHAVE_CRYPTO = crypto
    .createHash('sha256')
    .update(String(process.env.CRYPTO_KEY || 'chave_secreta_padrao_32_bytes_123'))
    .digest();

function criptografia(texto) {
    if (!texto) return '';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', CHAVE_CRYPTO, iv);
    let criptografado = cipher.update(String(texto), 'utf8', 'hex');
    criptografado += cipher.final('hex');
    return `${iv.toString('hex')}:${criptografado}`;
}

function descriptografarCPF(textoCriptografado) {
    if (!textoCriptografado || !textoCriptografado.includes(':')) return textoCriptografado;
    try {
        const [ivHex, conteudoHex] = textoCriptografado.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', CHAVE_CRYPTO, iv);
        let descriptografado = decipher.update(conteudoHex, 'hex', 'utf8');
        descriptografado += decipher.final('utf8');
        return descriptografado;
    } catch (error) {
        return textoCriptografado;
    }
}

// =========================================================================
// ROTAS PÚBLICAS (Antes do middleware de autenticação JWT)
// =========================================================================
app.get('/', (req, res) => {
    res.send(mostrar('index', { erro: '' }));
});

app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const usuario = rows[0];

        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(401).send(mostrar('index', { erro: 'E-mail ou senha inválidos.' }));
        }

        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true });
        return res.redirect('/principal');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro interno no servidor.');
    }
});

app.post('/sair', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// =========================================================================
// MIDDLEWARE DE PROTEÇÃO (Exige login válido para todas as rotas abaixo)
// =========================================================================
app.use((req, res, next) => {
    try {
        req.usuario = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        next();
    } catch (erro) {
        res.redirect('/');
    }
});

// =========================================================================
// TELA PRINCIPAL
// =========================================================================
app.get('/principal', (req, res) => {
    res.send(mostrar('principal', { nome: req.usuario.nome }));
});

// =========================================================================
// CRUD DE CLIENTES
// =========================================================================
app.get('/clientes', async (req, res) => {
    try {
        const busca = req.query.busca || '';
        const termo = `%${busca}%`;

        const [lista] = await db.query(
            'SELECT * FROM clientes WHERE nome LIKE ? OR email LIKE ?',
            [termo, termo]
        );

        const clientes = lista.map(cliente => ({
            ...cliente,
            cpf: descriptografarCPF(cliente.cpf)
        }));

        res.send(mostrar('clientes', { clientes, busca, nome: req.usuario.nome }));
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar clientes.');
    }
});

app.post('/clientes', async (req, res) => {
    try {
        const { nome, email, cpf, telefone } = req.body;

        await db.query(
            'INSERT INTO clientes (nome, email, cpf, telefone) VALUES (?, ?, ?, ?)',
            [nome, email, criptografia(cpf), telefone]
        );

        res.redirect('/clientes');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao cadastrar cliente.');
    }
});

app.put('/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, cpf, telefone } = req.body;

        await db.query(
            'UPDATE clientes SET nome = ?, email = ?, cpf = ?, telefone = ? WHERE id = ?',
            [nome, email, criptografia(cpf), telefone, id]
        );

        res.redirect('/clientes');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar cliente.');
    }
});

app.delete('/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM clientes WHERE id = ?', [id]);
        res.redirect('/clientes');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao excluir cliente.');
    }
});

// =========================================================================
// CRUD DE VEÍCULOS
// =========================================================================
app.get('/veiculos', async (req, res) => {
    try {
        const busca = req.query.busca || '';
        const termo = `%${busca}%`;

        const [veiculos] = await db.query(
            'SELECT * FROM veiculos WHERE placa LIKE ? OR modelo LIKE ?',
            [termo, termo]
        );

        res.send(mostrar('veiculos', { veiculos, busca, nome: req.usuario.nome }));
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar veículos.');
    }
});

app.post('/veiculos', async (req, res) => {
    try {
        const { cliente_id, placa, marca, modelo, ano } = req.body;

        await db.query(
            'INSERT INTO veiculos (cliente_id, placa, marca, modelo, ano) VALUES (?, ?, ?, ?, ?)',
            [cliente_id, placa, marca, modelo, ano]
        );

        res.redirect('/veiculos');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao cadastrar veículo.');
    }
});

app.put('/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente_id, placa, marca, modelo, ano } = req.body;

        await db.query(
            'UPDATE veiculos SET cliente_id = ?, placa = ?, marca = ?, modelo = ?, ano = ? WHERE id = ?',
            [cliente_id, placa, marca, modelo, ano, id]
        );

        res.redirect('/veiculos');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar veículo.');
    }
});

app.delete('/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM veiculos WHERE id = ?', [id]);
        res.redirect('/veiculos');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao excluir veículo.');
    }
});

// =========================================================================
// CRUD DE AGENDAMENTOS
// =========================================================================
app.get('/agendamentos', async (req, res) => {
    try {
        const busca = req.query.busca || '';
        const termo = `%${busca}%`;

        const [agendamentos] = await db.query(
            'SELECT * FROM agendamentos WHERE status LIKE ? OR observacoes LIKE ?',
            [termo, termo]
        );

        res.send(mostrar('agendamentos', { agendamentos, busca, nome: req.usuario.nome }));
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar agendamentos.');
    }
});

app.post('/agendamentos', async (req, res) => {
    try {
        const { cliente_id, veiculo_id, data_agendamento, servico, status, observacoes } = req.body;

        await db.query(
            'INSERT INTO agendamentos (cliente_id, veiculo_id, data_agendamento, servico, status, observacoes) VALUES (?, ?, ?, ?, ?, ?)',
            [cliente_id, veiculo_id, data_agendamento, servico, status || 'Pendente', observacoes]
        );

        res.redirect('/agendamentos');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao cadastrar agendamento.');
    }
});

app.put('/agendamentos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente_id, veiculo_id, data_agendamento, servico, status, observacoes } = req.body;

        await db.query(
            'UPDATE agendamentos SET cliente_id = ?, veiculo_id = ?, data_agendamento = ?, servico = ?, status = ?, observacoes = ? WHERE id = ?',
            [cliente_id, veiculo_id, data_agendamento, servico, status, observacoes, id]
        );

        res.redirect('/agendamentos');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar agendamento.');
    }
});

app.delete('/agendamentos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM agendamentos WHERE id = ?', [id]);
        res.redirect('/agendamentos');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao excluir agendamento.');
    }
});

// =========================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =========================================================================
app.listen(port, host, () => {
    console.log(`Servidor rodando em http://${host}:${port}`);
});