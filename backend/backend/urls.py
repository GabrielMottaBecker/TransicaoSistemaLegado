from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('funcionarios.urls')),
    
    # APIs organizadas com prefixos específicos
    path('api/fornecedores/', include('fornecedores.urls')),
    path('api/clientes/', include('clientes.urls')),
    path('api/produtos/', include('produtos.urls')),      # 🔧 CORRIGIDO
    path('api/vendas/', include('vendas.urls')),          # 🔧 CORRIGIDO
    path('api/reports/', include('reports.urls')),
]