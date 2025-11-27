
from django.db import models

class Cliente(models.Model):
    nome = models.CharField(max_length=100) 
    
    rg = models.CharField(max_length=20, blank=True, null=True)
    
    cpf = models.CharField(
        max_length=14,
        unique=False, 
        blank=True,  
        null=True,   
        validators=[],
        help_text="Formato: XXX.XXX.XXX-XX"
    )

    email = models.EmailField(max_length=100, blank=True, null=True)
    
    telefone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[], 
        help_text="Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
    )
    celular = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[], 
        help_text="Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
    )

    cep = models.CharField(
        max_length=9,
        blank=True,
        null=True,
        validators=[], 
        help_text="Formato: XXXXX-XXX"
    )
    
    endereco = models.CharField(max_length=100, blank=True, null=True)
    numero = models.CharField(max_length=10, blank=True, null=True)
    complemento = models.CharField(max_length=50, blank=True, null=True)
    bairro = models.CharField(max_length=50, blank=True, null=True)
    cidade = models.CharField(max_length=50, blank=True, null=True)
    
    uf = models.CharField(
        max_length=2,
        blank=True,
        null=True,
        validators=[], 
        help_text="Sigla do estado (ex: SP, RJ)"
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['nome']

    def __str__(self):
        cpf_display = self.cpf if self.cpf else "N/A"
        return f"{self.nome} ({cpf_display})"
    