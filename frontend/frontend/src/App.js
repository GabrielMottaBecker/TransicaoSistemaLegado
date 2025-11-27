import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ListarUsuarios from "./components/templates/usuarios_template/listar_usuarios.tsx";
import CadastrarUsuarios from './components/templates/usuarios_template/cadastrar_usuarios.tsx'; 
import EditarUsuario from "./components/templates/usuarios_template/editar_usuarios.tsx";     
import { ToastProvider } from './components/widgets/ToastContext.tsx';  

import Home from "./components/templates/home_template/home.tsx";
import Login from "./components/templates/login_template/login.tsx";


import PDV from "./components/templates/pdv_template/pdv.tsx"; 
import Relatorios from "./components/templates/relatorio_template/Relatorios.tsx"; 

import CadastrarCliente from "./components/templates/cliente_template/cadastrar_clientes.tsx"; 
import ListarClientes from "./components/templates/cliente_template/listar_clientes.tsx"; 
import EditarClientesWrapper from "./components/templates/cliente_template/editar_clientes.tsx"; 


import ListarFornecedores from "./components/templates/fornecedor_templates/listar_fornecedores.tsx"; 
import CadastrarFornecedor from "./components/templates/fornecedor_templates/cadastrar_fornecedores.tsx"; 
import EditarFornecedorWrapper from "./components/templates/fornecedor_templates/editar_fornecedores.tsx";


import ListarProdutos from "./components/templates/produtos_templates/listar_produtos.tsx";
import CadastrarProduto from "./components/templates/produtos_templates/cadastrar_produtos.tsx";
import EditarProdutoWrapper from "./components/templates/produtos_templates/editar_produtos.tsx";


// Componente para rotas protegidas
function PrivateRoute({ children }) {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  return usuarioLogado ? children : <Navigate to="/" />;
}

function App() {
  return (
    <ToastProvider> 
      <Router>
        <div className="App">
          
          <Routes>
            
            <Route path="/" element={<Login />} />

            {/* ROTAS PROTEGIDAS */}
            
            {/* 2. Rota Home/Dashboard */}
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />

            {/* 3. Listagem de Funcionários */}
            <Route path="/listar_usuarios" element={<PrivateRoute><ListarUsuarios /></PrivateRoute>} />

            {/* 4. Cadastro de Funcionários (Rota para Novo) */}
            <Route path="/cadastrar_funcionario" element={<PrivateRoute><CadastrarUsuarios /></PrivateRoute>} />
            
            {/* 5. Edição de Funcionários (Rota para Edição) */}
            <Route path="/editar_funcionario/:id" element={<PrivateRoute>
              <EditarUsuario /> 
            </PrivateRoute>} />

            {/* 6. Listagem de Clientes */}
            <Route path="/clientes" element={<PrivateRoute><ListarClientes /></PrivateRoute>} />

            {/* 7. Cadastro de Clientes (Criação) */}
            <Route path="/cadastrar_cliente" element={<PrivateRoute><CadastrarCliente /></PrivateRoute>} />
            
            {/* 8. Edição de Clientes (Rota solicitada) */}
            <Route path="/editar_clientes/:id" element={<PrivateRoute><EditarClientesWrapper /></PrivateRoute>} />
            
            {/* 9. Listagem de Fornecedores */}
            <Route path="/fornecedores" element={<PrivateRoute><ListarFornecedores /></PrivateRoute>} />
            
            {/* 10. Cadastro de Fornecedores */}
            <Route path="/cadastrar_fornecedor" element={<PrivateRoute><CadastrarFornecedor /></PrivateRoute>} />
            
            {/* 11. Edição de Fornecedores */}
            <Route path="/editar_fornecedor/:id" element={<PrivateRoute><EditarFornecedorWrapper /></PrivateRoute>} />

            
            <Route path="/produtos" element={<PrivateRoute><ListarProdutos /></PrivateRoute>} />
            <Route path="/cadastrar_produto" element={<PrivateRoute><CadastrarProduto /></PrivateRoute>} />
            <Route path="/editar_produto/:id" element={<PrivateRoute><EditarProdutoWrapper /></PrivateRoute>} />

            
            <Route path="/pdv" element={<PrivateRoute><PDV /></PrivateRoute>} />
            <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />


            {/* Rotas Futuras (Placeholders) */}
            <Route path="/vendas" element={<PrivateRoute><div>Página Vendas (A ser implementada)</div></PrivateRoute>} />
            <Route path="/configuracoes" element={<PrivateRoute><div>Página Configurações (A ser implementada)</div></PrivateRoute>} />

            {/* Rota Padrão / Fallback */}
            <Route path="*" element={<Navigate to="/home" />} />

          </Routes>
        </div>
      </Router>
    </ToastProvider> 
  );
}

export default App;