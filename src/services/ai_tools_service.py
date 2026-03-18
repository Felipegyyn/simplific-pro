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

            # 16. Vincular Conta em Transação Solta
            {
                "name": "vincular_conta_ultima_transacao",
                "description": "Vincula uma conta bancária à última transação solta do usuário e atualiza o saldo da conta. Acione APENAS quando o usuário estiver respondendo qual conta ele usou após você ter avisado que encontrou múltiplas contas do mesmo banco.",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "identificador_conta": {
                            "type": "STRING", 
                            "description": "O texto que o usuário usou para identificar a conta. Pode ser os últimos números (ex: '1234', 'final 8821') ou o nome/tipo (ex: 'conta PJ', 'nubank da empresa')."
                        }
                    },
                    "required": ["identificador_conta"]
                }
            }

            # 15. Metas
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
            }
        ]
    }
]