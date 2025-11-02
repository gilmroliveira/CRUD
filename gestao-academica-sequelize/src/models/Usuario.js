const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nomeCompleto: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'nome_completo',
    validate: {
      notEmpty: {
        msg: 'Nome completo é obrigatório'
      }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      msg: 'Email já cadastrado'
    },
    validate: {
      isEmail: {
        msg: 'Email inválido'
      }
    }
  },
  matricula: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'Matrícula já cadastrada'
    }
  },
  categoria: {
    type: DataTypes.ENUM('aluno', 'professor', 'funcionario'),
    allowNull: false,
    defaultValue: 'aluno'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  validado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

module.exports = Usuario;
