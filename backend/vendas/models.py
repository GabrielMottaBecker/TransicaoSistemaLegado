# vendas/models.py

from django.db import models
from produtos.models import Produto  # ← IMPORT do app produtos
from clientes.models import Cliente  # ← IMPORT do app clientes
from django.contrib.auth.models import User


class Venda(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='vendas')
    vendedor = models.ForeignKey(User, on_delete=models.PROTECT, related_name='vendas', null=True, blank=True)
    data_venda = models.DateTimeField(auto_now_add=True)
    desconto_percentual = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_venda = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def calcular_total(self):
        """Calcula o total da venda somando os subtotais dos itens"""
        total = sum(item.subtotal for item in self.itens.all())
        desconto = total * (self.desconto_percentual / 100)
        self.total_venda = total - desconto
        self.save()
        return self.total_venda

    def __str__(self):
        return f"Venda #{self.id} - Cliente: {self.cliente.nome} - Total: R$ {self.total_venda}"

    class Meta:
        ordering = ['-data_venda']


class ItemVenda(models.Model):
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(
        'produtos.Produto',  # ← IMPORTANTE: Referência explícita ao app produtos
        on_delete=models.PROTECT
    )
    quantidade = models.IntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    desconto_percentual = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    @property
    def subtotal(self):
        """Calcula o subtotal do item com desconto"""
        valor = self.quantidade * self.preco_unitario
        desconto = valor * (self.desconto_percentual / 100)
        return valor - desconto

    def __str__(self):
        return f"{self.produto.descricao} x{self.quantidade}"

    class Meta:
        verbose_name = 'Item de Venda'
        verbose_name_plural = 'Itens de Venda'