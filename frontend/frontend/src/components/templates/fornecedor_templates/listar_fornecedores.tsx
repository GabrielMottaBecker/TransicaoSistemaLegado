import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Mail, Phone, Loader2 } from "lucide-react";
import Sidebar from '../../widgets/side_bar.tsx'; 

interface Fornecedor {
  id: number;
  nome: string; 
  cnpj: string;
  email: string;
  celular: string;
  telefone_fixo?: string; 
  cep: string;
  endereco: string;
  numero_casa: string;
  bairro: string;
  cidade: string;
  uf: string;
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

export default function ListarFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [usuarioLogado, setUsuarioLogado] = useState<string>(() => localStorage.getItem("usuarioLogado") || "Usuário");
  const [nivelAcesso, setNivelAcesso] = useState<string>(() => localStorage.getItem("nivelAcesso") || "user");

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("usuarioLogado");
    const nivel = localStorage.getItem("nivelAcesso");
    if (user) setUsuarioLogado(user);
    if (nivel) setNivelAcesso(nivel);
    
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    setLoading(true);
    try {
        const response = await fetch("http://127.0.0.1:8000/api/fornecedores/"); 
        
        if (!response.ok) {
           throw new Error(`Falha ao buscar fornecedores. Status: ${response.status}`);
        }
        
        const data: Fornecedor[] = await response.json();
        setFornecedores(data);
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
        alert("Erro de conexão com o backend. Verifique o servidor Django.");
        setFornecedores([]);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este fornecedor? Esta ação é irreversível.")) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/fornecedores/${id}/`, { method: "DELETE" });
            
            if (!response.ok) {
                const errorText = await response.text(); 
                throw new Error(`Falha na exclusão. Detalhe: ${errorText}`);
            }
            carregarFornecedores(); 
        } catch (error) {
            console.error("Erro ao excluir fornecedor:", error);
            alert("Erro ao excluir fornecedor. Tente novamente ou verifique o console.");
        }
    }
  };
  
  const handleNovoFornecedor = () => {
      navigate("/cadastrar_fornecedor"); 
  };
  
  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    navigate("/");
  };

  const fornecedoresFiltrados = fornecedores.filter(forn =>
    forn.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forn.cnpj.includes(searchTerm) ||
    forn.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forn.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      
      <Sidebar
        usuarioLogado={usuarioLogado}
        nivelAcesso={nivelAcesso}
        onLogout={handleLogout}
      />

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
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>Fornecedores</h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Gerencie seus fornecedores</p>
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
                  Lista de Fornecedores
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  {fornecedoresFiltrados.length} fornecedor(es) cadastrado(s)
                </p>
              </div>
              <button
                onClick={handleNovoFornecedor}
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
                Novo Fornecedor
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
                  placeholder="Buscar por Razão Social, CNPJ, email ou cidade..."
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
                    <th style={tableHeaderStyle}>Razão Social</th>
                    <th style={tableHeaderStyle}>CNPJ</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Telefone</th>
                    <th style={tableHeaderStyle}>Cidade/UF</th>
                    <th style={tableHeaderStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{
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
                  ) : fornecedoresFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px"
                      }}>
                        Nenhum fornecedor encontrado
                      </td>
                    </tr>
                  ) : (
                    fornecedoresFiltrados.map((forn) => (
                      <tr key={forn.id} style={{
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
                              {forn.nome.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{forn.nome}</span>
                          </div>
                        </td>
                        <td style={tableCellStyle}>{forn.cnpj}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
                            <Mail size={16} />
                            {forn.email}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
                            <Phone size={16} />
                            {forn.celular || forn.telefone_fixo || 'N/A'}
                          </div>
                        </td>
                        <td style={tableCellStyle}>{forn.cidade}/{forn.uf}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => navigate(`/editar_fornecedor/${forn.id}`)}
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
                              onClick={() => handleDelete(forn.id)}
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