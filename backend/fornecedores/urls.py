from django.urls import path, include
from rest_framework import routers
from .views import FornecedorViewSet

router = routers.DefaultRouter()
router.register(r'', FornecedorViewSet)  # vazio, pois já será incluído via /api/fornecedores/

urlpatterns = router.urls
