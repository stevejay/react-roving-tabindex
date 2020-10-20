let counter = 0;

export function uniqueId(): string {
  return `rti_${++counter}`;
}
