import * as articleService from "../services/article.service.js";

export async function createArticle(req, res, next) {
  try {
    const article = await articleService.createArticle(req.body, req.user?.id);
    return res.status(201).json(article);
  } catch (error) {
    return next(error);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const article = await articleService.updateArticle(req.params.id, req.body, req.user?.id);
    return res.status(200).json(article);
  } catch (error) {
    return next(error);
  }
}

export async function publishArticle(req, res, next) {
  try {
    const article = await articleService.publishArticle(req.params.id, req.user?.id);
    return res.status(200).json(article);
  } catch (error) {
    return next(error);
  }
}

export async function unpublishArticle(req, res, next) {
  try {
    const article = await articleService.unpublishArticle(req.params.id, req.user?.id);
    return res.status(200).json(article);
  } catch (error) {
    return next(error);
  }
}

export async function getPublishedArticles(req, res, next) {
  try {
    const articles = await articleService.getPublishedArticles({
      tag: req.query.tag,
      authorId: req.query.authorId,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    return res.status(200).json(articles);
  } catch (error) {
    return next(error);
  }
}

export async function getArticle(req, res, next) {
  try {
    const article = await articleService.getArticleById(req.params.id);
    return res.status(200).json(article);
  } catch (error) {
    return next(error);
  }
}
