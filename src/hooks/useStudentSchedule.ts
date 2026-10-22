import { useState, useEffect } from "react";
import { scheduleStore } from "../store/ScheduleStore"; // ваш путь к стору
import type { DayOfWeek } from "../services/ScheduleService";

const DAYS_TRANSLATIONS: Record<DayOfWeek, string> = {
  monday: "ПН",
  tuesday: "ВТ",
  wednesday: "СР",
  thursday: "ЧТ",
  friday: "ПТ",
  saturday: "СБ",
};

export const useStudentSchedule = (
  classId: string = "4_A",
) => {
  const [selectedDay, setSelectedDay] =
    useState<DayOfWeek>("monday");

  useEffect(() => {
    scheduleStore
      .fetchSchedule(classId, selectedDay)
      .then();
  }, [classId, selectedDay]);

  const termSelectorProps = {
    terms: (
      Object.keys(DAYS_TRANSLATIONS) as DayOfWeek[]
    ).map((day) => ({
      key: day, // Используем "key" вместо "id"
      label: DAYS_TRANSLATIONS[day],
    })),
    selectedTerm: selectedDay,
    onSelectTerm: (dayId: DayOfWeek) =>
      setSelectedDay(dayId),
  };

  return {
    termSelectorProps,
    schedule: scheduleStore.currentSchedule,
    isLoading: scheduleStore.isLoading,
    error: scheduleStore.error,
  };
};
