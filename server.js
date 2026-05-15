/**
 * SERVIDOR DO DISPARADOR DE EMAIL (Pronto para o Render)
 * 
 * COMO PUBLICAR NO RENDER:
 * 1. Crie uma pasta, adicione este arquivo como "server.js"
 * 2. Crie um arquivo "package.json" com o comando: npm init -y
 * 3. Instale as dependências: npm install express cors nodemailer
 * 4. Suba essa pasta para o GitHub.
 * 5. No Render.com, crie um novo "Web Service", conecte o GitHub.
 * 6. Build Command: npm install
 * 7. Start Command: node server.js
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors()); // Permite que seu Painel React se conecte com esta API
app.use(express.json()); // Permite receber dados em formato JSON

// Rota de teste para ver se o servidor está online
app.get('/', (req, res) => {
    res.send('✅ Bot de Email está Online no Render!');
});

// Rota principal que o Frontend vai chamar para CADA email da lista
app.post('/api/send-single', async (req, res) => {
    // Recebendo os dados enviados pelo painel
    const { provider, email, password, subject, message, targetEmail } = req.body;

    if (!email || !password || !targetEmail) {
        return res.status(400).json({ success: false, error: 'Dados incompletos.' });
    }

    try {
        // 1. Criar a conexão com o provedor com rotas explícitas para a nuvem
        let transporterConfig = {};
        
        if (provider === 'gmail') {
            transporterConfig = {
                host: 'smtp.gmail.com',
                port: 587, // Tentando a porta 587 (Menos chances de bloqueio)
                secure: false, // Obrigatório false para porta 587
                requireTLS: true,
                auth: { user: email, pass: password },
                tls: { rejectUnauthorized: false }, // Evita bloqueio de firewall
                connectionTimeout: 10000, // Limite de 10s para não ficar travado
                greetingTimeout: 10000
            };
        } else {
            transporterConfig = {
                host: 'smtp-mail.outlook.com',
                port: 587, // Porta de segurança padrão da Microsoft
                secure: false, // Exige false para porta 587 (STARTTLS)
                requireTLS: true,
                auth: { user: email, pass: password },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 10000,
                greetingTimeout: 10000
            };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        // 2. Montar o email
        const mailOptions = {
            from: email,
            to: targetEmail,
            subject: subject,
            html: message
        };

        // 3. Enviar o email
        await transporter.sendMail(mailOptions);
        
        // 4. Responder sucesso para o Painel
        res.status(200).json({ success: true, message: `Enviado com sucesso para ${targetEmail}` });

    } catch (error) {
        console.error(`Erro ao enviar para ${targetEmail}:`, error.message);
        // Responder erro para o Painel
        res.status(500).json({ success: false, error: error.message });
    }
});

// O Render define a porta automaticamente através da variável de ambiente PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
