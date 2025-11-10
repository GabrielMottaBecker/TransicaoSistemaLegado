import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Loader2, ShoppingCart } from "lucide-react";

// Importação da Sidebar externa para garantir o padrão
import Sidebar from '../../widgets/side_bar.tsx'; 

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

// --- Estilos CSS (Padronizados) ---
// Usamos apenas os estilos que são comuns à tabela e ações, 
// o layout principal (header/card) é replicado via styles inline
const tableHeaderStyle: React.CSSProperties = {
  padding: "16px 20px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: 600,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tableCellStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontSize: "14px",
  color: "#334155"
};

const actionButtonStyle: React.CSSProperties = { 
  backgroundColor: "transparent", 
  border: "none", 
  cursor: "pointer", 
  padding: "6px", 
  borderRadius: "6px", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center" 
};

// Estilo para o ícone de carregamento (animação não é suportada por inline style diretamente no React sem definição externa)
const loadingIconStyle: React.CSSProperties = { 
  color: '#1e88e5', 
  margin: '0 auto 10px',
  // A propriedade animation não funciona com CSSProperties nativas. 
  // Para fins de demonstração visual, o icon será exibido, mas a animação precisa de CSS global ou styled-components.
}; 

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

  const produtosFiltrados = (Array.isArray(produtos) ? produtos : []).filter(prod =>
    prod.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prod.codigo_barras && prod.codigo_barras.includes(searchTerm))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };


  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      
      {/* 1. USANDO O COMPONENTE EXTERNO Sidebar */}
      <Sidebar
        usuarioLogado={usuarioLogado}
        nivelAcesso={nivelAcesso}
        onLogout={handleLogout}
      />

      {/* Conteúdo Principal */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header (Top Bar) - Padrão dos outros componentes */}
        <header style={{
          backgroundColor: "#fff",
          padding: "20px 50px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>Produtos</h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Gerencie seu estoque e preços</p>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
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
                <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Administrador</p>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo da Tabela */}
        <div style={{ padding: "30px 50px" }}>
          {/* Card principal */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}>
            {/* Header do card */}
            <div style={{
              padding: "25px 30px",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                  Lista de Produtos
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  {produtosFiltrados.length} produto(s) cadastrado(s)
                </p>
              </div>
              <button
                onClick={handleNovoProduto}
                style={{
                  backgroundColor: "#1e88e5", // Cor azul consistente
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <Plus size={18} />
                Novo Produto
              </button>
            </div>

            {/* Barra de busca */}
            <div style={{ padding: "20px 30px", borderBottom: "1px solid #e0e0e0" }}>
              <div style={{ position: "relative" }}>
                <Search size={20} style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }} />
                <input
                  type="text"
                  placeholder="Buscar por descrição ou código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 45px",
                    fontSize: "14px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Tabela */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                      <td colSpan={8} style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px"
                      }}>
                        <Loader2 size={24} style={loadingIconStyle} />
                        <p>Carregando dados...</p>
                      </td>
                    </tr>
                  ) : produtosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px"
                      }}>
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  ) : (
                    produtosFiltrados.map((prod) => (
                      <tr key={prod.id} style={{
                        borderBottom: "1px solid #e0e0e0",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={tableCellStyle}>
                           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: "#e3f2fd",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#1e88e5",
                              fontWeight: 600,
                              fontSize: "14px"
                            }}>
                              {prod.descricao.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{prod.descricao}</span>
                          </div>
                        </td>
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

// NOTE: Todo o bloco de estilos da sidebar foi removido daqui para forçar o uso do Sidebar importado 
// e manter apenas os estilos de tabela necessários.