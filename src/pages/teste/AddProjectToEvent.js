import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function AddProjectToEvent() {
  const [eventos, setEventos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState('');
  const [selectedProjeto, setSelectedProjeto] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Carregar eventos ativos
    fetch('/api/Eventos/List')
      .then(res => res.json())
      .then(data => {
        console.log('Dados dos eventos:', data);
        if (data.eventos) {
          setEventos(data.eventos);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar eventos:', err);
        setMessage({ type: 'error', text: 'Erro ao carregar eventos' });
      });

    // Carregar projetos ativos
    fetch('/api/Projetos/Get_active')
      .then(res => res.json())
      .then(data => {
        console.log('Dados dos projetos:', data);
        if (data.projetos) {
          setProjetos(data.projetos);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar projetos:', err);
        setMessage({ type: 'error', text: 'Erro ao carregar projetos' });
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/Eventos/Add_Project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_evento: selectedEvento,
          id_projeto: selectedProjeto
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Projeto adicionado ao evento com sucesso!',
          details: data.dados
        });
        // Limpar seleção
        setSelectedEvento('');
        setSelectedProjeto('');
      } else {
        setMessage({ 
          type: 'error', 
          text: data.erro || 'Erro ao adicionar projeto ao evento'
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao processar requisição'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Adicionar Projeto a Evento
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Evento</InputLabel>
              <Select
                value={selectedEvento}
                onChange={(e) => setSelectedEvento(e.target.value)}
                label="Evento"
                required
              >
                {eventos.map((evento) => (
                  <MenuItem key={evento.id_evento} value={evento.id_evento}>
                    {evento.nome_evento} ({evento.tipo_evento})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Projeto</InputLabel>
              <Select
                value={selectedProjeto}
                onChange={(e) => setSelectedProjeto(e.target.value)}
                label="Projeto"
                required
              >
                {projetos.map((projeto) => (
                  <MenuItem key={projeto.id} value={projeto.id}>
                    {projeto.nome_projeto} - {projeto.nome_equipe}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Adicionar Projeto ao Evento'}
            </Button>
          </form>
        </Paper>

        {/* Tabela de Eventos */}
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lista de Eventos
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome do Evento</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Total de Projetos</TableCell>
                  <TableCell>Total de Candidatos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eventos.map((evento) => (
                  <TableRow key={evento.id_evento}>
                    <TableCell>{evento.id_evento}</TableCell>
                    <TableCell>{evento.nome_evento}</TableCell>
                    <TableCell>{evento.tipo_evento}</TableCell>
                    <TableCell>{evento.total_projetos || 0}</TableCell>
                    <TableCell>{evento.total_candidatos || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Tabela de Projetos */}
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lista de Projetos Ativos
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome do Projeto</TableCell>
                  <TableCell>Equipe</TableCell>
                  <TableCell>Turma</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projetos.map((projeto) => (
                  <TableRow key={projeto.id}>
                    <TableCell>{projeto.id}</TableCell>
                    <TableCell>{projeto.nome_projeto}</TableCell>
                    <TableCell>{projeto.nome_equipe}</TableCell>
                    <TableCell>{projeto.turma}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ mt: 3 }}
          >
            {message.text}
            {message.details && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  URL de Confirmação: {message.details.url_confirmacao}
                </Typography>
              </Box>
            )}
          </Alert>
        )}
      </Box>
    </Container>
  );
} 