// ── Datos demo para modo sin backend ─────────────────────────────────────────

export const DEMO_FINANCE = {
  summary: {
    totalRevenue:  42_800_000,
    totalExpenses: 31_540_000,
    netProfit:     11_260_000,
    avgNetMargin:  26.3,
  },

  // Flujo de caja mensual 2026
  cashflow: [
    { mes:'Ene', ingresos:6_200_000,  egresos:4_800_000,  saldo:1_400_000  },
    { mes:'Feb', ingresos:5_800_000,  egresos:4_600_000,  saldo:2_600_000  },
    { mes:'Mar', ingresos:7_400_000,  egresos:5_200_000,  saldo:4_800_000  },
    { mes:'Abr', ingresos:8_100_000,  egresos:5_900_000,  saldo:7_000_000  },
    { mes:'May', ingresos:7_900_000,  egresos:5_640_000,  saldo:9_260_000  },
    { mes:'Jun', ingresos:7_400_000,  egresos:5_400_000,  saldo:11_260_000 },
    { mes:'Jul', ingresos:8_500_000,  egresos:6_100_000,  saldo:13_660_000 },  // proyectado
    { mes:'Ago', ingresos:9_200_000,  egresos:6_500_000,  saldo:16_360_000 },
    { mes:'Sep', ingresos:8_800_000,  egresos:6_200_000,  saldo:18_960_000 },
    { mes:'Oct', ingresos:9_500_000,  egresos:6_800_000,  saldo:21_660_000 },
    { mes:'Nov', ingresos:10_200_000, egresos:7_100_000,  saldo:24_760_000 },
    { mes:'Dic', ingresos:11_000_000, egresos:7_500_000,  saldo:28_260_000 },
  ],

  // RRHH — Remuneraciones
  rrhh: {
    totalPlanta: 8,
    totalHonorarios: 12,
    costoMensualTotal: 9_840_000,
    sueldos: [
      { cargo:'Director Académico',     tipo:'Planta',    bruto:2_200_000, prevision:418_000,  liquido:1_782_000 },
      { cargo:'Coordinadora Académica', tipo:'Planta',    bruto:1_450_000, prevision:275_500,  liquido:1_174_500 },
      { cargo:'Administrador',          tipo:'Planta',    bruto:1_200_000, prevision:228_000,  liquido:972_000   },
      { cargo:'Asistente Contable',     tipo:'Planta',    bruto:850_000,   prevision:161_500,  liquido:688_500   },
      { cargo:'Community Manager',      tipo:'Planta',    bruto:750_000,   prevision:142_500,  liquido:607_500   },
      { cargo:'Recepción',              tipo:'Planta',    bruto:620_000,   prevision:117_800,  liquido:502_200   },
      { cargo:'Servicios Generales',    tipo:'Planta',    bruto:500_000,   prevision:95_000,   liquido:405_000   },
      { cargo:'TI / Soporte',           tipo:'Planta',    bruto:900_000,   prevision:171_000,  liquido:729_000   },
    ],
    honorarios: [
      { nombre:'Relator Liderazgo',          monto:480_000,  retencion:48_000  },
      { nombre:'Relator RRHH',               monto:420_000,  retencion:42_000  },
      { nombre:'Relator Salud Ocupacional',  monto:560_000,  retencion:56_000  },
      { nombre:'Relator Computación',        monto:380_000,  retencion:38_000  },
      { nombre:'Relator Habilidades Blandas',monto:450_000,  retencion:45_000  },
      { nombre:'Consultor Estratégico',      monto:800_000,  retencion:80_000  },
      { nombre:'Abogado Licitaciones',       monto:650_000,  retencion:65_000  },
    ],
    previsionSocial: {
      afp: 818_000,
      salud: 490_000,
      mutual: 82_000,
      seguroCesantia: 164_000,
      total: 1_554_000,
    },
  },

  // Costos operacionales
  costos: [
    { categoria:'Remuneraciones planta',  monto:8_470_000, porcentaje:26.8 },
    { categoria:'Honorarios relatores',   monto:3_740_000, porcentaje:11.9 },
    { categoria:'Arriendo oficina',       monto:1_200_000, porcentaje:3.8  },
    { categoria:'Marketing digital',      monto:850_000,   porcentaje:2.7  },
    { categoria:'Tecnología / Software',  monto:420_000,   porcentaje:1.3  },
    { categoria:'Materiales cursistas',   monto:680_000,   porcentaje:2.2  },
    { categoria:'Gastos generales',       monto:380_000,   porcentaje:1.2  },
    { categoria:'Imprevistos (5%)',       monto:320_000,   porcentaje:1.0  },
  ],

  // Punto de equilibrio
  puntoEquilibrio: {
    costosFijos:        14_340_000,
    costosVariablesPct: 22.4,        // % sobre ingresos
    precioPromedioActividad: 320_000,
    actividadesParaEquilibrio: 58,
    ingresosEquilibrio:  18_560_000,
    margenContribucion:  248_000,
    mesesParaEquilibrio: 2.1,
  },

  // Escenarios de sensibilización
  escenarios: [
    {
      nombre:'Pesimista',
      color:'#E82429',
      supuesto:'−30% actividades, +10% costos',
      ingresos:    29_960_000,
      costos:      34_694_000,
      resultado:   -4_734_000,
      margen:      -15.8,
    },
    {
      nombre:'Base',
      color:'#6B7280',
      supuesto:'Proyección actual sin cambios',
      ingresos:    42_800_000,
      costos:      31_540_000,
      resultado:   11_260_000,
      margen:      26.3,
    },
    {
      nombre:'Optimista',
      color:'#16A34A',
      supuesto:'+25% actividades, costos estables',
      ingresos:    53_500_000,
      costos:      33_120_000,
      resultado:   20_380_000,
      margen:      38.1,
    },
    {
      nombre:'Licitaciones',
      color:'#00C8E0',
      supuesto:'+3 contratos marco sector público',
      ingresos:    68_000_000,
      costos:      38_500_000,
      resultado:   29_500_000,
      margen:      43.4,
    },
  ],

  // Metas de cumplimiento
  metas: [
    { nombre:'Ingresos anuales',          meta:86_000_000, actual:42_800_000, unidad:'$'  },
    { nombre:'Actividades realizadas',    meta:180,         actual:94,         unidad:'act'},
    { nombre:'Margen neto',               meta:30,          actual:26.3,       unidad:'%'  },
    { nombre:'Nuevos convenios',          meta:8,           actual:3,          unidad:'cvn'},
    { nombre:'Licitaciones adjudicadas',  meta:6,           actual:2,          unidad:'lic'},
    { nombre:'Relatores certificados',    meta:20,          actual:12,         unidad:'rel'},
    { nombre:'Satisfacción cursistas',    meta:90,          actual:87.4,       unidad:'%'  },
    { nombre:'Punto equilibrio mensual',  meta:100,         actual:100,        unidad:'%'  },
  ],

  records: [],
};
