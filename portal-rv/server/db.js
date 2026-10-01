import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

function envObrigatoria(nome) {
  const valor = process.env[nome]
  if (!valor || !valor.trim()) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${nome}`)
  }
  return valor.trim()
}

export const pool = mysql.createPool({
  host: process.env.MYSQL_ORIGEM_HOST || 'cl-mysql-prd.intradesk',
  port: Number(process.env.MYSQL_ORIGEM_PORT || 6447),
  database: process.env.MYSQL_ORIGEM_DATABASE || 'dbplanp02',
  user: envObrigatoria('MYSQL_ORIGEM_USER'),
  password: envObrigatoria('MYSQL_ORIGEM_PASSWORD'),
  connectTimeout: 15000,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
})
