#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Carga incremental da view VIEW_ORDENS_SF para uma tabela nova no destino.

Tabela destino padrao:
  db_Melhoria_continua_operacoes.view_ordens_sf_dt_criacao_sa

Seguranca:
  - Nao altera tabelas pre-existentes.
  - Se a tabela destino ja existir e nao tiver sido criada por este script,
    o processo para antes de carregar dados.
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


load_dotenv()


DESTINO_TABELA_PADRAO = "view_ordens_sf_dt_criacao_sa"
PERIODO_INICIO_PADRAO = "2026-06-01"
BATCH_SIZE_PADRAO = 1000
TABLE_COMMENT = "Criada por load_view_ordens_sf.py"


SELECT_COLUMNS = [
    "work_order_number",
    "case_number",
    "motivo_caso",
    "submotivo_caso",
    "codigo_baixa",
    "dt_criacao_sa",
]


def configurar_logs() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


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
    return "`" + nome.replace("`", "``") + "`"


def normalizar_valor(valor: Any) -> str:
    if valor is None:
        return ""
    if isinstance(valor, datetime):
        return valor.strftime("%Y-%m-%d %H:%M:%S")
    if isinstance(valor, date):
        return valor.strftime("%Y-%m-%d")
    if isinstance(valor, Decimal):
        return str(valor)
    return str(valor).strip()


def chunks(lista: Sequence[str], tamanho: int) -> Iterable[Sequence[str]]:
    for i in range(0, len(lista), tamanho):
        yield lista[i : i + tamanho]


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
        "tabela_destino": os.getenv("ORDENS_SF_DESTINO_TABELA", DESTINO_TABELA_PADRAO),
        "batch_size": env_int("BATCH_SIZE", BATCH_SIZE_PADRAO),
        "periodo_inicio": os.getenv("ORDENS_SF_DT_CRIACAO_SA_INICIO", PERIODO_INICIO_PADRAO),
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


def criar_database_destino(config_destino: Dict[str, Any]) -> None:
    conn = None
    cursor = None
    try:
        conn = conectar_mysql(config_destino, usar_database=False)
        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute(
            f"""
            CREATE DATABASE IF NOT EXISTS {quote_ident(config_destino['database'])}
            DEFAULT CHARACTER SET utf8mb4
            COLLATE utf8mb4_0900_ai_ci
            """
        )
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


def consultar_comentario_tabela(conn, database: str, tabela: str) -> str | None:
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT TABLE_COMMENT
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = %s
              AND TABLE_NAME = %s
            """,
            (database, tabela),
        )
        row = cursor.fetchone()
        return None if row is None else row[0]
    finally:
        cursor.close()


def criar_tabela_destino(conn, database: str, tabela: str) -> None:
    comentario = consultar_comentario_tabela(conn, database, tabela)
    if comentario is not None:
        if comentario != TABLE_COMMENT:
            raise RuntimeError(
                f"Tabela {database}.{tabela} ja existe e nao foi criada por este script. "
                "Carga cancelada para nao alterar tabela existente."
            )
        logging.info("Tabela destino ja existe e tem marcador deste script: %s.%s", database, tabela)
        return

    cursor = conn.cursor()
    try:
        colunas_sql = ",\n".join(
            f"    {quote_ident(coluna)} LONGTEXT NULL" for coluna in SELECT_COLUMNS
        )
        cursor.execute(
            f"""
            CREATE TABLE {quote_ident(database)}.{quote_ident(tabela)} (
                `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                `chave_unica` VARCHAR(64) NOT NULL,
{colunas_sql},
                `data_carga` DATETIME NULL,
                `data_atualizacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uk_ordens_sf_chave_unica` (`chave_unica`)
            ) ENGINE=InnoDB
              DEFAULT CHARSET=utf8mb4
              COLLATE=utf8mb4_0900_ai_ci
              COMMENT={repr(TABLE_COMMENT)}
            """
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()


def montar_query_origem(database_origem: str) -> str:
    colunas = ",\n    ".join(quote_ident(coluna) for coluna in SELECT_COLUMNS)
    return f"""
        SELECT
            {colunas}
        FROM {quote_ident(database_origem)}.`VIEW_ORDENS_SF`
        WHERE `dt_criacao_sa` >= %s
    """


def montar_chave_unica(row: Dict[str, Any]) -> str:
    work_order_number = normalizar_valor(row.get("work_order_number"))
    case_number = normalizar_valor(row.get("case_number"))
    dt_criacao_sa = normalizar_valor(row.get("dt_criacao_sa"))

    if work_order_number and case_number:
        base = f"work_order_number={work_order_number}|case_number={case_number}"
    elif work_order_number:
        base = f"work_order_number={work_order_number}"
    elif case_number:
        base = f"case_number={case_number}|dt_criacao_sa={dt_criacao_sa}"
    else:
        base = "|".join(f"{campo}={normalizar_valor(row.get(campo))}" for campo in SELECT_COLUMNS)

    return hashlib.sha256(base.encode("utf-8")).hexdigest()


def preparar_lote(rows: List[Dict[str, Any]]) -> Tuple[List[Tuple[Any, ...]], int]:
    agora = datetime.now()
    por_chave: Dict[str, Tuple[Any, ...]] = {}

    for row in rows:
        chave = montar_chave_unica(row)
        valores = [chave]
        valores.extend(row.get(coluna) for coluna in SELECT_COLUMNS)
        valores.append(agora)
        por_chave[chave] = tuple(valores)

    duplicados_no_lote = len(rows) - len(por_chave)
    return list(por_chave.values()), duplicados_no_lote


def buscar_chaves_existentes(conn, database: str, tabela: str, chaves: Sequence[str]) -> Set[str]:
    if not chaves:
        return set()

    existentes: Set[str] = set()
    cursor = conn.cursor()
    try:
        for parte in chunks(chaves, 1000):
            placeholders = ", ".join(["%s"] * len(parte))
            cursor.execute(
                f"""
                SELECT `chave_unica`
                FROM {quote_ident(database)}.{quote_ident(tabela)}
                WHERE `chave_unica` IN ({placeholders})
                """,
                list(parte),
            )
            existentes.update(linha[0] for linha in cursor.fetchall())
    finally:
        cursor.close()

    return existentes


def executar_upsert(conn, database: str, tabela: str, registros: List[Tuple[Any, ...]]) -> int:
    if not registros:
        return 0

    cursor = conn.cursor()
    try:
        colunas_insert = ["chave_unica"] + SELECT_COLUMNS + ["data_carga"]
        colunas_sql = ", ".join(quote_ident(coluna) for coluna in colunas_insert)
        placeholders = ", ".join(["%s"] * len(colunas_insert))
        updates = ",\n                ".join(
            f"{quote_ident(coluna)} = VALUES({quote_ident(coluna)})" for coluna in SELECT_COLUMNS
        )
        updates += ",\n                `data_carga` = VALUES(`data_carga`)"
        updates += ",\n                `data_atualizacao` = CURRENT_TIMESTAMP"

        cursor.executemany(
            f"""
            INSERT INTO {quote_ident(database)}.{quote_ident(tabela)}
                ({colunas_sql})
            VALUES
                ({placeholders})
            ON DUPLICATE KEY UPDATE
                {updates}
            """,
            registros,
        )
        return cursor.rowcount
    finally:
        cursor.close()


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
    total_afetados_mysql = 0

    try:
        logging.info("Inicio do processo de carga VIEW_ORDENS_SF.")
        config = carregar_config()
        origem_cfg = config["origem"]
        destino_cfg = config["destino"]
        database_destino = destino_cfg["database"]
        tabela_destino = config["tabela_destino"]
        batch_size = config["batch_size"]
        periodo_inicio = config["periodo_inicio"]

        logging.info("Conectando na origem: %s:%s/%s", origem_cfg["host"], origem_cfg["port"], origem_cfg["database"])
        origem_conn = conectar_mysql(origem_cfg, usar_database=True)
        logging.info("Conexao com origem realizada com sucesso.")

        logging.info("Criando/verificando banco de destino: %s", database_destino)
        criar_database_destino(destino_cfg)

        logging.info("Conectando no destino: %s:%s/%s", destino_cfg["host"], destino_cfg["port"], database_destino)
        destino_conn = conectar_mysql(destino_cfg, usar_database=True)
        logging.info("Conexao com destino realizada com sucesso.")

        logging.info("Criando tabela destino, se ainda nao existir: %s.%s", database_destino, tabela_destino)
        criar_tabela_destino(destino_conn, database_destino, tabela_destino)
        logging.info("Tabela destino pronta.")

        query_origem = montar_query_origem(origem_cfg["database"])
        origem_cursor = origem_conn.cursor(dictionary=True, buffered=False)

        logging.info("Executando consulta na origem com dt_criacao_sa >= %s", periodo_inicio)
        origem_cursor.execute(query_origem, (periodo_inicio,))

        while True:
            rows = origem_cursor.fetchmany(batch_size)
            if not rows:
                break

            total_lidos += len(rows)
            registros, duplicados_no_lote = preparar_lote(rows)
            total_duplicados_no_lote += duplicados_no_lote

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
                "Lote processado | lidos=%s | unicos_enviados=%s | inseridos_estimado=%s | atualizados_estimado=%s | duplicados_no_lote=%s | total_lidos=%s",
                len(rows),
                len(registros),
                inseridos_estimado,
                atualizados_estimado,
                duplicados_no_lote,
                total_lidos,
            )

        duracao = time.time() - inicio
        logging.info("Fim do processo de carga VIEW_ORDENS_SF.")
        logging.info("Total de registros lidos da origem: %s", total_lidos)
        logging.info("Total de registros unicos enviados ao destino: %s", total_unicos_enviados)
        logging.info("Total estimado de registros inseridos: %s", total_inseridos_estimado)
        logging.info("Total estimado de registros atualizados: %s", total_atualizados_estimado)
        logging.info("Total de duplicados encontrados dentro dos lotes: %s", total_duplicados_no_lote)
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
