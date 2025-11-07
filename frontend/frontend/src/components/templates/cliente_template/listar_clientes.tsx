import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Search, Plus, Edit, Trash2, Phone, Briefcase, Loader2, Home, Users, Package, ShoppingCart, DollarSign, Menu, LogOut, Mail } from "lucide-react";

// --- Interfaces ---
interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string; 
  celular?: string; 
  cidade: string;
  uf: string;
}

// --- Componente Principal de Listagem ---

export default function ListarClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [nivelAcesso, setNivelAcesso] = useState<string>("admin");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const nivel = localStorage.getItem("nivelAcesso");
    if (nivel) setNivelAcesso(nivel);
    carregarClientes();
  }, []);

  // ✅ Função de listagem REAL: GET para a API Django
  const carregarClientes = async () => {
    setLoading(true);
    try {
        const response = await fetch("http://127.0.0.1:8000/api/clientes/");
        
        if (!response.ok) {
           throw new Error(`Falha ao buscar clientes. Status: ${response.status}`);
        }
        
        const data: Cliente[] = await response.json();
        setClientes(data);
    } catch (error) {
        console.error("Erro ao carregar clientes da API real:", error);
        alert("Erro de conexão com o backend. Verifique o servidor Django.");
        setClientes([]);
    } finally {
        setLoading(false);
    }
  };

  // ✅ Função de exclusão REAL: DELETE para a API Django
  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente? Esta ação é irreversível.")) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/clientes/${id}/`, { method: "DELETE" });
            
            if (!response.ok) {
                const errorText = await response.text(); 
                throw new Error(`Falha na exclusão. Detalhe: ${errorText}`);
            }
            carregarClientes(); 
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            alert("Erro ao excluir cliente. Tente novamente ou verifique o console.");
        }
    }
  };
  
  const handleNovoCliente = () => {
      // Navega para o componente de Cadastro (sem ID)
      navigate("/cadastrar_cliente"); 
  };
  
  const handleEditarCliente = (id: number) => {
      // Navega para a rota de Edição (que usa o wrapper e o formulário unificado)
      navigate(`/editar_clientes/${id}`); 
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    navigate("/");
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf.includes(searchTerm) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* 🔵 Sidebar (Estilo Consistente) */}
      <aside style={sidebarStyle}>
        <div style={logoContainerStyle}>
          <h2 style={logoTextStyle}><Activity size={24} />SalesFlow</h2>
          <p style={subLogoTextStyle}>Sistema de Vendas</p>
        </div>

        <nav style={{ flex: 1, padding: "20px 0" }}>
          <div style={menuSectionTitleStyle}>PRINCIPAL</div>
          
          {/* Botões do Menu com Ícones */}
          <button onClick={() => navigate("/home")} style={{ ...menuItemStyle }}>
            <Home size={18} />
            <span>Home</span>
          </button>

          <button onClick={() => navigate("/clientes")} style={{ ...menuItemStyle, backgroundColor: "#e3f2fd", color: "#1e88e5" }}>
            <Briefcase size={18} />
            <span>Clientes</span>
          </button>

          <button onClick={() => navigate("/listar_usuarios")} style={{ ...menuItemStyle }}>
            <Users size={18} />
            <span>Funcionários</span>
          </button>
          
          <button onClick={() => navigate("/fornecedores")} style={{ ...menuItemStyle }}>
            <Package size={18} />
            <span>Fornecedores</span>
          </button>
          
          <button onClick={() => navigate("/produtos")} style={{ ...menuItemStyle }}>
            <ShoppingCart size={18} />
            <span>Produtos</span>
          </button>
          
          <button onClick={() => navigate("/vendas")} style={{ ...menuItemStyle }}>
            <DollarSign size={18} />
            <span>Vendas</span>
          </button>
          
          <div style={menuSectionTitleStyle}>SISTEMA</div>
          
          <button onClick={() => navigate("/configuracoes")} style={{ ...menuItemStyle }}>
            <Menu size={18} />
            <span>Configurações</span>
          </button>
          
          <button onClick={handleLogout} style={{ ...menuItemStyle, color: "#e53935" }}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </nav>
      </aside>

      {/* 🏠 Conteúdo Principal */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header (Top Bar) */}
        <header style={headerStyle}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>Clientes</h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Gerencie seus Clientes</p>
          </div>

          <button onClick={handleNovoCliente} style={newFuncionarioButtonStyle}>
              <Plus size={18} />
              Novo Cliente
          </button>
        </header>

        {/* Conteúdo da Tabela */}
        <div style={{ padding: "30px 30px" }}>
          <div style={tableCardStyle}>
            {/* Header da Tabela e Busca */}
            <div style={searchContainerStyle}>
                <h2 style={tableTitleStyle}>
                    Lista de Clientes
                    <span style={tableSubTitleStyle}>
                        Total de {clientes.length} cliente(s)
                    </span>
                </h2>
                <div style={{ position: "relative", width: "300px" }}>
                    <Search size={20} style={searchIconStyle} />
                    <input
                        type="text"
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                    />
                </div>
            </div>

            {/* Tabela */}
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={tableHeaderStyle}>Nome</th>
                    <th style={tableHeaderStyle}>CPF</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Telefone</th>
                    <th style={tableHeaderStyle}>Cidade/UF</th>
                    <th style={tableHeaderStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                        <Loader2 size={24} style={loadingIconStyle} />
                        <p style={{ marginTop: '10px', color: '#666' }}>Carregando dados...</p>
                      </td>
                    </tr>
                  ) : clientesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={emptyTableStyle}>
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  ) : (
                    clientesFiltrados.map((cliente) => (
                      <tr key={cliente.id} style={tableRowStyle}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={tableCellStyle}>{cliente.nome}</td>
                        <td style={tableCellStyle}>{cliente.cpf}</td>
                        <td style={tableCellStyle}>{cliente.email}</td>
                        <td style={tableCellStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
                                <Phone size={16} />
                                {cliente.celular || cliente.telefone || 'N/A'}
                            </div>
                        </td>
                        <td style={tableCellStyle}>{cliente.cidade}/{cliente.uf}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEditarCliente(cliente.id)}
                              style={{ ...actionButtonStyle, color: "#1e88e5" }}
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(cliente.id)}
                              style={{ ...actionButtonStyle, color: "#ef4444" }}
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Estilos CSS (Embutidos) ---

const sidebarStyle: React.CSSProperties = { width: "240px", backgroundColor: "#fff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", padding: "20px 0" };
const logoContainerStyle: React.CSSProperties = { padding: "0 20px 30px", borderBottom: "1px solid #e0e0e0" };
const logoTextStyle: React.CSSProperties = { color: "#1e88e5", fontSize: "20px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", margin: 0 };
const subLogoTextStyle: React.CSSProperties = { fontSize: "11px", color: "#999", marginTop: "2px" };
const menuSectionTitleStyle: React.CSSProperties = { fontSize: "11px", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", padding: "0 15px", marginBottom: "15px", marginTop: "20px" };
const menuItemStyle: React.CSSProperties = { 
  display: "flex", 
  alignItems: "center", 
  gap: "12px", 
  padding: "12px 20px", 
  textDecoration: "none", 
  fontSize: "14px", 
  fontWeight: 500, 
  transition: "all 0.2s", 
  cursor: "pointer", 
  border: "none", 
  width: "100%", 
  textAlign: "left", 
  backgroundColor: "transparent", 
  color: "#475569" 
}; // 💡 Esta definição garante que o ícone seja exibido ao lado do texto
const headerStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "20px 50px", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const newFuncionarioButtonStyle: React.CSSProperties = { backgroundColor: "#10b981", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)" };
const tableCardStyle: React.CSSProperties = { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" };
const searchContainerStyle: React.CSSProperties = { padding: "25px 30px", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const tableTitleStyle: React.CSSProperties = { fontSize: "18px", fontWeight: 600, color: "#1e293b", margin: 0 };
const tableSubTitleStyle: React.CSSProperties = { fontSize: "13px", color: "#64748b", marginLeft: "10px" };
const searchIconStyle: React.CSSProperties = { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" };
const searchInputStyle: React.CSSProperties = { width: "100%", padding: "12px 12px 12px 45px", fontSize: "14px", border: "2px solid #e2e8f0", borderRadius: "8px", outline: "none", boxSizing: "border-box" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const tableHeaderStyle: React.CSSProperties = { padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" };
const tableCellStyle: React.CSSProperties = { padding: "16px 20px", fontSize: "14px", color: "#334155" };
const tableRowStyle: React.CSSProperties = { borderBottom: "1px solid #e0e0e0", transition: "background-color 0.2s" };
const emptyTableStyle: React.CSSProperties = { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" };
const actionButtonStyle: React.CSSProperties = { backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" };
const loadingIconStyle: React.CSSProperties = { color: '#1e88e5', margin: '0 auto', animation: "spin 1s linear infinite" };