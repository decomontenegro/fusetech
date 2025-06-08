const { spawn } = require('child_process');
const net = require('net');

console.log('🔍 Iniciando diagnóstico do servidor...\n');

// Função para verificar se uma porta está disponível
function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Porta ${port} está em uso`);
        resolve(false);
      } else {
        reject(err);
      }
    });
    
    server.once('listening', () => {
      console.log(`✅ Porta ${port} está disponível`);
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// Função principal
async function main() {
  console.log('1. Verificando portas...');
  await checkPort(3000);
  await checkPort(9001);
  
  console.log('\n2. Verificando variáveis de ambiente...');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'não definido');
  console.log('PORT:', process.env.PORT || 'não definido');
  
  console.log('\n3. Iniciando Next.js com logs detalhados...\n');
  
  const next = spawn('npx', ['next', 'dev', '--verbose'], {
    stdio: 'pipe',
    env: { ...process.env, DEBUG: '*' }
  });
  
  next.stdout.on('data', (data) => {
    console.log(`[STDOUT] ${data}`);
  });
  
  next.stderr.on('data', (data) => {
    console.error(`[STDERR] ${data}`);
  });
  
  next.on('error', (err) => {
    console.error('❌ Erro ao iniciar Next.js:', err);
  });
  
  next.on('close', (code) => {
    console.log(`\nNext.js encerrado com código ${code}`);
  });
  
  // Após 5 segundos, verificar se o servidor está respondendo
  setTimeout(async () => {
    console.log('\n4. Testando conexão...');
    const http = require('http');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`✅ Servidor respondendo! Status: ${res.statusCode}`);
    });
    
    req.on('error', (err) => {
      console.error('❌ Erro ao conectar:', err.message);
    });
    
    req.end();
  }, 5000);
}

main().catch(console.error);