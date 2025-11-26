from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('funcionarios.urls')),
    
    # APIs organizadas com prefixos específicos
    path('api/fornecedores/', include('fornecedores.urls')),
    path('api/clientes/', include('clientes.urls')),
    path('api/', include('produtos.urls')),
    path('api/', include('vendas.urls')),  # ← Remova o 'vendas/' daqui
    path("api/reports/", include("reports.urls")),
]