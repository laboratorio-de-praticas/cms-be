import 'dotenv/config';
import { conectar_banco } from '../../../../config/database';
import ENUMS from '../../../../config/enums';
import bcrypt from 'bcryptjs';
import axios from 'axios';

const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:3000';

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

    // DADOS PARA O SERVIÇO DE AUTENTICAÇÃO
    const userPayload = {
      nome,
      email_institucional,
      senha
      // tipo_usuario: 'Interno', // ou o valor correto
      // status_usuario: 'Pendente' // ou o valor correto
    };

    // 1. Cria o usuário via API de autenticação
    const response = await axios.post(`${AUTH_API_URL}/v1/users/create`, userPayload);
    const id_usuario = response.data.id;

    // 2. Atualiza o tipo_usuario para "Interno"
    await client.query(
      'UPDATE "Usuarios" SET tipo_usuario = $1 WHERE id = $2',
      ['Interno', id_usuario]
    );

    // 3. Cria o aluno localmente, usando o id_usuario retornado
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
    await client.query('ROLLBACK');
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json({
      mensagem: 'Erro ao cadastrar aluno',
      detalhes: error.message,
      stack: error.stack,
      error: error
    });
  } finally {
    client.release();
  }
}