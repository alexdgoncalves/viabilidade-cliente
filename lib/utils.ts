export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const value of inputs) {
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) {
        classes.push(nested);
      }
      continue;
    }

    if (value === null || value === undefined || value === false) {
      continue;
    }

    classes.push(String(value));
  }

  return classes.join(" ");
}
