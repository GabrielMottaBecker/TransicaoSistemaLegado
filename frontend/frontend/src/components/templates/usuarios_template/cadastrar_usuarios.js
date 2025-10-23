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

  const [erroBusca, setErroBusca] = useState("");
  const navigate = useNavigate();
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const nivelAcesso = localStorage.getItem("nivelAcesso");

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white p-4 flex justify-between items-center shadow">
        <div className="flex gap-4 font-semibold">
          <Link to="/home" className="hover:text-gray-200 transition">Home</Link>
          <Link to="/listar_usuarios" className="hover:text-gray-200 transition">Listar Usuários</Link>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </nav>

      {/* Conteúdo */}
      <main className="flex-1 p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Cadastrar / Editar Usuário</h1>

        <button
          onClick={() => navigate("/listar_usuarios")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded mb-6 shadow"
        >
          Voltar para Lista
        </button>

        {erroBusca && <p className="text-red-500 mb-4">{erroBusca}</p>}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          {/* Seção principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input
                type="text"
                name="nome"
                value={usuario.nome}
                onChange={handleChange}
                placeholder=" "
                className="peer border-b-2 border-gray-300 focus:border-blue-500 outline-none w-full py-2"
                required
              />
              <label className="absolute left-0 -top-3.5 text-gray-500 text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all">Nome</label>
            </div>
            <div className="relative">
              <input
                type="text"
                name="cpf"
                value={usuario.cpf}
                onChange={handleChange}
                placeholder=" "
                className="peer border-b-2 border-gray-300 focus:border-blue-500 outline-none w-full py-2"
                required
              />
              <label className="absolute left-0 -top-3.5 text-gray-500 text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all">CPF</label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBuscar}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow"
          >
            Buscar
          </button>

          {/* Seção de detalhes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="email" name="email" value={usuario.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded w-full" required />
            <input type="text" name="cep" value={usuario.cep} onChange={handleChange} placeholder="CEP" className="border p-2 rounded w-full" required />
            <input type="text" name="celular" value={usuario.celular} onChange={handleChange} placeholder="Celular" className="border p-2 rounded w-full" required />
            <input type="text" name="telefone" value={usuario.telefone} onChange={handleChange} placeholder="Telefone" className="border p-2 rounded w-full" />
            <input type="text" name="telefone_fixo" value={usuario.telefone_fixo} onChange={handleChange} placeholder="Telefone Fixo" className="border p-2 rounded w-full" />
            <input type="text" name="endereco" value={usuario.endereco} onChange={handleChange} placeholder="Endereço" className="border p-2 rounded w-full" required />
            <input type="text" name="numero_casa" value={usuario.numero_casa} onChange={handleChange} placeholder="Número da Casa" className="border p-2 rounded w-full" required />
            <input type="text" name="bairro" value={usuario.bairro} onChange={handleChange} placeholder="Bairro" className="border p-2 rounded w-full" required />
            <input type="text" name="cidade" value={usuario.cidade} onChange={handleChange} placeholder="Cidade" className="border p-2 rounded w-full" required />
            <input type="text" name="complemento" value={usuario.complemento} onChange={handleChange} placeholder="Complemento" className="border p-2 rounded w-full" />
            <select name="uf" value={usuario.uf} onChange={handleChange} className="border p-2 rounded w-full" required>
              <option value="">Selecione o Estado</option>
              {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
            <input type="text" name="rg" value={usuario.rg} onChange={handleChange} placeholder="RG" className="border p-2 rounded w-full" required />
            <input type="text" name="cargo" value={usuario.cargo} onChange={handleChange} placeholder="Cargo" className="border p-2 rounded w-full" required />
            <input type="password" name="senha" value={usuario.senha} onChange={handleChange} placeholder="Senha" className="border p-2 rounded w-full" required />
            <select name="nivel_acesso" value={usuario.nivel_acesso} onChange={handleChange} className="border p-2 rounded w-full" required>
              <option value="">Selecione o nível de acesso</option>
              <option value="admin">Admin</option>
              <option value="user">Usuário</option>
            </select>
          </div>

          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded shadow text-lg font-semibold w-full">
            {usuario.id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 p-4 text-left">
        {usuarioLogado ? `Logado como: ${usuarioLogado} (${nivelAcesso})` : "Não logado"}
      </footer>
    </div>
  );
}

export default CadastrarUsuarios;
