import { useState, FormEvent, MouseEvent } from "react";
import { Activity, Lock, User, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  nome: string;
  nivel_acesso: string;
}

function Login() {
  const [nome, setNome] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [erro, setErro] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha }),
      });

      if (!res.ok) {
        setErro("Nome ou senha incorretos");
        setLoading(false);
        return;
      }

      const data: LoginResponse = await res.json();

      // Login bem-sucedido → salva nome e nível de acesso
      localStorage.setItem("usuarioLogado", data.nome);
      localStorage.setItem("nivelAcesso", data.nivel_acesso);

      navigate("/home");
      
    } catch (err) {
      console.error("Erro de rede:", err);
      setErro("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      backgroundColor: "#f5f5f5",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* 🎨 Lado esquerdo - Banner */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px",
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decoração de fundo */}
        <div style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          top: "-200px",
          left: "-200px"
        }}></div>
        <div style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "50%",
          bottom: "-150px",
          right: "-150px"
        }}></div>

        {/* Conteúdo */}
        <div style={{ zIndex: 1, textAlign: "center", maxWidth: "500px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "30px"
          }}>
            <Activity size={48} strokeWidth={2.5} />
            <h1 style={{ fontSize: "42px", fontWeight: 700, margin: 0 }}>SalesFlow</h1>
          </div>
          
          <h2 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "20px" }}>
            Sistema de Gestão de Vendas
          </h2>
          
          <p style={{ fontSize: "16px", lineHeight: "1.6", opacity: 0.95 }}>
            Gerencie suas vendas, clientes e produtos com eficiência. 
            Sistema moderno e responsivo para o crescimento do seu negócio.
          </p>

          {/* Features */}
          <div style={{
            marginTop: "50px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            textAlign: "left"
          }}>


            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>⚡</div>
              <div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Interface Intuitiva</h4>
                <p style={{ margin: "4px 0 0", fontSize: "14px", opacity: 0.9 }}>Fácil de usar, rápido de aprender</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔐 Lado direito - Formulário de Login */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px"
      }}>
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "50px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          {/* Header */}
          <div style={{ marginBottom: "40px", textAlign: "center" }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "8px"
            }}>
              Bem-vindo de volta!
            </h2>
            <p style={{ color: "#64748b", fontSize: "15px" }}>
              Faça login para acessar seu painel
            </p>
          </div>

          {/* Formulário */}
          <div>
            {/* Campo Nome */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                color: "#334155",
                marginBottom: "8px"
              }}>
                Nome de usuário
              </label>
              <div style={{ position: "relative" }}>
                <User size={20} style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }} />
                <input
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 45px",
                    fontSize: "15px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#1e88e5"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                color: "#334155",
                marginBottom: "8px"
              }}>
                Senha
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={20} style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }} />
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 45px",
                    fontSize: "15px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#1e88e5"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#991b1b"
              }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: "14px" }}>{erro}</span>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              onClick={handleLogin}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#fff",
                backgroundColor: loading ? "#94a3b8" : "#1e88e5",
                border: "none",
                borderRadius: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(30, 136, 229, 0.3)"
              }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#1565c0";
              }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#1e88e5";
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>

          {/* Links adicionais */}
          <div style={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "14px",
            color: "#64748b"
          }}>
          </div>

          <div style={{
            marginTop: "30px",
            paddingTop: "30px",
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
            fontSize: "14px",
            color: "#64748b"
          }}>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;