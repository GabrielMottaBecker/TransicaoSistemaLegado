from django.db import models
from .validators import validate_cpf, validate_uf, validate_cep, validate_telefone

class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    rg = models.CharField(max_length=20, blank=True, null=True)
    cpf = models.CharField(
        max_length=14,
        unique=True,
        validators=[validate_cpf],
        help_text="Formato: XXX.XXX.XXX-XX"
    )

    email = models.EmailField(max_length=100)
    telefone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[validate_telefone],
        help_text="Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
    )
    celular = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[validate_telefone],
        help_text="Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
    )


    cep = models.CharField(
        max_length=9,
        blank=True,
        null=True,
        validators=[validate_cep],
        help_text="Formato: XXXXX-XXX"
    )
    endereco = models.CharField(max_length=100)
    numero = models.CharField(max_length=10)
    complemento = models.CharField(max_length=50, blank=True, null=True)
    bairro = models.CharField(max_length=50)
    cidade = models.CharField(max_length=50)
    uf = models.CharField(
        max_length=2,
        validators=[validate_uf],
        help_text="Sigla do estado (ex: SP, RJ)"
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.cpf})"

    def get_endereco_completo(self):
        endereco = f"{self.endereco}, {self.numero}"
        if self.complemento:
            endereco += f" - {self.complemento}"
        endereco += f"\n{self.bairro} - {self.cidade}/{self.uf}"
        endereco += f"\nCEP: {self.cep}" if self.cep else ""
        return endereco