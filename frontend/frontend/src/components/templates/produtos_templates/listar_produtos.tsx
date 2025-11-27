import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Loader2, Package } from "lucide-react";
import Sidebar from "../../widgets/side_bar.tsx";
import { useToast, useConfirm } from '../../widgets/ToastContext.tsx';

interface Produto {
  id: number;
  descricao: string;
  preco: number;
  quantidade_estoque: number;
  desconto_percentual: number;
  codigo_barras: string | null;
  ativo: boolean;
}

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

export default function ListarProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [usuarioLogado, setUsuarioLogado] = useState<string>(() => localStorage.getItem("usuarioLogado") || "Usuário");
  const [nivelAcesso, setNivelAcesso] = useState<string>(() => localStorage.getItem("nivelAcesso") || "user");

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();

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
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      
      let lista: Produto[] = [];
      if (Array.isArray(data)) {
        lista = data;
      } else if (data.results && Array.isArray(data.results)) {
        lista = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        lista = data.data;
      }

      setProdutos(lista);

    } catch (error) {
      showToast('error', 'Erro!', 'Erro ao carregar produtos. Verifique o servidor Django.');
      setProdutos([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, descricao: string) => {
    const confirmed = await showConfirm({
      title: 'Excluir Produto',
      message: `Tem certeza que deseja excluir "${descricao}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/produtos/${id}/`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Erro ao excluir");
      
      showToast('success', 'Produto Excluído!', 'Produto removido com sucesso.');
      carregarProdutos();
    } catch (error) {
      showToast('error', 'Erro!', 'Não foi possível excluir o produto. Verifique se ele está vinculado a uma venda.');
    }
  };

  const handleNovoProduto = () => navigate("/cadastrar_produto");
  const handleEditarProduto = (id: number) => navigate(`/editar_produto/${id}`);
  
  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    navigate("/");
  };

  const produtosFiltrados = produtos.filter((p) => {
      const desc = p.descricao ? p.descricao.toLowerCase() : "";
      const cod = p.codigo_barras ? p.codigo_barras.toLowerCase() : "";
      const term = searchTerm.toLowerCase();
      
      return desc.includes(term) || cod.includes(term);
  });

  const formatCurrency = (v: number | string | null) => {
    if (v === null || v === undefined || v === "") return "R$ 0,00";
    const num = typeof v === 'string' ? parseFloat(v) : v;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Sidebar usuarioLogado={usuarioLogado} nivelAcesso={nivelAcesso} onLogout={handleLogout} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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

        <div style={{ padding: "30px 50px" }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}>
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
                  backgroundColor: "#1e88e5",
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

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={tableHeaderStyle}>Descrição</th>
                    <th style={tableHeaderStyle}>Preço</th>
                    <th style={tableHeaderStyle}>Desconto (%)</th>
                    <th style={tableHeaderStyle}>Estoque</th>
                    <th style={tableHeaderStyle}>Cód. Barras</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px"
                      }}>
                        <Loader2 size={24} style={{ 
                          color: '#1e88e5', 
                          margin: '0 auto 10px',
                          animation: 'spin 1s linear infinite'
                        }} />
                        <p>Carregando dados...</p>
                      </td>
                    </tr>
                  ) : produtosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px"
                      }}>
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  ) : (
                    produtosFiltrados.map((p) => (
                      <tr 
                        key={p.id} 
                        style={{
                          borderBottom: "1px solid #e0e0e0",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
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
                              <Package size={18} />
                            </div>
                            <span style={{ fontWeight: 500 }}>{p.descricao}</span>
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{ fontWeight: 600, color: "#16a34a" }}>
                            {formatCurrency(p.preco)}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          {p.desconto_percentual > 0 ? (
                            <span style={{
                              backgroundColor: "#fef3c7",
                              color: "#92400e",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 500
                            }}>
                              {p.desconto_percentual}%
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>0%</span>
                          )}
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            color: p.quantidade_estoque < 10 ? "#dc2626" : "#334155",
                            fontWeight: p.quantidade_estoque < 10 ? 600 : 400
                          }}>
                            {p.quantidade_estoque}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{ color: "#64748b", fontFamily: "monospace" }}>
                            {p.codigo_barras || "N/A"}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            backgroundColor: p.ativo ? "#dcfce7" : "#fee2e2",
                            color: p.ativo ? "#166534" : "#991b1b",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 500
                          }}>
                            {p.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEditarProduto(p.id)}
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#1e88e5",
                                padding: "6px",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.descricao)}
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#ef4444",
                                padding: "6px",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
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