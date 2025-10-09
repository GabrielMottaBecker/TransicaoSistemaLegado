# vendas/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendaViewSet, ItemVendaViewSet  # vamos supor que você tenha essas views

router = DefaultRouter()
router.register(r'vendas', VendaViewSet, basename='vendas')
router.register(r'itens', ItemVendaViewSet, basename='itens-venda')

urlpatterns = [
    path('', include(router.urls)),
]
