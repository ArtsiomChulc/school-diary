import { userStore } from "../store/UserStore.tsx";

// Call from an observer component to track profile and subject changes.
export const useStudentSubjects = () => {
  const { profile, isLoading } = userStore;

  return {
    profile,
    isLoading,
    isEmpty: !profile?.subjects,
    subjects: Object.values(profile?.subjects ?? {}),
  };
};
