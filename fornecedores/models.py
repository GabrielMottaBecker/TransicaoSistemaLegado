from django.db import models

from django.db import models
from django.core.exceptions import ValidationError
import re

class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    
    def __str__(self):
        return self.nome

class Fornecedor(Cliente):
    cnpj = models.CharField(
        max_length=18,
        unique=True,
        verbose_name="CNPJ",
        help_text="Formato: XX.XXX.XXX/XXXX-XX"
    )

    def clean(self):
        super().clean()
        self._validate_cnpj_format()
        self._validate_cnpj_digits()

    def _validate_cnpj_format(self):
        """Valida o formato do CNPJ"""
        pattern = r'^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$'
        if not re.match(pattern, self.cnpj):
            raise ValidationError({
                'cnpj': 'Formato inválido. Use o formato XX.XXX.XXX/XXXX-XX'
            })

    def _validate_cnpj_digits(self):
        """Valida os dígitos verificadores do CNPJ"""
        cnpj = re.sub(r'[^\d]', '', self.cnpj)
        
        if cnpj == cnpj[0] * 14:
            raise ValidationError({'cnpj': 'CNPJ inválido'})
        
        weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        sum1 = sum(int(cnpj[i]) * weights1[i] for i in range(12))
        digit1 = 11 - (sum1 % 11)
        digit1 = 0 if digit1 >= 10 else digit1
        
        weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        sum2 = sum(int(cnpj[i]) * weights2[i] for i in range(13))
        digit2 = 11 - (sum2 % 11)
        digit2 = 0 if digit2 >= 10 else digit2
        
        if int(cnpj[12]) != digit1 or int(cnpj[13]) != digit2:
            raise ValidationError({'cnpj': 'CNPJ inválido'})

    def __str__(self):
        return self.nome
