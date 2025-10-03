from django.contrib import admin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'cpf', 'nivel_acesso', 'uf')
    search_fields = ('nome', 'email', 'cpf')
    list_filter = ('nivel_acesso', 'uf')