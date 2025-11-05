from django.db import models
from decimal import Decimal

class Produto(models.Model):
    # ⚠️ FLEXIBILIZADO: Campos obrigatórios se tornam opcionais (blank=True, null=True)
    descricao = models.CharField(max_length=200, verbose_name="Descrição", blank=True, null=True)
    
    # ⚠️ FLEXIBILIZADO: Permite que preços não sejam enviados ou sejam strings inválidas
    preco = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Preço", blank=True, null=True)
    
    # ⚠️ FLEXIBILIZADO: Permite que estoque seja nulo ou inválido
    quantidade_estoque = models.PositiveIntegerField(verbose_name="Quantidade em Estoque", blank=True, null=True)
    
    # Desconto já era opcional (default=0)
    desconto_percentual = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="Desconto (%)"
    )
    
    # ⚠️ FLEXIBILIZADO: Código de barras perde a unicidade, permite duplicados
    codigo_barras = models.CharField(max_length=50, unique=False, null=True, blank=True, verbose_name="Código de Barras")
    
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    data_cadastro = models.DateTimeField(auto_now_add=True, verbose_name="Data de Cadastro")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Última Atualização")

    class Meta:
        ordering = ['descricao']
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"

    def __str__(self):
        # Adicionado tratamento para campos nulos para evitar erros no __str__ durante testes
        descricao_display = self.descricao if self.descricao else "Produto sem descrição"
        preco_display = f"R$ {self.preco:.2f}" if self.preco is not None else "R$ N/A"
        return f"{descricao_display} - {preco_display}"

    @property
    def preco_com_desconto(self):
        """Retorna o preço já aplicando o desconto percentual."""
        # Adicionado tratamento para campos nulos
        if self.preco is None or self.desconto_percentual is None:
            return None
            
        if self.desconto_percentual > 0:
            desconto = (self.desconto_percentual / Decimal(100)) * self.preco
            return self.preco - desconto
        return self.preco