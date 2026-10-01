#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Carga incremental/atualizavel da view dbplanp02.VIEW_BSC para o banco
db_Melhoria_continua_operacoes.view_bsc_periodo_fechamento.

Requisitos:
  pip install mysql-connector-python python-dotenv

Execucao:
  python3 load_view_bsc.py

Seguranca:
  Usuarios e senhas sao lidos de variaveis de ambiente ou arquivo .env.
"""

import hashlib
import logging
import os
import sys
import time
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, Iterable, List, Sequence, Set, Tuple

import mysql.connector
from dotenv import load_dotenv
from mysql.connector import Error


# Carrega variaveis do arquivo .env, se existir.
load_dotenv()


# -----------------------------
# Configuracoes gerais
# -----------------------------
DESTINO_TABELA_PADRAO = "view_bsc_periodo_fechamento"
PERIODO_INICIO_PADRAO = "2026-07-01 00:00:00"
BATCH_SIZE_PADRAO = 1000


# Campos retornados no SELECT da origem.
# A tabela de destino sera criada com todos estes campos.
SELECT_COLUMNS = [
    "DT_ABERTURA",
    "PERIODO_ABERTURA",
    "DT_AB",
    "SEMANA_ABERTURA",
    "DT_FECHAMENTO",
    "PERIODO_FECHAMENTO",
    "DIA_FECH",
    "SEMANA_FECHAMENTO",
    "DT_PRI_AG",
    "DT_AG_Limite",
    "DIA_REF_FECH_IRR_IFI",
    "DT_REF_FECH_IRR_IFI",
    "SEM_ANO_REF_IRR_IFI",
    "Dias_REF_IRR_IFI",
    "PERIODO_REF_FECH_IRR_IFI",
    "Flag_IRR",
    "Flag_IFI",
    "Flag_AG",
    "ID_REF_REP_IFI",
    "ID_OSS",
    "ID_ATENDIMENTO",
    "ID_CLIENTE",
    "LOGIN_TECNICO",
    "NOME_TECNICO",
    "CIDADE",
    "DESCRICAO_OS",
    "DETALHE_OS",
    "TIPO_OS",
    "PONTUACAO",
    "EXECUTADO",
    "EMPRESA_ORIGEM",
    "AGING_H",
    "REGIONAL",
    "EMPRESA_TECNICO",
    "TECNICO_PROPRIO_TERCEIRO",
    "CONTADOR",
    "NOVA_ADQ",
    "Aux_semana",
    "NEW_REGIONAIS",
    "COD_REGIONAL",
    "COD_GERENTE",
    "V24",
    "V48",
    "V72",
    "COD_IBGE",
    "TIPO_GARANTIA",
    "FLAG_IG",
    "ID_ATENDIMENTO_GARANTIA",
    "DATA_ABERTURA_GARANTIA",
    "DIAS_GARANTIA",
    "EMPRESA_TECNICO_GARANTIA",
    "gerencia",
    "TIPO_OS_REF_IG",
    "dslam_projeto",
    "chassis",
    "hostname",
    "primaria",
    "cto_caixa",
    "id_adm",
    "DT_INICIO_OS",
    "Flag_APP",
    "TECNICO_PRIMEIRA_AGENDA",
    "EMPRESA_PRIMEIRA_AGENDA",
    "QFLAG_AG",
    "PERIODO_REF_QUEBRA_AG",
    "SEMANA_QUEBRA_AG",
    "DT_FLAG_Q_AG",
    "flag_retencao",
    "motivo_suspensao",
    "detalhe_encerr",
    "nome_produto",
    "plano",
    "segmento",
    "motivo_abertura",
    "MOTAB_REF_IRR_IFI",
    "MOTFECH_REF_IRR_IFI",
    "ID_PROSPECT",
    "ID_REF_REP_BDREINC",
    "DT_AB_REF_BDREINC",
    "DT_REF_FECH_BDREINC",
    "DIAS_REF_BDREINC",
    "FLAG_BDREINC",
    "PAPEL",
    "ENCERRADO_POR",
    "STATUS_OS",
    "FLAG_IFI_TT",
    "FLAG_IRR_TT",
    "ID_REF_REP_IRR_IFI_TT",
    "DT_REF_FECH_IRR_IFI_TT",
    "DIAS_REF_IRR_IFI_TT",
    "FLAG_IRR_SC",
    "ID_REF_REP_IRR_SC",
    "DT_REF_FECH_IRR_SC",
    "DIAS_REF_IRR_SC",
    "LOGIN_PLANO",
    "ID_SA",
    "ID_CONTRATO",
    "CRIADA_CRITICA",
    "cluster",
]


# -----------------------------
# Logs
# -----------------------------
def configurar_logs() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


# -----------------------------
# Utilitarios
# -----------------------------
def env_obrigatoria(nome: str) -> str:
    valor = os.getenv(nome)
    if valor is None or valor.strip() == "":
        raise RuntimeError(f"Variavel de ambiente obrigatoria nao encontrada: {nome}")
    return valor.strip()


def env_int(nome: str, valor_padrao: int) -> int:
    valor = os.getenv(nome)
    if not valor:
        return valor_padrao
    try:
        return int(valor)
    except ValueError as exc:
        raise RuntimeError(f"Variavel {nome} precisa ser numero inteiro. Valor recebido: {valor}") from exc


def quote_ident(nome: str) -> str:
    """Protege nomes de banco, tabela e coluna com crase."""
    return "`" + nome.replace("`", "``") + "`"


def normalizar_valor(valor: Any) -> str:
    """Converte valores para texto estavel, usado na chave unica."""
    if valor is None:
        return ""
    if isinstance(valor, datetime):
        return valor.strftime("%Y-%m-%d %H:%M:%S")
    if isinstance(valor, date):
        return valor.strftime("%Y-%m-%d")
    if isinstance(valor, Decimal):
        return str(valor)
    return str(valor).strip()


def parse_datetime(valor: Any, nome_campo: str) -> datetime:
    if isinstance(valor, datetime):
        return valor
    if isinstance(valor, date):
        return datetime.combine(valor, datetime.min.time())
    if isinstance(valor, str):
        valor_limpo = valor.strip()
        formatos = (
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d",
            "%d/%m/%Y %H:%M:%S",
            "%d/%m/%Y",
        )
        for formato in formatos:
            try:
                return datetime.strptime(valor_limpo, formato)
            except ValueError:
                continue

    raise RuntimeError(
        f"Valor invalido para {nome_campo}: {valor!r}. "
        "Use o formato YYYY-MM-DD HH:MM:SS."
    )


def chunks(lista: Sequence[str], tamanho: int) -> Iterable[Sequence[str]]:
    for i in range(0, len(lista), tamanho):
        yield lista[i : i + tamanho]


# -----------------------------
# Configuracao das conexoes
# -----------------------------
def carregar_config() -> Dict[str, Any]:
    return {
        "origem": {
            "host": os.getenv("MYSQL_ORIGEM_HOST", "cl-mysql-prd.intradesk"),
            "port": env_int("MYSQL_ORIGEM_PORT", 6447),
            "database": os.getenv("MYSQL_ORIGEM_DATABASE", "dbplanp02"),
            "user": env_obrigatoria("MYSQL_ORIGEM_USER"),
            "password": env_obrigatoria("MYSQL_ORIGEM_PASSWORD"),
        },
        "destino": {
            "host": os.getenv("MYSQL_DESTINO_HOST", "172.29.5.3"),
            "port": env_int("MYSQL_DESTINO_PORT", 3306),
            "database": os.getenv("MYSQL_DESTINO_DATABASE", "db_Melhoria_continua_operacoes"),
            "user": env_obrigatoria("MYSQL_DESTINO_USER"),
            "password": env_obrigatoria("MYSQL_DESTINO_PASSWORD"),
        },
        "tabela_destino": os.getenv("DESTINO_TABELA", DESTINO_TABELA_PADRAO),
        "batch_size": env_int("BATCH_SIZE", BATCH_SIZE_PADRAO),
        "periodo_inicio": os.getenv("PERIODO_FECHAMENTO_INICIO", PERIODO_INICIO_PADRAO),
    }


def conectar_mysql(config: Dict[str, Any], usar_database: bool = True):
    params = {
        "host": config["host"],
        "port": config["port"],
        "user": config["user"],
        "password": config["password"],
        "connection_timeout": 30,
        "autocommit": False,
        "use_pure": True,
    }
    if usar_database:
        params["database"] = config["database"]

    return mysql.connector.connect(**params)


# -----------------------------
# Banco e tabela destino
# -----------------------------
def criar_database_destino(config_destino: Dict[str, Any]) -> None:
    conn = None
    cursor = None
    try:
        conn = conectar_mysql(config_destino, usar_database=False)
        conn.autocommit = True
        cursor = conn.cursor()
        sql = f"""
            CREATE DATABASE IF NOT EXISTS {quote_ident(config_destino['database'])}
            DEFAULT CHARACTER SET utf8mb4
            COLLATE utf8mb4_0900_ai_ci
        """
        cursor.execute(sql)
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


def criar_ou_verificar_tabela(conn, database: str, tabela: str) -> None:
    cursor = conn.cursor()
    try:
        colunas_sql = ",\n".join(
            f"    {quote_ident(coluna)} LONGTEXT NULL" for coluna in SELECT_COLUMNS
        )

        sql_create = f"""
            CREATE TABLE IF NOT EXISTS {quote_ident(database)}.{quote_ident(tabela)} (
                `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                `chave_unica` VARCHAR(64) NOT NULL,
{colunas_sql},
                `data_carga` DATETIME NULL,
                `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uk_view_bsc_chave_unica` (`chave_unica`)
            ) ENGINE=InnoDB
              DEFAULT CHARSET=utf8mb4
              COLLATE=utf8mb4_0900_ai_ci
        """
        cursor.execute(sql_create)

        cursor.execute(
            """
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = %s
              AND TABLE_NAME = %s
            """,
            (database, tabela),
        )
        colunas_existentes = {linha[0] for linha in cursor.fetchall()}

        for coluna in SELECT_COLUMNS:
            if coluna not in colunas_existentes:
                logging.info("Coluna ausente no destino. Criando coluna: %s", coluna)
                cursor.execute(
                    f"ALTER TABLE {quote_ident(database)}.{quote_ident(tabela)} "
                    f"ADD COLUMN {quote_ident(coluna)} LONGTEXT NULL"
                )

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()


def truncar_tabela_destino(conn, database: str, tabela: str) -> None:
    cursor = conn.cursor()
    try:
        cursor.execute(f"TRUNCATE TABLE {quote_ident(database)}.{quote_ident(tabela)}")
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()


# -----------------------------
# Consulta origem
# -----------------------------
def montar_query_origem(database_origem: str) -> str:
    colunas = ",\n    ".join(quote_ident(coluna) for coluna in SELECT_COLUMNS)
    return f"""
        SELECT
            {colunas}
        FROM {quote_ident(database_origem)}.`VIEW_BSC`
        WHERE `PERIODO_FECHAMENTO` >= %s
    """


# -----------------------------
# Chave unica / anti-duplicidade
# -----------------------------
def montar_chave_unica(row: Dict[str, Any]) -> str:
    """
    Cria uma chave unica segura para evitar duplicidade.

    Preferencia:
      1. ID_OSS + ID_ATENDIMENTO
      2. ID_OSS
      3. ID_ATENDIMENTO
      4. ID_SA
      5. Fallback: hash dos campos principais

    A chave final e SHA-256 para ficar curta, padronizada e segura para indice unico.
    """
    id_oss = normalizar_valor(row.get("ID_OSS"))
    id_atendimento = normalizar_valor(row.get("ID_ATENDIMENTO"))
    id_sa = normalizar_valor(row.get("ID_SA"))

    if id_oss and id_atendimento:
        base = f"ID_OSS={id_oss}|ID_ATENDIMENTO={id_atendimento}"
    elif id_oss:
        base = f"ID_OSS={id_oss}"
    elif id_atendimento:
        base = f"ID_ATENDIMENTO={id_atendimento}"
    elif id_sa:
        base = f"ID_SA={id_sa}"
    else:
        campos_fallback = [
            "ID_CLIENTE",
            "PERIODO_FECHAMENTO",
            "DT_FECHAMENTO",
            "LOGIN_TECNICO",
            "TIPO_OS",
            "CIDADE",
            "STATUS_OS",
        ]
        base = "|".join(f"{campo}={normalizar_valor(row.get(campo))}" for campo in campos_fallback)

    return hashlib.sha256(base.encode("utf-8")).hexdigest()


def preparar_lote(
    rows: List[Dict[str, Any]],
    periodo_inicio: datetime,
) -> Tuple[List[Tuple[Any, ...]], int, int]:
    """
    Prepara o lote para INSERT.
    Se houver duplicidade dentro do mesmo lote, mantem o ultimo registro da chave.
    """
    agora = datetime.now()
    por_chave: Dict[str, Tuple[Any, ...]] = {}
    ignorados_por_periodo = 0

    for row in rows:
        periodo_fechamento = row.get("PERIODO_FECHAMENTO")
        if periodo_fechamento is None or parse_datetime(periodo_fechamento, "PERIODO_FECHAMENTO") < periodo_inicio:
            ignorados_por_periodo += 1
            continue

        chave = montar_chave_unica(row)
        valores = [chave]
        valores.extend(row.get(coluna) for coluna in SELECT_COLUMNS)
        valores.append(agora)
        por_chave[chave] = tuple(valores)

    duplicados_no_lote = (len(rows) - ignorados_por_periodo) - len(por_chave)
    return list(por_chave.values()), duplicados_no_lote, ignorados_por_periodo


def buscar_chaves_existentes(conn, database: str, tabela: str, chaves: Sequence[str]) -> Set[str]:
    if not chaves:
        return set()

    existentes: Set[str] = set()
    cursor = conn.cursor()
    try:
        for parte in chunks(chaves, 1000):
            placeholders = ", ".join(["%s"] * len(parte))
            sql = (
                f"SELECT `chave_unica` "
                f"FROM {quote_ident(database)}.{quote_ident(tabela)} "
                f"WHERE `chave_unica` IN ({placeholders})"
            )
            cursor.execute(sql, list(parte))
            existentes.update(linha[0] for linha in cursor.fetchall())
    finally:
        cursor.close()

    return existentes


# -----------------------------
# Upsert no destino
# -----------------------------
def executar_upsert(conn, database: str, tabela: str, registros: List[Tuple[Any, ...]]) -> int:
    if not registros:
        return 0

    cursor = conn.cursor()
    try:
        colunas_insert = ["chave_unica"] + SELECT_COLUMNS + ["data_carga"]
        colunas_sql = ", ".join(quote_ident(coluna) for coluna in colunas_insert)
        placeholders = ", ".join(["%s"] * len(colunas_insert))

        updates = ",\n                ".join(
            f"{quote_ident(coluna)} = VALUES({quote_ident(coluna)})"
            for coluna in SELECT_COLUMNS
        )
        updates += ",\n                `data_carga` = VALUES(`data_carga`)"
        updates += ",\n                `data_atualizacao` = CURRENT_TIMESTAMP"

        sql = f"""
            INSERT INTO {quote_ident(database)}.{quote_ident(tabela)}
                ({colunas_sql})
            VALUES
                ({placeholders})
            ON DUPLICATE KEY UPDATE
                {updates}
        """

        cursor.executemany(sql, registros)
        return cursor.rowcount
    finally:
        cursor.close()


# -----------------------------
# Processo principal
# -----------------------------
def main() -> None:
    configurar_logs()
    inicio = time.time()

    origem_conn = None
    destino_conn = None
    origem_cursor = None

    total_lidos = 0
    total_unicos_enviados = 0
    total_inseridos_estimado = 0
    total_atualizados_estimado = 0
    total_duplicados_no_lote = 0
    total_ignorados_por_periodo = 0
    total_afetados_mysql = 0

    try:
        logging.info("Inicio do processo de carga VIEW_BSC.")

        config = carregar_config()
        origem_cfg = config["origem"]
        destino_cfg = config["destino"]
        database_destino = destino_cfg["database"]
        tabela_destino = config["tabela_destino"]
        batch_size = config["batch_size"]

        periodo_inicio_minimo = parse_datetime(PERIODO_INICIO_PADRAO, "PERIODO_INICIO_PADRAO")
        periodo_inicio_configurado = parse_datetime(config["periodo_inicio"], "PERIODO_FECHAMENTO_INICIO")
        periodo_inicio = max(periodo_inicio_configurado, periodo_inicio_minimo)
        if periodo_inicio_configurado < periodo_inicio_minimo:
            logging.warning(
                "PERIODO_FECHAMENTO_INICIO configurado (%s) menor que o minimo permitido (%s). Usando %s.",
                periodo_inicio_configurado.strftime("%Y-%m-%d %H:%M:%S"),
                periodo_inicio_minimo.strftime("%Y-%m-%d %H:%M:%S"),
                periodo_inicio.strftime("%Y-%m-%d %H:%M:%S"),
            )

        logging.info("Conectando na origem: %s:%s/%s", origem_cfg["host"], origem_cfg["port"], origem_cfg["database"])
        origem_conn = conectar_mysql(origem_cfg, usar_database=True)
        logging.info("Conexao com origem realizada com sucesso.")

        logging.info("Criando/verificando banco de destino: %s", database_destino)
        criar_database_destino(destino_cfg)

        logging.info("Conectando no destino: %s:%s/%s", destino_cfg["host"], destino_cfg["port"], database_destino)
        destino_conn = conectar_mysql(destino_cfg, usar_database=True)
        logging.info("Conexao com destino realizada com sucesso.")

        logging.info("Criando/verificando tabela de destino: %s.%s", database_destino, tabela_destino)
        criar_ou_verificar_tabela(destino_conn, database_destino, tabela_destino)
        logging.info("Tabela verificada/criada com sucesso.")

        if os.getenv("TRUNCAR_DESTINO_ANTES_CARGA", "").strip().lower() in {"1", "true", "sim", "yes"}:
            logging.warning("Truncando tabela de destino antes da carga: %s.%s", database_destino, tabela_destino)
            truncar_tabela_destino(destino_conn, database_destino, tabela_destino)
            logging.info("Tabela de destino truncada com sucesso.")

        query_origem = montar_query_origem(origem_cfg["database"])
        origem_cursor = origem_conn.cursor(dictionary=True, buffered=False)

        logging.info(
            "Executando consulta na origem com PERIODO_FECHAMENTO >= %s",
            periodo_inicio.strftime("%Y-%m-%d %H:%M:%S"),
        )
        origem_cursor.execute(query_origem, (periodo_inicio,))

        while True:
            rows = origem_cursor.fetchmany(batch_size)
            if not rows:
                break

            total_lidos += len(rows)
            registros, duplicados_no_lote, ignorados_por_periodo = preparar_lote(rows, periodo_inicio)
            total_duplicados_no_lote += duplicados_no_lote
            total_ignorados_por_periodo += ignorados_por_periodo

            chaves_lote = [registro[0] for registro in registros]
            chaves_existentes = buscar_chaves_existentes(destino_conn, database_destino, tabela_destino, chaves_lote)

            inseridos_estimado = len(registros) - len(chaves_existentes)
            atualizados_estimado = len(chaves_existentes)

            total_inseridos_estimado += inseridos_estimado
            total_atualizados_estimado += atualizados_estimado
            total_unicos_enviados += len(registros)

            afetados_mysql = executar_upsert(destino_conn, database_destino, tabela_destino, registros)
            destino_conn.commit()
            total_afetados_mysql += afetados_mysql

            logging.info(
                "Lote processado | lidos=%s | unicos_enviados=%s | inseridos_estimado=%s | atualizados_estimado=%s | duplicados_no_lote=%s | ignorados_por_periodo=%s | total_lidos=%s",
                len(rows),
                len(registros),
                inseridos_estimado,
                atualizados_estimado,
                duplicados_no_lote,
                ignorados_por_periodo,
                total_lidos,
            )

        duracao = time.time() - inicio
        logging.info("Fim do processo de carga VIEW_BSC.")
        logging.info("Total de registros lidos da origem: %s", total_lidos)
        logging.info("Total de registros unicos enviados ao destino: %s", total_unicos_enviados)
        logging.info("Total estimado de registros inseridos: %s", total_inseridos_estimado)
        logging.info("Total estimado de registros atualizados: %s", total_atualizados_estimado)
        logging.info("Total de duplicados encontrados dentro dos lotes: %s", total_duplicados_no_lote)
        logging.info(
            "Total de registros ignorados por PERIODO_FECHAMENTO menor que %s: %s",
            periodo_inicio.strftime("%Y-%m-%d %H:%M:%S"),
            total_ignorados_por_periodo,
        )
        logging.info("Total afetado pelo MySQL: %s", total_afetados_mysql)
        logging.info("Tempo total: %.2f segundos", duracao)

    except Error as exc:
        if destino_conn:
            destino_conn.rollback()
        logging.exception("Erro MySQL durante a carga: %s", exc)
        sys.exit(1)

    except Exception as exc:
        if destino_conn:
            destino_conn.rollback()
        logging.exception("Erro inesperado durante a carga: %s", exc)
        sys.exit(1)

    finally:
        if origem_cursor:
            origem_cursor.close()

        if origem_conn and origem_conn.is_connected():
            origem_conn.close()
            logging.info("Conexao com origem fechada.")

        if destino_conn and destino_conn.is_connected():
            destino_conn.close()
            logging.info("Conexao com destino fechada.")


if __name__ == "__main__":
    main()
