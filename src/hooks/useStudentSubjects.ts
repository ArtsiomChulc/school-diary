import { userStore } from "../store/UserStore.tsx";

export const useStudentSubjects = () => {
  const { profile, isLoading } = userStore;

  return {
    profile,
    isLoading,
    isEmpty: !profile?.subjects,
    subjects: Object.values(profile?.subjects ?? {}),
  };
};
