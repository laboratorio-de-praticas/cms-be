import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { useState, useEffect } from 'react';
import Navbar from '../components/navbar.js';
import MenuProfile from '../components/menu-profile.js';
import Header from '../components/header.js';
import Footer from '../components/footer.js';
import { UserProvider } from '../../context/userContext.js'; // importa seu contexto

export default function App({ Component, pageProps }) {
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  const abrirMenu = () => setMenuAberto(true);
  const fecharMenu = () => setMenuAberto(false);

  return (
    <UserProvider> {/* aqui começa o contexto */}
      <div style={{ position: 'relative' }}>
        <Header />
        <Navbar abrirMenu={abrirMenu} />
        <MenuProfile menuAberto={menuAberto} fecharMenu={fecharMenu} />
        <main>
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
}
