import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "../utils/api";

const initialState = {
  user: null as any,
  loading: false,
  error: null as string | null,
};

// Async thunk for login — handles the API call and dispatches pending/fulfilled/rejected automatically
export const loginAsync = createAsyncThunk(
  "auth/loginAsync",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await loginUser(email, password);
      if (!user) return rejectWithValue("Invalid credentials");
      return user;
    } catch (err: any) {
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
