from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from datetime import date
from vendas.models import Venda, ItemVenda
from clientes.models import Cliente
from produtos.models import Produto 

class RelatorioGeralView(APIView):
    """
    Retorna um resumo de métricas do negócio para a tela de Relatórios (Dashboard).
    """
    def get(self, request, format=None):
        hoje = date.today()
        
        # --- 1. Vendas Totais ---
        # CORREÇÃO: Agora usamos 'total_venda' para alinhar com o models.py atualizado
        vendas_totais = Venda.objects.aggregate(
            total_valor=Sum('total_venda'),
            total_qtd=Count('id')
        )
        
        # --- 2. Clientes Ativos ---
        clientes_ativos = Cliente.objects.count()
        
        # --- 3. Produtos Ativos ---
        produtos_ativos = Produto.objects.filter(ativo=True).count()
        
        # --- 4. Vendas Recentes (Últimos 5 registros) ---
        vendas_recentes = Venda.objects.select_related('cliente').order_by('-data_venda')[:5]
        
        vendas_recentes_data = []
        pagamentos_mock = ['PIX', 'Cartão', 'Dinheiro'] 
        
        for i, venda in enumerate(vendas_recentes):
            # Tratamento de segurança para cliente nulo
            nome_cliente = 'Consumidor Final'
            if venda.cliente:
                nome_cliente = venda.cliente.nome

            vendas_recentes_data.append({
                'data': venda.data_venda.strftime('%d/%m/%Y'),
                'cliente': nome_cliente,
                'pagamento': pagamentos_mock[i % len(pagamentos_mock)], 
                # CORREÇÃO: Usando 'total_venda' aqui também
                'valor': float(venda.total_venda) 
            })

        # --- 5. Estoque de Produtos (Top 5 menor estoque) ---
        produtos_estoque = Produto.objects.order_by('quantidade_estoque')[:5]
        
        estoque_data = []
        for produto in produtos_estoque:
            # Calcula quantos itens desse produto foram vendidos
            vendido_total = ItemVenda.objects.filter(
                produto_id=produto.pk
            ).aggregate(Sum('quantidade'))['quantidade__sum'] or 0
            
            estoque_data.append({
                'produto': produto.descricao,
                'estoque': produto.quantidade_estoque,
                'vendidos': vendido_total
            })

        # --- Consolidação Final ---
        data = {
            'vendas_totais': {
                'valor': float(vendas_totais['total_valor'] or 0),
                'quantidade': vendas_totais['total_qtd'] or 0,
                'comparativo': '+0%' 
            },
            'produtos_vendidos': {
                'quantidade': produtos_ativos,
                'comparativo': '+0%' 
            },
            'clientes_ativos': {
                'quantidade': clientes_ativos,
                'comparativo': '+0%' 
            },
            'vendas_recentes': vendas_recentes_data,
            'estoque_produtos': estoque_data,
        }
        
        return Response(data)