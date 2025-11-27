from rest_framework import routers
from .views import ProdutoViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'', ProdutoViewSet, basename='produto')

urlpatterns = [
    path('', include(router.urls)),
]