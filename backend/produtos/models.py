from django.db import models
from decimal import Decimal

class Produto(models.Model):
    descricao = models.CharField(max_length=200, verbose_name="Descrição")
    preco = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Preço")
    quantidade_estoque = models.PositiveIntegerField(verbose_name="Quantidade em Estoque")
    desconto_percentual = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="Desconto (%)"
    )
    codigo_barras = models.CharField(max_length=50, unique=True, null=True, blank=True, verbose_name="Código de Barras")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    data_cadastro = models.DateTimeField(auto_now_add=True, verbose_name="Data de Cadastro")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Última Atualização")

    class Meta:
        ordering = ['descricao']
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"

    def __str__(self):
        return f"{self.descricao} - R$ {self.preco:.2f}"

    @property
    def preco_com_desconto(self):
        """Retorna o preço já aplicando o desconto percentual."""
        if self.desconto_percentual > 0:
            desconto = (self.desconto_percentual / Decimal(100)) * self.preco
            return self.preco - desconto
        return self.preco
