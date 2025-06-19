// Script para atualizar credenciais Strava rapidamente
const fs = require('fs');
const path = require('path');

function updateCredentials(clientId, clientSecret) {
  const envPath = '.env.local';
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Atualizar Client ID
    envContent = envContent.replace(
      /STRAVA_CLIENT_ID=.*/,
      `STRAVA_CLIENT_ID=${clientId}`
    );
    
    // Atualizar Client Secret
    envContent = envContent.replace(
      /STRAVA_CLIENT_SECRET=.*/,
      `STRAVA_CLIENT_SECRET=${clientSecret}`
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Credenciais atualizadas com sucesso!');
    console.log(`Client ID: ${clientId}`);
    console.log(`Client Secret: ***${clientSecret.slice(-4)}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar credenciais:', error.message);
  }
}

// Exemplo de uso:
// updateCredentials('123456', 'abc123def456');

module.exports = { updateCredentials };
