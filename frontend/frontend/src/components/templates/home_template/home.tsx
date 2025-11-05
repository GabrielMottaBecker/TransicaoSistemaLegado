import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, Briefcase, TrendingUp, ShoppingCart, Package, DollarSign, Activity, LogOut, Menu } from "lucide-react";

export default function SalesFlowDashboard() {
  const [usuarioLogado, setUsuarioLogado] = useState<string>("Admin");
  const [nivelAcesso, setNivelAcesso] = useState<string>("admin");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("usuarioLogado");
    const nivel = localStorage.getItem("nivelAcesso");
    if (user) setUsuarioLogado(user);
    if (nivel) setNivelAcesso(nivel);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: "240px",
        backgroundColor: "#fff",
        borderRight: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0"
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 30px", borderBottom: "1px solid #e0e0e0" }}>
          <h2 style={{ color: "#1e88e5", fontSize: "20px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={24} />
            SalesFlow
          </h2>
          <p style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Sistema de Vendas</p>
        </div>

        {/* Menu Principal */}
        <nav style={{ flex: 1, padding: "20px 0" }}>
          <div style={{ padding: "0 15px", marginBottom: "15px" }}>
            <p style={{ fontSize: "11px", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>PRINCIPAL</p>
          </div>
          
          <button onClick={() => navigate("/home")} style={{ ...menuItemStyle, backgroundColor: "#e3f2fd", color: "#1e88e5" }}>
            <Home size={18} />
            <span>Dashboard</span>
          </button>
          
          <button onClick={() => navigate("/clientes")} style={{ ...menuItemStyle, backgroundColor: "transparent", color: "#666" }}>
            <Briefcase size={18} />
            <span>Clientes</span>
          </button>

          {/* Apenas admin pode ver Funcionarios */}
          {nivelAcesso === "admin" && (
            <button onClick={() => navigate("/listar_usuarios")} style={{ ...menuItemStyle, backgroundColor: "transparent", color: "#666" }}>
              <Users size={18} />
              <span>Funcionários</span>
            </button>
          )}
          
          <button onClick={() => navigate("/fornecedores")} style={{ ...menuItemStyle, backgroundColor: "transparent", color: "#666" }}>
            <Package size={18} />
            <span>Fornecedores</span>
          </button>
          
          <button onClick={() => navigate("/produtos")} style={{ ...menuItemStyle, backgroundColor: "transparent", color: "#666" }}>
            <ShoppingCart size={18} />
            <span>Produtos</span>
          </button>
          
          <button onClick={() => navigate("/pdv")} style={{ ...menuItemStyle, backgroundColor: "transparent", color: "#666" }}>
            <DollarSign size={18} />
            <span>Vendas</span>
          </button>

          <div style={{ padding: "0 15px", marginTop: "25px", marginBottom: "15px" }}>
            <p style={{ fontSize: "11px", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>SISTEMA</p>
          </div>
          
          <button onClick={() => navigate("/configuracoes")} style={{ ...menuItemStyle, backgroundColor: "transparent", color: "#666" }}>
            <Menu size={18} />
            <span>Configurações</span>
          </button>
          
          <button onClick={handleLogout} style={{ ...menuItemStyle, backgroundColor: "transparent", color: "#666" }}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header com usuário logado */}
        <header style={{
          backgroundColor: "#1e88e5",
          background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
          color: "#fff",
          padding: "40px 50px",
          position: "relative"
        }}>
          {/* Avatar e nome do usuário no canto direito */}
          <div style={{
            position: "absolute",
            top: "20px",
            right: "50px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              backgroundColor: "rgba(255,255,255,0.2)",
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
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1e88e5",
                fontWeight: 600,
                fontSize: "14px"
              }}>
                {usuarioLogado.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>{usuarioLogado}</p>
                <p style={{ fontSize: "11px", opacity: 0.8, margin: 0 }}>
                  {nivelAcesso === "admin" ? "Administrador" : "Usuário"}
                </p>
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "8px", marginTop: "20px" }}>Bem-vindo ao SalesFlow</h1>
          <p style={{ fontSize: "15px", opacity: 0.95 }}>
            Gerencie suas vendas, clientes e produtos com eficiência. Sistema moderno e responsivo para o crescimento do seu negócio.
          </p>
          
          <div style={{ marginTop: "25px", display: "flex", gap: "15px" }}>
            {/* Botão visível apenas para admin */}
            {nivelAcesso === "admin" && (
              <button
                onClick={() => navigate("/relatorios")}
                style={{
                  backgroundColor: "#fff",
                  color: "#1e88e5",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Ver Relatórios
              </button>
            )}

            {/* Botão sempre visível */}
            <button
              onClick={() => navigate("/pdv")}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "10px 20px",
                borderRadius: "6px",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Nova Venda
            </button>
          </div>
        </header>

        {/* Cards de Métricas */}
        <div style={{ padding: "30px 50px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}>
            {/* Card 1 - Vendas Hoje */}
            <div style={metricCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Vendas Hoje</p>
                  <h3 style={{ fontSize: "24px", fontWeight: 600, color: "#333" }}>R$ 12.450</h3>
                  <p style={{ fontSize: "12px", color: "#4caf50", marginTop: "6px", fontWeight: 500 }}>
                    ↗ +12% vs. mês anterior
                  </p>
                </div>
                <div style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1e88e5"
                }}>
                  <DollarSign size={20} />
                </div>
              </div>
            </div>

            {/* Card 2 - Clientes Ativos */}
            <div style={metricCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Clientes Ativos</p>
                  <h3 style={{ fontSize: "24px", fontWeight: 600, color: "#333" }}>2.847</h3>
                  <p style={{ fontSize: "12px", color: "#4caf50", marginTop: "6px", fontWeight: 500 }}>
                    ↗ +8% vs. mês anterior
                  </p>
                </div>
                <div style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#e8f5e9",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4caf50"
                }}>
                  <Users size={20} />
                </div>
              </div>
            </div>

            {/* Card 3 - Produtos */}
            <div style={metricCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Produtos</p>
                  <h3 style={{ fontSize: "24px", fontWeight: 600, color: "#333" }}>1.234</h3>
                  <p style={{ fontSize: "12px", color: "#4caf50", marginTop: "6px", fontWeight: 500 }}>
                    ↗ +3% vs. mês anterior
                  </p>
                </div>
                <div style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#fff3e0",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ff9800"
                }}>
                  <Package size={20} />
                </div>
              </div>
            </div>

            {/* Card 4 - Pedidos */}
            <div style={metricCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Pedidos</p>
                  <h3 style={{ fontSize: "24px", fontWeight: 600, color: "#333" }}>89</h3>
                  <p style={{ fontSize: "12px", color: "#4caf50", marginTop: "6px", fontWeight: 500 }}>
                    ↗ +15% vs. mês anterior
                  </p>
                </div>
                <div style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#fce4ec",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e91e63"
                }}>
                  <ShoppingCart size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Atividades e Resumo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Atividades Recentes */}
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "25px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={18} />
                Atividades Recentes
              </h3>
              <p style={{ fontSize: "12px", color: "#999", marginBottom: "20px" }}>Últimas atividades do Sistema</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={activityItemStyle}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "14px", color: "#333" }}>Nova venda realizada</p>
                    <p style={{ fontSize: "12px", color: "#999" }}>João Silva</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 600, fontSize: "14px", color: "#1e88e5" }}>R$ 450,00</p>
                    <p style={{ fontSize: "11px", color: "#999" }}>há 5 min</p>
                  </div>
                </div>

                <div style={activityItemStyle}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "14px", color: "#333" }}>Cliente cadastrado</p>
                    <p style={{ fontSize: "12px", color: "#999" }}>Maria Santos</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "11px", color: "#999" }}>há 12 min</p>
                  </div>
                </div>

                <div style={activityItemStyle}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "14px", color: "#333" }}>Produto adicionado</p>
                    <p style={{ fontSize: "12px", color: "#999" }}>Notebook Dell</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 600, fontSize: "14px", color: "#4caf50" }}>R$ 2.800,00</p>
                    <p style={{ fontSize: "11px", color: "#999" }}>há 1 hora</p>
                  </div>
                </div>

                <div style={activityItemStyle}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "14px", color: "#333" }}>Venda realizada</p>
                    <p style={{ fontSize: "12px", color: "#999" }}>Pedro Costa</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 600, fontSize: "14px", color: "#1e88e5" }}>R$ 180,00</p>
                    <p style={{ fontSize: "11px", color: "#999" }}>há 1 hora</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo de Vendas */}
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "25px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={18} />
                Resumo de Vendas
              </h3>
              <p style={{ fontSize: "12px", color: "#999", marginBottom: "25px" }}>Performance do último período</p>

              {/* Barra de progresso - Meta Mensal */}
              <div style={{ marginBottom: "25px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <p style={{ fontSize: "13px", color: "#666" }}>Meta Mensal</p>
                  <p style={{ fontSize: "13px", color: "#666", fontWeight: 600 }}>75%</p>
                </div>
                <div style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "10px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: "75%",
                    height: "100%",
                    background: "linear-gradient(90deg, #1e88e5 0%, #1565c0 100%)",
                    borderRadius: "10px"
                  }}></div>
                </div>
              </div>

              {/* Estatísticas */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px"
              }}>
                <div>
                  <p style={{ fontSize: "32px", fontWeight: 600, color: "#333" }}>156</p>
                  <p style={{ fontSize: "13px", color: "#666" }}>Vendas este mês</p>
                </div>
                <div>
                  <p style={{ fontSize: "32px", fontWeight: 600, color: "#1e88e5" }}>98%</p>
                  <p style={{ fontSize: "13px", color: "#666" }}>Taxa de conversão</p>
                </div>
              </div>

              {/* Botão de ação */}
              <button 
                onClick={() => navigate("/relatorios")}
                style={{
                  marginTop: "25px",
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#1e88e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Ver Relatório Completo
              </button>
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

const metricCardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const activityItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  paddingBottom: "15px",
  borderBottom: "1px solid #f0f0f0"
};