#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cria a view de cruzamento entre garantias e BSC no banco destino.

View destino:
  db_Melhoria_continua_operacoes.vw_garantias_bsc_motivos

Seguranca:
  - Nao altera tabelas.
  - Se ja existir uma tabela ou view com o nome destino, o processo para.
"""

import logging
import os
import sys
from typing import Any, Dict

import mysql.connector
from dotenv import load_dotenv
from mysql.connector import Error


load_dotenv()


VIEW_DESTINO_PADRAO = "vw_garantias_bsc_motivos"


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


def carregar_config() -> Dict[str, Any]:
    return {
        "destino": {
            "host": os.getenv("MYSQL_DESTINO_HOST", "172.29.5.3"),
            "port": env_int("MYSQL_DESTINO_PORT", 3306),
            "database": os.getenv("MYSQL_DESTINO_DATABASE", "db_Melhoria_continua_operacoes"),
            "user": env_obrigatoria("MYSQL_DESTINO_USER"),
            "password": env_obrigatoria("MYSQL_DESTINO_PASSWORD"),
        },
        "view_destino": os.getenv("VW_GARANTIAS_BSC_MOTIVOS", VIEW_DESTINO_PADRAO),
    }


def conectar_mysql(config: Dict[str, Any]):
    return mysql.connector.connect(
        host=config["host"],
        port=config["port"],
        database=config["database"],
        user=config["user"],
        password=config["password"],
        connection_timeout=30,
        autocommit=False,
        use_pure=True,
    )


def objeto_existente(conn, database: str, nome: str) -> str | None:
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT TABLE_TYPE
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = %s
              AND TABLE_NAME = %s
            """,
            (database, nome),
        )
        row = cursor.fetchone()
        return None if row is None else row[0]
    finally:
        cursor.close()


def criar_view(conn, database: str, view_nome: str) -> None:
    tipo_existente = objeto_existente(conn, database, view_nome)
    if tipo_existente is not None:
        raise RuntimeError(
            f"Objeto {database}.{view_nome} ja existe como {tipo_existente}. "
            "Criacao cancelada para nao sobrescrever nada."
        )

    cursor = conn.cursor()
    try:
        sql = f"""
            CREATE VIEW {quote_ident(database)}.{quote_ident(view_nome)} AS
            SELECT
                g.`DESC_TIPO_GARANTIA`,
                g.`EMPRESA_ORIGEM`,
                g.`FLAG_IG`,
                g.`TIPO_GARANTIA`,
                g.`ID_CLIENTE`,
                g.`DIAS_GARANTIA`,
                g.`ID_ATENDIMENTO_A`,
                g.`ID_OSS_A`,
                g.`TIPO_OS_A`,
                g.`DT_ABERTURA_A`,
                g.`DT_FECHAMENTO_A`,
                g.`LOGIN_TECNICO_A`,
                g.`EMPRESA_TECNICO_A`,
                g.`ID_ATENDIMENTO_B`,
                g.`ID_OSS_B`,
                g.`TIPO_OS_B`,
                g.`DT_ABERTURA_B`,
                g.`DT_FECHAMENTO_B`,
                g.`EMPRESA_TECNICO_B`,
                b.`motivo_abertura` AS `MOTIVO_ABERT_B`,
                b.`detalhe_encerr` AS `ENCERRAM_B`
            FROM {quote_ident(database)}.`view_garantias_dt_fechamento_b` g
            LEFT JOIN {quote_ident(database)}.`view_bsc_periodo_fechamento` b
                ON TRIM(g.`ID_OSS_B`) = TRIM(b.`ID_OSS`)
               AND TRIM(g.`ID_ATENDIMENTO_B`) = TRIM(b.`ID_ATENDIMENTO`)
            WHERE g.`DT_FECHAMENTO_B` >= '2026-06-01'
        """
        cursor.execute(sql)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()


def validar_view(conn, database: str, view_nome: str) -> None:
    cursor = conn.cursor()
    try:
        cursor.execute(
            f"""
            SELECT COUNT(*)
            FROM {quote_ident(database)}.{quote_ident(view_nome)}
            """
        )
        total = cursor.fetchone()[0]

        cursor.execute(
            f"""
            SELECT COUNT(*)
            FROM {quote_ident(database)}.{quote_ident(view_nome)}
            WHERE `MOTIVO_ABERT_B` IS NOT NULL
               OR `ENCERRAM_B` IS NOT NULL
            """
        )
        preenchidos = cursor.fetchone()[0]

        logging.info("View validada: %s.%s", database, view_nome)
        logging.info("Total de linhas retornadas: %s", total)
        logging.info("Linhas com MOTIVO_ABERT_B ou ENCERRAM_B preenchido: %s", preenchidos)
    finally:
        cursor.close()


def main() -> None:
    configurar_logs()
    conn = None
    try:
        config = carregar_config()
        destino_cfg = config["destino"]
        database = destino_cfg["database"]
        view_nome = config["view_destino"]

        logging.info("Conectando no destino: %s:%s/%s", destino_cfg["host"], destino_cfg["port"], database)
        conn = conectar_mysql(destino_cfg)
        logging.info("Conexao com destino realizada com sucesso.")

        logging.info("Criando view: %s.%s", database, view_nome)
        criar_view(conn, database, view_nome)
        logging.info("View criada com sucesso.")

        validar_view(conn, database, view_nome)

    except Error as exc:
        if conn:
            conn.rollback()
        logging.exception("Erro MySQL durante a criacao da view: %s", exc)
        sys.exit(1)
    except Exception as exc:
        if conn:
            conn.rollback()
        logging.exception("Erro inesperado durante a criacao da view: %s", exc)
        sys.exit(1)
    finally:
        if conn and conn.is_connected():
            conn.close()
            logging.info("Conexao com destino fechada.")


if __name__ == "__main__":
    main()
