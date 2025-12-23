import { all, takeEvery, put, call } from "redux-saga/effects";
import axios, { AxiosResponse } from "axios";
import { Song } from "../types/song";
import {
  fetchSongsRequest,
  fetchSongsSuccess,
  addSongRequest,
  addSongSuccess,
  deleteSongRequest,
  deleteSongSuccess,
  updateSongRequest,
  updateSongSuccess,
} from "./songs/songsSlice";

const API_URL = process.env.REACT_APP_API_URL!;
type SagaReturnType<T> = Generator<any, T, any>;

// Fetch all songs
function* fetchSongsSaga(): SagaReturnType<void> {
  const response: AxiosResponse<Song[]> = yield call(() => axios.get<Song[]>(API_URL));
  yield put(fetchSongsSuccess(response.data));
}

// Add a new song
function* addSongSaga(action: ReturnType<typeof addSongRequest>): SagaReturnType<void> {
  const song = action.payload;
  if (!song) return;
  const response: AxiosResponse<Song> = yield call(() => axios.post<Song>(API_URL, song));
  yield put(addSongSuccess(response.data));
}

// Delete a song by ID
function* deleteSongSaga(action: ReturnType<typeof deleteSongRequest>): SagaReturnType<void> {
  const id = action.payload;
  if (!id) return;
  yield call(() => axios.delete(`${API_URL}/${id}`));
  yield put(deleteSongSuccess(id));
}

// Update a song
function* updateSongSaga(action: ReturnType<typeof updateSongRequest>): SagaReturnType<void> {
  const song = action.payload;
  if (!song || !song._id) return;
  const response: AxiosResponse<Song> = yield call(() =>
    axios.put<Song>(`${API_URL}/${song._id}`, song)
  );
  yield put(updateSongSuccess(response.data));
}

// Root saga
export default function* rootSaga(): SagaReturnType<void> {
  yield all([
    takeEvery(fetchSongsRequest.type, fetchSongsSaga),
    takeEvery(addSongRequest.type, addSongSaga),
    takeEvery(deleteSongRequest.type, deleteSongSaga),
    takeEvery(updateSongRequest.type, updateSongSaga),
  ]);
}
