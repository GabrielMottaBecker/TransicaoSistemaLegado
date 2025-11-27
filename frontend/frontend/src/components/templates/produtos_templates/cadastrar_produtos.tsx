import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { X, Loader2, AlertCircle, ShoppingCart, Edit, Plus } from "lucide-react";

// --- Componentes Auxiliares (Modal de Sucesso) ---
interface SavedModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
}

const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)' };
const closeButtonStyle: React.CSSProperties = { border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' };
const modalPrimaryButtonStyle: React.CSSProperties = { backgroundColor: '#1e88e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s' };

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

/**
 * Interface que define a estrutura de um Produto.
 */
interface Produto {
  id: number | null;
  descricao: string;
  preco: string;
  quantidade_estoque: string;
  desconto_percentual: string;
  codigo_barras: string;
  ativo: boolean; 
}

const initialProdutoState: Produto = {
    id: null,
    descricao: "",
    preco: "0.00",
    quantidade_estoque: "0",
    desconto_percentual: "0.00",
    codigo_barras: "",
    ativo: true,
};

// --- Componente Principal de Cadastro/Edição de Produto ---

export default function CadastrarProduto() {
    const { id } = useParams<{ id: string }>(); 
    const isEditMode = !!id;

    const navigate = useNavigate();
    const [produto, setProduto] = useState<Produto>(initialProdutoState);
    const [loading, setLoading] = useState(false);
    const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
    
    // Função auxiliar para converter "0,09" em 0.09
    const parseCurrency = (value: string) => {
        if (!value) return 0.00;
        // Troca vírgula por ponto e remove caracteres não numéricos (exceto ponto)
        const normalized = value.replace(',', '.');
        const number = parseFloat(normalized);
        return isNaN(number) ? 0.00 : number;
    };

    useEffect(() => {
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
            
            setProduto({
                ...initialProdutoState,
                id: data.id,
                descricao: data.descricao || "",
                preco: String(data.preco || "0.00"),
                quantidade_estoque: String(data.quantidade_estoque || "0"),
                desconto_percentual: String(data.desconto_percentual || "0.00"),
                codigo_barras: data.codigo_barras || "",
                ativo: data.ativo,
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

        // CORREÇÃO AQUI: Usando parseCurrency para tratar vírgulas
        const produtoPayload = {
            descricao: produto.descricao,
            preco: parseCurrency(produto.preco),
            quantidade_estoque: parseInt(produto.quantidade_estoque, 10) || 0,
            desconto_percentual: parseCurrency(produto.desconto_percentual),
            codigo_barras: produto.codigo_barras || null,
            ativo: produto.ativo,
        };
        
        console.log("Enviando Payload:", produtoPayload); // Debug no console do navegador

        try {
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
                
                // Mostra o erro específico retornado pelo Django
                let errorMsg = "Falha na operação.";
                if (errorData.codigo_barras) errorMsg = "Código de Barras inválido ou já existente.";
                else if (errorData.descricao) errorMsg = `Erro na descrição: ${errorData.descricao}`;
                else if (errorData.preco) errorMsg = `Erro no preço: ${errorData.preco}`;
                else errorMsg = `Erro: ${JSON.stringify(errorData)}`;

                alert(errorMsg);
                setLoading(false);
                return;
            }

            setLoading(false);
            setIsSavedModalOpen(true); 

        } catch (error) {
            console.error("Erro de rede:", error);
            alert("Erro de rede. Verifique se o servidor Django está rodando.");
            setLoading(false);
        }
    };

    if (loading && isEditMode && !produto.descricao) {
        return <div style={loadingContainerStyle}>Carregando dados do produto...</div>;
    }

    return (
        <div style={pageContainerStyle}>
            <main style={mainContentStyle}>
                {/* Header */}
                <header style={headerStyle}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                            {isEditMode ? `Editar Produto (ID: ${id})` : "Adicionar Produto"}
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                            {isEditMode ? "Atualize os detalhes do produto." : "Adicione um novo produto ao estoque."}
                        </p>
                    </div>

                    <button onClick={() => navigate("/produtos")} style={backButtonStyle}>
                        Voltar para Lista
                    </button>
                </header>

                <div style={formWrapperStyle}>
                    <div style={formCardStyle}>
                        <form onSubmit={handleSubmit}>
                            
                            <h3 style={sectionTitleStyle}><ShoppingCart size={20} /> Detalhes do Produto</h3>
                            
                            <div style={twoColumnGridStyle}>
                                {/* Coluna 1 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ flexGrow: 1 }}>
                                        <label htmlFor="descricao" style={labelStyle}>Descrição:</label>
                                        <input id="descricao" type="text" name="descricao" value={produto.descricao} onChange={handleChange} placeholder="Nome completo do produto" style={inputStyle} required />
                                        <small style={hintStyle}>Nome de exibição e identificação do produto.</small>
                                    </div>
                                    
                                    <div style={{ flexGrow: 1 }}>
                                        <label htmlFor="codigo_barras" style={labelStyle}>Código de Barras:</label>
                                        <input id="codigo_barras" type="text" name="codigo_barras" value={produto.codigo_barras} onChange={handleChange} placeholder="SKU, EAN ou Código Interno" style={inputStyle} />
                                        <small style={hintStyle}>Opcional. Usado para leitura em PDV.</small>
                                    </div>
                                </div>
                                
                                {/* Coluna 2 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ flexGrow: 1 }}>
                                        <label htmlFor="preco" style={labelStyle}>Preço:</label>
                                        <input id="preco" type="number" name="preco" value={produto.preco} onChange={handleChange} placeholder="0.00" step="0.01" style={inputStyle} required />
                                        <small style={hintStyle}>Preço de venda (Use ponto ou vírgula).</small>
                                    </div>
                                    
                                    <div style={{ flexGrow: 1 }}>
                                        <label htmlFor="quantidade_estoque" style={labelStyle}>Quantidade em Estoque:</label>
                                        <input id="quantidade_estoque" type="number" name="quantidade_estoque" value={produto.quantidade_estoque} onChange={handleChange} placeholder="0" style={inputStyle} required />
                                    </div>
                                    
                                    <div style={{ flexGrow: 1 }}>
                                        <label htmlFor="desconto_percentual" style={labelStyle}>Desconto (%):</label>
                                        <input id="desconto_percentual" type="number" name="desconto_percentual" value={produto.desconto_percentual} onChange={handleChange} placeholder="0.00" step="0.01" style={inputStyle} />
                                    </div>
                                </div>
                                
                                {/* Checkbox Ativo */}
                                <div style={{ gridColumn: 'span 2', paddingTop: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="checkbox" 
                                            name="ativo" 
                                            checked={produto.ativo} 
                                            onChange={handleChange} 
                                            style={checkboxStyle} 
                                        />
                                        <label style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>Produto Ativo (Disponível para Venda)</label>
                                    </div>
                                </div>
                            </div>
                            
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
                    navigate("/produtos");
                }}
            />
        </div>
    );
}

// --- ESTILOS CSS ---
const pageContainerStyle: React.CSSProperties = { display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" };
const mainContentStyle: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column" };
const headerStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "20px 50px", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const backButtonStyle: React.CSSProperties = { backgroundColor: "#f1f5f9", color: "#64748b", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const formWrapperStyle: React.CSSProperties = { padding: "30px", flexGrow: 1 };
const formCardStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", maxWidth: "900px", margin: "0 auto" };
const sectionTitleStyle: React.CSSProperties = { fontSize: "18px", fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #e0e0e0", paddingBottom: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" };
const twoColumnGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" };
const inputStyle: React.CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", width: "100%", boxSizing: "border-box", fontSize: "14px" };
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' };
const hintStyle: React.CSSProperties = { fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' };
const submitButtonStyle: React.CSSProperties = { width: "100%", padding: "14px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: 600, cursor: "pointer", transition: "background-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" };
const spinIconStyle: React.CSSProperties = { animation: "spin 1s linear infinite" };
const checkboxStyle: React.CSSProperties = { width: '18px', height: '18px' };
const loadingContainerStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };