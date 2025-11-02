const app = require('./src/app');
const { syncDatabase } = require('./src/models');

const PORT = process.env.PORT || 3000;

// Inicializa o servidor
const startServer = async () => {
  try {
    // Sincroniza o banco de dados
    await syncDatabase();
    
    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
