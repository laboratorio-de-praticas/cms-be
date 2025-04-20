import { conectar_banco } from '../../../../config/database';
import ENUMS from '../../../../config/enums';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { nome, email_institucional, senha, dados_aluno } = req.body;

  // Campos obrigatórios para aluno
  const camposObrigatorios = {
    nome: 'Nome completo do aluno',
    email_institucional: 'Email institucional do aluno',
    senha: 'Senha do aluno',
    'dados_aluno.ra': 'RA do aluno',
    'dados_aluno.curso': 'Curso do aluno', 
    'dados_aluno.semestre': 'Semestre do aluno' 
  };

  // Verifica campos obrigatórios
  const camposFaltantes = [];
  
  if (!nome) camposFaltantes.push(camposObrigatorios.nome);
  if (!email_institucional) camposFaltantes.push(camposObrigatorios.email_institucional);
  if (!senha) camposFaltantes.push(camposObrigatorios.senha);
  if (!dados_aluno?.ra) camposFaltantes.push(camposObrigatorios['dados_aluno.ra']);
  if (!dados_aluno?.curso) camposFaltantes.push(camposObrigatorios['dados_aluno.curso']); 
  if (!dados_aluno?.semestre) camposFaltantes.push(camposObrigatorios['dados_aluno.semestre']);

  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      mensagem: 'Campos obrigatórios não fornecidos',
      campos_faltantes: camposFaltantes,
      exemplo_requisicao: {
        nome: "João Silva",
        email_institucional: "joao.silva@fatec.sp.gov.br",
        senha: "Senha@123",
        dados_aluno: {
          ra: 123456,
          curso: "DSM",
          semestre: "2024.1",
          deseja_ser_candidato: false
        }
      }
    });
  }

  // Validação do formato do email institucional 
  if (!email_institucional.endsWith('@fatec.sp.gov.br')) {
    return res.status(400).json({
      mensagem: 'Email institucional inválido',
      detalhes: 'O email deve ser institucional (@fatec.sp.gov.br)'
    });
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
        detalhes: 'Este email já está em uso por outro aluno'
      });
    }

    // Verifica se o RA já existe
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
        ENUMS.UsuarioTipos.INTERNO,
        ENUMS.UsuarioStatus.PENDENTE
      ]
    );

    const id_usuario = result.rows[0].id;

    // Inserir dados do aluno
    await client.query(
      `INSERT INTO "Alunos" 
       (fk_id_usuario, ra, curso_semestre, deseja_ser_candidato) 
       VALUES ($1, $2, $3 || ' - ' || $4, $5)`, 
      [
        id_usuario,
        dados_aluno.ra,
        dados_aluno.curso, 
        dados_aluno.semestre, 
        dados_aluno.deseja_ser_candidato || false
      ]
    );

  
    await client.query('COMMIT');

    res.status(201).json({
      mensagem: 'Aluno cadastrado com sucesso',
      id_usuario,
      ra: dados_aluno.ra
    });

  } catch (error) {
    // Rollback em caso de erro
    await client.query('ROLLBACK');
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json({
      mensagem: 'Erro ao cadastrar aluno',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
}