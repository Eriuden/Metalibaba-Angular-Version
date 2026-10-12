import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

type Article = {
  _id: string;
  name: string;
  typeArticle: string;
  groupe: string;
  price: string;
  picture?: string;
  likers: string[];
  dislikers: string[];
  // comments...
};

type ArticleState = {
  articles: Article[];
  selectedArticle: Article | null;
  loading: boolean;
  error: string | null;
};

export const ArticleStore = signalStore(
  { providedIn: 'root' },

  withState<ArticleState>({
    articles: [],
    selectedArticle: null,
    loading: false,
    error: null
  }),

  withComputed((store:any) => ({
    articlesCount: computed(() => store.articles().length),
    hasError: computed(() => !!store.error())
  })),

  withMethods((store:any, http = inject(HttpClient)) => {
    const apiUrl = 'http://localhost:5000/api/article';

    return {
      // === Charger tous les articles ===
      loadAllArticles: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            http.get<Article[]>(apiUrl).pipe(
              tap({
                next: (articles) => patchState(store, { articles, loading: false }),
                error: (err) => patchState(store, { error: err.message, loading: false })
              })
            )
          )
        )
      ),

      // === Charger un article ===
      loadArticle: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((id) =>
            http.get<Article>(`${apiUrl}/${id}`).pipe(
              tap({
                next: (article) => patchState(store, { selectedArticle: article, loading: false }),
                error: (err) => patchState(store, { error: err.message, loading: false })
              })
            )
          )
        )
      ),

      // === Ajouter un article ===
      addArticle: rxMethod<any>(
        pipe(
          switchMap((data) =>
            http.post<Article>(apiUrl, data).pipe(
              tap({
                next: (newArticle) =>
                  patchState(store, (state:any) => ({
                    articles: [...state.articles, newArticle]
                  })),
                error: (err) => patchState(store, { error: err.message })
              })
            )
          )
        )
      ),

      // === Update ===
      updateArticle(articleId: string, changes: Partial<Article>) {
        return http.put(`${apiUrl}/${articleId}`, changes).pipe(
          tap(() =>
            patchState(store, (state:any) => ({
              articles: state.articles.map((a:any) =>
                a._id === articleId ? { ...a, ...changes } : a
              )
            }))
          )
        );
      },

      // === Delete ===
      deleteArticle: rxMethod<string>(
        pipe(
          switchMap((articleId) =>
            http.delete(`${apiUrl}/${articleId}`).pipe(
              tap(() =>
                patchState(store, (state:any) => ({
                  articles: state.articles.filter((a:any) => a._id !== articleId)
                }))
              )
            )
          )
        )
      )
    };
  })
);
