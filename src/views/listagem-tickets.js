import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/card';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PaidIcon from '@mui/icons-material/Paid';

function ListagemTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  const cadastrar = () => {
    navigate('/cadastro-tickets');
  };

  const editar = (id) => {
    navigate(`/cadastro-tickets/${id}`);
  };

  const encerrarTicket = (id) => {
    navigate(`/cadastro-pagamentos?ticketId=${id}`);
  };

  const excluir = (id) => {
    const novaLista = tickets.filter((item) => item.id !== id);
    setTickets(novaLista);
    localStorage.setItem('tickets_salvos', JSON.stringify(novaLista));
  };

  useEffect(() => {
    const ticketsLocal = JSON.parse(localStorage.getItem('tickets_salvos'));

    if (ticketsLocal && ticketsLocal.length > 0) {
      setTickets(ticketsLocal);
    } else {
      axios.get('/db.json')
        .then(response => {
          const lista = response.data.tickets || [];
          setTickets(lista);
          localStorage.setItem('tickets_salvos', JSON.stringify(lista));
        })
        .catch(error => {
          console.error("Erro ao buscar tickets:", error);
        });
    }
  }, []);

  return (
    <div className='container'>
      <Card title='Listagem de Tickets'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button
                type='button'
                className='btn btn-warning mb-3'
                onClick={() => cadastrar()}
              >
                Novo Ticket
              </button>
              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>ID</th>
                    <th scope='col'>Placa</th>
                    <th scope='col'>Categoria</th>
                    <th scope='col'>Entrada</th>
                    <th scope='col'>Saída</th>
                    <th scope='col'>Valor Total</th>
                    <th scope='col'>Status</th>
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((dado) => (
                    <tr key={dado.id}>
                      <td>{dado.id}</td>
                      <td><strong>{dado.placa}</strong></td>
                      <td>{dado.categoria}</td>
                      <td>{dado.dataEntrada} às {dado.horaEntrada}</td>
                      <td>{dado.dataSaida ? `${dado.dataSaida} às ${dado.horaSaida}` : 'Em aberto'}</td>
                      <td>{dado.valorTotal ? `R$ ${Number(dado.valorTotal).toFixed(2)}` : '-'}</td>
                      <td>
                        <span className={`badge ${dado.status === 'ABERTO' ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {dado.status}
                        </span>
                      </td>
                      <td>
                        <Stack spacing={1} padding={0} direction='row'>
                          {dado.status === 'ABERTO' && (
                            <IconButton
                              aria-label='encerrar'
                              title='Encerrar e Pagar Ticket'
                              color='success'
                              onClick={() => encerrarTicket(dado.id)}
                            >
                              <PaidIcon />
                            </IconButton>
                          )}
                          <IconButton
                            aria-label='edit'
                            title='Editar'
                            onClick={() => editar(dado.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label='delete'
                            title='Excluir'
                            onClick={() => excluir(dado.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ListagemTickets;