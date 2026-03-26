import nodemailer from 'nodemailer';

// Interface pour structurer les données du mail
interface UserCredentials {
  email: string;
  username: string;
  tempPassword: string;
  orgName: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure:true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls:{
    rejectUnauthorized: false
  }
});

export const sendCredentialsEmail = async (data: UserCredentials): Promise<void> => {
  const { email, username, tempPassword, orgName } = data;

  // Dans ton service de mail
const mailOptions = {
  from: '"AllStock Admin" <no-reply@stockflow.cm>',
  to: email,
  subject: `Accès à votre espace ${orgName}`,
  html: `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1e40af;">Bienvenue sur StockFlow !</h2>
      <p>Un compte vous a été créé par votre administrateur pour l'organisation <strong>${orgName}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Identifiant :</strong> ${username}</p>
        <p style="margin: 5px 0;"><strong>Mot de passe provisoire :</strong> <span style="color: #b45309; font-family: monospace; font-weight: bold;">${tempPassword}</span></p>
      </div>
      <a href="http://localhost:5173/login" 
         style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
         Se connecter maintenant
      </a>
      <p style="margin-top: 20px; font-size: 0.875rem; color: #64748b;">
        <em>Note : Pour votre sécurité, vous devrez obligatoirement changer ce mot de passe lors de votre première connexion.</em>
      </p>
    </div>
  `,
};
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès :", info.messageId);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    // Optionnel : tu pourrais lever une erreur personnalisée ici
    throw new Error("Impossible d'envoyer l'email de bienvenue.");
  }

  await transporter.sendMail(mailOptions);
};