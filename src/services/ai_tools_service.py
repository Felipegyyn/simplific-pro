# src/services/ai_tools_service.py

# ==============================================================================
# DECLARAÇÃO DE FERRAMENTAS (TOOLS) PARA O GEMINI FUNCTION CALLING
# ==============================================================================

simplific_tools = [
    {
        "function_declarations": [
            # 1. Lançamentos Gerais
            {
                "name": "create_transaction",
                "description": "Registra uma nova transação financeira de receita ou despesa em conta bancária.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "description": {"type": "STRING", "description": "Descrição clara do gasto ou receita."},
                        "value": {"type": "NUMBER", "description": "Valor monetário da transação. Sempre positivo."},
                        "type": {"type": "STRING", "description": "Estritamente 'entrada' ou 'saida'.", "enum": ["entrada", "saida"]},
                        "category_name": {"type": "STRING", "description": "Categoria financeira sugerida."},
                        "bank_account_name": {"type": "STRING", "description": "Nome do banco ou conta. Nulo se não mencionado.", "nullable": True}
                    },
                    "required": ["description", "value", "type", "category_name"]
                }
            },
            # 2. Lançamento Cartão de Crédito
            {
                "name": "lancar_gasto_cartao",
                "description": "Registra uma despesa especificamente feita no Cartão de Crédito.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "description": {"type": "STRING", "description": "O que foi comprado no cartão."},
                        "value": {"type": "NUMBER", "description": "Valor da compra."},
                        "card_name": {"type": "STRING", "description": "Nome do cartão de crédito usado (ex: Nubank, Black). Nulo se não especificado.", "nullable": True},
                        "installments": {"type": "INTEGER", "description": "Número de parcelas. Use 1 se for à vista."}
                    },
                    "required": ["description", "value"]
                }
            },
            # 3. Pagar Fatura
            {
                "name": "pay_credit_card_bill",
                "description": "Inicia o pagamento de uma fatura de cartão de crédito aberta.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "card_name": {"type": "STRING", "description": "Nome do cartão cuja fatura será paga."}
                    },
                    "required": ["card_name"]
                }
            },
            # 4. Investimentos
            {
                "name": "cadastrar_investimento",
                "description": "Cadastra a compra de um novo investimento (Ações, FIIs, etc).",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "ticker": {"type": "STRING", "description": "O código do ativo na bolsa (ex: PETR4, MXRF11)."},
                        "valor_total": {"type": "NUMBER", "description": "O valor total investido."}
                    },
                    "required": ["ticker", "valor_total"]
                }
            },
            # 5. Consultar Preço (Yahoo Finance)
            {
                "name": "consultar_preco_ativo",
                "description": "Consulta a cotação atual de um ativo financeiro ou moeda na bolsa de valores.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "ativo": {"type": "STRING", "description": "O código do ativo ou moeda (ex: USD, AAPL, BBDC4)."}
                    },
                    "required": ["ativo"]
                }
            },
            # 6. Consultar Orçamento / Planejamento
            {
                "name": "consultar_planejamento",
                "description": "Consulta como está o andamento do orçamento/planejamento financeiro do usuário.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "periodo": {"type": "STRING", "description": "O período consultado (ex: 'este mês', 'janeiro', 'mês passado')."}
                    },
                    "required": ["periodo"]
                }
            },
            # 7. Consultar Extrato / Transações
            {
                "name": "consultar_transacoes",
                "description": "Busca o extrato de lançamentos e transações já feitas.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "status": {"type": "STRING", "description": "Status da transação ('pendente' ou 'confirmada')."},
                        "tipo": {"type": "STRING", "description": "Tipo ('entrada', 'saida', ou 'ambos')."},
                        "periodo": {"type": "STRING", "description": "O período a ser filtrado (ex: 'este mês')."}
                    },
                    "required": ["status", "tipo", "periodo"]
                }
            },
            # 8. Agenda (Consultar)
            {
                "name": "consultar_agenda",
                "description": "Consulta os compromissos, reuniões e lembretes da agenda.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "dummy": {"type": "STRING", "description": "Apenas para manter o formato do objeto.", "nullable": True}
                    }
                }
            },
            # 9. Agenda (Criar / Reunião)
            {
                "name": "cadastrar_evento_agenda",
                "description": "Agenda um compromisso ou reunião na agenda do usuário.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "title": {"type": "STRING", "description": "Título do compromisso."},
                        "event_date": {"type": "STRING", "description": "Data no formato YYYY-MM-DD."},
                        "time": {"type": "STRING", "description": "Hora no formato HH:MM."},
                        "create_meet": {"type": "BOOLEAN", "description": "Verdadeiro se for reunião com link do Google Meet."},
                        "attendee_email": {"type": "STRING", "description": "Email do convidado.", "nullable": True}
                    },
                    "required": ["title", "event_date", "time"]
                }
            },
            # 10. Simulação Financeira
            {
                "name": "simular_cenario_financeiro",
                "description": "Realiza uma simulação matemática de financiamento ou investimento.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "tipo_simulacao": {"type": "STRING", "description": "'financiamento' ou 'projecao_investimento'."},
                        "valor_total": {"type": "NUMBER", "description": "O valor principal da simulação."},
                        "prazo_meses": {"type": "INTEGER", "description": "Quantidade de meses."},
                        "taxa_juros_mensal": {"type": "NUMBER", "description": "Taxa de juros ao mês em porcentagem (ex: 1.8)."}
                    },
                    "required": ["tipo_simulacao", "valor_total", "prazo_meses", "taxa_juros_mensal"]
                }
            },
            # 11. Gráfico / Relatório Visual
            {
                "name": "gerar_resumo_visual",
                "description": "Gera um dashboard gráfico em imagem para enviar ao usuário.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "periodo": {"type": "STRING", "description": "O período do relatório (ex: 'este mês')."}
                    },
                    "required": ["periodo"]
                }
            },
            # 12. Contatos (Consultar)
            {
                "name": "consultar_contato",
                "description": "Busca os dados de um contato na agenda do sistema.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "nome": {"type": "STRING", "description": "Nome da pessoa a ser buscada."}
                    },
                    "required": ["nome"]
                }
            },
            # 13. Contatos (Salvar)
            {
                "name": "cadastrar_contato",
                "description": "Salva ou atualiza um contato no sistema.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "name": {"type": "STRING", "description": "Nome completo do contato."},
                        "email": {"type": "STRING", "description": "Email do contato."},
                        "whatsapp": {"type": "STRING", "description": "Número do WhatsApp com DDD."}
                    },
                    "required": ["name", "email", "whatsapp"]
                }
            },

            # 14. Pesquisa na Internet (Janela para o Mundo)
            {
                "name": "pesquisar_na_internet",
                "description": "Faz uma pesquisa em tempo real na internet para descobrir preços atualizados de passagens, hotéis, produtos ou notícias. REGRA OBRIGATÓRIA: Se a pesquisa for para cotar preços, comprar produtos, ver passagens ou hotéis, você DEVE incluir o 'Link da Fonte' na sua resposta final ao utilizador para facilitar a compra. Se for uma pesquisa genérica (ex: previsão do tempo, notícias comuns), não inclua os links.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "query": {
                            "type": "STRING", 
                            "description": "A pergunta exata ou termo de busca que será pesquisado no Google. Seja específico (ex: 'preço médio passagem aérea são paulo para paris 2024')."
                        }
                    },
                    "required": ["query"]
                }
            },

            # 15.0  criar Metas

            # Ferramenta para Criar Novas Metas
            {
                "name": "criar_meta",
                "description": "Cria uma nova meta financeira do zero para o usuário.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "name": {
                            "type": "STRING", 
                            "description": "O nome da meta. Ex: 'Parque no FDS', 'Aniversário Clarice', 'Viagem'."
                        },
                        "target_amount": {
                            "type": "NUMBER", 
                            "description": "O valor total (alvo) que o usuário deseja alcançar."
                        },
                        "target_date": {
                            "type": "STRING",
                            "description": "A data limite para a meta no formato 'YYYY-MM-DD'. Calcule a data exata se o usuário disser 'daqui a 6 meses' ou passar uma data específica. Se o usuário não falar sobre prazos, NÃO envie este campo."
                        },
                        "category": {
                            "type": "STRING",
                            "description": "A categoria da meta. Escolha uma das categorias que o usuário já possui. Se não souber ou não houver categoria clara, NÃO envie este campo."
                        }
                    },
                    "required": ["name", "target_amount"] # Data e categoria são opcionais!
                }
            },

            # 16. Vincular Conta do Comprovante
            {
                "name": "vincular_conta_ultima_transacao",
                "description": "Se o usuário responder com APENAS um número (ex: '1', '2' ou '2345') logo após você ter listado as opções de contas bancárias, OBRIGATORIAMENTE chame esta função. Apenas repasse o número digitado.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "opcao_usuario": {
                            "type": "STRING", 
                            "description": "Exatamente o número ou texto que o usuário digitou (ex: '1', '2' ou '2345')."
                        }
                    },
                    "required": ["opcao_usuario"]
                }
            },

            # 16. Metas
            {
                "name": "add_value_to_goal",
                "description": "Adiciona dinheiro guardado a uma Meta Financeira existente.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "goal_name": {"type": "STRING", "description": "Nome da meta financeira que receberá o valor."},
                        "value": {"type": "NUMBER", "description": "Valor a ser guardado/adicionado."}
                    },
                    "required": ["goal_name", "value"]
                }
            },

            # 17. Editar Transação
            {
                "name": "editar_transacao",
                "description": "Edita ou altera dados de uma transação financeira existente (ex: mudar valor, descrição, data ou categoria de um gasto).",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "termo_busca": {"type": "STRING", "description": "Nome, descrição ou termo do gasto a alterar (ex: 'almoço', 'ifood', 'último lançamento')."},
                        "novo_valor": {"type": "NUMBER", "description": "Novo valor da transação.", "nullable": True},
                        "nova_descricao": {"type": "STRING", "description": "Nova descrição para o lançamento.", "nullable": True},
                        "nova_categoria": {"type": "STRING", "description": "Nova categoria sugerida.", "nullable": True},
                        "nova_data": {"type": "STRING", "description": "Nova data no formato YYYY-MM-DD.", "nullable": True}
                    },
                    "required": ["termo_busca"]
                }
            },

            # 18. Excluir / Estornar Transação
            {
                "name": "excluir_transacao",
                "description": "Exclui, cancela ou estorna uma transação financeira lançada (ex: 'cancele o almoço', 'apague o último gasto de 50').",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "termo_busca": {"type": "STRING", "description": "Descrição, valor ou termo do gasto a excluir (ex: 'almoço', 'ifood de 45', 'último gasto')."}
                    },
                    "required": ["termo_busca"]
                }
            },

            # 19. Cadastrar Novo Cartão de Crédito
            {
                "name": "cadastrar_cartao_credito",
                "description": "Cadastra um novo cartão de crédito para o usuário no sistema.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "name": {"type": "STRING", "description": "Nome do cartão de crédito (ex: 'Nubank Ultravioleta', 'Inter Black')."},
                        "limit": {"type": "NUMBER", "description": "Limite total do cartão de crédito."},
                        "due_day": {"type": "INTEGER", "description": "Dia do mês em que a fatura vence (1 a 31)."},
                        "closing_day": {"type": "INTEGER", "description": "Dia do mês do fechamento da fatura (opcional).", "nullable": True},
                        "brand": {"type": "STRING", "description": "Bandeira do cartão (ex: 'Mastercard', 'Visa', 'Elo').", "nullable": True}
                    },
                    "required": ["name", "limit", "due_day"]
                }
            },

            # 20. Alterar Limite de Cartão de Crédito
            {
                "name": "alterar_limite_cartao",
                "description": "Altera ou ajusta o limite de crédito de um cartão existente (ex: 'aumente o limite do Nubank para 8000').",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "card_name": {"type": "STRING", "description": "Nome do cartão de crédito a ter o limite alterado (ex: 'Nubank', 'Inter')."},
                        "novo_limite": {"type": "NUMBER", "description": "Novo valor total do limite de crédito."}
                    },
                    "required": ["card_name", "novo_limite"]
                }
            },

            # 21. Gerenciar Meta (Pausar, Excluir, Renegociar Prazo ou Valor)
            {
                "name": "gerenciar_meta",
                "description": "Gerencia uma meta financeira existente: pausar, reativar, excluir ou renegociar prazo/valor.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "goal_name": {"type": "STRING", "description": "Nome da meta a ser gerenciada (ex: 'Viagem', 'Carro Novo')."},
                        "action": {"type": "STRING", "description": "Ação a executar.", "enum": ["pausar", "reativar", "excluir", "alterar_prazo", "alterar_valor"]},
                        "new_target_date": {"type": "STRING", "description": "Nova data limite no formato YYYY-MM-DD (usado se action='alterar_prazo').", "nullable": True},
                        "new_target_amount": {"type": "NUMBER", "description": "Novo valor alvo financeiro (usado se action='alterar_valor').", "nullable": True}
                    },
                    "required": ["goal_name", "action"]
                }
            },

            # 22. Resgatar ou Vender Investimento
            {
                "name": "resgatar_investimento",
                "description": "Realiza o resgate ou venda de cotas/ações ou valor aplicado em um investimento existente.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "ticker_ou_nome": {"type": "STRING", "description": "Ticker ou nome do investimento (ex: 'PETR4', 'MXRF11', 'Reserva', 'Tesouro Selic')."},
                        "valor_resgate": {"type": "NUMBER", "description": "Valor monetário em R$ a ser resgatado.", "nullable": True},
                        "quantidade_cotas": {"type": "NUMBER", "description": "Quantidade de cotas/ações a serem vendidas.", "nullable": True}
                    },
                    "required": ["ticker_ou_nome"]
                }
            },

            # 23. Consultar Rentabilidade Consolidada da Carteira
            {
                "name": "consultar_rentabilidade_carteira",
                "description": "Consulta o panorama consolidado de rentabilidade, lucro/prejuízo e desempenho geral da carteira de investimentos do usuário.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "dummy": {"type": "STRING", "description": "Parâmetro auxiliar opcional.", "nullable": True}
                    }
                }
            },

            # 24. Cancelar Compromisso ou Reunião da Agenda
            {
                "name": "cancelar_evento_agenda",
                "description": "Cancela ou desmarca um compromisso ou reunião da agenda interna e do Google Calendar/Google Meet.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "termo_busca": {"type": "STRING", "description": "Título, pessoa ou assunto da reunião/compromisso (ex: 'reunião com o Michel', 'dentista')."},
                        "data_evento": {"type": "STRING", "description": "Data do evento no formato YYYY-MM-DD se mencionada.", "nullable": True}
                    },
                    "required": ["termo_busca"]
                }
            },

            # 25. Atualizar Contato Existente
            {
                "name": "atualizar_contato",
                "description": "Atualiza dados de e-mail ou WhatsApp de um contato que já está cadastrado na agenda.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "name": {"type": "STRING", "description": "Nome do contato a ser atualizado."},
                        "email": {"type": "STRING", "description": "Novo e-mail do contato (opcional).", "nullable": True},
                        "whatsapp": {"type": "STRING", "description": "Novo número de WhatsApp com DDD (opcional).", "nullable": True}
                    },
                    "required": ["name"]
                }
            }
        ]
    }
]

# ==============================================================================
# CONVERSOR PARA FORMATO OPENAI / FREELLMAPI / GROQ
# ==============================================================================

def _convert_gemini_schema(prop):
    """Converte recursivamente o schema de parâmetros do Gemini para JSON Schema do OpenAI."""
    if not isinstance(prop, dict):
        return {"type": "string"}
    
    result = {}
    p_type = prop.get("type", "STRING").lower()
    
    if p_type == "object":
        result["type"] = "object"
        if "properties" in prop:
            result["properties"] = {
                k: _convert_gemini_schema(v) for k, v in prop["properties"].items()
            }
        if "required" in prop:
            result["required"] = prop["required"]
    elif p_type in ["number", "float"]:
        result["type"] = "number"
    elif p_type == "integer":
        result["type"] = "integer"
    elif p_type == "boolean":
        result["type"] = "boolean"
    else:
        result["type"] = "string"

    if "description" in prop:
        result["description"] = prop["description"]
    if "enum" in prop:
        result["enum"] = prop["enum"]

    return result

def get_openai_tools():
    """Gera a lista de ferramentas compatível com OpenAI / FreeLLMAPI."""
    openai_tools = []
    for group in simplific_tools:
        for decl in group.get("function_declarations", []):
            name = decl["name"]
            description = decl.get("description", "")
            raw_params = decl.get("parameters", {})
            converted_params = _convert_gemini_schema(raw_params)
            
            if "type" not in converted_params:
                converted_params["type"] = "object"
            if "properties" not in converted_params:
                converted_params["properties"] = {}

            openai_tools.append({
                "type": "function",
                "function": {
                    "name": name,
                    "description": description,
                    "parameters": converted_params
                }
            })
    return openai_tools

openai_simplific_tools = get_openai_tools()