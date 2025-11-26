import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign, Plus, X, Trash2, Loader2, CreditCard, Smartphone, Banknote, FileText, Download, Printer
} from "lucide-react";
import Sidebar from '../../widgets/side_bar.tsx';

// ---------- Tipagem ----------
interface CarrinhoItem {
  codigo: string;
  produto: string;
  produto_id?: number | null;
  qtd: number;
  preco: number;
  subtotal: number;
}

// ---------- Componente ----------
export default function PDVSalesFlow() {
  const navigate = useNavigate();

  const [usuarioLogado] = useState<string>("Admin");
  const [nivelAcesso] = useState<string>("admin");

  const [cpf, setCpf] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [data] = useState(new Date().toLocaleString("pt-BR"));

  const [codigoProduto, setCodigoProduto] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [estoqueDisponivel, setEstoqueDisponivel] = useState<number | null>(null);
  const [produtoIdEncontrado, setProdutoIdEncontrado] = useState<number | null>(null);

  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [totalVenda, setTotalVenda] = useState<number>(0);
  const [showPagamento, setShowPagamento] = useState(false);
  const [showNotaFiscal, setShowNotaFiscal] = useState(false);
  const [vendaId, setVendaId] = useState<number | null>(null);

  const [dinheiro, setDinheiro] = useState("0");
  const [cartao, setCartao] = useState("0");
  const [pix, setPix] = useState("0");
  const [troco, setTroco] = useState("0");

  const [loading, setLoading] = useState(false);

  const calcularTroco = useCallback(() => {
    const totalPago = (Number(dinheiro) || 0) + (Number(cartao) || 0) + (Number(pix) || 0);
    const trocoCalculado = totalPago - totalVenda;
    setTroco((Math.round((trocoCalculado + Number.EPSILON) * 100) / 100).toFixed(2));
  }, [dinheiro, cartao, pix, totalVenda]);

  useEffect(() => {
    calcularTroco();
  }, [calcularTroco]);

  const pesquisarCliente = async () => {
    if (!cpf) {
      alert("Informe o CPF");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/clientes/?cpf=${encodeURIComponent(cpf)}`);
      if (!response.ok) {
        alert("Erro ao buscar cliente no servidor.");
        return;
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setNomeCliente(data[0].nome || "");
        setClienteId(data[0].id || null);
      } else {
        alert("Cliente não encontrado.");
        setNomeCliente("");
        setClienteId(null);
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      alert("Erro de rede ao buscar cliente.");
    }
  };

  const pesquisarProduto = async () => {
    if (!codigoProduto) {
      alert("Informe o código do produto (código de barras ou SKU).");
      return;
    }
    setLoading(true);
    try {
      let res = await fetch(`http://127.0.0.1:8000/api/produtos/?codigo_barras=${encodeURIComponent(codigoProduto)}`);
      if (res.status === 404 || res.status === 405 || !res.ok) {
        res = await fetch(`http://127.0.0.1:8000/api/produtos/?codigo_barras=${encodeURIComponent(codigoProduto)}`);
      }

      const json = await res.json();

      if (json && typeof json === 'object' && !Array.isArray(json) && Object.values(json).some(v => typeof v === 'string' && v.includes('/produtos/'))) {
        const listUrl = json.produtos || Object.values(json).find(v => typeof v === 'string' && v.includes('/produtos/'));
        if (listUrl) {
          const listRes = await fetch(listUrl);
          if (!listRes.ok) throw new Error("Falha ao buscar lista de produtos (router-root).");
          const lista = await listRes.json();
          const found = Array.isArray(lista) ? lista.find((p: any) => String(p.codigo_barras) === codigoProduto) : null;
          if (found) {
            setNomeProduto(found.descricao || "");
            setPreco(String(found.preco ?? "0"));
            setEstoqueDisponivel(found.quantidade_estoque ?? null);
            setProdutoIdEncontrado(found.id ?? null);
            return;
          } else {
            alert("Produto não encontrado na lista retornada.");
            setNomeProduto("");
            setPreco("");
            setEstoqueDisponivel(null);
            setProdutoIdEncontrado(null);
            return;
          }
        }
      }

      if (Array.isArray(json)) {
        if (json.length === 0) {
          alert("Produto não encontrado.");
          setNomeProduto("");
          setPreco("");
          setEstoqueDisponivel(null);
          setProdutoIdEncontrado(null);
          return;
        }
        const p = json[0];
        setNomeProduto(p.descricao || "");
        setPreco(String(p.preco ?? "0"));
        setEstoqueDisponivel(p.quantidade_estoque ?? null);
        setProdutoIdEncontrado(p.id ?? null);
        return;
      }

      if (json && typeof json === 'object') {
        const p = json;
        setNomeProduto(p.descricao || "");
        setPreco(String(p.preco ?? "0"));
        setEstoqueDisponivel(p.quantidade_estoque ?? null);
        setProdutoIdEncontrado(p.id ?? null);
        return;
      }

      alert("Resposta inesperada do servidor ao buscar produto.");
      setNomeProduto("");
      setPreco("");
      setEstoqueDisponivel(null);
      setProdutoIdEncontrado(null);
    } catch (err) {
      console.error("Erro pesquisarProduto:", err);
      alert("Erro ao pesquisar produto no servidor.");
    } finally {
      setLoading(false);
    }
  };

  const adicionarItem = () => {
    const qtd = Number(quantidade);
    const precoUnit = Number(preco);

    if (!codigoProduto || !nomeProduto || !preco || !quantidade) {
      alert("Preencha todos os campos do produto");
      return;
    }
    if (Number.isNaN(qtd) || Number.isNaN(precoUnit) || qtd <= 0 || precoUnit < 0) {
      alert("Quantidade ou preço inválidos");
      return;
    }
    if (estoqueDisponivel !== null && qtd > estoqueDisponivel) {
      alert(`Quantidade solicitada (${qtd}) maior que estoque disponível (${estoqueDisponivel}).`);
      return;
    }

    const subtotal = +(qtd * precoUnit);

    const novoItem: CarrinhoItem = {
      codigo: codigoProduto,
      produto: nomeProduto,
      produto_id: produtoIdEncontrado ?? null,
      qtd,
      preco: precoUnit,
      subtotal,
    };

    const novoCarrinho = [...carrinho, novoItem];
    setCarrinho(novoCarrinho);

    const novoTotal = novoCarrinho.reduce((acc, it) => acc + it.subtotal, 0);
    setTotalVenda(+novoTotal);

    setCodigoProduto("");
    setNomeProduto("");
    setPreco("");
    setQuantidade("");
    setEstoqueDisponivel(null);
    setProdutoIdEncontrado(null);
  };

  const removerItem = (index: number) => {
    const novoCarrinho = carrinho.filter((_, i) => i !== index);
    setCarrinho(novoCarrinho);
    const novoTotal = novoCarrinho.reduce((acc, item) => acc + item.subtotal, 0);
    setTotalVenda(+novoTotal);
  };

  const cancelarVenda = () => {
    if (window.confirm("Deseja realmente cancelar esta venda?")) {
      confirmarCancelamento();
    }
  };

  const confirmarCancelamento = () => {
    setCarrinho([]);
    setTotalVenda(0);
    setCpf("");
    setNomeCliente("");
    setClienteId(null);
    setCodigoProduto("");
    setNomeProduto("");
    setPreco("");
    setQuantidade("");
    setVendaId(null);
  };

  const finalizarPagamento = () => {
    if (carrinho.length === 0) {
      alert("Adicione produtos ao carrinho");
      return;
    }
    setShowPagamento(true);
  };

  const fecharPagamento = () => {
    setShowPagamento(false);
    setDinheiro("0");
    setCartao("0");
    setPix("0");
    setTroco("0");
  };

  const finalizarVenda = async () => {
    const totalPago = (Number(dinheiro) || 0) + (Number(cartao) || 0) + (Number(pix) || 0);
    if (totalPago < totalVenda) {
      alert("O valor pago é menor que o total da venda!");
      return;
    }

    const vendaPayload = {
      cliente: clienteId,
      desconto_percentual: 0,
      total_venda: totalVenda,
      obs: "",
      itens: carrinho.map(it => ({
        produto: it.produto_id ?? null,
        quantidade: it.qtd,
        preco_unitario: it.preco,
        desconto_percentual: 0
      }))
    };

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/vendas/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendaPayload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Erro ao finalizar venda:", res.status, text);
        alert("Falha ao finalizar venda. Verifique o console do servidor.");
        setLoading(false);
        return;
      }

      const created = await res.json();
      setVendaId(created.id);
      fecharPagamento();
      setShowNotaFiscal(true);
    } catch (err) {
      console.error("Erro rede finalizarVenda:", err);
      alert("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const imprimirNotaFiscal = () => {
    if (vendaId) {
      window.open(`http://127.0.0.1:8000/api/vendas/${vendaId}/nota_fiscal_html/`, '_blank');
    }
  };

  const baixarNotaFiscalPDF = () => {
    if (vendaId) {
      window.location.href = `http://127.0.0.1:8000/api/vendas/${vendaId}/nota_fiscal/`;
    }
  };

  const fecharNotaFiscal = () => {
    setShowNotaFiscal(false);
    confirmarCancelamento();
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    window.onbeforeunload = null;
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Sidebar usuarioLogado={usuarioLogado} nivelAcesso={nivelAcesso} onLogout={handleLogout} />

      {/* Modal de Nota Fiscal */}
      {showNotaFiscal && (
        <div 
          style={modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharNotaFiscal();
          }}
        >
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 600 }}>
                Venda Finalizada com Sucesso!
              </h3>
              <button 
                onClick={fecharNotaFiscal}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff"
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", textAlign: "center" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <FileText size={32} color="#16a34a" />
              </div>

              <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#1e293b" }}>
                Venda #{vendaId?.toString().padStart(6, '0')}
              </h3>
              <p style={{ margin: "0 0 24px 0", color: "#64748b" }}>
                A venda foi registrada com sucesso no sistema
              </p>

              <div style={{
                background: "#f8f9fa",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px"
              }}>
                <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>
                  Total da Venda
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#16a34a" }}>
                  R$ {totalVenda.toFixed(2)}
                </div>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <button 
                  onClick={imprimirNotaFiscal}
                  style={{
                    ...finalizarButton,
                    background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)"
                  }}
                >
                  <Printer size={18} />
                  Imprimir Nota Fiscal
                </button>

                <button 
                  onClick={baixarNotaFiscalPDF}
                  style={{
                    ...finalizarButton,
                    background: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)"
                  }}
                >
                  <Download size={18} />
                  Baixar PDF
                </button>

                <button 
                  onClick={fecharNotaFiscal}
                  style={{
                    ...secondaryButton,
                    width: "100%",
                    padding: "11px"
                  }}
                >
                  Nova Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPagamento && (
        <div 
          style={modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharPagamento();
          }}
        >
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 600 }}>
                Formas de Pagamento
              </h3>
              <button 
                onClick={fecharPagamento}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff"
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "12px",
                color: "#fff"
              }}>
                <div style={{ fontSize: "10px", opacity: 0.9, marginBottom: "2px" }}>Total da Venda</div>
                <div style={{ fontSize: "22px", fontWeight: 700 }}>
                  R$ {totalVenda.toFixed(2)}
                </div>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <div style={paymentMethodCard}>
                  <div style={paymentMethodHeader}>
                    <div style={{ ...paymentIcon, background: "#dcfce7" }}>
                      <Banknote size={18} color="#16a34a" />
                    </div>
                    <div>
                      <div style={paymentMethodTitle}>Dinheiro</div>
                      <div style={paymentMethodSubtitle}>Pagamento em espécie</div>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    value={dinheiro} 
                    onChange={(e) => setDinheiro(e.target.value)} 
                    onBlur={calcularTroco} 
                    step="0.01" 
                    placeholder="0,00"
                    style={paymentInput}
                  />
                </div>

                <div style={paymentMethodCard}>
                  <div style={paymentMethodHeader}>
                    <div style={{ ...paymentIcon, background: "#dbeafe" }}>
                      <CreditCard size={18} color="#1e88e5" />
                    </div>
                    <div>
                      <div style={paymentMethodTitle}>Cartão</div>
                      <div style={paymentMethodSubtitle}>Débito ou Crédito</div>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    value={cartao} 
                    onChange={(e) => setCartao(e.target.value)} 
                    onBlur={calcularTroco} 
                    step="0.01"
                    placeholder="0,00"
                    style={paymentInput}
                  />
                </div>

                <div style={paymentMethodCard}>
                  <div style={paymentMethodHeader}>
                    <div style={{ ...paymentIcon, background: "#f3e8ff" }}>
                      <Smartphone size={18} color="#9333ea" />
                    </div>
                    <div>
                      <div style={paymentMethodTitle}>PIX</div>
                      <div style={paymentMethodSubtitle}>Transferência instantânea</div>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    value={pix} 
                    onChange={(e) => setPix(e.target.value)} 
                    onBlur={calcularTroco} 
                    step="0.01"
                    placeholder="0,00"
                    style={paymentInput}
                  />
                </div>
              </div>

              <div style={{
                marginTop: "10px",
                padding: "8px",
                background: Number(troco) > 0 ? "#dcfce7" : "#f8f9fa",
                borderRadius: "6px",
                border: `2px solid ${Number(troco) > 0 ? "#16a34a" : "#e2e8f0"}`
              }}>
                <div style={{ 
                  fontSize: "10px", 
                  color: Number(troco) > 0 ? "#166534" : "#64748b",
                  marginBottom: "2px",
                  fontWeight: 500
                }}>
                  Troco
                </div>
                <div style={{ 
                  fontSize: "16px", 
                  fontWeight: 700,
                  color: Number(troco) > 0 ? "#16a34a" : "#334155"
                }}>
                  R$ {troco}
                </div>
              </div>

              <button 
                onClick={finalizarVenda} 
                disabled={loading}
                style={{
                  ...finalizarButton,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                    Processando...
                  </>
                ) : (
                  <>
                    <DollarSign size={18} />
                    Finalizar Venda
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>Ponto de Vendas</h1>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>{data}</p>
          </div>
          <div>
            <div style={userBox}>
              <div style={avatarStyle}>{usuarioLogado.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{usuarioLogado}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  {nivelAcesso === "admin" ? "Administrador" : "Usuário"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600 }}>Dados do Cliente</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                  <input 
                    placeholder="CPF" 
                    value={cpf} 
                    onChange={(e) => setCpf(e.target.value)} 
                    style={inputStyle} 
                  />
                  <button onClick={pesquisarCliente} style={secondaryButton}>
                    Pesquisar
                  </button>
                </div>
                <input 
                  placeholder="Nome do cliente" 
                  value={nomeCliente} 
                  onChange={(e) => setNomeCliente(e.target.value)} 
                  style={{ ...inputStyle, marginTop: 10 }} 
                />
              </div>

              <div style={{ ...cardStyle, marginTop: 16 }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600 }}>Dados do Produto</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <input 
                    placeholder="Código/Barcode" 
                    value={codigoProduto} 
                    onChange={(e) => setCodigoProduto(e.target.value)} 
                    style={{ ...inputStyle, flex: 1 }} 
                  />
                  <button onClick={pesquisarProduto} style={secondaryButton}>
                    Pesquisar
                  </button>
                </div>

                <input 
                  placeholder="Nome do produto" 
                  value={nomeProduto} 
                  onChange={(e) => setNomeProduto(e.target.value)} 
                  style={{ ...inputStyle, marginTop: 10 }} 
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                  <input 
                    placeholder="Preço" 
                    value={preco} 
                    onChange={(e) => setPreco(e.target.value)} 
                    style={inputStyle} 
                  />
                  <input 
                    placeholder="Qtd" 
                    value={quantidade} 
                    onChange={(e) => setQuantidade(e.target.value)} 
                    style={inputStyle} 
                  />
                </div>

                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Estoque: {estoqueDisponivel === null ? "—" : estoqueDisponivel}
                  </div>
                  <button onClick={adicionarItem} style={primaryGreenButton}>
                    <Plus size={16} />
                    Adicionar Item
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600 }}>Carrinho</h3>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {carrinho.length === 0 ? (
                    <div style={{ padding: 20, color: "#999", textAlign: "center" }}>
                      Nenhum item adicionado
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Código</th>
                          <th style={thStyle}>Produto</th>
                          <th style={thStyle}>Qtd</th>
                          <th style={thStyle}>Preço</th>
                          <th style={thStyle}>Subtotal</th>
                          <th style={thStyle}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {carrinho.map((it, idx) => (
                          <tr key={idx}>
                            <td style={tdStyle}>{it.codigo}</td>
                            <td style={tdStyle}>{it.produto}</td>
                            <td style={tdStyle}>{it.qtd}</td>
                            <td style={tdStyle}>R$ {it.preco.toFixed(2)}</td>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>R$ {it.subtotal.toFixed(2)}</td>
                            <td style={tdStyle}>
                              <button 
                                onClick={() => removerItem(idx)} 
                                style={{ 
                                  background: "none", 
                                  border: "none", 
                                  color: "#e91e63", 
                                  cursor: "pointer" 
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div style={{ ...cardStyle, marginTop: 16 }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600 }}>Total da Venda</h3>
                <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 14, color: "#666" }}>TOTAL</div>
                  <div style={{ fontSize: 32, color: "#1e88e5", fontWeight: 700 }}>
                    R$ {totalVenda.toFixed(2)}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <button onClick={finalizarPagamento} style={primaryButton}>
                    Pagamento
                  </button>
                  <button onClick={cancelarVenda} style={cancelButton}>
                    Cancelar Venda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Estilos ----------
const modalOverlay: React.CSSProperties = { 
  position: "fixed", 
  inset: 0, 
  backgroundColor: "rgba(0,0,0,0.6)", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  zIndex: 1000,
  backdropFilter: "blur(4px)"
};

const modalBox: React.CSSProperties = { 
  width: 360, 
  maxWidth: "95vw",
  maxHeight: "95vh",
  background: "#fff", 
  borderRadius: 12, 
  overflow: "hidden",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  display: "flex",
  flexDirection: "column"
};

const modalHeader: React.CSSProperties = { 
  background: "linear-gradient(135deg,#1e88e5,#1565c0)", 
  padding: "14px 16px", 
  color: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const paymentMethodCard: React.CSSProperties = {
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  padding: "8px",
  transition: "all 0.2s"
};

const paymentMethodHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px"
};

const paymentIcon: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
};

const paymentMethodTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#1e293b"
};

const paymentMethodSubtitle: React.CSSProperties = {
  fontSize: "10px",
  color: "#64748b"
};

const paymentInput: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "15px",
  fontWeight: 600,
  border: "none",
  background: "#f8f9fa",
  borderRadius: "6px",
  boxSizing: "border-box",
  color: "#1e293b"
};

const finalizarButton: React.CSSProperties = {
  width: "100%",
  marginTop: "10px",
  padding: "11px",
  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px"
};

const headerStyle: React.CSSProperties = { 
  background: "#fff", 
  padding: "20px 40px", 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  borderBottom: "1px solid #eee" 
};

const userBox: React.CSSProperties = { 
  display: "flex", 
  alignItems: "center", 
  gap: 10,
  background: "#f8f9fa",
  padding: "8px 16px",
  borderRadius: "8px"
};

const avatarStyle: React.CSSProperties = { 
  width: 36, 
  height: 36, 
  borderRadius: "50%", 
  background: "#1e88e5", 
  color: "#fff", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  fontWeight: 700 
};

const cardStyle: React.CSSProperties = { 
  background: "#fff", 
  borderRadius: 12, 
  padding: 16, 
  boxShadow: "0 1px 6px rgba(0,0,0,0.04)" 
};

const inputStyle: React.CSSProperties = { 
  width: "100%", 
  padding: 10, 
  borderRadius: 8, 
  border: "1px solid #e2e8f0", 
  boxSizing: "border-box",
  fontSize: "14px"
};

const primaryButton: React.CSSProperties = { 
  padding: "12px 16px", 
  background: "#1e88e5", 
  color: "#fff", 
  border: "none", 
  borderRadius: 8, 
  cursor: "pointer",
  fontWeight: 500
};

const primaryGreenButton: React.CSSProperties = { 
  padding: "8px 12px", 
  background: "#4caf50", 
  color: "#fff", 
  border: "none", 
  borderRadius: 8, 
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 500
};

const secondaryButton: React.CSSProperties = { 
  padding: "10px 16px", 
  background: "#eef2ff", 
  border: "1px solid #dbeafe", 
  borderRadius: 8, 
  cursor: "pointer",
  fontWeight: 500,
  color: "#1e88e5"
};

const cancelButton: React.CSSProperties = { 
  padding: "12px 16px", 
  background: "#e91e63", 
  color: "#fff", 
  border: "none", 
  borderRadius: 8, 
  cursor: "pointer",
  fontWeight: 500
};

const thStyle: React.CSSProperties = { 
  textAlign: "left", 
  padding: "8px 6px", 
  fontSize: 12, 
  color: "#666",
  fontWeight: 600
};

const tdStyle: React.CSSProperties = { 
  padding: "8px 6px", 
  fontSize: 14, 
  color: "#333" 
};