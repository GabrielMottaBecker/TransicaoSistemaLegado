from django.http import JsonResponse
from django.db.models import Sum
from vendas.models import Venda
from clientes.models import Cliente
from produtos.models import Produto
from django.utils.timezone import now

def sales_today(request):
    today = now().date()
    total = Venda.objects.filter(data__date=today).aggregate(Sum("valor"))["valor__sum"] or 0
    return JsonResponse({"sales_today": total})

def active_clients(request):
    count = Cliente.objects.filter(ativo=True).count()
    return JsonResponse({"active_clients": count})

def products_total(request):
    count = Produto.objects.count()
    return JsonResponse({"products_total": count})

def sales_total(request):
    total = Venda.objects.aggregate(Sum("valor"))["valor__sum"] or 0
    return JsonResponse({"sales_total": total})
