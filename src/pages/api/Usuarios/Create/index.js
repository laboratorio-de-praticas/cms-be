import { conectar_banco } from '../../../../config/database';
import ENUMS from '../../../../config/enums';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { nome, email_institucional, senha, tipo_usuario, dados_aluno } = req.body;

  console.log('Dados recebidos:', {
    nome,
    email_institucional,
    tipo_usuario,
    dados_aluno
  });

  // Lista de campos obrigatórios
  const camposObrigatorios = {
    nome: 'Nome do usuário',
    email_institucional: 'Email institucional do usuário',
    senha: 'Senha do usuário',
    tipo_usuario: 'Tipo de usuário (Admin, Atendente, Professor ou Interno)'
  };

  // Verifica campos obrigatórios
  const camposFaltantes = Object.entries(camposObrigatorios)
    .filter(([campo]) => !req.body[campo])
    .map(([_, descricao]) => descricao);

  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      mensagem: 'Campos obrigatórios não fornecidos',
      campos_faltantes: camposFaltantes,
      exemplo_requisicao: {
        aluno: {
          nome: "João Silva",
          email_institucional: "joao.silva@fatec.sp.gov.br",
          senha: "Senha@123",
          tipo_usuario: "Interno",
          dados_aluno: {
            ra: "123456",
            curso: "DSM",
            semestre: "2024.1",
            status_academico: "Ativo"
          }
        },
        admin: {
          nome: "Administrador Sistema",
          email_institucional: "admin@fatec.sp.gov.br",
          senha: "Admin@123",
          tipo_usuario: "Admin"
        }
      }
    });
  }

  // Verifica se o tipo de usuário é válido
  if (!Object.values(ENUMS.UsuarioTipos).includes(tipo_usuario)) {
    return res.status(400).json({
      mensagem: 'Tipo de usuário inválido',
      tipos_permitidos: Object.values(ENUMS.UsuarioTipos),
      tipo_recebido: tipo_usuario
    });
  }

  // Verifica se é do tipo Interno
  const ehInterno = tipo_usuario === ENUMS.UsuarioTipos.INTERNO;

  console.log('Tipo de usuário verificado:', {
    tipo_recebido: tipo_usuario,
    tipo_esperado: ENUMS.UsuarioTipos.INTERNO,
    tipos_permitidos: Object.values(ENUMS.UsuarioTipos),
    eh_interno: ehInterno
  });

  // Se for interno (aluno), verifica campos específicos
  if (ehInterno) {
    console.log('Iniciando verificação de dados do aluno:', dados_aluno);
    
    const camposAlunoObrigatorios = {
      ra: 'RA do aluno',
      curso_semestre: 'Curso e semestre do aluno'
    };

    const camposAlunoFaltantes = Object.entries(camposAlunoObrigatorios)
      .filter(([campo]) => !dados_aluno?.[campo])
      .map(([_, descricao]) => descricao);

    if (camposAlunoFaltantes.length > 0) {
      console.log('Campos do aluno faltantes:', camposAlunoFaltantes);
      return res.status(400).json({
        mensagem: 'Campos obrigatórios do aluno não fornecidos',
        campos_faltantes: camposAlunoFaltantes,
        exemplo_requisicao: {
          nome: "João Silva",
          email_institucional: "joao.silva@fatec.sp.gov.br",
          senha: "Senha@123",
          tipo_usuario: "Interno",
          dados_aluno: {
            ra: 123456,
            curso_semestre: "DSM - 2024.1",
            deseja_ser_candidato: false
          }
        }
      });
    }
  }

  const client = await conectar_banco();
  
  try {
    // Verifica se o email já existe
    const emailExistente = await client.query(
      'SELECT * FROM "Usuarios" WHERE email_institucional = $1',
      [email_institucional]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(400).json({
        mensagem: 'Email já cadastrado',
        detalhes: 'Este email já está em uso por outro usuário'
      });
    }

    // Se for interno (aluno), verifica se o RA já existe
    if (ehInterno) {
      const raExistente = await client.query(
        'SELECT * FROM "Alunos" WHERE ra = $1',
        [dados_aluno.ra]
      );

      if (raExistente.rows.length > 0) {
        return res.status(400).json({
          mensagem: 'RA já cadastrado',
          detalhes: 'Este RA já está em uso por outro aluno'
        });
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Iniciar transação
    await client.query('BEGIN');

    // Inserir usuário
    const result = await client.query(
      `INSERT INTO "Usuarios" 
       (nome, email_institucional, senha, tipo_usuario, status_usuario) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [
        nome,
        email_institucional,
        senhaHash,
        tipo_usuario,
        ENUMS.UsuarioStatus.PENDENTE
      ]
    );

    const id_usuario = result.rows[0].id;
    console.log('Usuário inserido com ID:', id_usuario);

    // Se for interno (aluno), insere dados específicos
    if (ehInterno) {
      console.log('Iniciando inserção do aluno para o usuário:', id_usuario);
      
      try {
        const queryAluno = `
          INSERT INTO "Alunos" 
          (id_aluno, fk_id_usuario, ra, curso_semestre, deseja_ser_candidato) 
          VALUES (DEFAULT, $1, $2, $3, $4) 
          RETURNING id_aluno
        `;
        
        const valoresAluno = [
          id_usuario,
          dados_aluno.ra,
          dados_aluno.curso_semestre,
          dados_aluno.deseja_ser_candidato || false
        ];

        console.log('Query do aluno:', queryAluno);
        console.log('Valores do aluno:', valoresAluno);

        const resultAluno = await client.query(queryAluno, valoresAluno);
        console.log('Resultado da inserção do aluno:', resultAluno.rows[0]);

        if (!resultAluno.rows[0]) {
          console.error('Falha ao inserir dados do aluno - nenhum registro retornado');
          throw new Error('Falha ao inserir dados do aluno');
        }

        // Verificar se o aluno foi realmente inserido
        const alunoVerificado = await client.query(
          'SELECT * FROM "Alunos" WHERE fk_id_usuario = $1',
          [id_usuario]
        );
        console.log('Aluno verificado após inserção:', alunoVerificado.rows[0]);

      } catch (error) {
        console.error('Erro específico ao inserir aluno:', {
          mensagem: error.message,
          stack: error.stack,
          query: error.query,
          parameters: error.parameters
        });
        throw error;
      }
    } else {
      console.log('Usuário não é do tipo Interno, pulando inserção na tabela Alunos');
    }

    // Commit da transação
    await client.query('COMMIT');
    console.log('Transação commitada com sucesso');

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      id_usuario,
      tipo_usuario
    });

  } catch (error) {
    // Rollback em caso de erro
    await client.query('ROLLBACK');
    console.error('Erro completo ao criar usuário:', {
      mensagem: error.message,
      stack: error.stack,
      tipo: error.name
    });
    res.status(500).json({
      mensagem: 'Erro ao criar usuário',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
} 