from django.urls import path
from .views import RelatorioGeralView

urlpatterns = [
    # O nome da rota é importante. Se no frontend chamamos 'api/relatorio_geral/',
    # e no arquivo principal incluímos como 'api/', aqui deve ser 'relatorio_geral/'
    path('relatorio_geral/', RelatorioGeralView.as_view(), name='relatorio_geral'),
]