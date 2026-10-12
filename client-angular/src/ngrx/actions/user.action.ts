import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

// ========== Types ==========
export interface User {
  _id: string;
  name: string;
  email: string,
  password: string,
  address : string
}



type UserState = {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
};

// ========== Store ==========
export const UserStore = signalStore(
  { providedIn: 'root' },

  withState<UserState>({
    users: [],
    selectedUser: null,
    loading: false,
    error: null
  }),

  withComputed((store:any) => ({
    userCount: computed(() => store.users().length),
    hasUser: computed(() => store.users().length > 0),
    hasError: computed(() => !!store.error())
  })),

  withMethods((store:any, http = inject(HttpClient)) => {
    const apiUrl = 'http://localhost:5000/api/user';

    // Helper pour gérer les erreurs proprement
    const handleError = (error: any) => {
      const message = error?.error?.message || error?.message || 'Une erreur est survenue';
      patchState(store, { error: message, loading: false });
      return of(null);
    };

    return {

      loadAllUsers: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            http.get<User[]>(apiUrl).pipe(
              tap({
                next: (users) => patchState(store, { users, loading: false }),
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      loadUser: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((userId) =>
            http.get<User>(`${apiUrl}/${userId}`).pipe(
              tap({
                next: (user) => patchState(store, {selectedUser: user, loading: false}),
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      updateArticle: rxMethod<{
        userId: string;
        name: string;
        address: string

      }>(
        pipe(
          switchMap(({ userId, name, address }) =>
            http.put(`${apiUrl}/${userId}`, { userId, name, address }).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => ({
                    articles: state.articles.map((u:any) =>
                      u._id === userId
                        ? { ...u, name, address }
                        : u
                    ),
                    selectedUser: state.selecteUser?._id === userId
                      ? { ...state.selectedUser, name, address }
                      : state.selectedUser
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),
    }
  })
)
