import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Checkbox
} from '@mui/material';
import axios from 'axios';

export default function Home() {
  // Estados
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState('home');
  const [pacientes, setPacientes] = useState([]);
  const [formData, setFormData] = useState({
    pacienteId: '',
    nome: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    rua: '',
    cidade: '',
    estado: '',
    ultimaConsulta: '',
    frequenciaConsultas: '',
    riscoCancelamento: '',
    statusPlano: '',
    endereco: { rua: '', cidade: '', estado: '' }
  });
  const [updateId, setUpdateId] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Configuração do menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Funções para navegação e atualização da lista
  const fetchPacientes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/pacientes');
      setPacientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error.response ? error.response.data : error.message);
    }
  };

  // Função para buscar um paciente específico pelo ID
  const fetchPacienteById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3001/pacientes/${id}`);
      const paciente = response.data;
      if (paciente) {
        setFormData({
          pacienteId: paciente.pacienteId || '',
          nome: paciente.nome || '',
          cpf: paciente.cpf || '',
          dataNascimento: paciente.dataNascimento || '',
          email: paciente.email || '',
          telefone: paciente.telefone || '',
          rua: paciente.endereco?.rua || '',
          cidade: paciente.endereco?.cidade || '',
          estado: paciente.endereco?.estado || '',
          ultimaConsulta: paciente.ultimaConsulta || '',
          frequenciaConsultas: paciente.frequenciaConsultas || '',
          riscoCancelamento: paciente.riscoCancelamento || '',
          statusPlano: paciente.statusPlano || '',
          endereco: {
            rua: paciente.endereco?.rua || '',
            cidade: paciente.endereco?.cidade || '',
            estado: paciente.endereco?.estado || ''
          }
        });
      } else {
        alert('Paciente não encontrado');
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao buscar paciente:', error.response ? error.response.data : error.message);
      alert('Erro ao buscar paciente: ' + (error.response?.data?.error || error.message));
      resetForm();
    }
  };

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    handleMenuClose();
    if (newPage === 'read' || newPage === 'delete' || newPage === 'export') {
      await fetchPacientes();
    }
  };

  // Funções para formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('endereco.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        endereco: { ...formData.endereco, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      pacienteId: '',
      nome: '',
      cpf: '',
      dataNascimento: '',
      email: '',
      telefone: '',
      rua: '',
      cidade: '',
      estado: '',
      ultimaConsulta: '',
      frequenciaConsultas: '',
      riscoCancelamento: '',
      statusPlano: '',
      endereco: { rua: '', cidade: '', estado: '' }
    });
    setUpdateId('');
  };

  const handleCreate = async () => {
    try {
      const payload = {
        pacienteId: Number(formData.pacienteId) || null,
        nome: formData.nome?.trim() || '',
        cpf: formData.cpf?.trim() || '',
        dataNascimento: formData.dataNascimento || '',
        email: formData.email?.trim() || '',
        telefone: formData.telefone?.trim() || '',
        endereco: {
          rua: formData.rua?.trim() || '',
          cidade: formData.cidade?.trim() || '',
          estado: formData.estado?.trim() || ''
        },
        ultimaConsulta: formData.ultimaConsulta || '',
        frequenciaConsultas: Number(formData.frequenciaConsultas) || 0,
        riscoCancelamento: Number(formData.riscoCancelamento) || 0,
        statusPlano: formData.statusPlano || ''
      };

      if (!payload.pacienteId || !payload.nome || !payload.cpf) {
        alert('Preencha os campos obrigatórios: ID, Nome, CPF');
        return;
      }

      console.log('Payload enviado (CREATE):', payload);
      const response = await axios.post('http://localhost:3001/pacientes', payload);
      console.log('Paciente criado:', response.data);
      alert('Paciente cadastrado com sucesso!');
      resetForm();
      await fetchPacientes();
    } catch (error) {
      const errorMessage = error.response
        ? `Erro ${error.response.status}: ${error.response.data.error || error.response.data.message}`
        : error.message;
      console.error('Erro ao criar paciente:', errorMessage);
      alert(`Erro ao cadastrar paciente: ${errorMessage}`);
    }
  };

  const handleUpdate = async () => {
    try {
      // Construir payload apenas com campos preenchidos
      const payload = {};
      if (formData.pacienteId) payload.pacienteId = Number(formData.pacienteId);
      if (formData.nome?.trim()) payload.nome = formData.nome.trim();
      if (formData.cpf?.trim()) payload.cpf = formData.cpf.trim();
      if (formData.dataNascimento) payload.dataNascimento = formData.dataNascimento;
      if (formData.email?.trim()) payload.email = formData.email.trim();
      if (formData.telefone?.trim()) payload.telefone = formData.telefone.trim();
      if (formData.rua?.trim() || formData.cidade?.trim() || formData.estado?.trim()) {
        payload.endereco = {};
        if (formData.rua?.trim()) payload.endereco.rua = formData.rua.trim();
        if (formData.cidade?.trim()) payload.endereco.cidade = formData.cidade.trim();
        if (formData.estado?.trim()) payload.endereco.estado = formData.estado.trim();
      }
      if (formData.ultimaConsulta) payload.ultimaConsulta = formData.ultimaConsulta;
      if (formData.frequenciaConsultas) payload.frequenciaConsultas = Number(formData.frequenciaConsultas);
      if (formData.riscoCancelamento) payload.riscoCancelamento = Number(formData.riscoCancelamento);
      if (formData.statusPlano) payload.statusPlano = formData.statusPlano;

      // Validação
      if (!payload.pacienteId || !payload.nome || !payload.cpf) {
        alert('Preencha os campos obrigatórios: ID, Nome, CPF');
        return;
      }

      console.log('Payload enviado (UPDATE):', payload);
      const response = await axios.put(`http://localhost:3001/pacientes/${updateId}`, payload);
      console.log('Paciente atualizado:', response.data);
      alert('Paciente atualizado com sucesso!');
      resetForm();
      await fetchPacientes();
    } catch (error) {
      const errorMessage = error.response
        ? `Erro ${error.response.status}: ${error.response.data.error || error.response.data.message}`
        : error.message;
      console.error('Erro ao atualizar paciente:', errorMessage);
      alert(`Erro ao atualizar paciente: ${errorMessage}`);
    }
  };

  const handleDelete = async () => {
    try {
      for (const id of selectedRows) {
        console.log('Deletando paciente ID:', id);
        await axios.delete(`http://localhost:3001/pacientes/${id}`);
      }
      console.log('Pacientes deletados:', selectedRows);
      alert('Paciente(s) deletado(s) com sucesso!');
      setSelectedRows([]);
      setDeleteDialogOpen(false);
      await fetchPacientes();
    } catch (error) {
      const errorMessage = error.response
        ? `Erro ${error.response.status}: ${error.response.data.error || error.response.data.message}`
        : error.message;
      console.error('Erro ao deletar paciente:', errorMessage);
      alert(`Erro ao deletar paciente: ${errorMessage}`);
    }
  };

  const handleExport = () => {
    const selectedPacientes = pacientes.filter(p => selectedRows.includes(p.pacienteId));
    const textContent = selectedPacientes
      .map(p => `ID: ${p.pacienteId}, Nome: ${p.nome}, CPF: ${p.cpf}, Email: ${p.email}`)
      .join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pacientes_exportados.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRowSelection = (pacienteId) => {
    setSelectedRows((prev) =>
      prev.includes(pacienteId)
        ? prev.filter((id) => id !== pacienteId)
        : [...prev, pacienteId]
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6F5' }}>
      <AppBar position="static" sx={{ bgcolor: '#003087' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#FFFFFF' }}>
            Dental Analytics Safe
          </Typography>
          <Button
            color="inherit"
            sx={{
              color: '#FFFFFF',
              '&:hover': { textDecoration: 'underline', bgcolor: '#00A1D6' }
            }}
            onClick={() => handlePageChange('home')}
          >
            Home
          </Button>
          <Button
            color="inherit"
            sx={{
              color: '#FFFFFF',
              '&:hover': { textDecoration: 'underline', bgcolor: '#00A1D6' }
            }}
            onMouseEnter={handleMenuOpen}
          >
            Pacientes
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ '& .MuiMenu-paper': { bgcolor: '#FFFFFF' } }}
          >
            <MenuItem onClick={() => handlePageChange('create')}>
              Create
            </MenuItem>
            <MenuItem onClick={() => handlePageChange('read')}>
              Read
            </MenuItem>
            <MenuItem onClick={() => handlePageChange('update')}>
              Update
            </MenuItem>
            <MenuItem onClick={() => handlePageChange('delete')}>
              Delete
            </MenuItem>
            <MenuItem onClick={() => handlePageChange('export')}>
              Export
            </MenuItem>
          </Menu>
          <Button
            color="inherit"
            sx={{
              color: '#FFFFFF',
              '&:hover': { textDecoration: 'underline', bgcolor: '#00A1D6' }
            }}
            onClick={() => handlePageChange('grupo')}
          >
            Grupo
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        {page === 'home' && (
          <Typography variant="h4" sx={{ color: '#003087' }}>
            Sistema de gestão MongoDB para Dental Analytics Safe
          </Typography>
        )}
        {page === 'create' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: '#003087' }}>
              Criar Paciente
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID"
                  name="pacienteId"
                  value={formData.pacienteId}
                  onChange={handleFormChange}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rua"
                  name="rua"
                  value={formData.rua}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Última Consulta"
                  name="ultimaConsulta"
                  value={formData.ultimaConsulta}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frequência de Consultas"
                  name="frequenciaConsultas"
                  value={formData.frequenciaConsultas}
                  onChange={handleFormChange}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Risco de Cancelamento"
                  name="riscoCancelamento"
                  value={formData.riscoCancelamento}
                  onChange={handleFormChange}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Status do Plano"
                  name="statusPlano"
                  value={formData.statusPlano}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#003087', '&:hover': { bgcolor: '#00A1D6' } }}
                  onClick={handleCreate}
                >
                  Cadastrar
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        {page === 'read' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: '#003087' }}>
              Lista de Pacientes
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Última Consulta</TableCell>
                    <TableCell>Status do Plano</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pacientes.map((paciente) => (
                    <TableRow key={paciente.pacienteId}>
                      <TableCell>{paciente.pacienteId}</TableCell>
                      <TableCell>{paciente.nome}</TableCell>
                      <TableCell>{paciente.cpf}</TableCell>
                      <TableCell>{paciente.email}</TableCell>
                      <TableCell>{paciente.telefone}</TableCell>
                      <TableCell>{paciente.ultimaConsulta}</TableCell>
                      <TableCell>{paciente.statusPlano}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {page === 'update' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: '#003087' }}>
              Atualizar Paciente
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ID (obrigatório)"
                  value={updateId}
                  onChange={(e) => {
                    setUpdateId(e.target.value);
                    if (e.target.value) {
                      fetchPacienteById(Number(e.target.value));
                    } else {
                      resetForm();
                    }
                  }}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rua"
                  name="rua"
                  value={formData.rua}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Última Consulta"
                  name="ultimaConsulta"
                  value={formData.ultimaConsulta}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frequência de Consultas"
                  name="frequenciaConsultas"
                  value={formData.frequenciaConsultas}
                  onChange={handleFormChange}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Risco de Cancelamento"
                  name="riscoCancelamento"
                  value={formData.riscoCancelamento}
                  onChange={handleFormChange}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Status do Plano"
                  name="statusPlano"
                  value={formData.statusPlano}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#003087', '&:hover': { bgcolor: '#00A1D6' } }}
                  onClick={handleUpdate}
                  disabled={!updateId}
                >
                  Atualizar
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        {page === 'delete' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: '#003087' }}>
              Deletar Paciente
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.length === pacientes.length && pacientes.length > 0}
                        onChange={() =>
                          setSelectedRows(
                            selectedRows.length === pacientes.length
                              ? []
                              : pacientes.map((p) => p.pacienteId)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pacientes.map((paciente) => (
                    <TableRow key={paciente.pacienteId}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.includes(paciente.pacienteId)}
                          onChange={() => handleRowSelection(paciente.pacienteId)}
                        />
                      </TableCell>
                      <TableCell>{paciente.pacienteId}</TableCell>
                      <TableCell>{paciente.nome}</TableCell>
                      <TableCell>{paciente.cpf}</TableCell>
                      <TableCell>{paciente.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              sx={{ mt: 2, bgcolor: '#003087', '&:hover': { bgcolor: '#00A1D6' } }}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={selectedRows.length === 0}
            >
              Deletar
            </Button>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DialogTitle>Tem certeza que deseja deletar o paciente?</DialogTitle>
              <DialogContent>
                <Typography>Esta ação não pode ser desfeita.</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Não</Button>
                <Button onClick={handleDelete} sx={{ color: '#003087' }}>
                  Deletar
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {page === 'export' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: '#003087' }}>
              Exportar Pacientes
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.length === pacientes.length && pacientes.length > 0}
                        onChange={() =>
                          setSelectedRows(
                            selectedRows.length === pacientes.length
                              ? []
                              : pacientes.map((p) => p.pacienteId)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pacientes.map((paciente) => (
                    <TableRow key={paciente.pacienteId}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.includes(paciente.pacienteId)}
                          onChange={() => handleRowSelection(paciente.pacienteId)}
                        />
                      </TableCell>
                      <TableCell>{paciente.pacienteId}</TableCell>
                      <TableCell>{paciente.nome}</TableCell>
                      <TableCell>{paciente.cpf}</TableCell>
                      <TableCell>{paciente.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              sx={{ mt: 2, bgcolor: '#003087', '&:hover': { bgcolor: '#00A1D6' } }}
              onClick={handleExport}
              disabled={selectedRows.length === 0}
            >
              Exportar
            </Button>
          </Box>
        )}
        {page === 'grupo' && (
          <Box>
            <Typography variant="h4" sx={{ color: '#003087', mb: 4 }}>
              Integrantes do Grupo
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ bgcolor: '#FFFFFF', boxShadow: 3, p: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#003087' }}>
                      Gabriel Pescarolli Galiza
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#003087' }}>
                      RM: 554012
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#003087' }}>
                      Turma: 2TDSPA
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ bgcolor: '#FFFFFF', boxShadow: 3, p: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#003087' }}>
                      Guilherme Gambarão Baptista
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#003087' }}>
                      RM: 554258
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#003087' }}>
                      Turma: 2TDSPA
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ bgcolor: '#FFFFFF', boxShadow: 3, p: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#003087' }}>
                      Marcelo Vieira Junior
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#003087' }}>
                      RM: 553640
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#003087' }}>
                      Turma: 2TDSPR
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}