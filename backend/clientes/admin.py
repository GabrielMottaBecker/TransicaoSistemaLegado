# clientes/admin.py
from django.contrib import admin
from .models import Cliente


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'email', 'telefone']
    search_fields = ['nome', 'email']
    ordering = ['nome']