import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Mail, Phone, Loader2 } from "lucide-react";
import Sidebar from '../../widgets/side_bar.tsx';
import { useToast, useConfirm } from '../../widgets/ToastContext.tsx'; // ← IMPORTAR

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

export default function ListarClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [usuarioLogado, setUsuarioLogado] = useState<string>(() => localStorage.getItem("usuarioLogado") || "Usuário");
  const [nivelAcesso, setNivelAcesso] = useState<string>(() => localStorage.getItem("nivelAcesso") || "user");

  const navigate = useNavigate();
  const { showToast } = useToast(); // ← USAR TOAST
  const { showConfirm } = useConfirm(); // ← USAR CONFIRM

  useEffect(() => {
    const user = localStorage.getItem("usuarioLogado");
    const nivel = localStorage.getItem("nivelAcesso");
    if (user) setUsuarioLogado(user);
    if (nivel) setNivelAcesso(nivel);
    
    carregarClientes();
  }, []);

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
      // ✅ SUBSTITUIR console.error e alert por showToast
      showToast('error', 'Erro!', 'Erro ao carregar clientes. Verifique o servidor Django.');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SUBSTITUIR window.confirm() por showConfirm()
  const handleDelete = async (id: number, nome: string) => {
    const confirmed = await showConfirm({
      title: 'Excluir Cliente',
      message: `Tem certeza que deseja excluir ${nome}? Esta ação não pode ser desfeita.`,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/clientes/${id}/`, { 
        method: "DELETE" 
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir');
      }

      // ✅ TOAST DE SUCESSO
      showToast('success', 'Cliente Excluído!', 'Cliente removido com sucesso.');
      carregarClientes();
    } catch (error) {
      // ✅ TOAST DE ERRO
      showToast('error', 'Erro!', 'Não foi possível excluir o cliente. Tente novamente.');
    }
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
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>Clientes</h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Gerencie seus clientes</p>
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
                  Lista de Clientes
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  {clientesFiltrados.length} cliente(s) cadastrado(s)
                </p>
              </div>
              <button
                onClick={() => navigate("/cadastrar_cliente")}
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
                Novo Cliente
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
                  placeholder="Buscar por nome, CPF, email ou cidade..."
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
                  ) : clientesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px"
                      }}>
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  ) : (
                    clientesFiltrados.map((cliente) => (
                      <tr key={cliente.id} style={{
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
                              {cliente.nome.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{cliente.nome}</span>
                          </div>
                        </td>
                        <td style={tableCellStyle}>{cliente.cpf}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
                            <Mail size={16} />
                            {cliente.email}
                          </div>
                        </td>
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
                              onClick={() => navigate(`/editar_clientes/${cliente.id}`)}
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
                              onClick={() => handleDelete(cliente.id, cliente.nome)}
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