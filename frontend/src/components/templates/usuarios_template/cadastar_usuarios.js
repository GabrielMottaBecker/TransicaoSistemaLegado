import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function CadastrarUsuarios() {
  const [usuario, setUsuario] = useState({
    id: "",
    nome: "",
    cpf: "",
    email: "",
    cep: "",
    celular: "",
    telefone: "",
    telefone_fixo: "",
    endereco: "",
    numero_casa: "",
    bairro: "",
    cidade: "",
    complemento: "",
    uf: "",
    rg: "",
    cargo: "",
    senha: "",
    nivel_acesso: "",
  });

  const navigate = useNavigate();
  const [erroBusca, setErroBusca] = useState("");
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const nivelAcesso = localStorage.getItem("nivelAcesso");

  // 🔒 Bloqueia usuários não-admin
  useEffect(() => {
    if (!usuarioLogado || nivelAcesso !== "admin") {
      alert("Acesso negado! Apenas administradores podem cadastrar usuários.");
      navigate("/home");
    }
  }, [usuarioLogado, nivelAcesso, navigate]);

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleBuscar = async () => {
    if (!usuario.nome && !usuario.cpf) {
      alert("Digite o Nome ou CPF para buscar");
      return;
    }

    try {
      const query = [];
      if (usuario.nome) query.push(`nome=${usuario.nome}`);
      if (usuario.cpf) query.push(`cpf=${usuario.cpf}`);
      const queryString = query.join("&");

      const res = await fetch(`http://127.0.0.1:8000/api/usuarios/?${queryString}`);
      if (!res.ok) throw new Error("Usuário não encontrado");

      const data = await res.json();
      if (data.length === 0) {
        setErroBusca("Nenhum usuário encontrado.");
        return;
      }

      setUsuario({ ...data[0] });
      setErroBusca("");
    } catch (err) {
      console.error("Erro ao buscar:", err);
      setErroBusca("Erro ao buscar usuário.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = usuario.id
        ? `http://127.0.0.1:8000/api/usuarios/${usuario.id}/`
        : "http://127.0.0.1:8000/api/usuarios/";

      const method = usuario.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erro ao cadastrar/atualizar:", errorData);
        alert("Erro ao cadastrar/atualizar usuário. Veja o console.");
        return;
      }

      alert(usuario.id ? "Usuário atualizado!" : "Usuário cadastrado!");
      setUsuario({
        id: "",
        nome: "",
        cpf: "",
        email: "",
        cep: "",
        celular: "",
        telefone: "",
        telefone_fixo: "",
        endereco: "",
        numero_casa: "",
        bairro: "",
        cidade: "",
        complemento: "",
        uf: "",
        rg: "",
        cargo: "",
        senha: "",
        nivel_acesso: "",
      });
      navigate("/listar_usuarios");
    } catch (err) {
      console.error("Erro de rede:", err);
      alert("Erro de rede ao cadastrar/atualizar usuário.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Barra azul */}
      <nav
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>
          <Link to="/listar_usuarios" style={{ color: "#fff", textDecoration: "none" }}>Listar Usuários</Link>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#ff4d4f",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </nav>

      {/* Conteúdo principal */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2>Cadastrar/Editar Usuário</h2>

        {/* Botão voltar para lista */}
        <button
          onClick={() => navigate("/listar_usuarios")}
          style={{
            marginBottom: "10px",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
          }}
        >
          Voltar para Lista
        </button>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <input type="text" name="id" value={usuario.id} readOnly placeholder="Código" />
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <input type="text" name="nome" value={usuario.nome} onChange={handleChange} placeholder="Nome" />
            <input type="text" name="cpf" value={usuario.cpf} onChange={handleChange} placeholder="CPF" />
            <button type="button" onClick={handleBuscar}>Buscar</button>
          </div>
          {erroBusca && <p style={{ color: "red" }}>{erroBusca}</p>}

          <input type="email" name="email" placeholder="Email" value={usuario.email} onChange={handleChange} required />
          <input type="text" name="cep" placeholder="CEP" value={usuario.cep} onChange={handleChange} required />
          <input type="text" name="celular" placeholder="Celular" value={usuario.celular} onChange={handleChange} required />
          <input type="text" name="telefone" placeholder="Telefone" value={usuario.telefone} onChange={handleChange} />
          <input type="text" name="telefone_fixo" placeholder="Telefone Fixo" value={usuario.telefone_fixo} onChange={handleChange} />
          <input type="text" name="endereco" placeholder="Endereço" value={usuario.endereco} onChange={handleChange} required />
          <input type="text" name="numero_casa" placeholder="Número da Casa" value={usuario.numero_casa} onChange={handleChange} required />
          <input type="text" name="bairro" placeholder="Bairro" value={usuario.bairro} onChange={handleChange} required />
          <input type="text" name="cidade" placeholder="Cidade" value={usuario.cidade} onChange={handleChange} required />
          <input type="text" name="complemento" placeholder="Complemento" value={usuario.complemento} onChange={handleChange} />
          <select name="uf" value={usuario.uf} onChange={handleChange} required>
            <option value="">Selecione o Estado</option>
            {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
          <input type="text" name="rg" placeholder="RG" value={usuario.rg} onChange={handleChange} required />
          <input type="text" name="cargo" placeholder="Cargo" value={usuario.cargo} onChange={handleChange} required />
          <input type="password" name="senha" placeholder="Senha" value={usuario.senha} onChange={handleChange} required />
          <select name="nivel_acesso" value={usuario.nivel_acesso} onChange={handleChange} required>
            <option value="">Selecione o nível de acesso</option>
            <option value="admin">Admin</option>
            <option value="user">Usuário</option>
          </select>

          <button type="submit" style={{ marginTop: "10px", padding: "5px 10px", borderRadius: "4px" }}>
            {usuario.id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>
      </div>

      {/* Rodapé */}
      <footer style={{ backgroundColor: "#f1f1f1", padding: "10px", textAlign: "left" }}>
        {usuarioLogado ? `Logado como: ${usuarioLogado} (${nivelAcesso})` : "Não logado"}
      </footer>
    </div>
  );
}

export default CadastrarUsuarios;
