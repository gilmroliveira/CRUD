const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Protocolo = require('./Protocolo');

// Define relacionamentos
Usuario.hasMany(Protocolo, {
  foreignKey: 'usuarioId',
  as: 'protocolos'
});

Protocolo.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

// Sincroniza os modelos com o banco de dados
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com o banco de dados!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
  }
};

module.exports = {
  sequelize,
  Usuario,
  Protocolo,
  syncDatabase
};
