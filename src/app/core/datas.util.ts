const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const DIAS_SEMANA_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const doisDigitos = (valor: number): string => String(valor).padStart(2, '0');

/** Converte uma data local para o formato YYYY-MM-DD, sem passar por UTC. */
export function paraIso(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/** Lê YYYY-MM-DD como meia-noite no horário local. */
export function deIso(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function adicionarDias(data: Date, dias: number): Date {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

export function adicionarDiasIso(iso: string, dias: number): string {
  return paraIso(adicionarDias(deIso(iso), dias));
}

export function hojeIso(): string {
  return paraIso(new Date());
}

export function inicioReserva(dataIso: string, hora: string): Date {
  const base = deIso(dataIso);
  const [horas, minutos] = hora.split(':').map(Number);
  base.setHours(horas, minutos, 0, 0);
  return base;
}

/** Próximos N dias a partir da data base, incluindo o dia base. */
export function proximosDias(quantidade: number, base = new Date()): string[] {
  const resultado: string[] = [];
  for (let indice = 0; indice < quantidade; indice++) {
    resultado.push(paraIso(adicionarDias(base, indice)));
  }
  return resultado;
}

export function nomeDiaSemana(dataIso: string): string {
  return DIAS_SEMANA[deIso(dataIso).getDay()];
}

export function nomeDiaSemanaCurto(dataIso: string): string {
  return DIAS_SEMANA_CURTOS[deIso(dataIso).getDay()];
}

export function rotuloDia(dataIso: string): string {
  const data = deIso(dataIso);
  return `${DIAS_SEMANA[data.getDay()]}, ${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
}

export function rotuloDiaCurto(dataIso: string): string {
  const data = deIso(dataIso);
  return `${DIAS_SEMANA_CURTOS[data.getDay()]}, ${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
}

export function rotuloDataLonga(dataIso: string): string {
  const data = deIso(dataIso);
  return `${data.getDate()} de ${MESES[data.getMonth()]}`;
}

export function rotuloDataNumerica(dataIso: string): string {
  const data = deIso(dataIso);
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
}

export function tempoRelativo(momento: number, agora = Date.now()): string {
  const diferenca = Math.max(0, agora - momento);
  const minutos = Math.floor(diferenca / 60000);
  if (minutos < 1) {
    return 'agora';
  }
  if (minutos < 60) {
    return `há ${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return `há ${horas} h`;
  }
  const dias = Math.floor(horas / 24);
  return `há ${dias} d`;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function formatarHoras(horas: number): string {
  return horas === 1 ? '1 hora' : `${horas} horas`;
}
