import type { RafiaSize } from '../services/rafiaSizeService';

type SeedSize = Omit<RafiaSize, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tamanhos padrão de sacaria agro ráfia.
 * label = "LARGURAxCOMPRIMENTO" em cm.
 * lengthCm pode diferir da label quando há margem de costura.
 */
export const DEFAULT_RAFIA_SIZES: SeedSize[] = [
  { label: '45X55', widthCm: 45, lengthCm: 58, material: 'LAMINADO', grammage: 60, active: true, order: 1 },
  { label: '45X60', widthCm: 45, lengthCm: 63, material: 'LAMINADO', grammage: 60, active: true, order: 2 },
  { label: '45X70', widthCm: 45, lengthCm: 73, material: 'LAMINADO', grammage: 60, active: true, order: 3 },
  { label: '45X75', widthCm: 45, lengthCm: 78, material: 'LAMINADO', grammage: 60, active: true, order: 4 },
  { label: '45X80', widthCm: 45, lengthCm: 83, material: 'LAMINADO', grammage: 60, active: true, order: 5 },
  { label: '50X60', widthCm: 50, lengthCm: 63, material: 'LAMINADO', grammage: 60, active: true, order: 6 },
  { label: '50X70', widthCm: 50, lengthCm: 73, material: 'LAMINADO', grammage: 60, active: true, order: 7 },
  { label: '50X75', widthCm: 50, lengthCm: 78, material: 'LAMINADO', grammage: 60, active: true, order: 8 },
  { label: '50X80', widthCm: 50, lengthCm: 83, material: 'LAMINADO', grammage: 60, active: true, order: 9 },
  { label: '50X90', widthCm: 50, lengthCm: 93, material: 'LAMINADO', grammage: 60, active: true, order: 10 },
  { label: '55X70', widthCm: 55, lengthCm: 73, material: 'LAMINADO', grammage: 60, active: true, order: 11 },
  { label: '55X80', widthCm: 55, lengthCm: 83, material: 'LAMINADO', grammage: 60, active: true, order: 12 },
  { label: '55X90', widthCm: 55, lengthCm: 93, material: 'LAMINADO', grammage: 60, active: true, order: 13 },
  { label: '55X100', widthCm: 55, lengthCm: 103, material: 'LAMINADO', grammage: 60, active: true, order: 14 },
  { label: '60X80', widthCm: 60, lengthCm: 83, material: 'LAMINADO', grammage: 60, active: true, order: 15 },
  { label: '60X90', widthCm: 60, lengthCm: 93, material: 'LAMINADO', grammage: 60, active: true, order: 16 },
  { label: '60X100', widthCm: 60, lengthCm: 103, material: 'LAMINADO', grammage: 60, active: true, order: 17 },
  { label: '65X100', widthCm: 65, lengthCm: 103, material: 'LAMINADO', grammage: 60, active: true, order: 18 },
  { label: '70X100', widthCm: 70, lengthCm: 103, material: 'LAMINADO', grammage: 60, active: true, order: 19 },
  { label: '70X110', widthCm: 70, lengthCm: 113, material: 'LAMINADO', grammage: 60, active: true, order: 20 },
  { label: '70X120', widthCm: 70, lengthCm: 123, material: 'LAMINADO', grammage: 60, active: true, order: 21 },
  { label: '80X120', widthCm: 80, lengthCm: 123, material: 'LAMINADO', grammage: 60, active: true, order: 22 },
  { label: '90X120', widthCm: 90, lengthCm: 123, material: 'LAMINADO', grammage: 60, active: true, order: 23 },
];
