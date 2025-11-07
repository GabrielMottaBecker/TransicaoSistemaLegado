import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Search, Plus, Edit, Trash2, Package, Loader2, Home, Users, Briefcase, ShoppingCart, DollarSign, Menu, LogOut } from "lucide-react";

// --- Interfaces ---
interface Produto {
  id: number;
  descricao: string;
  preco: number;
  quantidade_estoque: number;
  desconto_percentual: number;
  codigo_barras: string | null;
  ativo: boolean;
  preco_com_desconto: number; // Campo ReadOnly do Serializer
}

// --- Componente Principal de Listagem ---

export default function ListarProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<string>("Admin"); 
  const [nivelAcesso, setNivelAcesso] = useState<string>("admin"); 

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("usuarioLogado");
    const nivel = localStorage.getItem("nivelAcesso");
    if (user) setUsuarioLogado(user);
    if (nivel) setNivelAcesso(nivel);
    
    carregarProdutos();
  }, []);

  // Função de listagem REAL: GET para a API Django
  const carregarProdutos = async () => {
    setLoading(true);
    try {
        const response = await fetch("http://127.0.0.1:8000/api/produtos/"); 
        
        if (!response.ok) {
           throw new Error(`Falha ao buscar produtos. Status: ${response.status}`);
        }
        
        const data: Produto[] = await response.json();
        setProdutos(data);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        alert("Erro de conexão com o backend. Verifique o servidor Django.");
        setProdutos([]);
    } finally {
        setLoading(false);
    }
  };

  // Função de exclusão REAL: DELETE para a API Django
  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/produtos/${id}/`, { method: "DELETE" });
            
            if (!response.ok) {
                const errorText = await response.text(); 
                throw new Error(`Falha na exclusão. Detalhe: ${errorText}`);
            }
            carregarProdutos(); 
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
            alert("Erro ao excluir produto. Tente novamente ou verifique o console.");
        }
    }
  };
  
  const handleNovoProduto = () => {
      navigate("/cadastrar_produto"); 
  };
  
  const handleEditarProduto = (id: number) => {
      navigate(`/editar_produto/${id}`); 
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    navigate("/");
  };

  // 🚨 CORREÇÃO IMPLEMENTADA: Verifica se 'produtos' é um array antes de filtrar.
  const produtosFiltrados = (Array.isArray(produtos) ? produtos : []).filter(prod =>
    prod.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prod.codigo_barras && prod.codigo_barras.includes(searchTerm))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };


  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* 🔵 Sidebar */}
      <aside style={sidebarStyle}>
        <div style={logoContainerStyle}>
          <h2 style={logoTextStyle}><Activity size={24} />SalesFlow</h2>
          <p style={subLogoTextStyle}>Sistema de Vendas</p>
        </div>

        <nav style={{ flex: 1, padding: "20px 0" }}>
          <div style={menuSectionTitleStyle}>PRINCIPAL</div>
          
          <button onClick={() => navigate("/home")} style={{ ...menuItemStyle }}>
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button onClick={() => navigate("/clientes")} style={{ ...menuItemStyle }}>
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
          
          {/* 🎨 PRODUTOS ATIVO */}
          <button onClick={() => navigate("/produtos")} style={{ ...menuItemStyle, backgroundColor: "#e3f2fd", color: "#1e88e5" }}>
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
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>Produtos</h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Gerencie seu estoque e preços</p>
          </div>

          {/* Bloco Admin + Botão Novo Produto (Layout Vertical) */}
          <div style={{
            display: "flex",
            flexDirection: "column", 
            alignItems: "flex-end", 
            gap: "10px" 
          }}>
            {/* Bloco do Administrador Logado */}
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "8px 16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#1e88e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px"
              }}>
                {usuarioLogado.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, margin: 0, color: "#1e293b" }}>{usuarioLogado}</p>
                <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{nivelAcesso === "admin" ? "Administrador" : "Usuário"}</p>
              </div>
            </div>
          
            {/* Botão Novo Produto */}
            <button onClick={handleNovoProduto} style={{...newFuncionarioButtonStyle, backgroundColor: "#1e88e5", boxShadow: "0 4px 6px rgba(30, 136, 229, 0.2)"}}>
                <Plus size={18} />
                Novo Produto
            </button>
          </div>
        </header>

        {/* Conteúdo da Tabela */}
        <div style={{ padding: "30px 50px" }}>
          <div style={tableCardStyle}>
            {/* Header da Tabela e Busca */}
            <div style={searchContainerStyle}>
                <h2 style={tableTitleStyle}>
                    Lista de Produtos
                    <span style={tableSubTitleStyle}>
                        Total de {produtos.length} produto(s)
                    </span>
                </h2>
                <div style={{ position: "relative", width: "300px" }}>
                    <Search size={20} style={searchIconStyle} />
                    <input
                        type="text"
                        placeholder="Buscar por descrição ou código de barras..."
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
                    <th style={tableHeaderStyle}>Descrição</th>
                    <th style={tableHeaderStyle}>Preço Base</th>
                    <th style={tableHeaderStyle}>Desconto (%)</th>
                    <th style={tableHeaderStyle}>Preço Final</th>
                    <th style={tableHeaderStyle}>Estoque</th>
                    <th style={tableHeaderStyle}>Cód. Barras</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                        <Loader2 size={24} style={loadingIconStyle} />
                        <p style={{ marginTop: '10px', color: '#666' }}>Carregando dados...</p>
                      </td>
                    </tr>
                  ) : produtosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={emptyTableStyle}>
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  ) : (
                    produtosFiltrados.map((prod) => (
                      <tr key={prod.id} style={tableRowStyle}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={tableCellStyle}>{prod.descricao}</td>
                        <td style={tableCellStyle}>{formatCurrency(prod.preco)}</td>
                        <td style={tableCellStyle}>{prod.desconto_percentual.toFixed(2)}%</td>
                        <td style={{...tableCellStyle, fontWeight: 600}}>{formatCurrency(prod.preco_com_desconto)}</td>
                        <td style={tableCellStyle}>{prod.quantidade_estoque}</td>
                        <td style={tableCellStyle}>{prod.codigo_barras || 'N/A'}</td>
                        <td style={tableCellStyle}>
                            <span style={{
                                backgroundColor: prod.ativo ? '#e8f5e9' : '#fce4ec',
                                color: prod.ativo ? '#4caf50' : '#e91e63',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 500
                            }}>
                                {prod.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEditarProduto(prod.id)}
                              style={{ ...actionButtonStyle, color: "#1e88e5" }}
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id)}
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

// --- Estilos CSS (Reutilizados) ---
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
}; 
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