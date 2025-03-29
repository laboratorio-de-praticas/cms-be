const conectar_banco = require('@/config/database');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const db = conectar_banco();
  
  try {
    const { 
      nome_Projeto, 
      nome_equipe, 
      tlr, 
      imagem_capa, 
      turma, 
      descricao, 
      cea, 
      area_atuacao, 
      ods_ids,
      linha_extensao_ids,
      area_tematica_ids
    } = req.body;

    // Validações básicas
    if (!nome_Projeto?.trim()) {
      return res.status(400).json({ erro: 'Nome do projeto é obrigatório' });
    }

    if (!nome_equipe?.trim()) {
      return res.status(400).json({ erro: 'Nome da equipe é obrigatório' });
    }

    if (!descricao?.trim()) {
      return res.status(400).json({ erro: 'Descrição é obrigatória' });
    }

    // Verifica se o projeto já existe (case insensitive)
    const projeto_existente = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM Projetos WHERE UPPER(nome_Projeto) = UPPER(?)',
        [nome_Projeto],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (projeto_existente) {
      return res.status(400).json({ erro: 'Já existe um projeto com este nome' });
    }

    // Validação dos IDs de ODS
    if (ods_ids) {
      const ods_validos = await new Promise((resolve, reject) => {
        db.get(
          'SELECT COUNT(*) as count FROM ODS WHERE id IN (' + ods_ids.join(',') + ')',
          [],
          (err, row) => {
            if (err) reject(err);
            resolve(row.count === ods_ids.length);
          }
        );
      });

      if (!ods_validos) {
        return res.status(400).json({ erro: 'Um ou mais ODS selecionados são inválidos' });
      }
    }

    // Inicia a transação
    db.run("BEGIN TRANSACTION");

    // Convertendo para Promise para melhor controle do fluxo assíncrono
    const inserir_projeto = () => {
      return new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO Projetos
          (nome_Projeto, nome_equipe, tlr, imagem_capa, turma, descricao, cea, Ativo, area_atuacao)
          VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, 
          [
            nome_Projeto || '',   // se for null, usa string vazia
            nome_equipe || '',    // se for null, usa string vazia
            tlr || 0,            // se for null, usa 0
            imagem_capa || '',   // se for null, usa string vazia
            turma || '',         // se for null, usa string vazia
            descricao || '',     // se for null, usa string vazia
            cea || 0,           // se for null, usa 0
            true,               // Ativo
            area_atuacao || ''  // se for null, usa string vazia
          ],
          function(err) {
            if (err) {
              console.error('Erro na inserção:', err);
              reject(err);
              return;
            }
            resolve(this.lastID);
          }
        );
      });
    };

    const projeto_id = await inserir_projeto();

    // Insere os ODS selecionados
    if (ods_ids && ods_ids.length > 0) {
      for (const ods_id of ods_ids) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO ProjetoODS (projeto_id, ods_id) VALUES (?, ?)`,
            [projeto_id, ods_id],
            (err) => err ? reject(err) : resolve()
          );
        });
      }
    }

    // Insere as Linhas de Extensão
    if (linha_extensao_ids && linha_extensao_ids.length > 0) {
      for (const linha_id of linha_extensao_ids) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO ProjetoLinhaExtensao (projeto_id, linha_extensao_id) VALUES (?, ?)`,
            [projeto_id, linha_id],
            (err) => err ? reject(err) : resolve()
          );
        });
      }
    }

    // Insere as Áreas Temáticas
    if (area_tematica_ids && area_tematica_ids.length > 0) {
      for (const area_id of area_tematica_ids) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO ProjetoAreaTematica (projeto_id, area_tematica_id) VALUES (?, ?)`,
            [projeto_id, area_id],
            (err) => err ? reject(err) : resolve()
          );
        });
      }
    }

    // Commit da transação
    await new Promise((resolve, reject) => {
      db.run("COMMIT", (err) => err ? reject(err) : resolve());
    });

    db.close();

    return res.status(201).json({ 
      mensagem: "Projeto cadastrado com sucesso!", 
      projeto_id 
    });

  } catch (erro) {
    console.error("Erro ao cadastrar projeto:", erro);
    
    // Rollback em caso de erro
    db.run("ROLLBACK");
    db.close();

    return res.status(500).json({ erro: "Erro ao cadastrar projeto" });
  }
}
