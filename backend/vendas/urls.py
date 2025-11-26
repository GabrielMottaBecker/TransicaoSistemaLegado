# vendas/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendaViewSet, ItemVendaViewSet

router = DefaultRouter()
router.register(r'', VendaViewSet, basename='venda')  # Rota vazia porque já está em /api/vendas/
router.register(r'itens', ItemVendaViewSet, basename='item-venda')

urlpatterns = [
    path('', include(router.urls)),
]