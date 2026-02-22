import * as authorService from "../services/author.service.js";

export async function createAuthor(req, res, next) {
  try {
    const result = await authorService.createAuthor(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function loginAuthor(req, res, next) {
  try {
    const result = await authorService.loginAuthor(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getAuthor(req, res, next) {
  try {
    const author = await authorService.getAuthorById(req.params.id);
    return res.status(200).json(author);
  } catch (error) {
    return next(error);
  }
}

export async function getAuthorByName(req, res, next) {
  try {
    const author = await authorService.getAuthorByName(req.params.name);
    return res.status(200).json(author);
  } catch (error) {
    return next(error);
  }
}
