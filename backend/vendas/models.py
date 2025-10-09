from django.db import models
from decimal import Decimal
from django.contrib.auth.models import User
from clientes.models import Cliente  # ajuste para seu app de clientes

class Produto(models.Model):
    descricao = models.CharField(max_length=200)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade_estoque = models.PositiveIntegerField()
    codigo_barras = models.CharField(max_length=50, unique=True, null=True, blank=True)
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return self.descricao

class Venda(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True)
    vendedor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    data_venda = models.DateTimeField(auto_now_add=True)
    desconto_percentual = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_venda = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    obs = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Venda #{self.id} - {self.data_venda.strftime('%d/%m/%Y')}"

    def calcular_total(self):
        total_itens = sum(item.subtotal for item in self.itens.all())
        desconto_venda = (self.desconto_percentual / Decimal(100)) * total_itens
        self.total_venda = total_itens - desconto_venda
        self.save()
        return self.total_venda

class ItemVenda(models.Model):
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(Produto, on_delete=models.PROTECT)
    quantidade = models.PositiveIntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    desconto_percentual = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    @property
    def subtotal(self):
        desconto = (self.desconto_percentual / Decimal(100)) * self.preco_unitario
        return (self.preco_unitario - desconto) * self.quantidade

    def save(self, *args, **kwargs):
        # Atualiza estoque automaticamente ao criar o item
        if not self.pk:
            self.produto.quantidade_estoque -= self.quantidade
            self.produto.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantidade}x {self.produto.descricao}"
