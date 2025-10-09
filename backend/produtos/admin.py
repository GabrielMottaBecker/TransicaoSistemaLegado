from django.contrib import admin
from .models import Produto

@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('id', 'descricao', 'quantidade_estoque', 'preco', 'ativo')
    list_filter = ('ativo',)
    search_fields = ('descricao', 'codigo_barras')
    ordering = ('descricao',)
