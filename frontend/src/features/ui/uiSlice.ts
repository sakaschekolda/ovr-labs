import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  globalLoading: boolean;
  modal: string | null;
}

const initialState: UIState = {
  globalLoading: false,
  modal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.modal = action.payload;
    },
    closeModal(state) {
      state.modal = null;
    },
  },
});

export const { setGlobalLoading, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer; 