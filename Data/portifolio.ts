export type table_row = {
    name: string
    purchase_price: number
    quantity: number
    exchange: 'NSE' | 'BSE'
    exchange_code: string
    sector: string
}

export const mock_cmp_date: Record<string, number> = {
    'HDFCBANK': 600,
    'BAJFINANCE': 7200,
    '532174': 1120,
    'AFFLE': 1380,
    'LTIM': 5150,
    'DMART': 4100
}

export const portfolio: table_row[] = [
    {
        name: 'HDFC Bank',
        purchase_price: 1490,
        quantity: 50,
        exchange: 'NSE',
        exchange_code: 'HDFCBANK',
        sector: 'Financials'
      },
      {
        name: 'Bajaj Finance',
        purchase_price: 6466,
        quantity: 15,
        exchange: 'NSE',
        exchange_code: 'BAJFINANCE',
        sector: 'Financials'
      },
      {
        name: 'ICICI Bank',
        purchase_price: 780,
        quantity: 84,
        exchange: 'BSE',
        exchange_code: '532174',
        sector: 'Financials'
      },
      {
        name: 'Bajaj Housing',
        purchase_price: 130,
        quantity: 504,
        exchange: 'BSE',
        exchange_code: '544252',
        sector: 'Financials'
      },
      {
        name: 'Savani Financials',
        purchase_price: 24,
        quantity: 1080,
        exchange: 'BSE',
        exchange_code: '511577',
        sector: 'Financials'
      },
    
      // Technology Sector
      {
        name: 'Affle India',
        purchase_price: 1151,
        quantity: 50,
        exchange: 'NSE',
        exchange_code: 'AFFLE',
        sector: 'Technology'
      },
      {
        name: 'LTI Mindtree',
        purchase_price: 4775,
        quantity: 16,
        exchange: 'NSE',
        exchange_code: 'LTIM',
        sector: 'Technology'
      },
      {
        name: 'KPIT Tech',
        purchase_price: 672,
        quantity: 61,
        exchange: 'BSE',
        exchange_code: '542651',
        sector: 'Technology'
      },
      {
        name: 'Tata Tech',
        purchase_price: 1072,
        quantity: 63,
        exchange: 'BSE',
        exchange_code: '544028',
        sector: 'Technology'
      },
      {
        name: 'BLS E-Services',
        purchase_price: 232,
        quantity: 191,
        exchange: 'BSE',
        exchange_code: '544107',
        sector: 'Technology'
      },
      {
        name: 'Tanla',
        purchase_price: 1134,
        quantity: 45,
        exchange: 'BSE',
        exchange_code: '532790',
        sector: 'Technology'
      },
      {
        name: 'Dmart',
        purchase_price: 3777,
        quantity: 27,
        exchange: 'NSE',
        exchange_code: 'DMART',
        sector: 'Consumer'
      },
      {
        name: 'Tata Consumer',
        purchase_price: 845,
        quantity: 90,
        exchange: 'BSE',
        exchange_code: '532540',
        sector: 'Consumer'
      },
      {
        name: 'Pidilite',
        purchase_price: 2376,
        quantity: 36,
        exchange: 'BSE',
        exchange_code: '500331',
        sector: 'Consumer'
      },
      {
        name: 'Tata Power',
        purchase_price: 224,
        quantity: 225,
        exchange: 'BSE',
        exchange_code: '500400',
        sector: 'Power'
      },
      {
        name: 'KPI Green',
        purchase_price: 875,
        quantity: 50,
        exchange: 'BSE',
        exchange_code: '542323',
        sector: 'Power'
      },
      {
        name: 'Suzlon',
        purchase_price: 44,
        quantity: 450,
        exchange: 'BSE',
        exchange_code: '532667',
        sector: 'Power'
      },
      {
        name: 'Gensol',
        purchase_price: 998,
        quantity: 45,
        exchange: 'BSE',
        exchange_code: '542851',
        sector: 'Power'
      },
      {
        name: 'Hariom Pipes',
        purchase_price: 580,
        quantity: 60,
        exchange: 'BSE',
        exchange_code: '543517',
        sector: 'Pipe'
      },
      {
        name: 'Astral',
        purchase_price: 1517,
        quantity: 56,
        exchange: 'NSE',
        exchange_code: 'ASTRAL',
        sector: 'Pipe'
      },
      {
        name: 'Polycab',
        purchase_price: 2818,
        quantity: 28,
        exchange: 'BSE',
        exchange_code: '542652',
        sector: 'Pipe'
      },
      {
        name: 'Clean Science',
        purchase_price: 1610,
        quantity: 32,
        exchange: 'BSE',
        exchange_code: '543318',
        sector: 'Others'
      },
      {
        name: 'Deepak Nitrite',
        purchase_price: 2248,
        quantity: 27,
        exchange: 'BSE',
        exchange_code: '506401',
        sector: 'Others'
      },
      {
        name: 'Fine Organic',
        purchase_price: 4284,
        quantity: 16,
        exchange: 'BSE',
        exchange_code: '541557',
        sector: 'Others'
      },
      {
        name: 'Gravita',
        purchase_price: 2037,
        quantity: 8,
        exchange: 'BSE',
        exchange_code: '533282',
        sector: 'Others'
      },
      {
        name: 'SBI Life',
        purchase_price: 1197,
        quantity: 49,
        exchange: 'BSE',
        exchange_code: '540719',
        sector: 'Others'
      },
      {
        name: 'Infy',
        purchase_price: 1647,
        quantity: 36,
        exchange: 'BSE',
        exchange_code: '500209',
        sector: 'Others'
      },
      {
        name: 'Happiest Minds',
        purchase_price: 1103,
        quantity: 45,
        exchange: 'BSE',
        exchange_code: '543237',
        sector: 'Others'
      },
      {
        name: 'EaseMyTrip',
        purchase_price: 20,
        quantity: 1332,
        exchange: 'BSE',
        exchange_code: '543272',
        sector: 'Others'
      }
]