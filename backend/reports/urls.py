from django.urls import path
from .views import RelatorioGeralView

urlpatterns = [
    path('relatorio_geral/', RelatorioGeralView.as_view(), name='relatorio_geral'),
]