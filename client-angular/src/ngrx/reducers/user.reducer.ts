import { createReducer, on } from '@ngrx/store';
import * as UserActions from '../actions/user.action'

//A perfectionner et corriger

// ========== State ==========
export interface UserState {
  users: any[];
  selectedUser: any | null;
  loading: boolean;
  error: string | null;
}

export const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null
};

type User = {
    userId: string,
    picture: string,
    name: string,
    password: string,
    email: string
};

// ========== Reducer ==========
export const userReducer = createReducer(
  initialState,

  // ===== Chargement de tous les users =====
  on(UserActions.loadAllUsers, (state:any) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(UserActions.loadAllUsersSuccess, (state:any, { users }:any) => ({
    ...state,
    users,
    loading: false
  })),
  on(UserActions.loadAllUsersFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Chargement d'un user =====
  on(UserActions.loadUser, (state:any) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(UserActions.loadUserSuccess, (state:any, { userId }:User) => ({
    ...state,
    selectedUser: userId,
    loading: false
  })),
  on(UserActions.loadUserFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Ajout =====
  on(UserActions.addUser, (state:any) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(UserActions.addUserSuccess, (state:any) => ({
    ...state,
    loading: false
  })),
  on(UserActions.addUserFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Mise à jour =====
  on(UserActions.updateUserSuccess, (state:any, { userId, name }:User) => ({
    ...state,
    user: state.users.map((user:any) =>
      user._id === userId
        ? { ...user, name}
        : user
    ),
    selectedArticle:
      state.selectedArticle?._id === userId
        ? { ...state.selectedArticle, name}
        : state.selectedArticle
  })),
  on(UserActions.updateUserFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Upload picture =====
  on(UserActions.uploadUserPictureSuccess, (state:any, { picture }:User) => ({
    ...state,
    selectedUser: state.selectedUser
      ? { ...state.selectedUser, picture }
      : null,
    users: state.users.map((user:any) =>
      state.selectedUser && user._id === state.selectedUser._id
        ? { ...user, picture }
        : user
    )
  })),
  on(UserActions.uploadUserPictureFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Suppression =====
  on(UserActions.deleteUserSuccess, (state:any, { userId }:User) => ({
    ...state,
    users: state.users.filter((user:any) => user._id !== userId),
    //"déselectionner" le user pour éviter des bugs potentiels
    selectedUser:
      state.selectedUser?._id === userId ? null : state.selectedUser
  })),
  on(UserActions.deleteUserFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  }))
