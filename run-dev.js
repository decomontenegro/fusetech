const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando FuseApp na porta 9001...\n');

// Configurar ambiente
process.env.PORT = '9001';
process.env.NODE_ENV = 'development';
process.env.HOST = '127.0.0.1';
process.env.HOSTNAME = '127.0.0.1';

// Iniciar Next.js
const nextPath = path.join(__dirname, 'node_modules', '.bin', 'next');
const next = spawn(nextPath, ['dev', '-p', '9001', '-H', '127.0.0.1'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

next.on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err);
});

next.on('close', (code) => {
  console.log(`Servidor encerrado com código ${code}`);
});

// Capturar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando servidor...');
  next.kill();
  process.exit();
});