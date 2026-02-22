import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { conflict, notFound, unauthorized } from "../middleware/error.middleware.js";

const SALT_ROUNDS = 12;

export const publicAuthorSelect = {
  id: true,
  name: true,
  createdAt: true,
};

function sanitizeAuthor(author) {
  return {
    id: author.id,
    name: author.name,
    createdAt: author.createdAt,
  };
}

function signAuthToken(author) {
  return jwt.sign({ name: author.name }, env.JWT_SECRET, {
    subject: author.id,
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export async function createAuthor(payload) {
  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

  try {
    const author = await prisma.author.create({
      data: {
        name: payload.name,
        passwordHash,
      },
      select: publicAuthorSelect,
    });

    const token = signAuthToken(author);

    return {
      author,
      token,
    };
  } catch (error) {
    if (error.code === "P2002") {
      throw conflict("Author name already exists");
    }
    throw error;
  }
}

export async function loginAuthor(payload) {
  const author = await prisma.author.findUnique({
    where: { name: payload.name },
  });

  if (!author) {
    throw unauthorized("Invalid credentials");
  }

  if (!author.passwordHash) {
    throw unauthorized("Password not set for this account");
  }

  const passwordMatches = await bcrypt.compare(payload.password, author.passwordHash);

  if (!passwordMatches) {
    throw unauthorized("Invalid credentials");
  }

  const token = signAuthToken(author);

  return {
    author: sanitizeAuthor(author),
    token,
  };
}

export async function getAuthorById(id) {
  const author = await prisma.author.findUnique({
    where: { id },
    select: publicAuthorSelect,
  });

  if (!author) {
    throw notFound("Author not found");
  }

  return author;
}

export async function getAuthorByName(name) {
  const author = await prisma.author.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
    select: publicAuthorSelect,
  });

  if (!author) {
    throw notFound("Author not found");
  }

  return author;
}
