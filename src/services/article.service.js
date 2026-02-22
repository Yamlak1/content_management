import { prisma } from "../config/prisma.js";
import { forbidden, notFound } from "../middleware/error.middleware.js";
import { publicAuthorSelect } from "./author.service.js";

const articleWithAuthorSelect = {
  id: true,
  title: true,
  body: true,
  tags: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: {
    select: publicAuthorSelect,
  },
};

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

async function ensureAuthorExists(authorId) {
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { id: true },
  });

  if (!author) {
    throw notFound("Author not found");
  }
}

async function ensureArticleOwnership(articleId, authenticatedAuthorId) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, authorId: true },
  });

  if (!article) {
    throw notFound("Article not found");
  }

  if (article.authorId !== authenticatedAuthorId) {
    throw forbidden("You can only modify your own articles");
  }
}

function resolveAuthorId(payloadAuthorId, authenticatedAuthorId) {
  if (!authenticatedAuthorId) {
    if (!payloadAuthorId) {
      throw forbidden("Authenticated author is required");
    }
    return payloadAuthorId;
  }

  if (payloadAuthorId && payloadAuthorId !== authenticatedAuthorId) {
    throw forbidden("You can only create articles for your own author account");
  }

  return authenticatedAuthorId;
}

export async function createArticle(payload, authenticatedAuthorId) {
  const authorId = resolveAuthorId(payload.authorId, authenticatedAuthorId);
  await ensureAuthorExists(authorId);

  return prisma.article.create({
    data: {
      title: payload.title,
      body: payload.body,
      tags: normalizeTags(payload.tags),
      authorId,
      status: "draft",
      publishedAt: null,
    },
    select: articleWithAuthorSelect,
  });
}

export async function updateArticle(id, payload, authenticatedAuthorId) {
  await ensureArticleOwnership(id, authenticatedAuthorId);
  const data = {};

  if (payload.title !== undefined) data.title = payload.title;
  if (payload.body !== undefined) data.body = payload.body;
  if (payload.tags !== undefined) data.tags = normalizeTags(payload.tags);

  try {
    return await prisma.article.update({
      where: { id },
      data,
      select: articleWithAuthorSelect,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw notFound("Article not found");
    }
    throw error;
  }
}

export async function publishArticle(id, authenticatedAuthorId) {
  await ensureArticleOwnership(id, authenticatedAuthorId);
  try {
    return await prisma.article.update({
      where: { id },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
      select: articleWithAuthorSelect,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw notFound("Article not found");
    }
    throw error;
  }
}

export async function unpublishArticle(id, authenticatedAuthorId) {
  await ensureArticleOwnership(id, authenticatedAuthorId);
  try {
    return await prisma.article.update({
      where: { id },
      data: {
        status: "draft",
        publishedAt: null,
      },
      select: articleWithAuthorSelect,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw notFound("Article not found");
    }
    throw error;
  }
}

export async function getPublishedArticles(filters) {
  const where = {
    status: "published",
  };

  if (filters.tag) {
    where.tags = { has: filters.tag };
  }

  if (filters.authorId) {
    where.authorId = filters.authorId;
  }

  return prisma.article.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip: filters.offset,
    take: filters.limit,
    select: articleWithAuthorSelect,
  });
}

export async function getArticleById(id) {
  const article = await prisma.article.findUnique({
    where: { id },
    select: articleWithAuthorSelect,
  });

  if (!article) {
    throw notFound("Article not found");
  }

  return article;
}
