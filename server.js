const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Configurações do servidor (Middlewares)
app.use(cors()); // Permite que o seu Painel (Frontend) se comunique com esta API sem bloqueios
app.use(express.json()); // Permite que a API entenda os dados em formato JSON (lista de contatos, mensagem, etc)

// Rota básica apenas para você testar se o servidor está online no navegador
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'Online', 
        mensagem: '🤖 API do Bot de Mala Direta está rodando perfeitamente!' 
    });
});

// Esta é a rota que o seu Painel vai chamar para cada contato da lista
app.post('/api/send-single', async (req, res) => {
    // Extraindo os dados recebidos do Painel
    const { provider, email, password, subject, message, targetEmail } = req.body;

    // Validação básica para garantir que nenhum dado falte
    if (!email || !password || !targetEmail || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Dados incompletos. Verifique as configurações no painel.' });
    }

    try {
        let transporterConfig = {};
        
        if (provider === 'gmail') {
            transporterConfig = {
                host: 'smtp.gmail.com',
                port: 587, // Porta segura recomendada para TLS
                secure: false, // O false aqui significa que vamos usar TLS (STARTTLS), e não SSL direto
                auth: { 
                    user: email, 
                    pass: password // A Senha de Aplicativo de 16 dígitos
                },
                tls: { rejectUnauthorized: false } // Ajuda a evitar bloqueios de certificado em servidores locais/nuvem
            };
        } else {
            // Configuração para Hotmail / Outlook
            transporterConfig = {
                host: 'smtp-mail.outlook.com',
                port: 587,
                secure: false,
                auth: { 
                    user: email, 
                    pass: password 
                },
                tls: { rejectUnauthorized: false }
            };
        }

        // Criando o "carteiro" (transporter) do Nodemailer
        const transporter = nodemailer.createTransport(transporterConfig);

        const mailOptions = {
            from: `Mala Direta <${email}>`, // Nome do remetente + Email
            to: targetEmail,                // Email do cliente que vai receber
            subject: subject,               // Assunto da campanha
            html: message                   // Corpo do email (suporta HTML)
        };

        // Executando o envio através do Nodemailer
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Sucesso: Email enviado para ${targetEmail} | ID: ${info.messageId}`);
        
        // Devolvendo a resposta de sucesso para o Painel mostrar a barrinha verde
        res.status(200).json({ success: true, message: `Enviado com sucesso para ${targetEmail}` });

    } catch (error) {
        console.error(`❌ Erro ao enviar para ${targetEmail}:`, error.message);
        
        // Devolvendo a mensagem de erro exata para o Painel mostrar em vermelho
        res.status(500).json({ success: false, error: error.message });
    }
});

// Define a porta (usa a variável de ambiente se estiver na nuvem, ou a porta 10000 no PC local)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`
==================================================
🚀 API DE MALA DIRETA (NODEMAILER) INICIADA!
==================================================
➡️  Servidor rodando na porta: ${PORT}
➡️  URL para colocar no Painel: http://localhost:${PORT}

Aguardando comandos de disparo...
    `);
});
