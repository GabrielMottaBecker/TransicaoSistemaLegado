from django.core.exceptions import ValidationError
import re


def validate_cpf(value):
    """Valida o formato e os dígitos verificadores do CPF"""
    cpf = ''.join(filter(str.isdigit, value))

    if len(cpf) != 11:
        raise ValidationError('CPF deve conter 11 dígitos')

    if cpf == cpf[0] * 11:
        raise ValidationError('CPF inválido')

    soma = 0
    for i in range(9):
        soma += int(cpf[i]) * (10 - i)
    resto = 11 - (soma % 11)
    digito1 = resto if resto < 10 else 0

    soma = 0
    for i in range(10):
        soma += int(cpf[i]) * (11 - i)
    resto = 11 - (soma % 11)
    digito2 = resto if resto < 10 else 0

    if int(cpf[9]) != digito1 or int(cpf[10]) != digito2:
        raise ValidationError('CPF inválido')


def validate_uf(value):
    """Valida se a UF é uma sigla de estado brasileiro válida"""
    ufs_validas = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
                   'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
                   'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

    if value.upper() not in ufs_validas:
        raise ValidationError(f'UF inválida. Deve ser uma das: {", ".join(ufs_validas)}')


def validate_cep(value):
    """Valida o formato do CEP"""
    cep = ''.join(filter(str.isdigit, value))

    if len(cep) != 8:
        raise ValidationError('CEP deve conter 8 dígitos')

    if cep == cep[0] * 8:
        raise ValidationError('CEP inválido')


def validate_telefone(value):
    """Valida o formato de telefone fixo ou celular"""
    telefone = ''.join(filter(str.isdigit, value))

    if len(telefone) not in (10, 11):
        raise ValidationError('Telefone deve ter 10 ou 11 dígitos')

    if telefone == telefone[0] * len(telefone):
        raise ValidationError('Telefone inválido')