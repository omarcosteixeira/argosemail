/**
 * SERVIDOR DO DISPARADOR DE EMAIL (Pronto para o Railway)
 * 
 * COMO PUBLICAR NO RAILWAY:
 * 1. Mantenha este arquivo e o "package.json" em uma pasta.
 * 2. Suba a pasta para o seu GitHub.
 * 3. Crie uma conta no Railway.app.
 * 4. Clique em "New Project" > "Deploy from GitHub repo".
 * 5. Selecione o seu repositório. O Railway vai instalar e rodar sozinho!
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors()); // Permite que seu Painel se conecte com esta API
app.use(express.json()); // Permite receber dados em formato JSON

// Rota de teste
app.get('/', (req, res) => {
    res.send('✅ Bot de Email está Online no Railway!');
});

// Rota principal de envio
app.post('/api/send-single', async (req, res) => {
    const { provider, email, password, subject, message, targetEmail } = req.body;

    if (!email || !password || !targetEmail) {
        return res.status(400).json({ success: false, error: 'Dados incompletos.' });
    }

    try {
        let transporterConfig = {};
        
        if (provider === 'gmail') {
            transporterConfig = {
                host: 'smtp.gmail.com',
                port: 587, 
                secure: false, 
                requireTLS: true,
                auth: { user: email, pass: password },
                tls: { rejectUnauthorized: false }, 
                connectionTimeout: 10000, 
                greetingTimeout: 10000
            };
        } else {
            transporterConfig = {
                host: 'smtp-mail.outlook.com',
                port: 587, 
                secure: false, 
                requireTLS: true,
                auth: { user: email, pass: password },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 10000,
                greetingTimeout: 10000
            };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        const mailOptions = {
            from: email,
            to: targetEmail,
            subject: subject,
            html: message
        };

        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ success: true, message: `Enviado com sucesso para ${targetEmail}` });

    } catch (error) {
        console.error(`Erro ao enviar para ${targetEmail}:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// O Railway define a porta automaticamente através da variável PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT} (Pronto para o Railway)`);
});
