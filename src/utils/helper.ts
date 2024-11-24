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
