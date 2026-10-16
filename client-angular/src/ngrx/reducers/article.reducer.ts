import { createReducer, on } from '@ngrx/store';
import * as ArticleActions from './article.actions';

//A perfectionner et corriger

// ========== State ==========
export interface ArticleState {
  articles: any[];
  selectedArticle: any | null;
  loading: boolean;
  error: string | null;
}

export const initialState: ArticleState = {
  articles: [],
  selectedArticle: null,
  loading: false,
  error: null
};

type Article = {
    articleId: string,
    picture: string,
    name: string,
    typeArticle: string,
    groupe: string,
    price: string
    likers:[string],
    dislikers:[string],
}

type commentId = {
  articleId: string,
  userId: string
}

// ========== Reducer ==========
export const articleReducer = createReducer(
  initialState,

  // ===== Chargement de tous les articles =====
  on(ArticleActions.loadAllArticles, (state:any) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ArticleActions.loadAllArticlesSuccess, (state:any, { articles }:any) => ({
    ...state,
    articles,
    loading: false
  })),
  on(ArticleActions.loadAllArticlesFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Chargement d'un article =====
  on(ArticleActions.loadArticle, (state:any) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ArticleActions.loadArticleSuccess, (state:any, { articleId }:Article) => ({
    ...state,
    selectedArticle: articleId,
    loading: false
  })),
  on(ArticleActions.loadArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Ajout =====
  on(ArticleActions.addArticle, (state:any) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ArticleActions.addArticleSuccess, (state:any) => ({
    ...state,
    loading: false
  })),
  on(ArticleActions.addArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Mise à jour =====
  on(ArticleActions.updateArticleSuccess, (state:any, { articleId, name, typeArticle, groupe, price }:Article) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? { ...article, name, typeArticle, groupe, price }
        : article
    ),
    selectedArticle:
      state.selectedArticle?._id === articleId
        ? { ...state.selectedArticle, name, typeArticle, groupe, price }
        : state.selectedArticle
  })),

  // ===== Upload picture =====
  on(ArticleActions.uploadArticlePictureSuccess, (state:any, { picture }:Article) => ({
    ...state,
    selectedArticle: state.selectedArticle
      ? { ...state.selectedArticle, picture }
      : null,
    articles: state.articles.map((article:any) =>
      state.selectedArticle && article._id === state.selectedArticle._id
        ? { ...article, picture }
        : article
    )
  })),

  // ===== Suppression =====
  on(ArticleActions.deleteArticleSuccess, (state:any, { articleId }:commentId) => ({
    ...state,
    articles: state.articles.filter((article:any) => article._id !== articleId),
    selectedArticle:
      state.selectedArticle?._id === articleId ? null : state.selectedArticle
  })),

  // ===== Likes / Dislikes =====
  on(ArticleActions.likeArticle, (state:any, { articleId, userId }:commentId) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? {
            ...article,
            likers: article.likers?.includes(userId)
              ? article.likers
              : [...(article.likers || []), userId],
            dislikers: (article.dislikers || []).filter((id: string) => id !== userId)
          }
        : article
    )
  })),

  on(ArticleActions.unlikeArticle, (state:any, { articleId, userId }:commentId) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? {
            ...article,
            likers: (article.likers || []).filter((id: string) => id !== userId)
          }
        : article
    )
  })),

  on(ArticleActions.dislikeArticle, (state:any, { articleId, userId }:commentId) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? {
            ...article,
            dislikers: article.dislikers?.includes(userId)
              ? article.dislikers
              : [...(article.dislikers || []), userId],
            likers: (article.likers || []).filter((id: string) => id !== userId)
          }
        : article
    )
  })),

  on(ArticleActions.undislikeArticle, (state:any, { articleId, userId }:commentId) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? {
            ...article,
            dislikers: (article.dislikers || []).filter((id: string) => id !== userId)
          }
        : article
    )
  })),
);
