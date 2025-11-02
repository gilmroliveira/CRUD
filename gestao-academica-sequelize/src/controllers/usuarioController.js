const { Usuario } = require('../models');
const { Op } = require('sequelize');

// CREATE - Inserir novo usuário
exports.criarUsuario = async (req, res) => {
  try {
    const { nomeCompleto, email, matricula, categoria } = req.body;

    // Validação básica
    if (!nomeCompleto || !email || !matricula || !categoria) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    const novoUsuario = await Usuario.create({
      nomeCompleto,
      email,
      matricula,
      categoria
    });

    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário criado com sucesso',
      dados: novoUsuario
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    // Tratamento de erros específicos
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Email ou matrícula já cadastrados',
        erro: error.errors[0].message
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Erro de validação',
        erros: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar usuário',
      erro: error.message
    });
  }
};

// READ - Buscar todos os usuários
exports.buscarTodosUsuarios = async (req, res) => {
  try {
    const { categoria, ativo, busca, pagina = 1, limite = 10 } = req.query;
    
    const offset = (pagina - 1) * limite;
    
    // Construir filtros dinâmicos
    const where = {};
    
    if (categoria) {
      where.categoria = categoria;
    }
    
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }
    
    if (busca) {
      where[Op.or] = [
        { nomeCompleto: { [Op.like]: `%${busca}%` } },
        { email: { [Op.like]: `%${busca}%` } },
        { matricula: { [Op.like]: `%${busca}%` } }
      ];
    }

    const { count, rows } = await Usuario.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['criado_em', 'DESC']]
    });

    res.status(200).json({
      sucesso: true,
      dados: rows,
      paginacao: {
        total: count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(count / limite)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar usuários',
      erro: error.message
    });
  }
};

// READ - Buscar usuário por ID
exports.buscarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      include: [{
        association: 'protocolos',
        attributes: ['id', 'numeroProtocolo', 'assunto', 'status', 'criado_em']
      }]
    });

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      sucesso: true,
      dados: usuario
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar usuário',
      erro: error.message
    });
  }
};

// UPDATE - Atualizar usuário
exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeCompleto, email, matricula, categoria, ativo, validado } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Atualiza apenas os campos enviados
    const dadosAtualizacao = {};
    if (nomeCompleto) dadosAtualizacao.nomeCompleto = nomeCompleto;
    if (email) dadosAtualizacao.email = email;
    if (matricula) dadosAtualizacao.matricula = matricula;
    if (categoria) dadosAtualizacao.categoria = categoria;
    if (ativo !== undefined) dadosAtualizacao.ativo = ativo;
    if (validado !== undefined) dadosAtualizacao.validado = validado;

    await usuario.update(dadosAtualizacao);

    res.status(200).json({
      sucesso: true,
      mensagem: 'Usuário atualizado com sucesso',
      dados: usuario
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Email ou matrícula já cadastrados',
        erro: error.errors[0].message
      });
    }

    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar usuário',
      erro: error.message
    });
  }
};

// DELETE - Deletar usuário (soft delete)
exports.deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Soft delete - apenas desativa
    await usuario.update({ ativo: false });

    res.status(200).json({
      sucesso: true,
      mensagem: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao deletar usuário',
      erro: error.message
    });
  }
};

// DELETE - Deletar usuário permanentemente
exports.deletarUsuarioPermanente = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    await usuario.destroy();

    res.status(200).json({
      sucesso: true,
      mensagem: 'Usuário deletado permanentemente'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário permanentemente:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao deletar usuário',
      erro: error.message
    });
  }
};
