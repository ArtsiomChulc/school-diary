import { makeAutoObservable, runInAction } from "mobx";
import {
  type DayOfWeek,
  type IDaySchedule,
  type ILesson,
  ScheduleService,
} from "../services/ScheduleService";

// const MOCK_WEEK_SCHEDULE: Record<
//   Exclude<DayOfWeek, "saturday">,
//   ILesson[]
// > = {
//   monday: [
//     {
//       id: "1",
//       name: "Изобразительное искусство",
//       room: "103",
//     },
//     { id: "2", name: "Белорусский язык", room: "103" },
//     { id: "3", name: "Математика", room: "103" },
//     {
//       id: "4",
//       name: "Белорусская литература",
//       room: "103",
//     },
//   ],
//   tuesday: [
//     { id: "1", name: "Русская литература", room: "103" },
//     { id: "2", name: "Русский язык", room: "103" },
//     { id: "3", name: "Математика", room: "103" },
//     { id: "4", name: "Иностранный язык", room: "103" },
//     {
//       id: "5",
//       name: "Физическая культура",
//       room: "Спортзал",
//     },
//   ],
//   wednesday: [
//     {
//       id: "1",
//       name: "Белорусская литература",
//       room: "103",
//     },
//     { id: "2", name: "Белорусский язык", room: "103" },
//     { id: "3", name: "Человек и мир", room: "103" },
//     { id: "4", name: "Математика", room: "103" },
//     { id: "5", name: "ОБЖ", room: "103" },
//   ],
//   thursday: [
//     { id: "1", name: "Математика", room: "103" },
//     { id: "2", name: "Иностранный язык", room: "103" },
//     {
//       id: "3",
//       name: "Физическая культура",
//       room: "Спортзал",
//     },
//     {
//       id: "4",
//       name: "Русский язык",
//       room: "103",
//     },
//   ],
//   friday: [
//     { id: "1", name: "Русская литература", room: "103" },
//     { id: "2", name: "Русский язык", room: "103" },
//     {
//       id: "3",
//       name: "Трудовое обучение",
//       room: "103",
//     },
//     { id: "4", name: "Иностранный язык", room: "103" },
//     { id: "4", name: "Музыка", room: "103" },
//   ],
// };

class ScheduleStore {
  currentSchedule: IDaySchedule | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchSchedule(classId: string, dayId: DayOfWeek) {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await ScheduleService.getDaySchedule(
        classId,
        dayId,
      );
      runInAction(() => {
        this.currentSchedule = data ?? { lessons: [] };
      });
    } catch (err: any) {
      runInAction(() => {
        this.error =
          err.message ?? "Ошибка при загрузке расписания";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async saveSchedule(
    classId: string,
    dayId: DayOfWeek,
    lessons: ILesson[],
  ) {
    this.isLoading = true;
    this.error = null;
    try {
      const scheduleData: IDaySchedule = { lessons };
      await ScheduleService.saveDaySchedule(
        classId,
        dayId,
        scheduleData,
      );

      runInAction(() => {
        this.currentSchedule = scheduleData;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error =
          err.message ?? "Ошибка при сохранении расписания";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // async seedMockData(classId: string = "4_A") {
  //   this.isLoading = true;
  //   this.error = null;
  //   try {
  //     const days = Object.keys(
  //       MOCK_WEEK_SCHEDULE,
  //     ) as DayOfWeek[];
  //
  //     for (const day of days) {
  //       const lessons =
  //         MOCK_WEEK_SCHEDULE[
  //           day as keyof typeof MOCK_WEEK_SCHEDULE
  //         ];
  //
  //       await ScheduleService.saveDaySchedule(
  //         classId,
  //         day,
  //         { lessons },
  //       );
  //     }
  //
  //     console.log(
  //       `[ScheduleStore] Моковые данные для класса ${classId} успешно сгенерированы!`,
  //     );
  //   } catch (err: any) {
  //     runInAction(() => {
  //       this.error =
  //         err.message ??
  //         "Не удалось загрузить моковые данные";
  //     });
  //   } finally {
  //     runInAction(() => {
  //       this.isLoading = false;
  //     });
  //   }
  // }
}

export const scheduleStore = new ScheduleStore();
