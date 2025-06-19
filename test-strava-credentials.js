// Teste das credenciais Strava
require('dotenv').config({ path: '.env.local' });

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

console.log('🔍 Testando credenciais Strava...\n');

console.log('📋 Configurações:');
console.log(`Client ID: ${STRAVA_CLIENT_ID}`);
console.log(`Client Secret: ${STRAVA_CLIENT_SECRET ? '***' + STRAVA_CLIENT_SECRET.slice(-4) : 'MISSING'}`);
console.log(`Callback URL: https://fusetech-mvp.loca.lt/api/auth/strava/callback\n`);

// Testar se as credenciais existem
if (!STRAVA_CLIENT_ID) {
  console.error('❌ STRAVA_CLIENT_ID não encontrado!');
  process.exit(1);
}

if (!STRAVA_CLIENT_SECRET) {
  console.error('❌ STRAVA_CLIENT_SECRET não encontrado!');
  process.exit(1);
}

// Gerar URL de autorização
const authUrl = `https://www.strava.com/oauth/authorize?` +
  `client_id=${STRAVA_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent('https://fusetech-mvp.loca.lt/api/auth/strava/callback')}&` +
  `response_type=code&` +
  `scope=read,activity:read_all&` +
  `state=test123`;

console.log('🔗 URL de autorização gerada:');
console.log(authUrl);
console.log('\n✅ Credenciais parecem estar configuradas corretamente!');
console.log('\n📝 Próximos passos:');
console.log('1. Verifique se a aplicação Strava tem o callback correto');
console.log('2. Teste o fluxo OAuth completo');
console.log('3. Verifique os logs do servidor para erros detalhados');
