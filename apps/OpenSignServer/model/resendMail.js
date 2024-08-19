import nodemailer from 'nodemailer';

const resendEmailAdapter = {
    // module: 'parse-server-simple-mailgun-adapter', // Esse nome é apenas para referência; substituímos pela configuração customizada abaixo
    options: {
        sender: 'Opensign™' + ' <>',
        templates: {
            passwordResetEmail: {
                subjectPath: './files/password_reset_email_subject.txt',
                textPath: './files/password_reset_email.txt',
                htmlPath: './files/password_reset_email.html',
            },
            verificationEmail: {
                subjectPath: './files/verification_email_subject.txt',
                textPath: './files/verification_email.txt',
                htmlPath: './files/verification_email.html',
            },
        },
        apiCallback: async ({ payload }) => {
            const transporter = nodemailer.createTransport({
                host: 'smtp.resend.com', // Substitua pelo host SMTP do Resend, se houver
                port: 465, // Substitua pela porta correta, se necessário
                secure: false, // true para 465, false para outras portas
                auth: {
                    user: process.env.RESEND_USERNAME, // Seu username no Resend
                    pass: process.env.RESEND_API_KEY, // Sua chave de API no Resend
                },
            });

            const mailOptions = {
                from: process.env.FROM_EMAIL_ADDRESS,
                to: payload.to,
                subject: payload.subject,
                text: payload.text,
                html: payload.html,
            };

            await transporter.sendMail(mailOptions);
        },
    },
};

export default resendEmailAdapter;
