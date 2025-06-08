const http = require('http');

const port = 9001;
const host = 'localhost';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Servidor de teste funcionando!</h1><p>Se você está vendo isso, a porta 9001 está acessível.</p>');
});

server.listen(port, host, () => {
  console.log(`✅ Servidor de teste rodando em http://${host}:${port}`);
  console.log('Pressione Ctrl+C para parar');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${port} já está em uso!`);
  } else if (err.code === 'EACCES') {
    console.error(`❌ Sem permissão para usar a porta ${port}!`);
  } else {
    console.error('❌ Erro ao iniciar servidor:', err);
  }
  process.exit(1);
});