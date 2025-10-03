import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha }),
      });

      if (!res.ok) {
        setErro("Nome ou senha incorretos");
        return;
      }

      const data = await res.json(); // 📌 pega o retorno da API

      // Login bem-sucedido → salva nome e nível de acesso
      localStorage.setItem("usuarioLogado", data.nome);
      localStorage.setItem("nivelAcesso", data.nivel_acesso);

      navigate("/home");
    } catch (err) {
      console.error("Erro de rede:", err);
      setErro("Erro de rede. Tente novamente.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Nome de usuário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Entrar</button>
      </form>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}

export default Login;