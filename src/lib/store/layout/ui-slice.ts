import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  activeTab: "chats" | "status" | "profile" | "setting";
  selectedUser: string | null;

  isThemeDialogOpen: boolean;

  isStatusPreviewOpen: boolean;
  statusPreviewContent: string | null;
}

const initialState: UIState = {
  activeTab: "chats",
  selectedUser: null,

  isThemeDialogOpen: false,

  isStatusPreviewOpen: false,
  statusPreviewContent: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveTab: (
      state,
      action: PayloadAction<
        "chats" | "status" | "profile" | "setting"
      >
    ) => {
      state.activeTab = action.payload;
    },

    setSelectedUser: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedUser = action.payload;
    },

    toggleThemeDialog: (state) => {
      state.isThemeDialogOpen =
        !state.isThemeDialogOpen;
    },

    setThemeDialog: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isThemeDialogOpen = action.payload;
    },

    openStatusPreview: (
      state,
      action: PayloadAction<string>
    ) => {
      state.isStatusPreviewOpen = true;
      state.statusPreviewContent =
        action.payload;
    },

    closeStatusPreview: (state) => {
      state.isStatusPreviewOpen = false;
      state.statusPreviewContent = null;
    },
  },
});

export const {
  setActiveTab,
  setSelectedUser,
  toggleThemeDialog,
  setThemeDialog,
  openStatusPreview,
  closeStatusPreview,
} = uiSlice.actions;

export default uiSlice.reducer;