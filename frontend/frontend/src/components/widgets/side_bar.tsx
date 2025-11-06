import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Briefcase, ShoppingCart, Package, DollarSign, Activity, LogOut } from "lucide-react";

interface SidebarProps {
  usuarioLogado?: string;
  nivelAcesso?: string;
  onLogout?: () => void;
}

export default function Sidebar({ usuarioLogado: propUsuario, nivelAcesso: propNivel, onLogout }: SidebarProps) {
  const [usuarioLogado, setUsuarioLogado] = useState<string>(propUsuario || "");
  const [nivelAcesso, setNivelAcesso] = useState<string>(propNivel || "");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se não vier via props, busca do localStorage
    const user = propUsuario || localStorage.getItem("usuarioLogado") || "Usuário";
    const nivel = propNivel || localStorage.getItem("nivelAcesso") || "comum";

    setUsuarioLogado(user);
    setNivelAcesso(nivel);
  }, [propUsuario, propNivel]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("usuarioLogado");
      localStorage.removeItem("nivelAcesso");
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: "/home", icon: Home, label: "Dashboard" },
    { path: "/clientes", icon: Briefcase, label: "Clientes" },
    { path: "/listar_usuarios", icon: Users, label: "Funcionários", adminOnly: true },
    { path: "/fornecedores", icon: Package, label: "Fornecedores" },
    { path: "/produtos", icon: ShoppingCart, label: "Produtos" },
    { path: "/pdv", icon: DollarSign, label: "Vendas" },
  ];

  return (
    <aside
      style={{
        width: "240px",
        backgroundColor: "#fff",
        borderRight: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        height: "100vh",
      }}
    >
      {/* Cabeçalho */}
      <div style={{ padding: "0 20px 30px", borderBottom: "1px solid #e0e0e0" }}>
        <h2
          style={{
            color: "#1e88e5",
            fontSize: "20px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Activity size={24} />
          SalesFlow
        </h2>
        <p style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Sistema de Vendas</p>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: "20px 0" }}>
        <div style={{ padding: "0 15px", marginBottom: "15px" }}>
          <p
            style={{
              fontSize: "11px",
              color: "#999",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            PRINCIPAL
          </p>
        </div>

        {menuItems.map((item) => {
          // ✅ Só mostra o item se for admin OU se não for adminOnly
          if (item.adminOnly && nivelAcesso !== "admin") return null;

          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...menuItemStyle,
                backgroundColor: active ? "#e3f2fd" : "transparent",
                color: active ? "#1e88e5" : "#666",
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div style={{ padding: "0 15px", marginTop: "25px", marginBottom: "15px" }}>
          <p
            style={{
              fontSize: "11px",
              color: "#999",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            SISTEMA
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{ ...menuItemStyle, backgroundColor: "transparent", color: "#666" }}
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </nav>
    </aside>
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
  textAlign: "left",
};
