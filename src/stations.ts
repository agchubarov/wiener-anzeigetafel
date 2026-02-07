// Wien U-Bahn Anzeigetafel — Station Data
// RBL IDs discovered from Wiener Linien API (4xxx range)
// rblIds[0] = towards lastStation (Leopoldau/Seestadt/etc), rblIds[1] = towards firstStation

import type { LineConfig } from './types';

export const lines: LineConfig[] = [
    {
        id: 'u1',
        name: 'U1',
        color: '#e20613',
        // Order: Oberlaa → Leopoldau
        // rblIds[0] = towards Leopoldau, rblIds[1] = towards Oberlaa
        stations: [
            { name: 'Oberlaa', rblIds: [4101, 4128] }, // Terminus towards Leopoldau
            { name: 'Neulaa', rblIds: [4101, 4132] },
            { name: 'Alaudagasse', rblIds: [4101, 4130] },
            { name: 'Altes Landgut', rblIds: [4101, 4130] },
            { name: 'Troststraße', rblIds: [4101, 4129] },
            { name: 'Reumannplatz', rblIds: [4101, 4128] }, // 4101 → LEOPOLDAU, 4128 → ALAUDAGASSE
            { name: 'Keplerplatz', rblIds: [4103, 4124] }, // 4103 → LEOPOLDAU, 4124 → OBERLAA
            { name: 'Südtiroler Platz', rblIds: [4105, 4124] },
            { name: 'Taubstummengasse', rblIds: [4107, 4122] },
            { name: 'Karlsplatz', rblIds: [4109, 4120] }, // 4109 → LEOPOLDAU, 4120 → OBERLAA
            { name: 'Stephansplatz', rblIds: [4111, 4118] }, // 4111 → LEOPOLDAU, 4118 → OBERLAA
            { name: 'Schwedenplatz', rblIds: [4113, 4116] },
            { name: 'Nestroyplatz', rblIds: [4115, 4114] },
            { name: 'Praterstern', rblIds: [4117, 4112] },
            { name: 'Vorgartenstraße', rblIds: [4119, 4110] },
            { name: 'Donauinsel', rblIds: [4121, 4108] },
            { name: 'Kaisermühlen-VIC', rblIds: [4123, 4106] },
            { name: 'Alte Donau', rblIds: [4125, 4104] },
            { name: 'Kagran', rblIds: [4127, 4102] }, // 4127 → LEOPOLDAU, 4102 → OBERLAA
            { name: 'Kagraner Platz', rblIds: [4127, 4102] },
            { name: 'Rennbahnweg', rblIds: [4127, 4102] },
            { name: 'Aderklaaer Straße', rblIds: [4127, 4102] },
            { name: 'Großfeldsiedlung', rblIds: [4127, 4102] },
            { name: 'Leopoldau', rblIds: [4127, 4102] }, // Terminus towards Oberlaa
        ],
    },
    {
        id: 'u2',
        name: 'U2',
        color: '#a762a4',
        // Order: Karlsplatz → Seestadt
        // rblIds[0] = towards Seestadt, rblIds[1] = towards Karlsplatz
        stations: [
            { name: 'Karlsplatz', rblIds: [4263, 4257] }, // Terminus towards Seestadt
            { name: 'Museumsquartier', rblIds: [4263, 4257] },
            { name: 'Volkstheater', rblIds: [4263, 4257] },
            { name: 'Rathaus', rblIds: [4263, 4257] },
            { name: 'Schottentor', rblIds: [4263, 4257] },
            { name: 'Schottenring', rblIds: [4263, 4257] },
            { name: 'Taborstraße', rblIds: [4262, 4257] },
            { name: 'Praterstern', rblIds: [4263, 4257] }, // 4263 → SEESTADT
            { name: 'Messe', rblIds: [4263, 4259] },
            { name: 'Krieau', rblIds: [4263, 4259] },
            { name: 'Stadion', rblIds: [4263, 4257] },
            { name: 'Donaumarina', rblIds: [4267, 4255] },
            { name: 'Donaustadtbrücke', rblIds: [4267, 4255] },
            { name: 'Stadlau', rblIds: [4271, 4254] }, // 4271 → SEESTADT, 4254 → KARLSPLATZ
            { name: 'Hardeggasse', rblIds: [4271, 4253] },
            { name: 'Donauspital', rblIds: [4271, 4252] },
            { name: 'Aspernstraße', rblIds: [4271, 4251] },
            { name: 'Lina-Loos-Platz', rblIds: [4271, 4251] },
            { name: 'Hausfeldstraße', rblIds: [4271, 4251] },
            { name: 'Aspern Nord', rblIds: [4271, 4251] },
            { name: 'Seestadt', rblIds: [4271, 4251] }, // Terminus towards Karlsplatz
        ],
    },
    {
        id: 'u3',
        name: 'U3',
        color: '#ef7c00',
        // Order: Ottakring → Simmering
        // Note: U3 API currently not returning data (construction)
        // rblIds[0] = towards Simmering, rblIds[1] = towards Ottakring
        stations: [
            { name: 'Ottakring', rblIds: [4302, 4301] },
            { name: 'Kendlerstraße', rblIds: [4304, 4303] },
            { name: 'Hütteldorfer Straße', rblIds: [4306, 4305] },
            { name: 'Johnstraße', rblIds: [4308, 4307] },
            { name: 'Schweglerstraße', rblIds: [4310, 4309] },
            { name: 'Westbahnhof', rblIds: [4312, 4311] },
            { name: 'Zieglergasse', rblIds: [4314, 4313] },
            { name: 'Neubaugasse', rblIds: [4316, 4315] },
            { name: 'Volkstheater', rblIds: [4318, 4317] },
            { name: 'Herrengasse', rblIds: [4320, 4319] },
            { name: 'Stephansplatz', rblIds: [4322, 4321] },
            { name: 'Stubentor', rblIds: [4324, 4323] },
            { name: 'Landstraße', rblIds: [4326, 4325] },
            { name: 'Rochusgasse', rblIds: [4328, 4327] },
            { name: 'Kardinal-Nagl-Platz', rblIds: [4330, 4329] },
            { name: 'Schlachthausgasse', rblIds: [4332, 4331] },
            { name: 'Erdberg', rblIds: [4334, 4333] },
            { name: 'Gasometer', rblIds: [4336, 4335] },
            { name: 'Zippererstraße', rblIds: [4338, 4337] },
            { name: 'Enkplatz', rblIds: [4340, 4339] },
            { name: 'Simmering', rblIds: [4342, 4341] },
        ],
    },
    {
        id: 'u4',
        name: 'U4',
        color: '#319f49',
        // Order: Hütteldorf → Heiligenstadt
        // rblIds[0] = towards Heiligenstadt, rblIds[1] = towards Hütteldorf
        stations: [
            { name: 'Hütteldorf', rblIds: [4401, 4430] }, // 4401 → HEILIGENSTADT, terminus
            { name: 'Ober St. Veit', rblIds: [4403, 4430] },
            { name: 'Unter St. Veit', rblIds: [4405, 4430] },
            { name: 'Braunschweiggasse', rblIds: [4407, 4430] },
            { name: 'Hietzing', rblIds: [4409, 4430] },
            { name: 'Schönbrunn', rblIds: [4411, 4430] },
            { name: 'Meidling Hauptstraße', rblIds: [4413, 4422] },
            { name: 'Längenfeldgasse', rblIds: [4415, 4422] },
            { name: 'Margaretengürtel', rblIds: [4415, 4422] },
            { name: 'Pilgramgasse', rblIds: [4419, 4422] },
            { name: 'Kettenbrückengasse', rblIds: [4419, 4416] },
            { name: 'Karlsplatz', rblIds: [4421, 4416] }, // 4421 → HEILIGENSTADT, 4416 → HÜTTELDORF
            { name: 'Stadtpark', rblIds: [4423, 4412] },
            { name: 'Landstraße', rblIds: [4423, 4412] },
            { name: 'Schwedenplatz', rblIds: [4427, 4410] },
            { name: 'Schottenring', rblIds: [4429, 4408] },
            { name: 'Roßauer Lände', rblIds: [4429, 4406] },
            { name: 'Friedensbrücke', rblIds: [4429, 4404] },
            { name: 'Spittelau', rblIds: [4402, 4404] },
            { name: 'Heiligenstadt', rblIds: [4402, 4401] }, // Terminus towards Hütteldorf
        ],
    },
    {
        id: 'u6',
        name: 'U6',
        color: '#9b6e2e',
        // Order: Siebenhirten → Floridsdorf
        // rblIds[0] = towards Floridsdorf, rblIds[1] = towards Siebenhirten
        stations: [
            { name: 'Siebenhirten', rblIds: [4636, 4646] }, // Terminus
            { name: 'Perfektastraße', rblIds: [4636, 4646] },
            { name: 'Erlaaer Straße', rblIds: [4636, 4632] },
            { name: 'Alterlaa', rblIds: [4638, 4646] },
            { name: 'Am Schöpfwerk', rblIds: [4639, 4646] },
            { name: 'Tscherttegasse', rblIds: [4640, 4646] },
            { name: 'Bahnhof Meidling', rblIds: [4640, 4646] },
            { name: 'Niederhofstraße', rblIds: [4640, 4646] },
            { name: 'Längenfeldgasse', rblIds: [4640, 4651] },
            { name: 'Gumpendorfer Straße', rblIds: [4624, 4651] },
            { name: 'Westbahnhof', rblIds: [4624, 4651] },
            { name: 'Burggasse - Stadthalle', rblIds: [4624, 4651] },
            { name: 'Thaliastraße', rblIds: [4624, 4651] },
            { name: 'Josefstädter Straße', rblIds: [4624, 4651] },
            { name: 'Alser Straße', rblIds: [4624, 4651] },
            { name: 'Michelbeuern - AKH', rblIds: [4624, 4651] },
            { name: 'Währinger Straße - Volksoper', rblIds: [4625, 4651] },
            { name: 'Nußdorfer Straße', rblIds: [4627, 4651] },
            { name: 'Spittelau', rblIds: [4627, 4651] },
            { name: 'Jägerstraße', rblIds: [4641, 4650] },
            { name: 'Dresdner Straße', rblIds: [4642, 4649] },
            { name: 'Handelskai', rblIds: [4643, 4648] },
            { name: 'Neue Donau', rblIds: [4644, 4647] },
            { name: 'Floridsdorf', rblIds: [4644, 4646] }, // Terminus
        ],
    },
];
