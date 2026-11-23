import React, { useState } from 'react';
import axios from 'axios';
import toastr from 'toastr';
import Card from '../components/card';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const entrar = (e) => {
    e.preventDefault();

    if (!email || !senha) {
      toastr.warning('Preencha o e-mail e a senha.');
      return;
    }

    axios.get('/db.json')
      .then((response) => {
        const lista = response.data.usuarios || response.data;
        const usuarioEncontrado = lista.find(
          (u) => u.email === email && u.senha === senha
        );

        if (!usuarioEncontrado) {
          toastr.error('E-mail ou senha inválidos.');
          return;
        }

        if (!usuarioEncontrado.ativo) {
          toastr.error('Este usuário está inativo no sistema.');
          return;
        }

        localStorage.setItem('usuario_logado', JSON.stringify(usuarioEncontrado));
        window.location.replace('/listagem-tickets');
      })
      .catch((error) => {
        console.error('Erro ao validar login:', error);
        toastr.error('Erro ao conectar com a base de usuários.');
      });
  };

  return (
    <div className='container' style={{ maxWidth: '450px', marginTop: '80px' }}>
      <Card title='Acesso ao Sistema - SCAC'>
        <form onSubmit={entrar}>
          <div className='form-group mb-3'>
            <label htmlFor='inputEmail'>E-mail</label>
            <input
              type='email'
              className='form-control'
              id='inputEmail'
              placeholder='Digite seu e-mail'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='form-group mb-4'>
            <label htmlFor='inputSenha'>Senha</label>
            <input
              type='password'
              className='form-control'
              id='inputSenha'
              placeholder='Digite sua senha'
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type='submit' className='btn btn-primary w-100'>
            Entrar
          </button>
        </form>
      </Card>
    </div>
  );
}

export default Login;