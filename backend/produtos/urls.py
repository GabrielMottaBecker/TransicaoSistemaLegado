from rest_framework import routers
from .views import ProdutoViewSet
from django.urls import path, include

router = routers.DefaultRouter()
# 🚨 IMPORTANTE: Use r'' (vazio) porque já definimos 'api/produtos/' no arquivo principal
router.register(r'', ProdutoViewSet, basename='produto')

urlpatterns = [
    path('', include(router.urls)),
]