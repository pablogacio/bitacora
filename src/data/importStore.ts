import { create } from 'zustand'

interface ImportState {
  files: File[]
  setFiles: (files: File[]) => void
  clear: () => void
}

/** Holds files picked on Home while the user reviews auto-detected trips. */
export const useImportStore = create<ImportState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  clear: () => set({ files: [] }),
}))
