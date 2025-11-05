from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Sum
from vendas.models import Venda
from clientes.models import Cliente
from produtos.models import Produto

def relatorio_geral(request):
    today = timezone.now().date()

    # Vendas hoje
    vendas_hoje = Venda.objects.filter(data__date=today)
    total_vendas_hoje = vendas_hoje.count()
    valor_vendas_hoje = vendas_hoje.aggregate(total=Sum('valor'))['total'] or 0

    # Clientes ativos
    total_clientes_ativos = Cliente.objects.filter(ativo=True).count()

    # Total produtos
    total_produtos = Produto.objects.count()

    # Vendas totais
    vendas_totais = Venda.objects.all()
    total_vendas = vendas_totais.count()
    valor_total_vendas = vendas_totais.aggregate(total=Sum('valor'))['total'] or 0

    return JsonResponse({
        "vendas_hoje": {
            "quantidade": total_vendas_hoje,
            "valor": valor_vendas_hoje
        },
        "clientes_ativos": total_clientes_ativos,
        "produtos_total": total_produtos,
        "vendas_totais": {
            "quantidade": total_vendas,
            "valor": valor_total_vendas
        }
    })
