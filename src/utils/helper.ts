import bcrypt from 'bcrypt';
const saltRounds = 10;

export const hashPasswordHelper = async (password: string) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch {
    console.log('Error hashing password');
  }
};
