import React from 'react';
import NavbarItem from './navbarItem';

function Navbar(props) {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));

  if (!usuarioLogado || window.location.pathname === '/' || window.location.pathname === '/login') {
    return null;
  }

  const isAdmin = usuarioLogado.perfil === 'ADMIN' ? 'true' : 'false';

  const sair = () => {
    localStorage.removeItem('usuario_logado');
    window.location.replace('/');
  };

  return (
    <div className='navbar navbar-expand-lg fixed-top navbar-dark bg-primary'>
      <div className='container'>
        <a href='/listagem-tickets' className='navbar-brand'>
          SCAC
        </a>
        <button
          className='navbar-toggler'
          type='button'
          data-toggle='collapse'
          data-target='#navbarResponsive'
          aria-controls='navbarResponsive'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarResponsive'>
          <ul className='navbar-nav me-auto'>
            <NavbarItem
              render={isAdmin}
              href='/listagem-usuarios'
              label='Usuarios'
            />

            <NavbarItem
              render='true'
              href='/listagem-categorias'
              label='Categorias'
            />

            <NavbarItem
              render='true'
              href='/listagem-tickets'
              label='Tickets'
            />

            <NavbarItem
              render='true'
              href='/listagem-pagamentos'
              label='Pagamentos'
            />

            <NavbarItem
              render='true'
              href='/listagem-caixa'
              label='Caixa'
            />
          </ul>

          <div className='d-flex align-items-center text-white'>
            <span className='me-3'>Olá, {usuarioLogado.nome}</span>
            <button onClick={sair} className='btn btn-outline-light btn-sm'>
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;