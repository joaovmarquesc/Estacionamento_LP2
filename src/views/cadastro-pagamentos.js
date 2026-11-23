import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toastr from 'toastr';
import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

function CadastroPagamentos() {
  const { idParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [ticketId, setTicketId] = useState(searchParams.get('ticketId') || '');
  const [caixaId, setCaixaId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [valor, setValor] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [troco, setTroco] = useState(0);
  const [resumoTicket, setResumoTicket] = useState(null);

  useEffect(() => {
    axios.get('/db.json')
      .then((response) => {
        const db = response.data;

        // 1. Pega automaticamente o caixa que está ABERTO
        const caixaAberto = (db.caixa || []).find((c) => c.status === 'ABERTO');
        if (caixaAberto) {
          setCaixaId(caixaAberto.id);
        }

        // 2. Se veio um ticketId pela URL, busca os dados do ticket e calcula o valor
        const idDaUrl = searchParams.get('ticketId');
        if (idDaUrl) {
          const ticketsSalvos = JSON.parse(localStorage.getItem('tickets_salvos')) || db.tickets || [];
          const ticket = ticketsSalvos.find((t) => String(t.id) === String(idDaUrl));

          if (ticket) {
            const categoria = (db.categorias || []).find((cat) => cat.id === ticket.categoriaId);
            const valorHora = categoria ? categoria.valorHora : 10;

            // Calcula diferença de tempo entre entrada e agora
            const agora = new Date();
            const dataSaida = agora.toISOString().split('T')[0];
            const horaSaida = agora.toTimeString().slice(0, 5);

            const entradaDate = new Date(`${ticket.dataEntrada}T${ticket.horaEntrada}:00`);
            const diffMs = agora - entradaDate;
            const horasCobradas = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
            const valorCalculado = horasCobradas * valorHora;

            setTicketId(ticket.id);
            setValor(valorCalculado);
            setValorRecebido(valorCalculado);
            setTroco(0);

            setResumoTicket({
              placa: ticket.placa,
              categoria: ticket.categoria,
              entrada: `${ticket.dataEntrada} às ${ticket.horaEntrada}`,
              saida: `${dataSaida} às ${horaSaida}`,
              horasCobradas,
              valorHora,
              dataSaida,
              horaSaida
            });
          }
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar dados do pagamento:', error);
      });
  }, [searchParams]);

  const inicializar = () => {
    navigate('/listagem-tickets');
  };

  const salvar = () => {
    if (!ticketId || !caixaId || !valor) {
      toastr.warning('Preencha todos os campos obrigatórios (*).');
      return;
    }

    const agora = new Date();
    const dataAtual = resumoTicket ? resumoTicket.dataSaida : agora.toISOString().split('T')[0];
    const horaAtual = resumoTicket ? resumoTicket.horaSaida : agora.toTimeString().slice(0, 5);

    axios.get('/db.json').then((response) => {
      const db = response.data;

      // 1. Atualiza o Ticket para FINALIZADO com data/hora de saída e valorTotal
      const ticketsAtuais = JSON.parse(localStorage.getItem('tickets_salvos')) || db.tickets || [];
      const ticketsAtualizados = ticketsAtuais.map((t) => {
        if (String(t.id) === String(ticketId)) {
          return {
            ...t,
            dataSaida: dataAtual,
            horaSaida: horaAtual,
            valorTotal: Number(valor),
            status: 'FINALIZADO'
          };
        }
        return t;
      });
      localStorage.setItem('tickets_salvos', JSON.stringify(ticketsAtualizados));

      // 2. Registra o novo Pagamento vinculado ao Ticket e ao Caixa
      const pagamentosAtuais = JSON.parse(localStorage.getItem('pagamentos_salvos')) || db.pagamentos || [];
      const novoPagamento = {
        id: pagamentosAtuais.length > 0 ? Math.max(...pagamentosAtuais.map((p) => p.id)) + 1 : 1,
        ticketId: Number(ticketId),
        caixaId: Number(caixaId),
        formaPagamento,
        valor: Number(valor),
        valorRecebido: Number(valorRecebido || valor),
        troco: Number(troco),
        data: dataAtual,
        hora: horaAtual,
        status: 'PAGO'
      };
      localStorage.setItem('pagamentos_salvos', JSON.stringify([...pagamentosAtuais, novoPagamento]));

      toastr.success('Pagamento registrado e saída do veículo liberada!');
      navigate('/listagem-tickets');
    });
  };

  return (
    <div className='container'>
      <Card title={idParam ? 'Editar Pagamento' : 'Novo Pagamento / Baixa de Ticket'}>
        {resumoTicket && (
          <div className='alert alert-info'>
            <strong>Resumo do Ticket #{ticketId}:</strong> Veículo <strong>{resumoTicket.placa}</strong> ({resumoTicket.categoria}) |
            Entrada: {resumoTicket.entrada} | Saída: {resumoTicket.saida} |
            Tempo cobrado: <strong>{resumoTicket.horasCobradas}h</strong> (R$ {resumoTicket.valorHora}/h)
          </div>
        )}

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <div className='row'>
                <div className='col-md-6'>
                  <FormGroup label='ID do Ticket: *' htmlFor='inputTicketId'>
                    <input
                      type='number'
                      id='inputTicketId'
                      value={ticketId}
                      className='form-control'
                      onChange={(e) => setTicketId(e.target.value)}
                    />
                  </FormGroup>
                </div>
                <div className='col-md-6'>
                  <FormGroup label='ID do Caixa: *' htmlFor='inputCaixaId'>
                    <input
                      type='number'
                      id='inputCaixaId'
                      value={caixaId}
                      className='form-control'
                      onChange={(e) => setCaixaId(e.target.value)}
                    />
                  </FormGroup>
                </div>
              </div>

              <FormGroup label='Forma de Pagamento: *' htmlFor='selectForma'>
                <select
                  className='form-select'
                  id='selectForma'
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <option value='PIX'>PIX</option>
                  <option value='DINHEIRO'>DINHEIRO</option>
                  <option value='CARTAO'>CARTÃO</option>
                </select>
              </FormGroup>

              <div className='row'>
                <div className='col-md-4'>
                  <FormGroup label='Valor (R$): *' htmlFor='inputValor'>
                    <input
                      type='number'
                      id='inputValor'
                      value={valor}
                      className='form-control'
                      onChange={(e) => {
                        const v = e.target.value;
                        setValor(v);
                        if (valorRecebido) setTroco(Math.max(0, valorRecebido - v));
                      }}
                    />
                  </FormGroup>
                </div>
                <div className='col-md-4'>
                  <FormGroup label='Valor Recebido (R$):' htmlFor='inputRecebido'>
                    <input
                      type='number'
                      id='inputRecebido'
                      value={valorRecebido}
                      className='form-control'
                      onChange={(e) => {
                        const rec = e.target.value;
                        setValorRecebido(rec);
                        if (valor) setTroco(Math.max(0, rec - valor));
                      }}
                    />
                  </FormGroup>
                </div>
                <div className='col-md-4'>
                  <FormGroup label='Troco (R$):' htmlFor='inputTroco'>
                    <input
                      type='number'
                      id='inputTroco'
                      value={troco}
                      className='form-control'
                      disabled
                    />
                  </FormGroup>
                </div>
              </div>

              <Stack spacing={1} padding={1} direction='row'>
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Confirmar Pagamento e Encerrar Ticket
                </button>
                <button onClick={inicializar} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CadastroPagamentos;