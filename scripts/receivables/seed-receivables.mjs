#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const MONTH_REMAP = {
  1: 7,
  2: 8,
  3: 9,
  4: 10,
  5: 11,
  6: 12,
  7: 1,
  8: 2,
  9: 3,
  10: 4,
  11: 5,
  12: 6
};

const MONTH_BY_NAME = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12
};

const PAYMENT_METHOD_INT = {
  Boleto: 1,
  Debit: 2,
  Credit: 3,
  Deposit: 4,
  Pix: 5
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const cwd = process.cwd();
  const sourcePath = path.resolve(cwd, args.source ?? 'receivables_2024_organizado.csv');
  const outputDir = path.resolve(cwd, args.outputDir ?? 'scripts/receivables/output');
  const jsonOutPath = path.join(outputDir, 'receivables_seed_historico.json');
  const sqlOutPath = path.join(outputDir, 'receivables_seed_historico.sql');
  const summaryOutPath = path.join(outputDir, 'receivables_seed_historico_summary.json');
  const apiUrl = args.apiUrl ?? 'http://localhost:15125/api/receivables';

  const csv = await fs.readFile(sourcePath, 'utf8');
  const rows = parseCsv(csv);
  const now = new Date();
  const today = atUtcDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());

  const payloads = [];
  const skipped = [];

  rows.forEach((row, index) => {
    const payload = mapRowToPayload(row, index, today);
    if (!payload) {
      skipped.push({
        line: index + 2,
        customer: row.Cliente ?? '',
        reason: 'invalid-or-empty-amount'
      });
      return;
    }
    payloads.push(payload);
  });

  const summary = buildSummary(payloads, skipped.length, sourcePath, apiUrl, today);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(jsonOutPath, `${JSON.stringify(payloads, null, 2)}\n`, 'utf8');
  await fs.writeFile(sqlOutPath, toSql(payloads), 'utf8');
  await fs.writeFile(summaryOutPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  let inserted = 0;
  let failed = [];
  if (args.insert) {
    const result = await insertViaApi(payloads, apiUrl);
    inserted = result.inserted;
    failed = result.failed;
  }

  const report = {
    sourcePath,
    generated: {
      json: jsonOutPath,
      sql: sqlOutPath,
      summary: summaryOutPath
    },
    totals: summary.totals,
    statusAfterTransform: summary.statusAfterTransform,
    skippedRows: skipped.length,
    inserted,
    failedInserts: failed.length
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  if (failed.length) {
    process.stdout.write('\nFalhas de insercao (primeiras 10):\n');
    failed.slice(0, 10).forEach((item) => {
      process.stdout.write(`- ${item.index}: HTTP ${item.status} ${item.statusText}\n`);
    });
  }
}

function parseArgs(argv) {
  const result = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      result.help = true;
      continue;
    }
    if (token === '--insert') {
      result.insert = true;
      continue;
    }
    if (token.startsWith('--source=')) {
      result.source = token.slice('--source='.length);
      continue;
    }
    if (token === '--source') {
      result.source = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--output-dir=')) {
      result.outputDir = token.slice('--output-dir='.length);
      continue;
    }
    if (token === '--output-dir') {
      result.outputDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--api-url=')) {
      result.apiUrl = token.slice('--api-url='.length);
      continue;
    }
    if (token === '--api-url') {
      result.apiUrl = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return result;
}

function printHelp() {
  process.stdout.write(`Uso:
  node scripts/receivables/seed-receivables.mjs [opcoes]

Opcoes:
  --source <arquivo.csv>       CSV base (default: receivables_2024_organizado.csv)
  --output-dir <dir>           Diretorio de saida (default: scripts/receivables/output)
  --api-url <url>              Endpoint de create receivables (default: http://localhost:15125/api/receivables)
  --insert                     Envia os registros para API apos gerar arquivos
  -h, --help                   Exibe ajuda
`);
}

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(current);
      current = '';
      if (row.length > 1 || row[0]) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const header = rows[0].map((item) => item.trim());
  return rows.slice(1).map((values) => {
    const obj = {};
    header.forEach((name, index) => {
      obj[name] = (values[index] ?? '').trim();
    });
    return obj;
  });
}

function mapRowToPayload(row, index, today) {
  const grossAmount = round2(parseDecimal(row.ValorBruto));
  if (grossAmount <= 0) {
    return null;
  }

  let issAmount = round2(Math.max(0, parseDecimal(row.ISS)));
  if (issAmount > grossAmount) {
    issAmount = grossAmount;
  }

  let netAmount = round2(parseDecimal(row.Liquido));
  if (netAmount <= 0 || netAmount > grossAmount) {
    netAmount = round2(grossAmount - issAmount);
  }

  let amountReceived = round2(Math.max(0, parseDecimal(row.Recebido)));
  if (amountReceived > netAmount) {
    amountReceived = netAmount;
  }

  const outstanding = round2(netAmount - amountReceived);
  const isSettled = outstanding <= 0.005;

  const fallbackCustomer = `Cliente ${String(index + 1).padStart(3, '0')}`;
  const customerName = sanitizeText(row.Cliente, fallbackCustomer, 150);
  const serviceDescription = sanitizeText(row.Servico, 'Servico geral', 255);
  const serviceOrderNumber = sanitizeOptional(row.NumeroOS, 50);
  let invoiceNumber = sanitizeOptional(row.NF, 50);
  const paymentMethod = mapPaymentMethod(row.FormaPagamento);

  const dueRaw = parseFlexibleDate(row.Vencimento);
  const serviceRaw = parseFlexibleDate(row.DataServico);
  const issueRaw = parseFlexibleDate(row.DataEmissao);

  const sourceMonth = dueRaw ? dueRaw.month : monthFromName(row.Mes) ?? ((index % 12) + 1);
  let dueDate = remapDateFromParts(
    sourceMonth,
    dueRaw ? dueRaw.day : ((index % 27) + 1),
    today
  );

  if (!isSettled) {
    const bucket = index % 5;
    if (bucket === 0) {
      dueDate = addDays(today, -((index % 18) + 1));
    } else if (bucket === 1) {
      dueDate = today;
    } else if (bucket === 2) {
      dueDate = addDays(today, (index % 7) + 1);
    } else if (bucket === 3) {
      dueDate = addDays(today, 15 + (index % 20));
    }
  }

  let serviceDate = serviceRaw
    ? remapDateFromParts(serviceRaw.month, serviceRaw.day, today)
    : addDays(dueDate, -(7 + (index % 21)));

  if (compareDate(serviceDate, dueDate) > 0) {
    serviceDate = addDays(dueDate, -2);
  }

  let invoiceIssueDate = issueRaw
    ? remapDateFromParts(issueRaw.month, issueRaw.day, today)
    : (invoiceNumber ? addDays(dueDate, -3) : null);

  if (!invoiceNumber && invoiceIssueDate) {
    invoiceNumber = `NF-${String(100000 + index)}`;
  }
  if (invoiceNumber && !invoiceIssueDate) {
    invoiceIssueDate = addDays(dueDate, -2);
  }

  if (invoiceIssueDate && compareDate(invoiceIssueDate, dueDate) >= 0) {
    invoiceIssueDate = addDays(dueDate, -1);
  }
  if (invoiceIssueDate && compareDate(invoiceIssueDate, serviceDate) < 0) {
    invoiceIssueDate = addDays(serviceDate, 1);
  }

  const payload = {
    customerName,
    serviceDescription,
    serviceDate: formatDate(serviceDate),
    serviceOrderNumber: serviceOrderNumber || undefined,
    invoiceNumber: invoiceNumber || undefined,
    invoiceIssueDate: invoiceIssueDate ? formatDate(invoiceIssueDate) : undefined,
    dueDate: formatDate(dueDate),
    paymentMethod,
    grossAmount,
    issAmount,
    amountReceived,
    currencyCode: 'BRL',
    netAmount: 0,
    outstandingAmount: 0,
    status: ''
  };

  return payload;
}

function toSql(payloads) {
  const lines = [];
  lines.push('SET NOCOUNT ON;');
  lines.push('DELETE FROM [Receivables];');
  lines.push('');
  lines.push('INSERT INTO [Receivables] ([Id], [CustomerName], [ServiceDescription], [ServiceDate], [ServiceOrderNumber], [InvoiceNumber], [InvoiceIssueDate], [DueDate], [PaymentMethod], [CurrencyCode], [AmountReceived], [GrossAmount], [IssAmount])');
  lines.push('VALUES');

  payloads.forEach((item, index) => {
    const paymentMethodInt = PAYMENT_METHOD_INT[item.paymentMethod] ?? 1;
    const tuple = [
      'NEWID()',
      toSqlString(item.customerName),
      toSqlString(item.serviceDescription),
      toSqlString(item.serviceDate),
      toSqlNullableString(item.serviceOrderNumber),
      toSqlNullableString(item.invoiceNumber),
      toSqlNullableString(item.invoiceIssueDate),
      toSqlString(item.dueDate),
      String(paymentMethodInt),
      toSqlString(item.currencyCode),
      toSqlNumber(item.amountReceived),
      toSqlNumber(item.grossAmount),
      toSqlNumber(item.issAmount)
    ].join(', ');

    const suffix = index === payloads.length - 1 ? ';' : ',';
    lines.push(`  (${tuple})${suffix}`);
  });

  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function insertViaApi(payloads, apiUrl) {
  let inserted = 0;
  const failed = [];

  for (let i = 0; i < payloads.length; i += 1) {
    const item = payloads[i];
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        failed.push({
          index: i,
          status: response.status,
          statusText: response.statusText
        });
        continue;
      }

      inserted += 1;
    } catch (error) {
      failed.push({
        index: i,
        status: 'NETWORK',
        statusText: String(error)
      });
    }
  }

  return { inserted, failed };
}

function buildSummary(payloads, skippedRows, sourcePath, apiUrl, today) {
  const statusAfterTransform = {
    settled: 0,
    overdue: 0,
    dueToday: 0,
    open: 0,
    next7Days: 0
  };

  let gross = 0;
  let received = 0;
  let outstanding = 0;

  payloads.forEach((item) => {
    const net = round2(item.grossAmount - item.issAmount);
    const open = round2(net - item.amountReceived);
    gross += item.grossAmount;
    received += item.amountReceived;
    outstanding += open;

    const due = parseIsoDate(item.dueDate);
    const diff = dateDiffDays(due, today);
    if (open <= 0.005) {
      statusAfterTransform.settled += 1;
    } else if (diff < 0) {
      statusAfterTransform.overdue += 1;
    } else if (diff === 0) {
      statusAfterTransform.dueToday += 1;
    } else {
      statusAfterTransform.open += 1;
      if (diff <= 7) {
        statusAfterTransform.next7Days += 1;
      }
    }
  });

  return {
    sourcePath,
    apiUrl,
    referenceDate: formatDate(today),
    totals: {
      records: payloads.length,
      skippedRows,
      grossAmount: round2(gross),
      amountReceived: round2(received),
      outstandingAmount: round2(outstanding)
    },
    statusAfterTransform
  };
}

function mapPaymentMethod(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return 'Boleto';
  }
  if (normalized.includes('pix')) {
    return 'Pix';
  }
  if (normalized.includes('deposito') || normalized.includes('deposit')) {
    return 'Deposit';
  }
  if (normalized.includes('debito') || normalized.includes('debit')) {
    return 'Debit';
  }
  if (normalized.includes('credito') || normalized.includes('credit')) {
    return 'Credit';
  }
  if (normalized.includes('boleto')) {
    return 'Boleto';
  }
  return 'Boleto';
}

function parseDecimal(raw) {
  const value = String(raw ?? '').trim();
  if (!value) {
    return 0;
  }

  const cleaned = value.replace(/[^0-9,.-]/g, '');
  if (!cleaned) {
    return 0;
  }

  let normalized = cleaned;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    normalized = cleaned.replace(',', '.');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseFlexibleDate(raw) {
  const value = String(raw ?? '').trim();
  if (!value) {
    return null;
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) {
    return {
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3])
    };
  }

  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(value);
  if (br) {
    let year = Number(br[3]);
    if (year < 100) {
      year += 2000;
    } else if (year < 1000) {
      year += 1800;
    }
    return {
      year,
      month: Number(br[2]),
      day: Number(br[1])
    };
  }

  if (/^\d{4,5}$/.test(value)) {
    const serial = Number(value);
    if (serial >= 20000) {
      const millis = Date.UTC(1899, 11, 30) + serial * 86400000;
      const date = new Date(millis);
      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate()
      };
    }
  }

  return null;
}

function monthFromName(raw) {
  const normalized = normalizeText(raw);
  return MONTH_BY_NAME[normalized] ?? null;
}

function normalizeText(raw) {
  return String(raw ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function sanitizeText(raw, fallback, maxLength) {
  const value = String(raw ?? '').trim();
  const chosen = value || fallback;
  return chosen.slice(0, maxLength);
}

function sanitizeOptional(raw, maxLength) {
  const value = String(raw ?? '').trim();
  if (!value) {
    return undefined;
  }
  return value.slice(0, maxLength);
}

function remapDateFromParts(sourceMonth, sourceDay, today) {
  const targetMonth = MONTH_REMAP[sourceMonth] ?? sourceMonth;
  const targetYear = targetYearForMonth(targetMonth, today);
  return atUtcDate(targetYear, targetMonth, sourceDay);
}

function targetYearForMonth(targetMonth, today) {
  const currentMonth = today.getUTCMonth() + 1;
  const currentYear = today.getUTCFullYear();
  return targetMonth <= (currentMonth + 1) ? currentYear : currentYear - 1;
}

function atUtcDate(year, month, day) {
  const maxDay = daysInMonth(year, month);
  const safeDay = Math.min(Math.max(Number(day) || 1, 1), maxDay);
  return new Date(Date.UTC(year, month - 1, safeDay));
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addDays(date, deltaDays) {
  const base = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return new Date(base + deltaDays * 86400000);
}

function compareDate(a, b) {
  const aUtc = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUtc = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  if (aUtc < bUtc) return -1;
  if (aUtc > bUtc) return 1;
  return 0;
}

function dateDiffDays(a, b) {
  const aUtc = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUtc = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((aUtc - bUtc) / 86400000);
}

function parseIsoDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return atUtcDate(year, month, day);
}

function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toSqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function toSqlNullableString(value) {
  if (value === undefined || value === null || value === '') {
    return 'NULL';
  }
  return toSqlString(value);
}

function toSqlNumber(value) {
  return Number(value).toFixed(2);
}

main().catch((error) => {
  process.stderr.write(`Erro ao gerar carga: ${error.stack || error}\n`);
  process.exitCode = 1;
});

