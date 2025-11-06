import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Search, Plus, Edit, Trash2, Mail, Phone, LogOut, Home, Users, Briefcase, Package, ShoppingCart, DollarSign, Menu } from "lucide-react";
import Sidebar from '../../widgets/side_bar.tsx';
interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  cargo: string;
  nivel: string;
  email: string;
  celular: string;
}

export default function ListarFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState<string>("Admin");
  const navigate = useNavigate();
  const nivelAcesso = "admin";

  useEffect(() => {
    const user = localStorage.getItem("usuarioLogado");
    if (user) {
      setUsuarioLogado(user);
    }
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/usuarios/");

      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      // Dados de exemplo para demonstração
      setFuncionarios([
        {
          id: 1,
          nome: "Maria Santos",
          cpf: "123.456.789-00",
          cargo: "Gerente de Vendas",
          nivel: "Administrador",
          email: "maria@example.com",
          celular: "(11) 98765-4321"
        }
      ]);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await fetch(`http://127.0.0.1:8000/api/usuarios/${id}/`, { method: "DELETE" });
        carregarFuncionarios();
      } catch (error) {
        console.error("Erro ao excluir funcionário:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    navigate("/");
  };

  const funcionariosFiltrados = funcionarios.filter(func =>
    func.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.cpf.includes(searchTerm) ||
    func.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
    <Sidebar
      usuarioLogado={usuarioLogado}
      nivelAcesso={nivelAcesso}
      onLogout={handleLogout}
    />




      {/* 🏠 Conteúdo Principal */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          backgroundColor: "#fff",
          padding: "20px 50px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>Funcionários</h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Gerencie seus funcionários</p>
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

        {/* Conteúdo */}
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
                  Lista de Funcionários
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  {funcionariosFiltrados.length} funcionário(s) cadastrado(s)
                </p>
              </div>
              <button
                onClick={() => navigate("/cadastrar_funcionario")}
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
                Novo Funcionário
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
                  placeholder="Buscar por nome, CPF, email ou cargo..."
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
                    <th style={tableHeaderStyle}>Nome</th>
                    <th style={tableHeaderStyle}>CPF</th>
                    <th style={tableHeaderStyle}>Cargo</th>
                    <th style={tableHeaderStyle}>Nível</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Celular</th>
                    <th style={tableHeaderStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px"
                      }}>
                        Nenhum funcionário encontrado
                      </td>
                    </tr>
                  ) : (
                    funcionariosFiltrados.map((func) => (
                      <tr key={func.id} style={{
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
                              {func.nome.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{func.nome}</span>
                          </div>
                        </td>
                        <td style={tableCellStyle}>{func.cpf}</td>
                        <td style={tableCellStyle}>{func.cargo}</td>
                        <td style={tableCellStyle}>
                          <span style={{
                            backgroundColor: "#e3f2fd",
                            color: "#1e88e5",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 500
                          }}>
                            {func.nivel}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
                            <Mail size={16} />
                            {func.email}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
                            <Phone size={16} />
                            {func.celular}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => navigate(`/editar_funcionario/${func.id}`)}
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
                              onClick={() => handleDelete(func.id)}
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
  textAlign: "left"
};

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