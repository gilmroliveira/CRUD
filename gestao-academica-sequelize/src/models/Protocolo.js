const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Protocolo = sequelize.define('Protocolo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numeroProtocolo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'numero_protocolo'
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'usuario_id',
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tipoDocumento: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'tipo_documento'
  },
  assunto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  destino: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('em_analise', 'aprovado', 'finalizado', 'rejeitado'),
    allowNull: false,
    defaultValue: 'em_analise'
  },
  responsavelAtual: {
    type: DataTypes.STRING(150),
    field: 'responsavel_atual'
  },
  prazoAtendimento: {
    type: DataTypes.DATE,
    field: 'prazo_atendimento'
  },
  observacoes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'protocolos',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

module.exports = Protocolo;
