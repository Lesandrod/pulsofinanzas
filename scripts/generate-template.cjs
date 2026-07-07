const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function createTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Pulso Finanzas';
  workbook.lastModifiedBy = 'Pulso Finanzas';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color Palette Constants (Sleek Professional Deep Blue & Warm Accents)
  const COLOR_HEADER_BG = '1E293B'; // Slate Blue Dark
  const COLOR_HEADER_FG = 'FFFFFF'; // White
  const COLOR_SUBHEADER_BG = 'F1F5F9'; // Soft Slate Light
  const COLOR_BORDER = 'CBD5E1'; // Soft gray borders
  const COLOR_ALERT_GREEN = 'D1FAE5'; // Success Light Green
  const COLOR_ALERT_RED = 'FEE2E2'; // Alert Light Red
  const COLOR_ACCENT_BLUE = '3B82F6'; // Brand Blue

  // --------------------------------------------------------------------------
  // SHEET 1: DASHBOARD
  // --------------------------------------------------------------------------
  const sheetDashboard = workbook.addWorksheet('Resumen General', {
    views: [{ showGridLines: true }]
  });

  // Set column widths
  sheetDashboard.columns = [
    { width: 4 },   // A (spacing)
    { width: 35 },  // B (label)
    { width: 18 },  // C (actual)
    { width: 18 },  // D (target/reference)
    { width: 28 },  // E (status)
    { width: 4 }    // F (spacing)
  ];

  // Header Title block
  sheetDashboard.mergeCells('B2:E2');
  const titleCell = sheetDashboard.getCell('B2');
  titleCell.value = 'CONTROL DE PRESUPUESTO MENSUAL - PULSO FINANZAS';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheetDashboard.getRow(2).height = 40;

  // Tagline/Instruction
  sheetDashboard.mergeCells('B3:E3');
  const tagCell = sheetDashboard.getCell('B3');
  tagCell.value = 'Instrucciones: Rellena tus datos en las pestañas inferiores de Ingresos y Gastos. Este panel se actualizará automáticamente.';
  tagCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '475569' } };
  tagCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheetDashboard.getRow(3).height = 25;

  // Section: RESUMEN DE SALDOS
  sheetDashboard.getCell('B5').value = '1. BALANCE GENERAL DEL MES';
  sheetDashboard.getCell('B5').font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: '1E3A8A' } };

  // Headers for Balance Table
  const headersBalance = ['Concepto', 'Monto Real (USD)', 'Proporción', 'Distribución Ideal'];
  headersBalance.forEach((h, index) => {
    const cell = sheetDashboard.getCell(6, 2 + index);
    cell.value = h;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_HEADER_FG } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_BG } };
    cell.alignment = { horizontal: 'center' };
  });
  sheetDashboard.getRow(6).height = 25;

  // Row 7: Ingresos
  sheetDashboard.getCell('B7').value = 'Total Ingresos Mensuales';
  sheetDashboard.getCell('C7').value = { formula: "SUM('Ingresos'!E5:E100)" };
  sheetDashboard.getCell('D7').value = 1.0; // 100%
  sheetDashboard.getCell('E7').value = 'Ingreso Base';
  
  // Row 8: Gastos Fijos (Necesidades)
  sheetDashboard.getCell('B8').value = 'Total Gastos Fijos (Necesidades)';
  sheetDashboard.getCell('C8').value = { formula: "SUM('Gastos Fijos'!E5:E100)" };
  sheetDashboard.getCell('D8').value = { formula: 'C8/C7' };
  sheetDashboard.getCell('E8').value = 'Máximo 50% recomendado';

  // Row 9: Gastos Variables (Deseos)
  sheetDashboard.getCell('B9').value = 'Total Gastos Variables (Deseos)';
  sheetDashboard.getCell('C9').value = { formula: "SUM('Gastos Variables'!E5:E100)" };
  sheetDashboard.getCell('D9').value = { formula: 'C9/C7' };
  sheetDashboard.getCell('E9').value = 'Máximo 30% recomendado';

  // Row 10: Ahorro e Inversión
  sheetDashboard.getCell('B10').value = 'Total Ahorro e Inversión';
  sheetDashboard.getCell('C10').value = { formula: "SUM('Ahorro e Inversión'!E5:E100)" };
  sheetDashboard.getCell('D10').value = { formula: 'C10/C7' };
  sheetDashboard.getCell('E10').value = 'Mínimo 20% recomendado';

  // Row 11: Balance Neto
  sheetDashboard.getCell('B11').value = 'Excedente Neto (Sin asignar)';
  sheetDashboard.getCell('C11').value = { formula: 'C7-C8-C9-C10' };
  sheetDashboard.getCell('D11').value = { formula: 'C11/C7' };
  sheetDashboard.getCell('E11').value = { formula: "IF(C11>=0, \"PRESUPUESTO EQUILIBRADO\", \"¡ALERTA: DÉFICIT!\")" };

  // Apply Styles to Balance Rows
  const balanceRows = [7, 8, 9, 10, 11];
  balanceRows.forEach(r => {
    sheetDashboard.getRow(r).height = 22;
    sheetDashboard.getCell(`B${r}`).font = { name: 'Segoe UI', size: 10, bold: r === 11 };
    sheetDashboard.getCell(`C${r}`).font = { name: 'Segoe UI', size: 10, bold: r === 11 };
    sheetDashboard.getCell(`C${r}`).numFormat = '$#,##0.00';
    sheetDashboard.getCell(`D${r}`).font = { name: 'Segoe UI', size: 10 };
    sheetDashboard.getCell(`D${r}`).numFormat = '0.0%';
    sheetDashboard.getCell(`E${r}`).font = { name: 'Segoe UI', size: 10, italic: true };
    sheetDashboard.getCell(`E${r}`).alignment = { horizontal: 'center' };

    // Borders
    ['B', 'C', 'D', 'E'].forEach(col => {
      sheetDashboard.getCell(`${col}${r}`).border = {
        bottom: { style: r === 11 ? 'double' : 'thin', color: { argb: COLOR_BORDER } },
        top: { style: r === 11 ? 'thin' : 'none', color: { argb: '000000' } }
      };
    });
  });

  // Conditional format coloring on row 11 (Balance status)
  sheetDashboard.getCell('E11').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLOR_ALERT_GREEN }
  };

  // Section: ANÁLISIS REGLA 50/30/20
  sheetDashboard.getCell('B13').value = '2. EVALUACIÓN DE LA REGLA 50/30/20';
  sheetDashboard.getCell('B13').font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: '1E3A8A' } };

  // Headers for rule comparison
  const headersRule = ['Categoría', 'Gasto Real (USD)', 'Porcentaje Actual', 'Límite Recomendado', 'Evaluación de Salud'];
  headersRule.forEach((h, index) => {
    const cell = sheetDashboard.getCell(14, 2 + index);
    cell.value = h;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_HEADER_FG } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ACCENT_BLUE } };
    cell.alignment = { horizontal: 'center' };
  });
  sheetDashboard.getRow(14).height = 25;

  // Row 15: Necesidades (50%)
  sheetDashboard.getCell('B15').value = 'Necesidades Básicas (50% máximo)';
  sheetDashboard.getCell('C15').value = { formula: 'C8' };
  sheetDashboard.getCell('D15').value = { formula: 'C15/C7' };
  sheetDashboard.getCell('E15').value = { formula: 'C7*0.5' };
  sheetDashboard.getCell('F15').value = { formula: 'IF(C15<=E15, "SALUDABLE (Bajo límite)", "EXCESO (Supera el 50%)")' };

  // Row 16: Deseos (30%)
  sheetDashboard.getCell('B16').value = 'Deseos y Ocio (30% máximo)';
  sheetDashboard.getCell('C16').value = { formula: 'C9' };
  sheetDashboard.getCell('D16').value = { formula: 'C16/C7' };
  sheetDashboard.getCell('E16').value = { formula: 'C7*0.3' };
  sheetDashboard.getCell('F16').value = { formula: 'IF(C16<=E16, "SALUDABLE (Bajo límite)", "EXCESO (Supera el 30%)")' };

  // Row 17: Ahorro (20%)
  sheetDashboard.getCell('B17').value = 'Ahorro e Inversión (20% mínimo)';
  sheetDashboard.getCell('C17').value = { formula: 'C10' };
  sheetDashboard.getCell('D17').value = { formula: 'C17/C7' };
  sheetDashboard.getCell('E17').value = { formula: 'C7*0.2' };
  sheetDashboard.getCell('F17').value = { formula: 'IF(C17>=E17, "EXCELENTE (Meta cumplida)", "INSUFICIENTE (Menor al 20%)")' };

  // Extend column F width for evaluation text
  sheetDashboard.getColumn('F').width = 30;

  // Apply Styles to Rule Rows
  const ruleRows = [15, 16, 17];
  ruleRows.forEach(r => {
    sheetDashboard.getRow(r).height = 22;
    sheetDashboard.getCell(`B${r}`).font = { name: 'Segoe UI', size: 10 };
    sheetDashboard.getCell(`C${r}`).font = { name: 'Segoe UI', size: 10 };
    sheetDashboard.getCell(`C${r}`).numFormat = '$#,##0.00';
    sheetDashboard.getCell(`D${r}`).font = { name: 'Segoe UI', size: 10 };
    sheetDashboard.getCell(`D${r}`).numFormat = '0.0%';
    sheetDashboard.getCell(`E${r}`).font = { name: 'Segoe UI', size: 10 };
    sheetDashboard.getCell(`E${r}`).numFormat = '$#,##0.00';
    sheetDashboard.getCell(`F${r}`).font = { name: 'Segoe UI', size: 10, bold: true };
    sheetDashboard.getCell(`F${r}`).alignment = { horizontal: 'center' };

    ['B', 'C', 'D', 'E', 'F'].forEach(col => {
      sheetDashboard.getCell(`${col}${r}`).border = {
        bottom: { style: 'thin', color: { argb: COLOR_BORDER } }
      };
    });
  });

  // --------------------------------------------------------------------------
  // SHEETS FOR DATA ENTRY
  // --------------------------------------------------------------------------
  const inputSheets = [
    {
      name: 'Ingresos',
      title: 'REGISTRO DE INGRESOS',
      color: '059669', // Emerald Green
      categories: ['Sueldo/Salario', 'Freelance/Honorarios', 'Inversiones', 'Ventas', 'Otros'],
      sampleData: [
        { date: '2026-07-01', desc: 'Salario mensual neto', cat: 'Sueldo/Salario', amount: 3200 },
        { date: '2026-07-15', desc: 'Proyecto freelance', cat: 'Freelance/Honorarios', amount: 450 }
      ]
    },
    {
      name: 'Gastos Fijos',
      title: 'REGISTRO DE GASTOS FIJOS (NECESIDADES)',
      color: 'DC2626', // Red
      categories: ['Alquiler/Hipoteca', 'Electricidad/Agua/Gas', 'Internet/Telefonía', 'Supermercado/Despensa', 'Seguros', 'Transporte', 'Otros Obligatorios'],
      sampleData: [
        { date: '2026-07-02', desc: 'Renta del departamento', cat: 'Alquiler/Hipoteca', amount: 900 },
        { date: '2026-07-03', desc: 'Servicio de energía eléctrica', cat: 'Electricidad/Agua/Gas', amount: 65 },
        { date: '2026-07-05', desc: 'Compras supermercado quincena', cat: 'Supermercado/Despensa', amount: 180 },
        { date: '2026-07-06', desc: 'Pago seguro de gastos médicos', cat: 'Seguros', amount: 120 }
      ]
    },
    {
      name: 'Gastos Variables',
      title: 'REGISTRO DE GASTOS VARIABLES (DESEOS)',
      color: 'D97706', // Amber Yellow
      categories: ['Restaurantes/Cafés', 'Entretenimiento/Cine', 'Delivery (Comida domicilio)', 'Suscripciones (Netflix/Spotify)', 'Ropa/Calzado', 'Regalos', 'Otros Gustos'],
      sampleData: [
        { date: '2026-07-04', desc: 'Cena fin de semana con amigos', cat: 'Restaurantes/Cafés', amount: 45 },
        { date: '2026-07-05', desc: 'Suscripción Netflix mensual', cat: 'Suscripciones (Netflix/Spotify)', amount: 15 },
        { date: '2026-07-06', desc: 'Pedido de comida rápida', cat: 'Delivery (Comida domicilio)', amount: 22 }
      ]
    },
    {
      name: 'Ahorro e Inversión',
      title: 'REGISTRO DE AHORRO E INVERSIÓN',
      color: '2563EB', // Blue
      categories: ['Fondo de Emergencia', 'Aportes Retiro', 'Bolsa/Acciones (S&P 500)', 'Criptomonedas', 'Renta Fija/Bonos'],
      sampleData: [
        { date: '2026-07-02', desc: 'Aporte a fondo de emergencias', cat: 'Fondo de Emergencia', amount: 300 },
        { date: '2026-07-10', desc: 'Compra ETF S&P 500 bolsa', cat: 'Bolsa/Acciones (S&P 500)', amount: 400 }
      ]
    }
  ];

  inputSheets.forEach(sheetDef => {
    const ws = workbook.addWorksheet(sheetDef.name, {
      views: [{ showGridLines: true }]
    });

    ws.columns = [
      { width: 4 },   // A (spacing)
      { width: 15 },  // B (Fecha)
      { width: 35 },  // C (Concepto/Descripción)
      { width: 25 },  // D (Categoría)
      { width: 18 },  // E (Monto USD)
      { width: 4 }    // F (spacing)
    ];

    // Sheet Title
    ws.mergeCells('B2:E2');
    const headerCell = ws.getCell('B2');
    headerCell.value = sheetDef.title;
    headerCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sheetDef.color } };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 35;

    // Subtitle note
    ws.mergeCells('B3:E3');
    const subtitleCell = ws.getCell('B3');
    subtitleCell.value = 'Rellena una fila por cada transacción. Usa montos positivos en la columna de Monto.';
    subtitleCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: '475569' } };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(3).height = 20;

    // Table Headers
    const headers = ['Fecha', 'Concepto', 'Categoría', 'Monto (USD)'];
    headers.forEach((h, idx) => {
      const cell = ws.getCell(4, 2 + idx);
      cell.value = h;
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
      cell.alignment = { horizontal: 'center' };
    });
    ws.getRow(4).height = 25;

    // Populating Sample Data
    sheetDef.sampleData.forEach((d, idx) => {
      const rowNum = 5 + idx;
      ws.getCell(`B${rowNum}`).value = d.date;
      ws.getCell(`C${rowNum}`).value = d.desc;
      ws.getCell(`D${rowNum}`).value = d.cat;
      ws.getCell(`E${rowNum}`).value = d.amount;
    });

    // Formatting data rows (including blank rows for user input up to row 100)
    for (let r = 5; r <= 100; r++) {
      ws.getRow(r).height = 20;
      ws.getCell(`B${r}`).font = { name: 'Segoe UI', size: 10 };
      ws.getCell(`B${r}`).alignment = { horizontal: 'center' };
      ws.getCell(`C${r}`).font = { name: 'Segoe UI', size: 10 };
      ws.getCell(`D${r}`).font = { name: 'Segoe UI', size: 10 };
      ws.getCell(`E${r}`).font = { name: 'Segoe UI', size: 10 };
      ws.getCell(`E${r}`).numFormat = '$#,##0.00';

      // Dropdown validation rules for Category column
      ws.getCell(`D${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${sheetDef.categories.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Categoría Incorrecta',
        error: 'Selecciona una categoría válida del menú desplegable.'
      };

      // Borders
      ['B', 'C', 'D', 'E'].forEach(col => {
        ws.getCell(`${col}${r}`).border = {
          bottom: { style: 'thin', color: { argb: COLOR_BORDER } }
        };
      });
    }

    // Total summary at row 101
    const totalRow = 101;
    ws.getRow(totalRow).height = 25;
    ws.getCell(`D${totalRow}`).value = 'TOTAL:';
    ws.getCell(`D${totalRow}`).font = { name: 'Segoe UI', size: 11, bold: true };
    ws.getCell(`D${totalRow}`).alignment = { horizontal: 'right' };
    ws.getCell(`E${totalRow}`).value = { formula: 'SUM(E5:E100)' };
    ws.getCell(`E${totalRow}`).font = { name: 'Segoe UI', size: 11, bold: true };
    ws.getCell(`E${totalRow}`).numFormat = '$#,##0.00';

    ['D', 'E'].forEach(col => {
      ws.getCell(`${col}${totalRow}`).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'double', color: { argb: '000000' } }
      };
    });
  });

  // Write Excel file output
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'plantilla-presupuesto-mensual.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Excel Spreadsheet successfully generated and saved to: ${outputPath}`);
}

createTemplate().catch(err => {
  console.error('Fatal error generating Excel template:', err);
  process.exit(1);
});
