// Quarterly labels
export const QUARTERS = ["Apr'24-Jun'24", "Jul'24-Sep'24", "Oct'24-Dec'24", "Jan'25-Mar'25", "Apr'25-Jun'25", "Jul'25-Sep'25", "Oct'25-Dec'25", "Jan'26-Mar'26"];

export const priceTrendsData = {
  Ahmedabad: {
    state: "Gujarat",
    buy: {
      avgPrice: "₹6,909",
      yoy: "+7.43%",
      priceRange: "₹260 - ₹1 Lakh",
      totalProperties: 9000,
      Apartment: [
        { locality: "Shela",              avgPrice: "₹5,451", priceRange: "₹3,000 - ₹10,800", count: 700,  trend: { Apartment: [5150, 5200, 5280, 5350, 5420, 5540, 5510, 5451], "Independent House": [4800, 4850, 4900, 4950, 5000, 5050, 5020, 4980], Villa: [7200, 7300, 7400, 7500, 7600, 7700, 7650, 7580] } },
        { locality: "Chandkheda",         avgPrice: "₹4,974", priceRange: "₹2,909 - ₹12,931", count: 583,  trend: { Apartment: [4600, 4680, 4750, 4820, 4900, 4980, 4960, 4974], "Independent House": [4200, 4250, 4300, 4350, 4400, 4450, 4420, 4390], Villa: [6500, 6600, 6700, 6800, 6900, 7000, 6950, 6880] } },
        { locality: "South Bopal",        avgPrice: "₹5,833", priceRange: "₹3,500 - ₹12,000", count: 490,  trend: { Apartment: [5400, 5480, 5560, 5640, 5720, 5850, 5840, 5833], "Independent House": [5000, 5080, 5160, 5240, 5320, 5400, 5380, 5350], Villa: [7800, 7900, 8000, 8100, 8200, 8300, 8250, 8180] } },
        { locality: "Gota",               avgPrice: "₹5,731", priceRange: "₹2,777 - ₹10,222", count: 483,  trend: { Apartment: [5300, 5380, 5460, 5540, 5620, 5750, 5740, 5731], "Independent House": [4900, 4980, 5060, 5140, 5220, 5300, 5280, 5250], Villa: [7600, 7700, 7800, 7900, 8000, 8100, 8050, 7980] } },
        { locality: "Bopal",              avgPrice: "₹5,766", priceRange: "₹3,600 - ₹11,388", count: 316,  trend: { Apartment: [5350, 5430, 5510, 5590, 5670, 5790, 5780, 5766], "Independent House": [4950, 5030, 5110, 5190, 5270, 5350, 5330, 5300], Villa: [7700, 7800, 7900, 8000, 8100, 8200, 8150, 8080] } },
        { locality: "Vaishno Devi Circle", avgPrice: "₹5,390", priceRange: "₹2,941 - ₹10,402", count: 310,  trend: { Apartment: [5000, 5080, 5160, 5240, 5320, 5420, 5400, 5390], "Independent House": [4600, 4680, 4760, 4840, 4920, 5000, 4980, 4950], Villa: [7200, 7300, 7400, 7500, 7600, 7700, 7650, 7580] } },
      ],
    },
    rent: {
      avgPrice: "₹22/sqft",
      yoy: "+5.1%",
      priceRange: "₹8 - ₹85/sqft",
      totalProperties: 4200,
      Apartment: [
        { locality: "Shela",              avgPrice: "₹18/sqft", priceRange: "₹10 - ₹40/sqft", count: 320, trend: { Apartment: [16, 17, 17, 18, 18, 19, 18, 18], "Independent House": [14, 14, 15, 15, 16, 16, 16, 15], Villa: [28, 29, 30, 31, 32, 33, 32, 31] } },
        { locality: "Chandkheda",         avgPrice: "₹16/sqft", priceRange: "₹9 - ₹35/sqft",  count: 280, trend: { Apartment: [14, 14, 15, 15, 16, 16, 16, 16], "Independent House": [12, 12, 13, 13, 14, 14, 14, 13], Villa: [24, 25, 26, 27, 28, 29, 28, 27] } },
        { locality: "South Bopal",        avgPrice: "₹20/sqft", priceRange: "₹12 - ₹45/sqft", count: 210, trend: { Apartment: [17, 18, 18, 19, 19, 20, 20, 20], "Independent House": [15, 15, 16, 16, 17, 17, 17, 16], Villa: [30, 31, 32, 33, 34, 35, 34, 33] } },
        { locality: "Gota",               avgPrice: "₹19/sqft", priceRange: "₹11 - ₹42/sqft", count: 195, trend: { Apartment: [16, 17, 17, 18, 18, 19, 19, 19], "Independent House": [14, 14, 15, 15, 16, 16, 16, 15], Villa: [28, 29, 30, 31, 32, 33, 32, 31] } },
        { locality: "Bopal",              avgPrice: "₹21/sqft", priceRange: "₹13 - ₹48/sqft", count: 180, trend: { Apartment: [18, 18, 19, 19, 20, 21, 21, 21], "Independent House": [15, 16, 16, 17, 17, 18, 18, 17], Villa: [31, 32, 33, 34, 35, 36, 35, 34] } },
      ],
    },
  },

  Vadodara: {
    state: "Gujarat",
    buy: {
      avgPrice: "₹4,250",
      yoy: "+6.1%",
      priceRange: "₹1,800 - ₹18,000",
      totalProperties: 3200,
      Apartment: [
        { locality: "Gotri",              avgPrice: "₹4,800", priceRange: "₹3,200 - ₹9,500",  count: 420, trend: { Apartment: [4400, 4480, 4560, 4640, 4720, 4820, 4810, 4800], "Independent House": [4000, 4080, 4160, 4240, 4320, 4400, 4380, 4350], Villa: [6500, 6600, 6700, 6800, 6900, 7000, 6950, 6880] } },
        { locality: "Alkapuri",           avgPrice: "₹5,200", priceRange: "₹3,500 - ₹11,000", count: 310, trend: { Apartment: [4800, 4880, 4960, 5040, 5120, 5220, 5210, 5200], "Independent House": [4400, 4480, 4560, 4640, 4720, 4800, 4780, 4750], Villa: [7000, 7100, 7200, 7300, 7400, 7500, 7450, 7380] } },
        { locality: "Manjalpur",          avgPrice: "₹3,900", priceRange: "₹2,500 - ₹8,200",  count: 280, trend: { Apartment: [3600, 3660, 3720, 3780, 3840, 3920, 3910, 3900], "Independent House": [3200, 3260, 3320, 3380, 3440, 3500, 3480, 3450], Villa: [5500, 5600, 5700, 5800, 5900, 6000, 5950, 5880] } },
        { locality: "Waghodia Road",      avgPrice: "₹3,600", priceRange: "₹2,200 - ₹7,500",  count: 240, trend: { Apartment: [3300, 3360, 3420, 3480, 3540, 3620, 3610, 3600], "Independent House": [2900, 2960, 3020, 3080, 3140, 3200, 3180, 3150], Villa: [5000, 5100, 5200, 5300, 5400, 5500, 5450, 5380] } },
        { locality: "Fatehgunj",          avgPrice: "₹4,500", priceRange: "₹3,000 - ₹9,800",  count: 190, trend: { Apartment: [4100, 4180, 4260, 4340, 4420, 4520, 4510, 4500], "Independent House": [3700, 3780, 3860, 3940, 4020, 4100, 4080, 4050], Villa: [6200, 6300, 6400, 6500, 6600, 6700, 6650, 6580] } },
        { locality: "Karelibaug",         avgPrice: "₹4,100", priceRange: "₹2,800 - ₹8,800",  count: 160, trend: { Apartment: [3800, 3860, 3920, 3980, 4040, 4120, 4110, 4100], "Independent House": [3400, 3460, 3520, 3580, 3640, 3700, 3680, 3650], Villa: [5800, 5900, 6000, 6100, 6200, 6300, 6250, 6180] } },
      ],
    },
    rent: {
      avgPrice: "₹14/sqft",
      yoy: "+4.8%",
      priceRange: "₹6 - ₹55/sqft",
      totalProperties: 1800,
      Apartment: [
        { locality: "Gotri",              avgPrice: "₹17/sqft", priceRange: "₹10 - ₹35/sqft", count: 210, trend: { Apartment: [15, 15, 16, 16, 17, 17, 17, 17], "Independent House": [13, 13, 14, 14, 15, 15, 15, 14], Villa: [25, 26, 27, 28, 29, 30, 29, 28] } },
        { locality: "Alkapuri",           avgPrice: "₹20/sqft", priceRange: "₹12 - ₹42/sqft", count: 160, trend: { Apartment: [17, 18, 18, 19, 19, 20, 20, 20], "Independent House": [15, 15, 16, 16, 17, 17, 17, 16], Villa: [28, 29, 30, 31, 32, 33, 32, 31] } },
        { locality: "Manjalpur",          avgPrice: "₹13/sqft", priceRange: "₹8 - ₹28/sqft",  count: 140, trend: { Apartment: [11, 11, 12, 12, 13, 13, 13, 13], "Independent House": [9, 10, 10, 11, 11, 12, 12, 11], Villa: [20, 21, 22, 23, 24, 25, 24, 23] } },
        { locality: "Waghodia Road",      avgPrice: "₹11/sqft", priceRange: "₹7 - ₹24/sqft",  count: 120, trend: { Apartment: [9, 10, 10, 11, 11, 11, 11, 11], "Independent House": [8, 8, 9, 9, 10, 10, 10, 9], Villa: [17, 18, 19, 20, 21, 22, 21, 20] } },
        { locality: "Fatehgunj",          avgPrice: "₹16/sqft", priceRange: "₹10 - ₹34/sqft", count: 95,  trend: { Apartment: [14, 14, 15, 15, 16, 16, 16, 16], "Independent House": [12, 12, 13, 13, 14, 14, 14, 13], Villa: [23, 24, 25, 26, 27, 28, 27, 26] } },
      ],
    },
  },

  Mumbai: {
    state: "Maharashtra",
    buy: {
      avgPrice: "₹19,500",
      yoy: "+8.2%",
      priceRange: "₹5,000 - ₹2 Lakh",
      totalProperties: 28000,
      Apartment: [
        { locality: "Bandra West",        avgPrice: "₹42,000", priceRange: "₹25,000 - ₹1.2 Lakh", count: 1800, trend: { Apartment: [38000, 39000, 40000, 41000, 42000, 43000, 42500, 42000], "Independent House": [32000, 33000, 34000, 35000, 36000, 37000, 36500, 36000], Villa: [55000, 56000, 57000, 58000, 59000, 60000, 59500, 59000] } },
        { locality: "Andheri West",       avgPrice: "₹22,000", priceRange: "₹14,000 - ₹55,000",   count: 2400, trend: { Apartment: [19000, 19500, 20000, 20500, 21000, 22000, 21800, 22000], "Independent House": [16000, 16500, 17000, 17500, 18000, 19000, 18800, 18500], Villa: [30000, 31000, 32000, 33000, 34000, 35000, 34500, 34000] } },
        { locality: "Powai",              avgPrice: "₹18,500", priceRange: "₹12,000 - ₹42,000",   count: 1600, trend: { Apartment: [16000, 16500, 17000, 17500, 18000, 18800, 18600, 18500], "Independent House": [14000, 14500, 15000, 15500, 16000, 16800, 16600, 16400], Villa: [26000, 27000, 28000, 29000, 30000, 31000, 30500, 30000] } },
        { locality: "Vikhroli East",      avgPrice: "₹14,200", priceRange: "₹9,000 - ₹32,000",    count: 1200, trend: { Apartment: [12000, 12500, 13000, 13500, 14000, 14500, 14300, 14200], "Independent House": [10000, 10500, 11000, 11500, 12000, 12500, 12300, 12100], Villa: [20000, 21000, 22000, 23000, 24000, 25000, 24500, 24000] } },
        { locality: "Mira Road East",     avgPrice: "₹9,800",  priceRange: "₹6,500 - ₹22,000",    count: 2100, trend: { Apartment: [8500, 8800, 9000, 9200, 9500, 9900, 9850, 9800], "Independent House": [7500, 7800, 8000, 8200, 8500, 8900, 8850, 8800], Villa: [14000, 14500, 15000, 15500, 16000, 16500, 16300, 16100] } },
        { locality: "Parel",              avgPrice: "₹28,000", priceRange: "₹18,000 - ₹75,000",   count: 980,  trend: { Apartment: [24000, 25000, 26000, 27000, 28000, 29000, 28500, 28000], "Independent House": [20000, 21000, 22000, 23000, 24000, 25000, 24500, 24000], Villa: [40000, 41000, 42000, 43000, 44000, 45000, 44500, 44000] } },
      ],
    },
    rent: {
      avgPrice: "₹65/sqft",
      yoy: "+9.1%",
      priceRange: "₹20 - ₹350/sqft",
      totalProperties: 14000,
      Apartment: [
        { locality: "Bandra West",        avgPrice: "₹120/sqft", priceRange: "₹70 - ₹280/sqft",  count: 850,  trend: { Apartment: [105, 108, 110, 113, 116, 120, 119, 120], "Independent House": [90, 93, 95, 98, 101, 105, 104, 103], Villa: [160, 165, 170, 175, 180, 185, 183, 181] } },
        { locality: "Andheri West",       avgPrice: "₹72/sqft",  priceRange: "₹45 - ₹160/sqft",  count: 1200, trend: { Apartment: [63, 65, 67, 69, 71, 73, 72, 72], "Independent House": [55, 57, 59, 61, 63, 65, 64, 63], Villa: [100, 103, 106, 109, 112, 115, 114, 113] } },
        { locality: "Powai",              avgPrice: "₹58/sqft",  priceRange: "₹38 - ₹130/sqft",  count: 780,  trend: { Apartment: [51, 52, 53, 55, 56, 58, 58, 58], "Independent House": [44, 45, 46, 48, 49, 51, 50, 50], Villa: [82, 84, 86, 88, 90, 92, 91, 90] } },
        { locality: "Mira Road East",     avgPrice: "₹32/sqft",  priceRange: "₹22 - ₹72/sqft",   count: 1050, trend: { Apartment: [28, 29, 30, 31, 31, 32, 32, 32], "Independent House": [24, 25, 26, 27, 27, 28, 28, 27], Villa: [46, 47, 48, 49, 50, 51, 51, 50] } },
        { locality: "Parel",              avgPrice: "₹88/sqft",  priceRange: "₹55 - ₹200/sqft",  count: 480,  trend: { Apartment: [77, 79, 81, 83, 85, 88, 88, 88], "Independent House": [66, 68, 70, 72, 74, 77, 76, 75], Villa: [120, 123, 126, 129, 132, 135, 134, 133] } },
      ],
    },
  },

  Hyderabad: {
    state: "Telangana",
    buy: {
      avgPrice: "₹7,800",
      yoy: "+9.5%",
      priceRange: "₹2,500 - ₹45,000",
      totalProperties: 18000,
      Apartment: [
        { locality: "Gachibowli",         avgPrice: "₹8,200",  priceRange: "₹5,500 - ₹18,000",  count: 2100, trend: { Apartment: [7200, 7400, 7600, 7800, 8000, 8300, 8250, 8200], "Independent House": [6200, 6400, 6600, 6800, 7000, 7300, 7250, 7200], Villa: [11000, 11300, 11600, 11900, 12200, 12500, 12400, 12300] } },
        { locality: "Manikonda",          avgPrice: "₹7,100",  priceRange: "₹4,800 - ₹14,500",  count: 1800, trend: { Apartment: [6200, 6400, 6600, 6800, 7000, 7200, 7150, 7100], "Independent House": [5400, 5600, 5800, 6000, 6200, 6400, 6350, 6300], Villa: [9500, 9800, 10100, 10400, 10700, 11000, 10900, 10800] } },
        { locality: "Jubilee Hills",      avgPrice: "₹12,500", priceRange: "₹8,000 - ₹32,000",  count: 980,  trend: { Apartment: [10800, 11100, 11400, 11700, 12000, 12600, 12550, 12500], "Independent House": [9200, 9500, 9800, 10100, 10400, 11000, 10950, 10900], Villa: [16000, 16500, 17000, 17500, 18000, 18600, 18500, 18400] } },
        { locality: "Banjara Hills",      avgPrice: "₹11,800", priceRange: "₹7,500 - ₹28,000",  count: 860,  trend: { Apartment: [10200, 10500, 10800, 11100, 11400, 11900, 11850, 11800], "Independent House": [8800, 9100, 9400, 9700, 10000, 10500, 10450, 10400], Villa: [15000, 15500, 16000, 16500, 17000, 17600, 17500, 17400] } },
        { locality: "Kukatpally",         avgPrice: "₹6,400",  priceRange: "₹4,200 - ₹13,000",  count: 1600, trend: { Apartment: [5600, 5800, 6000, 6100, 6200, 6500, 6450, 6400], "Independent House": [4800, 5000, 5200, 5300, 5400, 5700, 5650, 5600], Villa: [8500, 8800, 9100, 9200, 9300, 9600, 9550, 9500] } },
        { locality: "Nallagandla",        avgPrice: "₹7,500",  priceRange: "₹5,000 - ₹16,000",  count: 1200, trend: { Apartment: [6600, 6800, 7000, 7100, 7200, 7600, 7550, 7500], "Independent House": [5700, 5900, 6100, 6200, 6300, 6700, 6650, 6600], Villa: [10000, 10300, 10600, 10700, 10800, 11200, 11150, 11100] } },
      ],
    },
    rent: {
      avgPrice: "₹28/sqft",
      yoy: "+7.8%",
      priceRange: "₹10 - ₹120/sqft",
      totalProperties: 9500,
      Apartment: [
        { locality: "Gachibowli",         avgPrice: "₹32/sqft", priceRange: "₹20 - ₹75/sqft",  count: 1100, trend: { Apartment: [27, 28, 29, 30, 31, 32, 32, 32], "Independent House": [23, 24, 25, 26, 27, 28, 28, 27], Villa: [45, 46, 47, 48, 49, 50, 50, 49] } },
        { locality: "Manikonda",          avgPrice: "₹26/sqft", priceRange: "₹16 - ₹60/sqft",  count: 950,  trend: { Apartment: [22, 23, 24, 24, 25, 26, 26, 26], "Independent House": [19, 20, 21, 21, 22, 23, 23, 22], Villa: [37, 38, 39, 40, 41, 42, 42, 41] } },
        { locality: "Jubilee Hills",      avgPrice: "₹45/sqft", priceRange: "₹28 - ₹110/sqft", count: 520,  trend: { Apartment: [38, 39, 40, 41, 43, 45, 45, 45], "Independent House": [33, 34, 35, 36, 38, 40, 40, 39], Villa: [62, 63, 64, 65, 67, 69, 69, 68] } },
        { locality: "Banjara Hills",      avgPrice: "₹42/sqft", priceRange: "₹26 - ₹100/sqft", count: 460,  trend: { Apartment: [36, 37, 38, 39, 40, 42, 42, 42], "Independent House": [31, 32, 33, 34, 35, 37, 37, 36], Villa: [58, 59, 60, 61, 62, 64, 64, 63] } },
        { locality: "Kukatpally",         avgPrice: "₹22/sqft", priceRange: "₹14 - ₹50/sqft",  count: 820,  trend: { Apartment: [19, 19, 20, 20, 21, 22, 22, 22], "Independent House": [16, 17, 17, 18, 18, 19, 19, 18], Villa: [32, 33, 34, 35, 36, 37, 37, 36] } },
        { locality: "Nallagandla",        avgPrice: "₹29/sqft", priceRange: "₹18 - ₹68/sqft",  count: 640,  trend: { Apartment: [24, 25, 26, 27, 28, 29, 29, 29], "Independent House": [21, 22, 23, 24, 25, 26, 26, 25], Villa: [41, 42, 43, 44, 45, 46, 46, 45] } },
      ],
    },
  },
};

export const CITIES = ["Ahmedabad", "Vadodara", "Mumbai", "Hyderabad"];
