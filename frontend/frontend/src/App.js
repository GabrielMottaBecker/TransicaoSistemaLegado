import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import ListarUsuarios from "./components/templates/usuarios_template/listar_usuarios.tsx";
import CadastrarUsuarios from './components/templates/usuarios_template/cadastrar_usuarios';
import EditarUsuario from "./components/templates/usuarios_template/editar_usuarios"; 
import Home from "./components/templates/home_template/home.tsx";
import Login from "./components/templates/login_template/login.tsx";


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
          {/* Tela inicial será Login */}
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;