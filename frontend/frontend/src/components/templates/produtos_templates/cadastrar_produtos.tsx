import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { X, Loader2, AlertCircle, ShoppingCart, DollarSign, Package, Edit, Plus, Activity, User, Briefcase, Home, Users, Menu, LogOut } from "lucide-react";

/**
 * Interface que define a estrutura de um Produto, mapeada para o modelo Django.
 */
interface Produto {
  id: number | null;
  descricao: string;
  preco: string; // Usamos string para o input field
  quantidade_estoque: string; // Usamos string para o input field
  desconto_percentual: string; // Usamos string para o input field
  codigo_barras: string;
  ativo: boolean;
  // Campos extras do formulário (Categoria e Unidade de Medida)
  categoria: string; 
  unidade_medida: string;
}

const initialProdutoState: Produto = {
    id: null, descricao: "", preco: "0.00", quantidade_estoque: "0", 
    desconto_percentual: "0.00", codigo_barras: "", ativo: true,
    categoria: "", unidade_medida: "",
};

// Lista de categorias para o campo Select
const CATEGORIAS = [
    "Eletrônicos",
    "Alimentos",
    "Vestuário",
    "Serviços",
    "Outros"
];


// --- Componentes Auxiliares (Modal de Sucesso) ---
interface SavedModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
}

const SavedModal: React.FC<SavedModalProps> = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={20} /> Sucesso
                    </h3>
                    <button onClick={onClose} style={closeButtonStyle}>
                        <X size={20} />
                    </button>
                </div>
                <p style={{ marginTop: '15px', color: '#4b5563' }}>{message}</p>
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <button onClick={onClose} style={modalPrimaryButtonStyle}>
                        Fechar e Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Componente Principal de Cadastro/Edição de Produto ---

export default function CadastrarProduto() {
    const { id } = useParams<{ id: string }>(); 
    const isEditMode = !!id;

    const navigate = useNavigate();
    const [produto, setProduto] = useState<Produto>(initialProdutoState);
    const [loading, setLoading] = useState(false);
    const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
    // Para sidebar
    const [usuarioLogado, setUsuarioLogado] = useState<string>("Admin"); 
    const [nivelAcesso, setNivelAcesso] = useState<string>("admin"); 


    useEffect(() => {
        const user = localStorage.getItem("usuarioLogado");
        const nivel = localStorage.getItem("nivelAcesso");
        if (user) setUsuarioLogado(user);
        if (nivel) setNivelAcesso(nivel);

        if (isEditMode) {
            carregarProdutoParaEdicao(Number(id));
        }
    }, [isEditMode, id]);
    
    // Função para carregar dados do produto via API (GET)
    const carregarProdutoParaEdicao = async (produtoId: number) => {
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/produtos/${produtoId}/`);
            if (!res.ok) throw new Error("Produto não encontrado.");
            
            const data = await res.json();
            
            // Mapeamento: Django -> Frontend (Convertendo números para string para o input)
            setProduto({
                ...initialProdutoState,
                id: data.id,
                descricao: data.descricao,
                preco: String(data.preco),
                quantidade_estoque: String(data.quantidade_estoque),
                desconto_percentual: String(data.desconto_percentual),
                codigo_barras: data.codigo_barras || '',
                ativo: data.ativo,
                // Os campos extras (Categoria/Unidade) não são carregados do backend
            });

        } catch (error) {
            console.error("Erro ao carregar produto:", error);
            alert("Erro ao carregar dados. Voltando para a lista.");
            navigate("/produtos");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Lida com o checkbox 'ativo'
        if (name === 'ativo') {
            setProduto(prev => ({ ...prev, ativo: (e.target as HTMLInputElement).checked }));
        } else {
            setProduto(prev => ({ ...prev, [name]: value }));
        }
    };

    // Função principal de submissão (POST/PUT via API)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mapeamento e conversão de dados para o Django
        const produtoPayload = {
            descricao: produto.descricao, // Nome do Produto
            // Converte strings para DecimalField/PositiveIntegerField no Django
            preco: parseFloat(produto.preco) || 0.00,
            quantidade_estoque: parseInt(produto.quantidade_estoque, 10) || 0,
            desconto_percentual: parseFloat(produto.desconto_percentual) || 0.00,
            codigo_barras: produto.codigo_barras || null, // Envia null se vazio
            ativo: produto.ativo,
            // Categoria e Unidade de Medida (Campos não existentes no modelo Django) SÃO IGNORADOS AQUI
        };
        
        try {
            // Define a URL e o método com base no modo
            const url = isEditMode && produto.id 
                ? `http://127.0.0.1:8000/api/produtos/${produto.id}/` 
                : `http://127.0.0.1:8000/api/produtos/`;

            const method = isEditMode ? 'PUT' : 'POST'; 
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produtoPayload),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Erro da API:", errorData);
                // Mensagem de erro para código de barras duplicado ou inválido
                if (errorData.codigo_barras) alert(`Erro: Código de Barras já existe ou é inválido.`);
                else alert(`Falha na operação: ${isEditMode ? "Atualização" : "Cadastro"}. Verifique o console.`);
                setLoading(false);
                return;
            }

            setLoading(false);
            setIsSavedModalOpen(true); 

        } catch (error) {
            console.error("Erro de rede:", error);
            alert("Erro de rede. Tente novamente.");
            setLoading(false);
        }
    };

    if (loading && isEditMode && !produto.descricao) {
        return <div style={loadingContainerStyle}>Carregando dados do produto...</div>;
    }

    return (
        <div style={pageContainerStyle}>
            {/* Sidebar */}
            <aside style={sidebarStyle}>
                <div style={logoContainerStyle}>
                    <h2 style={logoTextStyle}><Activity size={24} />SalesFlow</h2>
                    <p style={subLogoTextStyle}>Sistema de Vendas</p>
                </div>
                <nav style={{ flex: 1, padding: "20px 0" }}>
                    <div style={menuSectionTitleStyle}>PRINCIPAL</div>
                    <button onClick={() => navigate("/home")} style={{ ...menuItemStyle }}>
                        <Home size={18} />
                        <span>Home</span>
                    </button>
                    <button onClick={() => navigate("/clientes")} style={{ ...menuItemStyle }}>
                        <Briefcase size={18} />
                        <span>Clientes</span>
                    </button>
                    <button onClick={() => navigate("/listar_usuarios")} style={{ ...menuItemStyle }}>
                        <Users size={18} />
                        <span>Funcionários</span>
                    </button>
                    <button onClick={() => navigate("/fornecedores")} style={{ ...menuItemStyle }}>
                        <Package size={18} />
                        <span>Fornecedores</span>
                    </button>
                    <button onClick={() => navigate("/produtos")} style={{ ...menuItemStyle, backgroundColor: "#e3f2fd", color: "#1e88e5" }}>
                        <ShoppingCart size={18} />
                        <span>Produtos</span>
                    </button>
                    <button onClick={() => navigate("/vendas")} style={{ ...menuItemStyle }}>
                        <DollarSign size={18} />
                        <span>Vendas</span>
                    </button>
                    <div style={menuSectionTitleStyle}>SISTEMA</div>
                    <button onClick={() => navigate("/configuracoes")} style={{ ...menuItemStyle }}>
                        <Menu size={18} />
                        <span>Configurações</span>
                    </button>
                    <button onClick={() => navigate("/sair")} style={{ ...menuItemStyle }}>
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                </nav>
            </aside>
            
            {/* Conteúdo Principal */}
            <main style={mainContentStyle}>
                <header style={headerStyle}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                            {isEditMode ? `Editar Produto (ID: ${id})` : "Cadastro de Produto"}
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                            {isEditMode ? "Atualize os detalhes do produto." : "Adicione um novo produto ao estoque."}
                        </p>
                    </div>

                    {/* Bloco Admin + Botão Voltar (Layout Vertical) */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column", 
                        alignItems: "flex-end", 
                        gap: "10px" 
                    }}>
                        {/* Bloco do Administrador Logado */}
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
                                <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{nivelAcesso === "admin" ? "Administrador" : "Usuário"}</p>
                            </div>
                        </div>
                    
                        {/* Botão Voltar */}
                        <button onClick={() => navigate("/produtos")} style={backButtonStyle}>
                            Voltar para Lista
                        </button>
                    </div>
                </header>

                <div style={formWrapperStyle}>
                    <div style={formCardStyle}>
                        <form onSubmit={handleSubmit}>
                            
                            {/* Seção 1: Informações Básicas (Layout da Imagem) */}
                            <h3 style={sectionTitleStyle}><Package size={20} /> Detalhes do Produto</h3>
                            <div style={gridContainerStyle}>
                                {/* Linha 1 */}
                                <input type="text" name="descricao" value={produto.descricao} onChange={handleChange} placeholder="Nome do Produto *" style={inputStyle} required />
                                <input type="text" name="codigo_barras" value={produto.codigo_barras} onChange={handleChange} placeholder="Código/SKU" style={inputStyle} />
                            </div>

                            {/* Linha 2: Preço e Estoque */}
                            <div style={gridContainerStyle}>
                                <input type="number" name="preco" value={produto.preco} onChange={handleChange} placeholder="Preço (R$) *" step="0.01" style={inputStyle} required />
                                <input type="number" name="quantidade_estoque" value={produto.quantidade_estoque} onChange={handleChange} placeholder="Quantidade em Estoque *" style={inputStyle} required />
                            </div>

                            {/* Linha 3: Categoria, Unidade de Medida, Desconto */}
                            <div style={gridContainerStyle}>
                                {/* 🚨 Select de Categoria */}
                                <select 
                                    name="categoria" 
                                    value={produto.categoria} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                >
                                    <option value="" disabled>Selecionar Categoria</option>
                                    {CATEGORIAS.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                
                                <input type="text" name="unidade_medida" value={produto.unidade_medida} onChange={handleChange} placeholder="Unidade de Medida" style={inputStyle} />
                                <input type="number" name="desconto_percentual" value={produto.desconto_percentual} onChange={handleChange} placeholder="Desconto (%)" step="0.01" style={inputStyle} />
                            </div>

                            {/* Descrição e Status */}
                            <div style={gridContainerDescricaoStyle}>
                                <textarea name="descricao_detalhada" placeholder="Descrição detalhada do produto" style={{...inputStyle, minHeight: '80px', gridColumn: 'span 2'}}></textarea>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" name="ativo" checked={produto.ativo} onChange={handleChange} style={checkboxStyle} />
                                    <label style={{ fontSize: '14px', color: '#475569' }}>Produto Ativo/Venda</label>
                                </div>
                            </div>
                            
                            
                            {/* Botão de Submissão */}
                            <div style={{ marginTop: "30px" }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={submitButtonStyle}
                                >
                                    {loading ? <Loader2 size={24} style={spinIconStyle} /> : (isEditMode ? <Edit size={24} /> : <Plus size={24} />)}
                                    {loading ? "Salvando..." : (isEditMode ? "Salvar Edição" : "Cadastrar Produto")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            
            <SavedModal 
                isOpen={isSavedModalOpen}
                message={isEditMode ? "O produto foi atualizado com sucesso." : "O novo produto foi adicionado com sucesso ao estoque."}
                onClose={() => {
                    setIsSavedModalOpen(false);
                    navigate("/produtos"); // Volta para a lista
                }}
            />
        </div>
    );
}

// --- ESTILOS CSS AUXILIARES (Adicionados para resolver o ReferenceError) ---
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)' };
const closeButtonStyle: React.CSSProperties = { border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' };
const modalPrimaryButtonStyle: React.CSSProperties = { backgroundColor: '#1e88e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s' };
const pageContainerStyle: React.CSSProperties = { display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" };
const mainContentStyle: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column" };
const headerStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "20px 50px", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const backButtonStyle: React.CSSProperties = { backgroundColor: "#f1f5f9", color: "#64748b", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const formWrapperStyle: React.CSSProperties = { padding: "30px", flexGrow: 1 };
const formCardStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", maxWidth: "900px", margin: "0 auto" };
const sectionTitleStyle: React.CSSProperties = { fontSize: "18px", fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #e0e0e0", paddingBottom: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" };
const gridContainerStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "15px" };
const gridContainerDescricaoStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" };
const inputStyle: React.CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", width: "100%", boxSizing: "border-box", fontSize: "14px" };
const submitButtonStyle: React.CSSProperties = { width: "100%", padding: "14px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: 600, cursor: "pointer", transition: "background-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" };
const spinIconStyle: React.CSSProperties = { animation: "spin 1s linear infinite" };
const checkboxStyle: React.CSSProperties = { width: '18px', height: '18px' };
const sidebarStyle: React.CSSProperties = { width: "240px", backgroundColor: "#fff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", padding: "20px 0" };
const logoContainerStyle: React.CSSProperties = { padding: "0 20px 30px", borderBottom: "1px solid #e0e0e0" };
const logoTextStyle: React.CSSProperties = { color: "#1e88e5", fontSize: "20px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", margin: 0 };
const subLogoTextStyle: React.CSSProperties = { fontSize: "11px", color: "#999", marginTop: "2px" };
const menuSectionTitleStyle: React.CSSProperties = { fontSize: "11px", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", padding: "0 15px", marginBottom: "15px", marginTop: "20px" };
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
  backgroundColor: "transparent", 
  color: "#475569" 
}; 
const loadingContainerStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };