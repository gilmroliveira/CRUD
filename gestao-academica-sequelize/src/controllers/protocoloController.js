const { Protocolo, Usuario } = require('../models');
const { Op } = require('sequelize');

// Função auxiliar para gerar número de protocolo único
const gerarNumeroProtocolo = () => {
  const data = new Date();
  const ano = data.getFullYear();
  const timestamp = Date.now();
  return `PROT-${ano}-${timestamp}`;
};

// CREATE - Inserir novo protocolo
exports.criarProtocolo = async (req, res) => {
  try {
    const { usuarioId, tipoDocumento, assunto, destino, responsavelAtual, prazoAtendimento, observacoes } = req.body;

    // Validação básica
    if (!usuarioId || !tipoDocumento || !assunto || !destino) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Campos obrigatórios: usuarioId, tipoDocumento, assunto, destino'
      });
    }

    // Verifica se o usuário existe
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Gera número único de protocolo
    const numeroProtocolo = gerarNumeroProtocolo();

    const novoProtocolo = await Protocolo.create({
      numeroProtocolo,
      usuarioId,
      tipoDocumento,
      assunto,
      destino,
      responsavelAtual,
      prazoAtendimento,
      observacoes
    });

    // Retorna com dados do usuário
    const protocoloCompleto = await Protocolo.findByPk(novoProtocolo.id, {
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nomeCompleto', 'email', 'matricula']
      }]
    });

    res.status(201).json({
      sucesso: true,
      mensagem: 'Protocolo criado com sucesso',
      dados: protocoloCompleto
    });
  } catch (error) {
    console.error('Erro ao criar protocolo:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar protocolo',
      erro: error.message
    });
  }
};

// READ - Buscar todos os protocolos
exports.buscarTodosProtocolos = async (req, res) => {
  try {
    const { status, usuarioId, tipoDocumento, dataInicio, dataFim, pagina = 1, limite = 10 } = req.query;
    
    const offset = (pagina - 1) * limite;
    
    // Construir filtros dinâmicos
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (usuarioId) {
      where.usuarioId = usuarioId;
    }
    
    if (tipoDocumento) {
      where.tipoDocumento = { [Op.like]: `%${tipoDocumento}%` };
    }
    
    if (dataInicio && dataFim) {
      where.criado_em = {
        [Op.between]: [new Date(dataInicio), new Date(dataFim)]
      };
    }

    const { count, rows } = await Protocolo.findAndCountAll({
      where,
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nomeCompleto', 'email', 'matricula', 'categoria']
      }],
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
    console.error('Erro ao buscar protocolos:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar protocolos',
      erro: error.message
    });
  }
};

// READ - Buscar protocolo por ID
exports.buscarProtocoloPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const protocolo = await Protocolo.findByPk(id, {
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nomeCompleto', 'email', 'matricula', 'categoria']
      }]
    });

    if (!protocolo) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Protocolo não encontrado'
      });
    }

    res.status(200).json({
      sucesso: true,
      dados: protocolo
    });
  } catch (error) {
    console.error('Erro ao buscar protocolo:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar protocolo',
      erro: error.message
    });
  }
};

// READ - Buscar protocolo por número
exports.buscarProtocoloPorNumero = async (req, res) => {
  try {
    const { numeroProtocolo } = req.params;

    const protocolo = await Protocolo.findOne({
      where: { numeroProtocolo },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nomeCompleto', 'email', 'matricula', 'categoria']
      }]
    });

    if (!protocolo) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Protocolo não encontrado'
      });
    }

    res.status(200).json({
      sucesso: true,
      dados: protocolo
    });
  } catch (error) {
    console.error('Erro ao buscar protocolo:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar protocolo',
      erro: error.message
    });
  }
};

// UPDATE - Atualizar protocolo
exports.atualizarProtocolo = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responsavelAtual, prazoAtendimento, observacoes, tipoDocumento, assunto, destino } = req.body;

    const protocolo = await Protocolo.findByPk(id);

    if (!protocolo) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Protocolo não encontrado'
      });
    }

    // Atualiza apenas os campos enviados
    const dadosAtualizacao = {};
    if (status) dadosAtualizacao.status = status;
    if (responsavelAtual) dadosAtualizacao.responsavelAtual = responsavelAtual;
    if (prazoAtendimento) dadosAtualizacao.prazoAtendimento = prazoAtendimento;
    if (observacoes) dadosAtualizacao.observacoes = observacoes;
    if (tipoDocumento) dadosAtualizacao.tipoDocumento = tipoDocumento;
    if (assunto) dadosAtualizacao.assunto = assunto;
    if (destino) dadosAtualizacao.destino = destino;

    await protocolo.update(dadosAtualizacao);

    // Retorna protocolo atualizado com usuário
    const protocoloAtualizado = await Protocolo.findByPk(id, {
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nomeCompleto', 'email', 'matricula']
      }]
    });

    res.status(200).json({
      sucesso: true,
      mensagem: 'Protocolo atualizado com sucesso',
      dados: protocoloAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar protocolo:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar protocolo',
      erro: error.message
    });
  }
};

// DELETE - Deletar protocolo
exports.deletarProtocolo = async (req, res) => {
  try {
    const { id } = req.params;

    const protocolo = await Protocolo.findByPk(id);

    if (!protocolo) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Protocolo não encontrado'
      });
    }

    await protocolo.destroy();

    res.status(200).json({
      sucesso: true,
      mensagem: 'Protocolo deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar protocolo:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao deletar protocolo',
      erro: error.message
    });
  }
};
