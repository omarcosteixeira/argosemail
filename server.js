const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// O CORS aberto é vital para o Railway não bloquear a requisição do seu Painel Web
app.use(cors({ origin: '*' })); 
app.use(express.json());

// Rota de Health Check (Para você saber se o Railway subiu a API com sucesso)
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'Online', 
        plataforma: 'Railway',
        mensagem: '🚀 API do Bot de Mala Direta está rodando na nuvem perfeitamente!' 
    });
});

// Endpoint principal de disparo
app.post('/api/send-single', async (req, res) => {
    const { provider, email, password, subject, message, targetEmail } = req.body;

    if (!email || !password || !targetEmail || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Dados incompletos enviados pelo painel.' });
    }

    try {
        let transporterConfig = {};
        
        if (provider === 'gmail') {
            transporterConfig = {
                host: 'smtp.gmail.com',
                port: 587, 
                secure: false, // TLS
                auth: { user: email, pass: password },
                tls: { rejectUnauthorized: false } // Ajuda a evitar bloqueios de certificado SSL na nuvem
            };
        } else {
            transporterConfig = {
                host: 'smtp-mail.outlook.com',
                port: 587,
                secure: false,
                auth: { user: email, pass: password },
                tls: { rejectUnauthorized: false }
            };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        const mailOptions = {
            from: `Mala Direta <${email}>`,
            to: targetEmail,
            subject: subject,
            html: message
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Sucesso [Railway]: Enviado para ${targetEmail} | ID: ${info.messageId}`);
        
        res.status(200).json({ success: true, message: `Enviado com sucesso para ${targetEmail}` });

    } catch (error) {
        console.error(`❌ Erro no Railway (${targetEmail}):`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// O Railway injeta dinamicamente a porta através do process.env.PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
==================================================
🚀 API DE MALA DIRETA INICIADA NO RAILWAY!
==================================================
➡️  Servidor escutando na porta: ${PORT}
Aguardando comandos de disparo pelo painel...
    `);
});
