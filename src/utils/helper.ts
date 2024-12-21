/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
const saltRounds = 10;

export const hashPasswordHelper = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Error hashing password', error);
    throw new Error('Error hashing password');
  }
};

export const comparePasswordHelper = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error comparing password', error);
    throw new Error('Error comparing password');
  }
};

export function formatTimeOnly(date: Date): string {
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();

  return `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
}

export function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setUTCHours(time.getUTCHours());
  combined.setUTCMinutes(time.getUTCMinutes());
  combined.setUTCSeconds(0);
  combined.setUTCMilliseconds(0);
  return combined;
}

export function calculateArrivalDate(
  departDate: Date,
  duration: number,
  daysDiff: number,
): Date {
  const arrivalDate = new Date(departDate);
  arrivalDate.setMinutes(arrivalDate.getMinutes() + duration);
  return arrivalDate;
}

export async function validateAirportCode(
  code: string,
  type: 'origin' | 'destination',
): Promise<void> {
  const airportExists = await this.prisma.airports.findUnique({
    where: { code },
  });

  if (!airportExists) {
    throw new BadRequestException(`${type} code '${code}' is not valid.`);
  }
}
