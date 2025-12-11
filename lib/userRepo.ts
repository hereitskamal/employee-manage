// lib/userRepo.ts
import bcrypt from "bcryptjs";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

const users: UserRecord[] = [];

// ❗ In production, replace all these with real DB queries

export async function findUserByEmail(email: string) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(name: string, email: string, password: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("User already exists with this email");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserRecord = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
  };
  users.push(user);
  return user;
}

export async function validateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}
