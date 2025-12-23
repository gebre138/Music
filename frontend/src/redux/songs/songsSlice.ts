import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Song } from "../../types/song"; // 

// Define the shape of the slice state
interface SongsState {
  songs: Song[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: SongsState = {
  songs: [],
  loading: false,
  error: null,
};

// Create the slice
const songsSlice = createSlice({
  name: "songs",
  initialState,
  reducers: {
    // --- FETCH SONGS ---
    fetchSongsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSongsSuccess: (state, action: PayloadAction<Song[]>) => {
      state.songs = action.payload;
      state.loading = false;
    },
    fetchSongsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- ADD SONG ---
    addSongRequest: (state, action: PayloadAction<Song>) => {
      state.loading = true;
      state.error = null;
    },
    addSongSuccess: (state, action: PayloadAction<Song>) => {
      state.songs.push(action.payload);
      state.loading = false;
    },
    addSongFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- DELETE SONG ---
    deleteSongRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteSongSuccess: (state, action: PayloadAction<string>) => {
      state.songs = state.songs.filter((s) => s._id !== action.payload);
      state.loading = false;
    },
    deleteSongFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- UPDATE SONG ---
    updateSongRequest: (state, action: PayloadAction<Song>) => {
      state.loading = true;
      state.error = null;
    },
    updateSongSuccess: (state, action: PayloadAction<Song>) => {
      const index = state.songs.findIndex((s) => s._id === action.payload._id);
      if (index !== -1) state.songs[index] = action.payload;
      state.loading = false;
    },
    updateSongFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Export actions
export const {
  fetchSongsRequest,
  fetchSongsSuccess,
  fetchSongsFailure,
  addSongRequest,
  addSongSuccess,
  addSongFailure,
  deleteSongRequest,
  deleteSongSuccess,
  deleteSongFailure,
  updateSongRequest,
  updateSongSuccess,
  updateSongFailure,
} = songsSlice.actions;

// Export reducer
export default songsSlice.reducer;
