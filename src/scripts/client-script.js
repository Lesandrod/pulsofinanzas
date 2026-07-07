document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     CoinGecko API Integration (Real-Time Crypto Ticker & Sidebar Table)
     ========================================================================== */
  async function fetchCryptoPrices() {
    const fallbacks = {
      bitcoin: { usd: 59321.45, usd_24h_change: 2.14 },
      ethereum: { usd: 3214.50, usd_24h_change: -0.85 },
      solana: { usd: 134.20, usd_24h_change: 4.50 },
      tether: { usd: 1.00, usd_24h_change: 0.01 }
    };

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd&include_24hr_change=true');
      if (!response.ok) throw new Error('API Response not ok');
      const data = await response.json();
      updateDOMPrices(data);
    } catch (error) {
      console.warn('API Error, using fallback crypto data:', error);
      updateDOMPrices(fallbacks);
    }
  }

  function updateDOMPrices(data) {
    const assets = [
      { id: 'bitcoin', symbol: 'BTC' },
      { id: 'ethereum', symbol: 'ETH' },
      { id: 'solana', symbol: 'SOL' },
      { id: 'tether', symbol: 'USDT' }
    ];

    assets.forEach(asset => {
      const assetData = data[asset.id];
      if (!assetData) return;

      const price = assetData.usd;
      const change = assetData.usd_24h_change;
      const changeFormatted = change.toFixed(2);
      const isPositive = change >= 0;

      // Update Ticker
      const tickerPriceEl = document.getElementById(`ticker-${asset.id}-price`);
      const tickerChangeEl = document.getElementById(`ticker-${asset.id}-change`);
      
      if (tickerPriceEl && tickerChangeEl) {
        tickerPriceEl.textContent = formatUSD(price);
        tickerChangeEl.textContent = `${isPositive ? '+' : ''}${changeFormatted}%`;
        tickerChangeEl.className = isPositive ? 'positive' : 'negative';
      }

      // Update Sidebar Table Row
      const sidebarPriceEl = document.getElementById(`side-${asset.id}-price`);
      const sidebarChangeEl = document.getElementById(`side-${asset.id}-change`);
      
      if (sidebarPriceEl && sidebarChangeEl) {
        sidebarPriceEl.textContent = formatUSD(price);
        sidebarChangeEl.textContent = `${isPositive ? '+' : ''}${changeFormatted}%`;
        sidebarChangeEl.className = isPositive ? 'positive' : 'negative';
      }
    });
  }

  function formatUSD(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: val < 10 ? 4 : 2
    }).format(val);
  }

  // Trigger CoinGecko immediately and repeat
  fetchCryptoPrices();
  setInterval(fetchCryptoPrices, 60000);

  // Close anchor adsense placeholder widget
  const closeAnchorAd = document.getElementById('close-anchor-ad');
  const anchorAd = document.getElementById('adsense-anchor-widget');
  if (closeAnchorAd && anchorAd) {
    closeAnchorAd.addEventListener('click', () => {
      anchorAd.style.display = 'none';
      const mainLayout = document.querySelector('.main-layout');
      if (mainLayout) mainLayout.style.paddingBottom = '30px';
    });
  }

  /* ==========================================================================
     Calculators Tab Selector (only runs if tab-btn-calc elements exist)
     ========================================================================== */
  const calcTabs = document.querySelectorAll('.tab-btn-calc');
  const calcPanes = document.querySelectorAll('.tab-pane');

  if (calcTabs.length > 0) {
    // If the URL has a hash matching a calculator pane, show it
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) {
      const activeTabId = hash.substring(1); // e.g. "tab-interes"
      activateTab(activeTabId);
    }

    calcTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-tab');
        activateTab(targetId);
        // Update URL hash without jumping
        history.replaceState(null, null, `#${targetId}`);
      });
    });
  }

  function activateTab(tabId) {
    calcTabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    calcPanes.forEach(pane => {
      if (pane.id === tabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     Calculadora de Fondo de Emergencia
     ========================================================================== */
  const fondoForm = document.getElementById('fondo-form');
  
  if (fondoForm) {
    fondoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const gastosMensuales = parseFloat(document.getElementById('gastos-mensuales').value) || 0;
      const ahorroActual = parseFloat(document.getElementById('ahorro-actual').value) || 0;
      const mesesCobertura = parseInt(document.getElementById('meses-cobertura').value) || 6;
      const ahorroMensual = parseFloat(document.getElementById('ahorro-mensual-capacidad').value) || 1;

      const fondoObjetivo = gastosMensuales * mesesCobertura;
      const mesesCubiertos = ahorroActual / (gastosMensuales || 1);
      const brecha = Math.max(0, fondoObjetivo - ahorroActual);
      const mesesRestantesTiempo = brecha / (ahorroMensual || 1);

      document.getElementById('res-fondo-objetivo').textContent = formatCurrency(fondoObjetivo);
      document.getElementById('res-cobertura-meses').textContent = `${mesesCubiertos.toFixed(1)} meses`;
      document.getElementById('res-brecha-fondo').textContent = formatCurrency(brecha);
      document.getElementById('res-meses-restantes-tiempo').textContent = brecha > 0 ? `${Math.ceil(mesesRestantesTiempo)} meses` : '¡Completado!';

      // Generate dynamic plain-language explanation for beginners
      let explicacionTexto = `
        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.72rem; color: #9CA3AF; display: block; margin-bottom: 8px;">¿Qué significa este resultado?</span>
        Tu objetivo de seguridad es acumular <strong>${formatCurrency(fondoObjetivo)}</strong> para cubrir <strong>${mesesCobertura} meses</strong> de tus gastos fijos mensuales.<br><br>
      `;

      if (ahorroActual === 0) {
        explicacionTexto += `
          <strong>Estado: Vulnerable.</strong> Actualmente no tienes ahorros destinados a emergencies. Si sufres un imprevisto (despido, enfermedad o daño doméstico), estarás obligado a endeudarte con tarjetas de crédito o préstamos con altas tasas.<br><br>
          Al ahorrar <strong>${formatCurrency(ahorroMensual)}</strong> al mes, te tomará aproximadamente <strong>${Math.ceil(mesesRestantesTiempo)} meses</strong> alcanzar tu meta de paz mental. ¡Comienza hoy, la constancia es la clave!
        `;
      } else if (ahorroActual < fondoObjetivo) {
        explicacionTexto += `
          <strong>Estado: En camino.</strong> Tu ahorro actual de <strong>${formatCurrency(ahorroActual)}</strong> te cubre <strong>${mesesCubiertos.toFixed(1)} meses</strong> de gastos. Estás en una posición mejor que la mayoría de las personas, pero aún te falta completar una brecha de <strong>${formatCurrency(brecha)}</strong>.<br><br>
          Manteniendo tu ahorro constante de <strong>${formatCurrency(ahorroMensual)}</strong> al mes, alcanzarás tu cobertura ideal en <strong>${Math.ceil(mesesRestantesTiempo)} meses</strong>.
        `;
      } else {
        explicacionTexto += `
          <strong>Estado: ¡Blindado!</strong> Tu ahorro actual de <strong>${formatCurrency(ahorroActual)}</strong> supera tu meta de cobertura de <strong>${formatCurrency(fondoObjetivo)}</strong>. Cuentas con un escudo financiero robusto que te protegerá de cualquier crisis.<br><br>
          <span style="color: #10B981; font-weight: bold;">Paso siguiente:</span> Como ya tienes tu seguridad cubierta, no es eficiente dejar el dinero excedente perdiendo valor frente a la inflación. ¡Es hora de empezar a invertir para multiplicar tus ahorros! Usa nuestra calculadora de <strong>Interés Compuesto</strong> para planificar tu futuro.
        `;
      }

      const explicacionCont = document.getElementById('fondo-explicacion');
      const explicacionEl = document.getElementById('fondo-explicacion-texto');
      if (explicacionCont && explicacionEl) {
        explicacionEl.innerHTML = explicacionTexto;
        explicacionCont.style.display = 'block';
      }
    });
  }

  /* ==========================================================================
     Calculadora de Interés Compuesto & Gráfico
     ========================================================================== */
  const inversionForm = document.getElementById('inversion-form');

  if (inversionForm) {
    inversionForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const capitalInicial = parseFloat(document.getElementById('capital').value) || 0;
      const aportacionMensual = parseFloat(document.getElementById('aportacion').value) || 0;
      const tasaAnual = (parseFloat(document.getElementById('tasa').value) || 0) / 100;
      const plazoAnos = parseInt(document.getElementById('plazo').value) || 1;

      const periodsPerYear = 12;
      const ratePerPeriod = tasaAnual / periodsPerYear;
      
      let balance = capitalInicial;
      let totalInvertido = capitalInicial;
      let projections = [];

      for (let yr = 1; yr <= plazoAnos; yr++) {
        for (let m = 1; m <= 12; m++) {
          balance = (balance + aportacionMensual) * (1 + ratePerPeriod);
          totalInvertido += aportacionMensual;
        }
        
        const interesAcumulado = balance - totalInvertido;
        projections.push({
          year: yr,
          invested: totalInvertido,
          interest: interesAcumulado,
          total: balance
        });
      }

      const finalProjection = projections[projections.length - 1];
      document.getElementById('res-total-inv').textContent = formatCurrency(finalProjection.total);
      document.getElementById('res-invertido').textContent = formatCurrency(finalProjection.invested);
      document.getElementById('res-interes-ganado').textContent = formatCurrency(finalProjection.interest);

      // Generate dynamic plain-language explanation for beginners
      const totalAportado = finalProjection.invested;
      const totalInteres = finalProjection.interest;
      const totalAcumulado = finalProjection.total;
      const ratioInteres = (totalInteres / totalAcumulado) * 100;
      
      const explicacionTexto = `
        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.72rem; color: #9CA3AF; display: block; margin-bottom: 8px;">¿Qué significa este resultado?</span>
        Al invertir tu dinero durante <strong>${plazoAnos} años</strong> con una tasa del <strong>${(tasaAnual * 100).toFixed(1)}%</strong> anual, tu patrimonio final proyectado alcanzará los <strong>${formatCurrency(totalAcumulado)}</strong>.<br><br>
        <strong>El efecto bola de nieve:</strong><br><br>
        • <strong>Capital Aportado (${formatCurrency(totalAportado)}):</strong> Este es el capital que salió realmente de tu bolsillo a lo largo de los años.<br><br>
        • <strong>Interés Compuesto Ganado (${formatCurrency(totalInteres)}):</strong> Este es el dinero "gratis" que generó el mercado. Equivale al <strong>${ratioInteres.toFixed(1)}%</strong> de tu riqueza final.<br><br>
        Gracias a la reinversión constante de tus rendimientos, los intereses comenzaron a generar sus propios intereses, creando un crecimiento exponencial.
      `;
      
      const explicacionCont = document.getElementById('interes-explicacion');
      const explicacionEl = document.getElementById('interes-explicacion-texto');
      if (explicacionCont && explicacionEl) {
        explicacionEl.innerHTML = explicacionTexto;
        explicacionCont.style.display = 'block';
      }

      renderChart(projections);
      renderTable(projections);
    });
  }

  function renderChart(projections) {
    const chartContainer = document.getElementById('bar-chart');
    if (!chartContainer) return;

    chartContainer.innerHTML = '';

    const maxVal = projections[projections.length - 1].total;
    const step = Math.ceil(projections.length / 10);
    const chartData = projections.filter((p, i) => i === 0 || (i + 1) % step === 0 || i === projections.length - 1);
    const uniqueChartData = Array.from(new Set(chartData.map(p => p.year))).map(yr => projections.find(p => p.year === yr));

    uniqueChartData.forEach(p => {
      const heightPercent = (p.total / maxVal) * 100;
      const investedPercent = (p.invested / p.total) * 100;
      const interestPercent = (p.interest / p.total) * 100;

      const barElement = document.createElement('div');
      barElement.className = 'chart-bar';
      barElement.style.height = `${heightPercent}%`;

      barElement.innerHTML = `
        <div class="bar-part-base" style="height: ${investedPercent}%"></div>
        <div class="bar-part-interest" style="height: ${interestPercent}%"></div>
        <span class="bar-year-label">Año ${p.year}</span>
        <div class="bar-tooltip">
          <strong>Año ${p.year}</strong><br>
          Principal: ${formatCurrency(p.invested)}<br>
          Interés: ${formatCurrency(p.interest)}<br>
          Total: ${formatCurrency(p.total)}
        </div>
      `;

      chartContainer.appendChild(barElement);
    });
  }

  function renderTable(projections) {
    const tableBody = document.querySelector('#projection-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    projections.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Año ${p.year}</td>
        <td>${formatCurrency(p.invested)}</td>
        <td>${formatCurrency(p.interest)}</td>
        <td><strong>${formatCurrency(p.total)}</strong></td>
      `;
      tableBody.appendChild(row);
    });
  }

  /* ==========================================================================
     Template Download Center with Timer
     ========================================================================== */
  const downloadBtn = document.getElementById('download-template-btn');
  const templateInfo = document.getElementById('template-info-box');
  const timerScreen = document.getElementById('download-timer-screen');
  const countdownVal = document.getElementById('timer-countdown-val');
  const progressCircle = document.querySelector('.progress-ring-bar');

  if (downloadBtn && templateInfo && timerScreen && countdownVal && progressCircle) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();

      templateInfo.style.display = 'none';
      timerScreen.style.display = 'block';

      let count = 5;
      countdownVal.textContent = count;
      
      const circ = 226;
      progressCircle.style.strokeDashoffset = circ;
      
      void progressCircle.offsetWidth;

      progressCircle.style.transition = 'stroke-dashoffset 5s linear';
      progressCircle.style.strokeDashoffset = '0';

      const interval = setInterval(() => {
        count--;
        countdownVal.textContent = count;

        if (count <= 0) {
          clearInterval(interval);
          
          const link = document.createElement('a');
          link.href = '/plantilla-presupuesto-mensual.xlsx';
          link.download = 'plantilla-presupuesto-mensual.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          alert('¡Tu plantilla se ha descargado con éxito! Revisa tu carpeta de descargas.');

          timerScreen.style.display = 'none';
          templateInfo.style.display = 'block';
          
          progressCircle.style.transition = 'none';
          progressCircle.style.strokeDashoffset = circ;
        }
      }, 1000);
    });
  }

  /* ==========================================================================
     Calculadora de Presupuesto 50/30/20
     ========================================================================== */
  const presupuestoForm = document.getElementById('presupuesto-form');
  if (presupuestoForm) {
    presupuestoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const ingreso = parseFloat(document.getElementById('ingreso-presupuesto').value) || 0;

      const needs = ingreso * 0.50;
      const wants = ingreso * 0.30;
      const savings = ingreso * 0.20;

      document.getElementById('res-needs').textContent = formatCurrency(needs);
      document.getElementById('res-wants').textContent = formatCurrency(wants);
      document.getElementById('res-savings').textContent = formatCurrency(savings);

      // Generate dynamic plain-language explanation for beginners
      const explicacionTexto = `
        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.72rem; color: #9CA3AF; display: block; margin-bottom: 8px;">¿Qué significa este resultado?</span>
        Tu presupuesto mensual recomendado en base a tus ingresos netos de <strong>${formatCurrency(ingreso)}</strong> se distribuye de la siguiente forma:<br><br>
        • <strong>50% Necesidades (${formatCurrency(needs)}):</strong> Destina esto a tus gastos vitales y obligatorios de supervivencia: alquiler o hipoteca, servicios del hogar (agua, luz, gas, internet), despensa de alimentos, seguros médicos y transporte diario.<br><br>
        • <strong>30% Deseos (${formatCurrency(wants)}):</strong> Úsalo para tu bienestar emocional, ocio y pasatiempos: salidas a restaurantes, suscripciones digitales (Netflix, Spotify), pasatiempos, viajes cortos y compras no esenciales.<br><br>
        • <strong>20% Ahorro e Inversión (${formatCurrency(savings)}):</strong> Este dinero es sagrado para edificar tu tranquilidad. Utilízalo para formar tu fondo de emergencias, realizar aportaciones para tu jubilación, pagar deudas pendientes o invertir en bolsa para ganarle a la inflación.
      `;
      
      const explicacionCont = document.getElementById('presupuesto-explicacion');
      const explicacionEl = document.getElementById('presupuesto-explicacion-texto');
      if (explicacionCont && explicacionEl) {
        explicacionEl.innerHTML = explicacionTexto;
        explicacionCont.style.display = 'block';
      }
    });
  }

  /* ==========================================================================
     Calculadora de Pérdida por Inflación
     ========================================================================== */
  const inflacionForm = document.getElementById('inflacion-form');
  if (inflacionForm) {
    inflacionForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const monto = parseFloat(document.getElementById('monto-inflacion').value) || 0;
      const tasa = (parseFloat(document.getElementById('tasa-inflacion').value) || 0) / 100;
      const anos = parseInt(document.getElementById('anos-inflacion').value) || 1;

      const poderRestante = monto / Math.pow(1 + tasa, anos);
      const perdidaTotal = monto - poderRestante;
      const porcentajePerdida = (perdidaTotal / monto) * 100;

      document.getElementById('res-poder-restante').textContent = formatCurrency(poderRestante);
      document.getElementById('res-perdida-total').textContent = formatCurrency(perdidaTotal);
      document.getElementById('res-porcentaje-perdida').textContent = `${porcentajePerdida.toFixed(1)}%`;

      // Generate dynamic plain-language explanation for beginners
      const explicacionTexto = `
        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.72rem; color: #9CA3AF; display: block; margin-bottom: 8px;">¿Qué significa este resultado?</span>
        Si decides guardar tu dinero en efectivo (ej. debajo del colchón o en una cuenta de ahorros que no te pague intereses) por <strong>${anos} ${anos === 1 ? 'año' : 'años'}</strong>, físicamente seguirás teniendo tus mismos <strong>${formatCurrency(monto)}</strong>.<br><br>
        Sin embargo, debido a que las cosas subirán de precio un promedio de <strong>${(tasa * 100).toFixed(1)}%</strong> anual, tu dinero perderá valor real. En el futuro, con tus ahorros solo podrás comprar lo que hoy comprarías con <strong>${formatCurrency(poderRestante)}</strong>.<br><br>
        Es decir, habrás perdido de manera invisible el <strong>${porcentajePerdida.toFixed(1)}%</strong> del valor real de tu esfuerzo laboral, equivalente a que se hubieran "esfumado" o "quemado" <strong>${formatCurrency(perdidaTotal)}</strong> de tu bolsillo sin darte cuenta.
      `;
      
      const explicacionCont = document.getElementById('inflacion-explicacion');
      const explicacionEl = document.getElementById('inflacion-explicacion-texto');
      if (explicacionCont && explicacionEl) {
        explicacionEl.innerHTML = explicacionTexto;
        explicacionCont.style.display = 'block';
      }
    });
  }

  // Enlace directo de la calculadora de inflación a la de interés compuesto
  const directTabBtns = document.querySelectorAll('.tab-btn-calc-direct');
  directTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab('tab-interes');
      history.replaceState(null, null, '#tab-interes');
    });
  });

  /* ==========================================================================
     Calculadora de Libertad Financiera (Regla del 4%)
     ========================================================================== */
  const libertadForm = document.getElementById('libertad-form');
  if (libertadForm) {
    libertadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const gastosMensuales = parseFloat(document.getElementById('gastos-mensuales-libertad').value) || 0;
      const ahorroActual = parseFloat(document.getElementById('ahorro-actual-libertad').value) || 0;
      const tasaRetiroSeguro = (parseFloat(document.getElementById('tasa-retiro-seguro').value) || 4.0) / 100;
      const ahorroMensual = parseFloat(document.getElementById('ahorro-mensual-libertad').value) || 1;

      // Rule of 4% safe withdrawal rate: Target capital = Annual Expenses / Safe Withdrawal Rate
      const gastosAnuales = gastosMensuales * 12;
      const capitalRequerido = gastosAnuales / (tasaRetiroSeguro || 0.04);
      const progreso = Math.min(100, (ahorroActual / (capitalRequerido || 1)) * 100);
      const faltante = Math.max(0, capitalRequerido - ahorroActual);
      
      // Calculate estimated years to reach target using basic saving (no compounding for safety fallback, keeps it simple and direct)
      const anosRestantes = (faltante / (ahorroMensual * 12)) || 0;

      document.getElementById('res-capital-libertad').textContent = formatCurrency(capitalRequerido);
      document.getElementById('res-progreso-libertad').textContent = `${progreso.toFixed(1)}%`;
      document.getElementById('res-faltante-libertad').textContent = formatCurrency(faltante);
      document.getElementById('res-anos-restantes-libertad').textContent = faltante > 0 ? `${anosRestantes.toFixed(1)} años` : '¡Alcanzada!';

      let explicacionTexto = `
        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.72rem; color: #9CA3AF; display: block; margin-bottom: 8px;">¿Qué significa este resultado?</span>
        Según el famoso estudio Trinity (estándar de jubilación), si acumulas un capital de <strong>${formatCurrency(capitalRequerido)}</strong> e inviertes ese dinero en una cartera diversificada, podrás retirar con seguridad el <strong>${(tasaRetiroSeguro * 100).toFixed(1)}%</strong> anual de por vida sin temor a quedarte sin dinero.<br><br>
        <strong>Tu situación actual:</strong><br><br>
        • Tu ahorro de <strong>${formatCurrency(ahorroActual)}</strong> representa el <strong>${progreso.toFixed(1)}%</strong> de tu meta.<br><br>
        • Te faltan <strong>${formatCurrency(faltante)}</strong> para ser financieramente libre.<br><br>
        Ahorrando de forma constante <strong>${formatCurrency(ahorroMensual)}</strong> al mes, te tomará <strong>${anosRestantes.toFixed(1)} años</strong> alcanzar esta meta en base a tus aportes directos.
        <br><br>
        <em>💡 Consejo de aceleración: Si en lugar de solo ahorrar, inviertes tu dinero y obtienes una rentabilidad histórica del 8-10% anual, el efecto del interés compuesto reducirá ese tiempo a casi la mitad.</em>
      `;

      const explicacionCont = document.getElementById('libertad-explicacion');
      const explicacionEl = document.getElementById('libertad-explicacion-texto');
      if (explicacionCont && explicacionEl) {
        explicacionEl.innerHTML = explicacionTexto;
        explicacionCont.style.display = 'block';
      }
    });
  }

  /* ==========================================================================
     Calculadora de Costo de Oportunidad (Gasto vs Inversión)
     ========================================================================== */
  const oportunidadForm = document.getElementById('oportunidad-form');
  if (oportunidadForm) {
    oportunidadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const montoGasto = parseFloat(document.getElementById('monto-gasto').value) || 0;
      const frecuencia = document.getElementById('frecuencia-gasto').value;
      const anos = parseInt(document.getElementById('anos-oportunidad').value) || 10;
      const tasa = (parseFloat(document.getElementById('tasa-oportunidad').value) || 8.0) / 100;

      // Standardize to monthly frequency for compound calculations
      let gastoMensualEquivalente = 0;
      if (frecuencia === 'diario') gastoMensualEquivalente = montoGasto * 30.4;
      else if (frecuencia === 'semanal') gastoMensualEquivalente = montoGasto * 4.34;
      else if (frecuencia === 'mensual') gastoMensualEquivalente = montoGasto;
      else if (frecuencia === 'anual') gastoMensualEquivalente = montoGasto / 12;

      // Future value of an annuity formula: FV = P * [((1 + r/12)^(n*12) - 1) / (r/12)]
      const totalMeses = anos * 12;
      const rMensual = tasa / 12;
      const riquezaPerdida = gastoMensualEquivalente * ((Math.pow(1 + rMensual, totalMeses) - 1) / rMensual);
      const totalGastadoFisico = gastoMensualEquivalente * totalMeses;
      const interesesPerdidos = riquezaPerdida - totalGastadoFisico;

      document.getElementById('res-riqueza-perdida').textContent = formatCurrency(riquezaPerdida);
      document.getElementById('res-total-gastado').textContent = formatCurrency(totalGastadoFisico);
      document.getElementById('res-intereses-perdidos').textContent = formatCurrency(interesesPerdidos);

      let frecuenciaLabel = '';
      if (frecuencia === 'diario') frecuenciaLabel = 'un día';
      else if (frecuencia === 'semanal') frecuenciaLabel = 'una semana';
      else if (frecuencia === 'mensual') frecuenciaLabel = 'un mes';
      else if (frecuencia === 'anual') frecuenciaLabel = 'un año';

      const explicacionTexto = `
        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.72rem; color: #9CA3AF; display: block; margin-bottom: 8px;">¿Qué significa este resultado?</span>
        Gastar <strong>${formatCurrency(montoGasto)}</strong> una vez a la semana/mes no se siente como mucho dinero. Pero sumando ese gasto por <strong>${anos} años</strong>, habrás desembolsado físicamente un total de <strong>${formatCurrency(totalGastadoFisico)}</strong>.<br><br>
        <strong>El verdadero costo oculto:</strong><br><br>
        Si en lugar de gastar ese dinero, lo hubieras invertido mensualmente en el mercado ganando una tasa promedio del <strong>${(tasa * 100).toFixed(1)}%</strong> anual, tu dinero habría crecido hasta alcanzar los <strong>${formatCurrency(riquezaPerdida)}</strong>.<br><br>
        El interés compuesto te habría regalado <strong>${formatCurrency(interesesPerdidos)}</strong> extras en puros rendimientos. Este es el **costo de oportunidad**: la riqueza futura que sacrificas hoy por un placer momentáneo.
      `;

      const explicacionCont = document.getElementById('oportunidad-explicacion');
      const explicacionEl = document.getElementById('oportunidad-explicacion-texto');
      if (explicacionCont && explicacionEl) {
        explicacionEl.innerHTML = explicacionTexto;
        explicacionCont.style.display = 'block';
      }
    });
  }

  /* ==========================================================================
     Calculadora de Capacidad de Endeudamiento (DTI)
     ========================================================================== */
  const endeudamientoForm = document.getElementById('endeudamiento-form');
  if (endeudamientoForm) {
    endeudamientoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const ingresoNeto = parseFloat(document.getElementById('ingreso-mensual-neto').value) || 0;
      const pagosDeudas = parseFloat(document.getElementById('pagos-deudas-actuales').value) || 0;
      const pagoVivienda = parseFloat(document.getElementById('vivienda-actual-alquiler').value) || 0;

      // Debt to Income Ratio = (Total Monthly Debts / Gross Monthly Income) * 100
      const totalDeudasMensuales = pagosDeudas + pagoVivienda;
      const ratioDti = (totalDeudasMensuales / (ingresoNeto || 1)) * 100;
      
      const limiteRecomendado = ingresoNeto * 0.35;
      const capacidadLibre = Math.max(0, limiteRecomendado - totalDeudasMensuales);

      document.getElementById('res-ratio-dti').textContent = `${ratioDti.toFixed(1)}%`;
      document.getElementById('res-limite-bancario').textContent = `${formatCurrency(limiteRecomendado)} al mes`;
      document.getElementById('res-capacidad-libre').textContent = `${formatCurrency(capacidadLibre)} al mes`;

      // Update styling container according to DTI health zone
      const containerDti = document.getElementById('payout-dti-container');
      const resEstadoDti = document.getElementById('res-estado-dti');

      let estado = '';
      let explicacionTexto = `
        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.72rem; color: #9CA3AF; display: block; margin-bottom: 8px;">¿Qué significa este resultado?</span>
        Los bancos y entidades de crédito utilizan la métrica <strong>Debt-to-Income (DTI)</strong> para evaluar tu nivel de riesgo antes de aprobarte una tarjeta, coche o hipoteca. El límite saludable de endeudamiento es de **30% a 35%** de tus ingresos netos.<br><br>
      `;

      if (ratioDti <= 30) {
        estado = 'Zona Segura (Excelente)';
        resEstadoDti.style.color = '#10B981';
        if (containerDti) {
          containerDti.style.borderColor = '#A7F3D0';
          containerDti.style.backgroundColor = '#ECFDF5';
        }
        explicacionTexto += `
          <strong>Estado: Saludable.</strong> Tu nivel de endeudamiento es bajo. Tienes una capacidad de pago muy sana, por lo que cualquier banco te considerará un cliente de bajo riesgo y te otorgará préstamos con las mejores tasas de interés.<br><br>
          Aún cuentas con <strong>${formatCurrency(capacidadLibre)}</strong> al mes de margen saludable de endeudamiento.
        `;
      } else if (ratioDti > 30 && ratioDti <= 40) {
        estado = 'Zona Límite (Precaución)';
        resEstadoDti.style.color = '#F59E0B';
        if (containerDti) {
          containerDti.style.borderColor = '#FDE68A';
          containerDti.style.backgroundColor = '#FFFBEB';
        }
        explicacionTexto += `
          <strong>Estado: Precaución.</strong> Estás al límite sugerido por los analistas de riesgo. Si bien puedes cubrir tus deudas, cualquier imprevisto de ingresos podría desestabilizarte. Un banco podría ser selectivo y exigirte mayor documentación o cobrarte tasas de interés más elevadas.<br><br>
          Se recomienda suspender la toma de nuevas deudas y enfocarte en liquidar tus saldos actuales usando el método de **Bola de Nieve**.
        `;
      } else {
        estado = 'Zona de Peligro (Riesgo)';
        resEstadoDti.style.color = '#EF4444';
        if (containerDti) {
          containerDti.style.borderColor = '#FCA5A5';
          containerDti.style.backgroundColor = '#FEF2F2';
        }
        explicacionTexto += `
          <strong>Estado: Sobrecargado.</strong> Estás destinando más del 40% de tu sueldo al pago de deudas. Financieramente estás en riesgo de impago si surge una emergencia. Es casi seguro que cualquier banco te rechazará nuevas solicitudes de crédito.<br><br>
          <span style="color: #EF4444; font-weight: bold;">Acción sugerida:</span> Tu capacidad de endeudamiento adicional es de **$0.00**. Debes recortar tus deseos mediante la regla **50/30/20** de forma urgente y canalizar todo tu excedente a liquidar tus deudas.
        `;
      }

      resEstadoDti.textContent = estado;

      const explicacionCont = document.getElementById('endeudamiento-explicacion');
      const explicacionEl = document.getElementById('endeudamiento-explicacion-texto');
      if (explicacionCont && explicacionEl) {
        explicacionEl.innerHTML = explicacionTexto;
        explicacionCont.style.display = 'block';
      }
    });
  }

  /* ==========================================================================
     Calculadora del Valor de tu Tiempo
     ========================================================================== */
  const valortiempoForm = document.getElementById('valortiempo-form');
  if (valortiempoForm) {
    valortiempoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const ingresoNeto = parseFloat(document.getElementById('ingreso-mensual-tiempo').value) || 0;
      const horasSemanales = parseFloat(document.getElementById('horas-semanales-tiempo').value) || 40;
      const costoArticulo = parseFloat(document.getElementById('costo-articulo').value) || 0;

      // Average monthly work hours = weekly hours * 4.34
      const horasMensuales = horasSemanales * 4.345;
      const valorHora = ingresoNeto / (horasMensuales || 1);
      
      const horasTrabajoRequeridas = costoArticulo / (valorHora || 1);
      const diasTrabajoRequeridos = horasTrabajoRequeridas / (horasSemanales / 5 || 8); // Assuming 5-day week

      document.getElementById('res-valor-hora').textContent = `${formatCurrency(valorHora)} / hora`;
      document.getElementById('res-horas-mensuales').textContent = `${Math.round(horasMensuales)} hrs`;
      document.getElementById('res-costo-horas-vida').textContent = `${horasTrabajoRequeridas.toFixed(1)} horas`;
      document.getElementById('res-costo-dias-vida').textContent = `${diasTrabajoRequeridos.toFixed(1)} días`;

      const explicacionTexto = `
        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.72rem; color: #9CA3AF; display: block; margin-bottom: 8px;">¿Qué significa este resultado?</span>
        Cada vez que compras algo por un valor de <strong>${formatCurrency(costoArticulo)}</strong>, no lo estás pagando con dinero; lo estás pagando con el **tiempo de tu vida** que te tomó ganar ese dinero.<br><br>
        • Tu sueldo neto se traduce en un valor real de <strong>${formatCurrency(valorHora)} por cada hora</strong> que pasas trabajando.<br><br>
        • Para comprar este artículo, debes entregarle a tu empleador un total de <strong>${horasTrabajoRequeridas.toFixed(1)} horas de tu esfuerzo</strong>.<br><br>
        • Esto equivale aproximadamente a <strong>${diasTrabajoRequeridos.toFixed(1)} días laborados enteros</strong> dedicados exclusivamente a pagar esta compra, sin destinar nada a alimentación o vivienda.<br><br>
        <em>💡 Consejo reflexivo: Antes de pasar tu tarjeta, pregúntate: "¿Este artículo realmente vale ${diasTrabajoRequeridos.toFixed(1)} días de mi libertad y energía de vida?". Esta simple pregunta elimina hasta un 80% de las compras impulsivas.</em>
      `;

      const explicacionCont = document.getElementById('valortiempo-explicacion');
      const explicacionEl = document.getElementById('valortiempo-explicacion-texto');
      if (explicacionCont && explicacionEl) {
        explicacionEl.innerHTML = explicacionTexto;
        explicacionCont.style.display = 'block';
      }
    });
  }

  /* ==========================================================================
     Calculadora de Retorno de Inversión (ROI)
     ========================================================================== */
  const roiForm = document.getElementById('roi-form');
  if (roiForm) {
    roiForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const montoInicial = parseFloat(document.getElementById('monto-inicial-roi').value) || 0;
      const montoFinal = parseFloat(document.getElementById('monto-final-roi').value) || 0;
      const ingresosAdicionales = parseFloat(document.getElementById('ingresos-adicionales-roi').value) || 0;

      // ROI = ((Final Value + Dividends - Initial Value) / Initial Value) * 100
      const gananciaNeta = (montoFinal + ingresosAdicionales) - montoInicial;
      const porcentajeRoi = (gananciaNeta / (montoInicial || 1)) * 100;
      const multiplo = (montoFinal + ingresosAdicionales) / (montoInicial || 1);

      document.getElementById('res-porcentaje-roi').textContent = `${porcentajeRoi.toFixed(2)}%`;
      document.getElementById('res-ganancia-roi').textContent = formatCurrency(gananciaNeta);
      document.getElementById('res-multiplo-roi').textContent = `${multiplo.toFixed(2)}x`;

      // Update styling container according to ROI success
      const containerRoi = document.getElementById('payout-roi-container');
      const resPorcentajeRoi = document.getElementById('res-porcentaje-roi');
      const resGananciaRoi = document.getElementById('res-ganancia-roi');

      let explicacionTexto = `
        <span style="font-weight: 800; text-transform: uppercase; font-size: 0.72rem; color: #9CA3AF; display: block; margin-bottom: 8px;">¿Qué significa este resultado?</span>
        El **Retorno de Inversión (ROI)** mide la eficiencia y rendimiento financiero de un capital invertido. 
      `;

      if (gananciaNeta >= 0) {
        resPorcentajeRoi.style.color = '#10B981';
        resGananciaRoi.style.color = '#10B981';
        if (containerRoi) {
          containerRoi.style.borderColor = '#A7F3D0';
          containerRoi.style.backgroundColor = '#ECFDF5';
        }
        explicacionTexto += `
          Tu inversión ha sido **rentable**.<br><br>
          • Has obtenido una ganancia neta de <strong>${formatCurrency(gananciaNeta)}</strong> sobre tu capital inicial de ${formatCurrency(montoInicial)}.<br><br>
          • Tu retorno total (ROI) es del <strong>${porcentajeRoi.toFixed(2)}%</strong>, lo que significa que por cada dólar invertido has recuperado <strong>${multiplo.toFixed(2)} dólares</strong>.<br><br>
          <em>Comparativa: Un ROI positivo es excelente. Si lograste este rendimiento en un plazo menor a un año, has superado el promedio del mercado de valores histórico (8-10% anual).</em>
        `;
      } else {
        resPorcentajeRoi.style.color = '#EF4444';
        resGananciaRoi.style.color = '#EF4444';
        if (containerRoi) {
          containerRoi.style.borderColor = '#FCA5A5';
          containerRoi.style.backgroundColor = '#FEF2F2';
        }
        explicacionTexto += `
          Tu inversión ha registrado una **pérdida neta**.<br><br>
          • Has perdido un total de <strong style="color: #EF4444;">${formatCurrency(Math.abs(gananciaNeta))}</strong> de tu capital inicial.<br><br>
          • Tu ROI es del <strong style="color: #EF4444;">${porcentajeRoi.toFixed(2)}%</strong>, indicando una depreciación en el valor del activo o negocio.<br><br>
          • Has recuperado únicamente <strong>${multiplo.toFixed(2)} dólares</strong> por cada dólar invertido.<br><br>
          <em>Recomendación: Analiza los factores de la pérdida. Si fue en bolsa o cripto, evalúa si es una fluctuación temporal del mercado o si es momento de diversificar tu portafolio.</em>
        `;
      }

      const explicacionCont = document.getElementById('roi-explicacion');
      const explicacionEl = document.getElementById('roi-explicacion-texto');
      if (explicacionCont && explicacionEl) {
        explicacionEl.innerHTML = explicacionTexto;
        explicacionCont.style.display = 'block';
      }
    });
  }

  /* ==========================================================================
     Utility Helpers
     ========================================================================== */
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
});
