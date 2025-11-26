# vendas/views.py
from django.db import transaction
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from io import BytesIO
from datetime import datetime
from .models import Venda, ItemVenda
from .serializers import VendaSerializer, VendaListSerializer, ItemVendaSerializer

# Importações para PDF (só importa se reportlab estiver instalado)
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class VendaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar vendas
    - list: Lista vendas de forma resumida
    - retrieve: Exibe detalhes completos de uma venda
    - create: Cria uma nova venda com itens
    - update/patch: Bloqueado pelo serializer
    - destroy: Permite exclusão (configure conforme necessário)
    """
    queryset = Venda.objects.select_related('cliente', 'vendedor').prefetch_related('itens__produto').order_by('-data_venda')
    
    def get_serializer_class(self):
        """Usa serializer simplificado para listagem"""
        if self.action == 'list':
            return VendaListSerializer
        return VendaSerializer

    def create(self, request, *args, **kwargs):
        """
        Cria venda com validação completa e transação atômica
        A transação já é gerenciada pelo serializer, mas mantemos aqui por segurança
        """
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            venda = serializer.save()
            
            # O método calcular_total() já é chamado no serializer.create()
            # mas podemos garantir que está atualizado
            venda.refresh_from_db()
            
            # Retorna a venda criada com todos os dados
            output_serializer = self.get_serializer(venda)
            headers = self.get_success_headers(output_serializer.data)
            return Response(
                output_serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )

    def update(self, request, *args, **kwargs):
        """Bloqueia atualização de vendas"""
        return Response(
            {"detail": "Vendas não podem ser modificadas após criadas."},
            status=status.HTTP_403_FORBIDDEN
        )

    def partial_update(self, request, *args, **kwargs):
        """Bloqueia atualização parcial de vendas"""
        return Response(
            {"detail": "Vendas não podem ser modificadas após criadas."},
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=True, methods=['get'])
    def nota_fiscal(self, request, pk=None):
        """
        Gera nota fiscal em PDF da venda
        GET /api/vendas/{id}/nota_fiscal/
        """
        if not REPORTLAB_AVAILABLE:
            return Response(
                {"detail": "ReportLab não está instalado. Execute: pip install reportlab"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        venda = self.get_object()
        
        # Cria buffer para o PDF
        buffer = BytesIO()
        
        # Cria o documento PDF
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30
        )
        
        # Container para elementos do PDF
        elements = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        # Cabeçalho
        elements.append(Paragraph("NOTA FISCAL DE VENDA", title_style))
        elements.append(Spacer(1, 12))
        
        # Informações da empresa (substitua pelos seus dados)
        empresa_info = [
            ["<b>Empresa:</b>", "Sua Empresa LTDA"],
            ["<b>CNPJ:</b>", "00.000.000/0001-00"],
            ["<b>Endereço:</b>", "Rua Exemplo, 123 - Cidade/UF"],
            ["<b>Telefone:</b>", "(45) 99999-9999"]
        ]
        
        empresa_table = Table(empresa_info, colWidths=[100, 350])
        empresa_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2C3E50')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(empresa_table)
        elements.append(Spacer(1, 20))
        
        # Informações da venda
        venda_info = [
            ["<b>Nota Fiscal Nº:</b>", f"{venda.id:06d}"],
            ["<b>Data:</b>", venda.data_venda.strftime("%d/%m/%Y %H:%M")],
            ["<b>Cliente:</b>", venda.cliente.nome],
            ["<b>Vendedor:</b>", venda.vendedor.username if venda.vendedor else "N/A"],
        ]
        
        venda_table = Table(venda_info, colWidths=[150, 300])
        venda_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2C3E50')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ECF0F1')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(venda_table)
        elements.append(Spacer(1, 20))
        
        # Cabeçalho da tabela de itens
        data = [['Item', 'Produto', 'Qtd', 'Preço Unit.', 'Desconto', 'Subtotal']]
        
        # Itens da venda
        for idx, item in enumerate(venda.itens.all(), 1):
            data.append([
                str(idx),
                item.produto.descricao,
                str(item.quantidade),
                f"R$ {item.preco_unitario:.2f}",
                f"{item.desconto_percentual}%",
                f"R$ {item.subtotal:.2f}"
            ])
        
        # Totais
        data.append(['', '', '', '', '<b>Desconto Geral:</b>', f"<b>{venda.desconto_percentual}%</b>"])
        data.append(['', '', '', '', '<b>TOTAL:</b>', f"<b>R$ {venda.total_venda:.2f}</b>"])
        
        # Cria tabela de itens
        items_table = Table(data, colWidths=[30, 200, 40, 80, 80, 80])
        items_table.setStyle(TableStyle([
            # Cabeçalho
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Corpo
            ('TEXTCOLOR', (0, 1), (-1, -3), colors.black),
            ('ALIGN', (2, 1), (2, -3), 'CENTER'),  # Quantidade
            ('ALIGN', (3, 1), (-1, -1), 'RIGHT'),  # Valores
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -3), 0.5, colors.grey),
            
            # Totais
            ('FONTNAME', (0, -2), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -2), (-1, -1), 10),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#ECF0F1')),
            ('LINEABOVE', (0, -2), (-1, -2), 2, colors.black),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 30))
        
        # Rodapé
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        elements.append(Paragraph(
            f"Documento gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}",
            footer_style
        ))
        
        # Gera o PDF
        doc.build(elements)
        
        # Retorna o PDF
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="nota_fiscal_{venda.id:06d}.pdf"'
        
        return response

    @action(detail=True, methods=['get'])
    def nota_fiscal_html(self, request, pk=None):
        """
        Gera nota fiscal em HTML da venda (para impressão)
        GET /api/vendas/{id}/nota_fiscal_html/
        """
        venda = self.get_object()
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Nota Fiscal #{venda.id:06d}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #333;
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .header h1 {{
                    color: #2C3E50;
                    margin-bottom: 10px;
                }}
                .info-box {{
                    background: #ECF0F1;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                }}
                .info-box p {{
                    margin: 5px 0;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }}
                th {{
                    background: #34495E;
                    color: white;
                    padding: 10px;
                    text-align: left;
                }}
                td {{
                    padding: 8px;
                    border-bottom: 1px solid #ddd;
                }}
                .text-right {{
                    text-align: right;
                }}
                .text-center {{
                    text-align: center;
                }}
                .total-row {{
                    background: #ECF0F1;
                    font-weight: bold;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    color: #7f8c8d;
                    font-size: 12px;
                }}
                @media print {{
                    body {{
                        margin: 20px;
                    }}
                    .no-print {{
                        display: none;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>NOTA FISCAL DE VENDA</h1>
                <p>Nota Fiscal Nº: {venda.id:06d}</p>
            </div>
            
            <div class="info-box">
                <h3>Informações da Empresa</h3>
                <p><strong>Empresa:</strong> Sua Empresa LTDA</p>
                <p><strong>CNPJ:</strong> 00.000.000/0001-00</p>
                <p><strong>Endereço:</strong> Rua Exemplo, 123 - Cidade/UF</p>
                <p><strong>Telefone:</strong> (45) 99999-9999</p>
            </div>
            
            <div class="info-box">
                <h3>Informações da Venda</h3>
                <p><strong>Data:</strong> {venda.data_venda.strftime("%d/%m/%Y %H:%M")}</p>
                <p><strong>Cliente:</strong> {venda.cliente.nome}</p>
                <p><strong>Vendedor:</strong> {venda.vendedor.username if venda.vendedor else "N/A"}</p>
            </div>
            
            <h3>Itens da Venda</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Produto</th>
                        <th class="text-center">Qtd</th>
                        <th class="text-right">Preço Unit.</th>
                        <th class="text-right">Desconto</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        # Adiciona itens
        for idx, item in enumerate(venda.itens.all(), 1):
            html += f"""
                    <tr>
                        <td>{idx}</td>
                        <td>{item.produto.descricao}</td>
                        <td class="text-center">{item.quantidade}</td>
                        <td class="text-right">R$ {item.preco_unitario:.2f}</td>
                        <td class="text-right">{item.desconto_percentual}%</td>
                        <td class="text-right">R$ {item.subtotal:.2f}</td>
                    </tr>
            """
        
        html += f"""
                    <tr class="total-row">
                        <td colspan="5" class="text-right">Desconto Geral:</td>
                        <td class="text-right">{venda.desconto_percentual}%</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="5" class="text-right">TOTAL:</td>
                        <td class="text-right">R$ {venda.total_venda:.2f}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer">
                <p>Documento gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}</p>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">🖨️ Imprimir</button>
            </div>
        </body>
        </html>
        """
        
        return HttpResponse(html)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """
        Endpoint customizado para cancelar uma venda
        POST /api/vendas/{id}/cancelar/
        """
        venda = self.get_object()
        
        with transaction.atomic():
            # Devolve estoque dos produtos
            for item in venda.itens.all():
                produto = item.produto
                produto.quantidade_estoque += item.quantidade
                produto.save()
            
            # Ou exclui a venda
            venda.delete()
            
        return Response(
            {"detail": "Venda cancelada com sucesso."},
            status=status.HTTP_200_OK
        )


class ItemVendaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet SOMENTE LEITURA para itens de venda
    Itens só podem ser criados através da venda (nested)
    - list: Lista todos os itens
    - retrieve: Detalhe de um item específico
    """
    queryset = ItemVenda.objects.select_related('produto', 'venda', 'venda__cliente').order_by('-venda__data_venda')
    serializer_class = ItemVendaSerializer

    def get_queryset(self):
        """
        Permite filtrar itens por venda
        Exemplo: /api/itens-venda/?venda=1
        """
        queryset = super().get_queryset()
        venda_id = self.request.query_params.get('venda', None)
        
        if venda_id is not None:
            queryset = queryset.filter(venda_id=venda_id)
        
        return queryset

    # Remove métodos de criação/edição/exclusão
    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "Itens só podem ser criados através da venda. Use POST /api/vendas/"},
            status=status.HTTP_403_FORBIDDEN
        )

    def update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Itens de venda não podem ser modificados."},
            status=status.HTTP_403_FORBIDDEN
        )

    def partial_update(self, request, *args, **kwargs): 
        return Response(
            {"detail": "Itens de venda não podem ser modificados."},
            status=status.HTTP_403_FORBIDDEN
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Itens de venda não podem ser excluídos diretamente."},
            status=status.HTTP_403_FORBIDDEN
        )