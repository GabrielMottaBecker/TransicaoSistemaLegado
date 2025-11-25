# backend/urls.py (Versão para Teste de Isolamento)

from django.contrib import admin
from django.urls import path, include
# Não se preocupe com este import por enquanto: from funcionarios.views import login_usuario

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Comente TODAS as rotas de API para iniciar
     path('api/', include('funcionarios.login_urls')), 
     path('api/', include('funcionarios.urls')), 
     path('api/fornecedores/', include('fornecedores.urls')),
     path('api/clientes/', include('clientes.urls')),
     path('api/produtos/', include('produtos.urls')),
     path('api/vendas/', include('vendas.urls')),
     path("api/reports/", include("reports.urls")), 
    # path('api/login/', login_usuario, name='login-api'), # Comente também o login direto
]