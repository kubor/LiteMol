/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Structure {
    'use strict';

    // TODO
    // - make "index" of bonds.
    //   ~ BondTable is monotonous in the atomAIndex argument => make mapping atomIndex => (startBondIndex, endBondIndex)
    //   ~ atomBIndex is always greater than atomAIndex
    // - add a function that "restricts" a bond table a smaller set of indices

    export const enum BondType {
        Unknown = 0,

        Single = 1,
        Double = 2,
        Triple = 3,
        Aromatic = 4,

        DisulfideBridge = 5,

        Metallic = 6,
        Ion = 7,
        Hydrogen = 8
    }
    
    export function isBondTypeCovalent(t: BondType) {
        return t >= BondType.Unknown && t <= BondType.DisulfideBridge;
    }

    export interface BondComputationParameters {
        maxHbondLength: number,
        forceCompute: boolean
    }

    // H,D,T are all mapped to H
    const __ElementIndex: { [e: string]: number | undefined } = {'H':0,'h':0,'D':0,'d':0,'T':0,'t':0,'He':2,'HE':2,'he':2,'Li':3,'LI':3,'li':3,'Be':4,'BE':4,'be':4,'B':5,'b':5,'C':6,'c':6,'N':7,'n':7,'O':8,'o':8,'F':9,'f':9,'Ne':10,'NE':10,'ne':10,'Na':11,'NA':11,'na':11,'Mg':12,'MG':12,'mg':12,'Al':13,'AL':13,'al':13,'Si':14,'SI':14,'si':14,'P':15,'p':15,'S':16,'s':16,'Cl':17,'CL':17,'cl':17,'Ar':18,'AR':18,'ar':18,'K':19,'k':19,'Ca':20,'CA':20,'ca':20,'Sc':21,'SC':21,'sc':21,'Ti':22,'TI':22,'ti':22,'V':23,'v':23,'Cr':24,'CR':24,'cr':24,'Mn':25,'MN':25,'mn':25,'Fe':26,'FE':26,'fe':26,'Co':27,'CO':27,'co':27,'Ni':28,'NI':28,'ni':28,'Cu':29,'CU':29,'cu':29,'Zn':30,'ZN':30,'zn':30,'Ga':31,'GA':31,'ga':31,'Ge':32,'GE':32,'ge':32,'As':33,'AS':33,'as':33,'Se':34,'SE':34,'se':34,'Br':35,'BR':35,'br':35,'Kr':36,'KR':36,'kr':36,'Rb':37,'RB':37,'rb':37,'Sr':38,'SR':38,'sr':38,'Y':39,'y':39,'Zr':40,'ZR':40,'zr':40,'Nb':41,'NB':41,'nb':41,'Mo':42,'MO':42,'mo':42,'Tc':43,'TC':43,'tc':43,'Ru':44,'RU':44,'ru':44,'Rh':45,'RH':45,'rh':45,'Pd':46,'PD':46,'pd':46,'Ag':47,'AG':47,'ag':47,'Cd':48,'CD':48,'cd':48,'In':49,'IN':49,'in':49,'Sn':50,'SN':50,'sn':50,'Sb':51,'SB':51,'sb':51,'Te':52,'TE':52,'te':52,'I':53,'i':53,'Xe':54,'XE':54,'xe':54,'Cs':55,'CS':55,'cs':55,'Ba':56,'BA':56,'ba':56,'La':57,'LA':57,'la':57,'Ce':58,'CE':58,'ce':58,'Pr':59,'PR':59,'pr':59,'Nd':60,'ND':60,'nd':60,'Pm':61,'PM':61,'pm':61,'Sm':62,'SM':62,'sm':62,'Eu':63,'EU':63,'eu':63,'Gd':64,'GD':64,'gd':64,'Tb':65,'TB':65,'tb':65,'Dy':66,'DY':66,'dy':66,'Ho':67,'HO':67,'ho':67,'Er':68,'ER':68,'er':68,'Tm':69,'TM':69,'tm':69,'Yb':70,'YB':70,'yb':70,'Lu':71,'LU':71,'lu':71,'Hf':72,'HF':72,'hf':72,'Ta':73,'TA':73,'ta':73,'W':74,'w':74,'Re':75,'RE':75,'re':75,'Os':76,'OS':76,'os':76,'Ir':77,'IR':77,'ir':77,'Pt':78,'PT':78,'pt':78,'Au':79,'AU':79,'au':79,'Hg':80,'HG':80,'hg':80,'Tl':81,'TL':81,'tl':81,'Pb':82,'PB':82,'pb':82,'Bi':83,'BI':83,'bi':83,'Po':84,'PO':84,'po':84,'At':85,'AT':85,'at':85,'Rn':86,'RN':86,'rn':86,'Fr':87,'FR':87,'fr':87,'Ra':88,'RA':88,'ra':88,'Ac':89,'AC':89,'ac':89,'Th':90,'TH':90,'th':90,'Pa':91,'PA':91,'pa':91,'U':92,'u':92,'Np':93,'NP':93,'np':93,'Pu':94,'PU':94,'pu':94,'Am':95,'AM':95,'am':95,'Cm':96,'CM':96,'cm':96,'Bk':97,'BK':97,'bk':97,'Cf':98,'CF':98,'cf':98,'Es':99,'ES':99,'es':99,'Fm':100,'FM':100,'fm':100,'Md':101,'MD':101,'md':101,'No':102,'NO':102,'no':102,'Lr':103,'LR':103,'lr':103,'Rf':104,'RF':104,'rf':104,'Db':105,'DB':105,'db':105,'Sg':106,'SG':106,'sg':106,'Bh':107,'BH':107,'bh':107,'Hs':108,'HS':108,'hs':108,'Mt':109,'MT':109,'mt':109};
    const __ElementBondThresholds: { [e: number]: number | undefined }  = {0:1.42, 1:1.42, 3:2.7, 4:2.7, 6:1.75, 7:1.6, 8:1.52, 11:2.7, 12:2.7, 13:2.7, 14:1.9, 15:1.9, 16:1.9, 17:1.8, 19:2.7, 20:2.7, 21:2.7, 22:2.7, 23:2.7, 24:2.7, 25:2.7, 26:2.7, 27:2.7, 28:2.7, 29:2.7, 30:2.7, 31:2.7, 33:2.68, 37:2.7, 38:2.7, 39:2.7, 40:2.7, 41:2.7, 42:2.7, 43:2.7, 44:2.7, 45:2.7, 46:2.7, 47:2.7, 48:2.7, 49:2.7, 50:2.7, 55:2.7, 56:2.7, 57:2.7, 58:2.7, 59:2.7, 60:2.7, 61:2.7, 62:2.7, 63:2.7, 64:2.7, 65:2.7, 66:2.7, 67:2.7, 68:2.7, 69:2.7, 70:2.7, 71:2.7, 72:2.7, 73:2.7, 74:2.7, 75:2.7, 76:2.7, 77:2.7, 78:2.7, 79:2.7, 80:2.7, 81:2.7, 82:2.7, 83:2.7, 87:2.7, 88:2.7, 89:2.7, 90:2.7, 91:2.7, 92:2.7, 93:2.7, 94:2.7, 95:2.7, 96:2.7, 97:2.7, 98:2.7, 99:2.7, 100:2.7, 101:2.7, 102:2.7, 103:2.7, 104:2.7, 105:2.7, 106:2.7, 107:2.7, 108:2.7, 109:2.88};
    const __ElementPairThresholds: { [e: number]: number | undefined }  = {0:0.8, 20:1.31, 27:1.3, 35:1.3, 44:1.05, 54:1, 60:1.84, 72:1.88, 84:1.75, 85:1.56, 86:1.76, 98:1.6, 99:1.68, 100:1.63, 112:1.55, 113:1.59, 114:1.36, 129:1.45, 144:1.6, 170:1.4, 180:1.55, 202:2.4, 222:2.24, 224:1.91, 225:1.98, 243:2.02, 269:2, 293:1.9, 480:2.3, 512:2.3, 544:2.3, 612:2.1, 629:1.54, 665:1, 813:2.6, 854:2.27, 894:1.93, 896:2.1, 937:2.05, 938:2.06, 981:1.62, 1258:2.68, 1309:2.33, 1484:1, 1763:2.14, 1823:2.48, 1882:2.1, 1944:1.72, 2380:2.34, 3367:2.44, 3733:2.11, 3819:2.6, 3821:2.36, 4736:2.75, 5724:2.73, 5959:2.63, 6519:2.84, 6750:2.87, 8991:2.81};

    const DefaultBondingRadius = 2.001;
    
    const MetalsSet = (function() {
        const metals = ['LI', 'NA', 'K', 'RB', 'CS', 'FR', 'BE', 'MG', 'CA', 'SR', 'BA', 'RA','AL', 'GA', 'IN', 'SN', 'TL', 'PB', 'BI', 'SC', 'TI', 'V', 'CR', 'MN', 'FE', 'CO', 'NI', 'CU', 'ZN', 'Y', 'ZR', 'NB', 'MO', 'TC', 'RU', 'RH', 'PD', 'AG', 'CD', 'LA', 'HF', 'TA', 'W', 'RE', 'OS', 'IR', 'PT', 'AU', 'HG', 'AC', 'RF', 'DB', 'SG', 'BH', 'HS', 'MT', 'CE', 'PR', 'ND', 'PM', 'SM', 'EU', 'GD', 'TB', 'DY', 'HO', 'ER', 'TM', 'YB', 'LU', 'TH', 'PA', 'U', 'NP', 'PU', 'AM', 'CM', 'BK', 'CF', 'ES', 'FM', 'MD', 'NO', 'LR'];
        const set = Utils.FastSet.create<number>();
        for (const m of metals) {
            set.add(__ElementIndex[m]!);
        }
        return set;
    })();

    function pair(a: number, b: number) {
        if (a < b) return (a + b) * (a + b + 1) / 2 + b;
        else return (a + b) * (a + b + 1) / 2 + a;
    }

    function idx(e: string) {
        const i = __ElementIndex[e];
        if (i === void 0) return -1;
        return i;
    }

    function pairThreshold(i: number, j: number) {
        if (i < 0 || j < 0) return -1;
        const r = __ElementPairThresholds[pair(i, j)];
        if (r === void 0) return -1;
        return r;
    }

    function threshold(i: number) {
        if (i < 0) return DefaultBondingRadius;
        const r = __ElementBondThresholds[i];
        if (r === void 0) return DefaultBondingRadius;
        return r;
    }

    const H_ID = __ElementIndex['H']!;
    function isHydrogen(i: number) {
        return i === H_ID;
    }

    function isMetal(e: string) {
        const i = __ElementIndex[e];
        if (i === void 0) return false;
        return MetalsSet.has(i);
    }

    function bondsFromInput(model: Molecule.Model, atomIndices: number[]): BondTable {
        const bonds = model.data.bonds.input!;
        if (atomIndices.length === model.data.atoms.count) return bonds;

        const mask = Utils.Mask.ofIndices(model.data.atoms.count, atomIndices);
        const { atomAIndex: a, atomBIndex: b, type: t } = bonds;
        let count = 0;
        for (let i = 0, __i = bonds.count; i < __i; i++) {
            if (!mask.has(a[i]) || !mask.has(b[i])) continue;
            count++;
        }

        const ret = Utils.DataTable.ofDefinition(Tables.Bonds, count);
        const { atomAIndex, atomBIndex, type } = ret;
        const { elementSymbol } = model.data.atoms;
        let offset = 0;
        for (let i = 0, __i = bonds.count; i < __i; i++) {
            const u = a[i], v = b[i];
            if (!mask.has(u) || !mask.has(v)) continue;
            atomAIndex[offset] = u;
            atomBIndex[offset] = v;
            const metal = isMetal(elementSymbol[u]) || isMetal(elementSymbol[v]);
            type[offset] = metal ? BondType.Metallic : t[i];
            offset++;
        }
        return ret;
    }

    type ComputeState = {
        model: Molecule.Model,
        mask: Utils.Mask,
        atomA: Utils.ChunkedArray<number>,
        atomB: Utils.ChunkedArray<number>,
        type: Utils.ChunkedArray<BondType>,
    }
    
    const ChunkedAdd = Utils.ChunkedArray.add;

    function addComponentBonds({ model, mask, atomA, atomB, type }: ComputeState, rI: number) {
        const { atomStartIndex, atomEndIndex, name: residueName } = model.data.residues;
        const { name: atomName, altLoc, elementSymbol } = model.data.atoms;
        const map = model.data.bonds.component!.entries.get(residueName[rI])!.map;
        const start = atomStartIndex[rI], end = atomEndIndex[rI];

        for (let i = start; i < end - 1; i++) {
            if (!mask.has(i)) continue;

            const pairs = map.get(atomName[i]);
            if (!pairs) continue;

            const altA = altLoc[i];
            const isMetalA = isMetal(elementSymbol[i]);

            for (let j = i + 1; j < end; j++) {
                if (!mask.has(j)) continue;
                
                const altB = altLoc[j];
                if (altA && altB && altA !== altB) continue;

                const order = pairs.get(atomName[j]);
                if (order === void 0) continue;

                const metal = isMetalA || isMetal(elementSymbol[j]);
                ChunkedAdd(atomA, i);
                ChunkedAdd(atomB, j);
                ChunkedAdd(type, metal ? BondType.Metallic : order);
            }
        }
    }

    function _computeBonds(model: Molecule.Model, atomIndices: number[], params: BondComputationParameters): BondTable {
        const MAX_RADIUS = 3;

        const { structConn, component } = model.data.bonds;
        const { x, y, z } = model.positions;
        const { elementSymbol, residueIndex, altLoc } = model.data.atoms;
        const { name: residueName } = model.data.residues;
        const query3d = model.queryContext.lookup3d();

        const atomA = Utils.ChunkedArray.create<number>(size => new Int32Array(size), (atomIndices.length * 1.33) | 0, 1);
        const atomB = Utils.ChunkedArray.create<number>(size => new Int32Array(size), (atomIndices.length * 1.33) | 0, 1);
        const type = Utils.ChunkedArray.create<BondType>(size => new Uint8Array(size), (atomIndices.length * 1.33) | 0, 1);

        const mask = Utils.Mask.ofIndices(model.data.atoms.count, atomIndices);
        const state: ComputeState = { model, mask, atomA, atomB, type };

        let lastResidue = -1;
        let hasComponent = false;
        for (const aI of atomIndices) {
            const raI = residueIndex[aI];
            
            if (!params.forceCompute && raI !== lastResidue) {
                hasComponent = !!component && component.entries.has(residueName[raI]);
                if (hasComponent) {
                    addComponentBonds(state, raI);
                }
            }
            lastResidue = raI;

            const aeI = idx(elementSymbol[aI]);

            const { elements, count, squaredDistances } = query3d(x[aI], y[aI], z[aI], MAX_RADIUS);
            const isHa = isHydrogen(aeI);
            const thresholdA = threshold(aeI);
            const altA = altLoc[aI];
            const metalA = MetalsSet.has(aeI);
            const structConnEntries = params.forceCompute ? void 0 : structConn && structConn.getAtomEntries(aI);

            for (let ni = 0; ni < count; ni++) {
                const bI = elements[ni];
                if (bI <= aI || !mask.has(bI)) continue;

                const altB = altLoc[bI];
                if (altA && altB && altA !== altB) continue;

                const rbI = residueIndex[bI];
                if (raI === rbI && hasComponent) continue;
                const beI = idx(elementSymbol[bI]);

                const isHb = isHydrogen(beI);
                if (isHa && isHb) continue;

                const dist = Math.sqrt(squaredDistances[ni]);    
                if (dist === 0) continue;

                if (structConnEntries) {
                    let added = false;
                    for (const se of structConnEntries) {
                        for (const p of se.partners) {
                            if (p.atomIndex === bI) {
                                ChunkedAdd(atomA, aI);
                                ChunkedAdd(atomB, bI);
                                ChunkedAdd(type, se.bondType);
                                added = true;
                                break;
                            }
                        }
                        if (added) break;
                    }
                    if (added) continue;
                }

                if (isHa || isHb) {
                    if (dist < params.maxHbondLength) {
                        ChunkedAdd(atomA, aI);
                        ChunkedAdd(atomB, bI);
                        ChunkedAdd(type, BondType.Single);
                    }
                    continue;
                }

                const thresholdAB = pairThreshold(aeI, beI);
                const pairingThreshold = thresholdAB > 0
                    ? thresholdAB
                    : beI < 0 ? thresholdA : Math.max(thresholdA, threshold(beI));

                const metalB = MetalsSet.has(beI);
                
                if (dist <= pairingThreshold) {
                    ChunkedAdd(atomA, aI);
                    ChunkedAdd(atomB, bI);
                    ChunkedAdd(type, metalA || metalB ? BondType.Metallic : BondType.Single);
                }
            }
        }

        const ret = Utils.DataTable.builder<Bond>(atomA.elementCount);
        ret.addRawColumn('atomAIndex', s => new Int32Array(s) as any as number[], Utils.ChunkedArray.compact(atomA));
        ret.addRawColumn('atomBIndex', s => new Int32Array(s) as any as number[], Utils.ChunkedArray.compact(atomB));
        ret.addRawColumn('type', s => new Uint8Array(s) as any as number[], Utils.ChunkedArray.compact(type));
        const dataTable = ret.seal();

        return dataTable;
    }

    export function computeBonds(model: Molecule.Model, atomIndices: number[], params?: Partial<BondComputationParameters>) {        
        if (model.data.bonds.input) return bondsFromInput(model, atomIndices);
        return _computeBonds(model, atomIndices, { 
            maxHbondLength: (params && params.maxHbondLength) || 1.15,
            forceCompute: !!(params && params.forceCompute),
        });
    }
}