import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

// Imports baseados na sua estrutura de pastas src/components/templates/...

// 🚨 CORREÇÃO FINAL: TODOS os arquivos de Usuário agora importados como .tsx
import ListarUsuarios from "./components/templates/usuarios_template/listar_usuarios.tsx";
import CadastrarUsuarios from './components/templates/usuarios_template/cadastrar_usuarios.tsx'; // 🚨 ALTERADO PARA .tsx
import EditarUsuario from "./components/templates/usuarios_template/editar_usuarios.tsx";       // 🚨 ALTERADO PARA .tsx

import Home from "./components/templates/home_template/home.tsx";
import Login from "./components/templates/login_template/login.tsx";
import PDV from "./components/templates/pdv_template/pdv.tsx";
import Relatorios from "./components/templates/relatorio_template/Relatorios.tsx";



// Componente para rotas protegidas
function PrivateRoute({ children }) {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  return usuarioLogado ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <div className="App">
        
        <Routes>
          {/* 1. Rota de Login (Não Protegida) */}
          <Route path="/" element={<Login />} />

          {/* Rotas protegidas */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/listar_usuarios"
            element={
              <PrivateRoute>
                <ListarUsuarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/cadastrar_usuarios"
            element={
              <PrivateRoute>
                <CadastrarUsuarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/editar/:id"
            element={
              <PrivateRoute>
                <EditarUsuario />
              </PrivateRoute>
            }
          />
          <Route
            path="/pdv"
            element={
              <PrivateRoute>
                <PDV />
              </PrivateRoute>
            }
          />
          <Route
  path="/relatorios"
  element={
    <PrivateRoute>
      <Relatorios />
    </PrivateRoute>
  }
/>  
        </Routes>
      </div>
    </Router>
  );
}

export default App;