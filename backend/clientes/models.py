# clientes/models.py (Versão Modificada para Teste - FLEXÍVEL)

from django.db import models
# Mantenha a importação dos validadores, mas vamos ignorá-los nos campos
# from .validators import validate_cpf, validate_uf, validate_cep, validate_telefone 

class Cliente(models.Model):
    # O Campo nome é mantido como o único campo realmente obrigatório
    nome = models.CharField(max_length=100) 
    
    # ⚠️ FLEXIBILIZADO: RG torna-se opcional
    rg = models.CharField(max_length=20, blank=True, null=True)
    
    # ⚠️ FLEXIBILIZADO: CPF torna-se OPCIONAL, perde a unicidade e a validação.
    cpf = models.CharField(
        max_length=14,
        unique=False, # Permite duplicados
        blank=True,  
        null=True,   
        validators=[], # Remove a validação de dígito verificador
        help_text="Formato: XXX.XXX.XXX-XX"
    )

    # ⚠️ FLEXIBILIZADO: Email torna-se OPCIONAL.
    email = models.EmailField(max_length=100, blank=True, null=True)
    
    # ⚠️ FLEXIBILIZADO: Telefones tornam-se OPCIONAIS e perdem a validação de formato.
    telefone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[], # Remove a validação de 10/11 dígitos
        help_text="Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
    )
    celular = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[], # Remove a validação de 10/11 dígitos
        help_text="Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
    )

    # ⚠️ FLEXIBILIZADO: Endereço torna-se OPCIONAL e remove a validação de CEP.
    cep = models.CharField(
        max_length=9,
        blank=True,
        null=True,
        validators=[], # Remove a validação de 8 dígitos
        help_text="Formato: XXXXX-XXX"
    )
    
    # ⚠️ FLEXIBILIZADO: Todos os campos de endereço se tornam opcionais.
    endereco = models.CharField(max_length=100, blank=True, null=True)
    numero = models.CharField(max_length=10, blank=True, null=True)
    complemento = models.CharField(max_length=50, blank=True, null=True)
    bairro = models.CharField(max_length=50, blank=True, null=True)
    cidade = models.CharField(max_length=50, blank=True, null=True)
    
    # ⚠️ FLEXIBILIZADO: UF torna-se OPCIONAL e remove a validação de estado.
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
    
    # ... outros métodos se houver ...