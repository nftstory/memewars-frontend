import { create } from "zustand";
import { produce } from "immer"
import * as ImagePicker from "expo-image-picker";
import { type UseFormReturn } from "react-hook-form";
import { type CreateMemeForm } from "./create.form.schema";

interface State {
    submittedImage: string
    isInformationDialogOpen: boolean
}

interface Action {
    setSubmittedImage: (submittedImage: string) => void
    toggleInformationDialog: () => void
    pickImage: (setFormValue: UseFormReturn<CreateMemeForm>["setValue"]) => Promise<void>
}


export const useCreateMemeStore = create<State & Action>((set) => ({
    submittedImage: "",
    isInformationDialogOpen: false,
    pickImage: async (setFormValue) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            // tODO: ask Nicholas about desired `mediaTypes`
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            // tODO: ask Nicholas about desired `aspectRatio`
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            if (uri) setFormValue("image", uri);
        }
    },
    setSubmittedImage: (submittedImage: string) => set({ submittedImage }),
    toggleInformationDialog: () => set(produce((state: State) => { state.isInformationDialogOpen = !state.isInformationDialogOpen })),
}))