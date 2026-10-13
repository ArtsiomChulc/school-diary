import { makeAutoObservable, runInAction } from "mobx";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "../../firebase.ts";
import toast from "react-hot-toast";

export interface ITermMarks {
  marks: number[];
  finalMark?: number | null;
}

export interface ISubject {
  id: string;
  name: string;
  term_1?: ITermMarks;
  term_2?: ITermMarks;
  term_3?: ITermMarks;
  term_4?: ITermMarks;
}

// Интерфейс профиля ученика
export interface IStudentProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  class?: string;
  createdAt: any;
  subjects?: Record<string, ISubject>;
  telegramChatIds: string | string[];
}

// Интерфейс профиля родителя
export interface IParentProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: any;
  children: string[]; // Массив UID детей
}

class UserStore {
  user: FirebaseUser | null = null;
  currentUserProfile:
    IStudentProfile | IParentProfile | null = null; // Кто залогинен (Родитель или Ученик)
  profile: IStudentProfile | null = null; // Чей дневник открыт (например, Стефания)
  isLoading: boolean = true;
  authError: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initAuthListener();
  }

  private initAuthListener() {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        runInAction(() => {
          this.user = currentUser;
          this.isLoading = true;
        });

        await this.fetchUserProfile(currentUser.uid);
      } else {
        runInAction(() => {
          this.user = null;
          this.currentUserProfile = null;
          this.profile = null;
          this.isLoading = false;
        });
      }
    });
  }

  private async fetchUserProfile(uid: string) {
    try {
      // 1. Проверяем, есть ли пользователь в коллекции учеников (users)
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData =
          userDocSnap.data() as IStudentProfile;
        const subjectsMap =
          await this.fetchStudentSubjects(uid);

        runInAction(() => {
          this.currentUserProfile = {
            ...userData,
            subjects: subjectsMap,
          };
          this.profile = this
            .currentUserProfile as IStudentProfile; // У ученика профили совпадают
          this.isLoading = false;
        });
        return;
      }

      // 2. Если в учениках нет, ищем в коллекции родителей (parents)
      const parentDocRef = doc(db, "parents", uid);
      const parentDocSnap = await getDoc(parentDocRef);

      if (parentDocSnap.exists()) {
        const parentData =
          parentDocSnap.data() as IParentProfile;

        runInAction(() => {
          this.currentUserProfile = parentData;
        });

        // Автоматически подгружаем дневник первого ребенка из массива children, если он есть
        if (
          parentData.children &&
          parentData.children.length > 0
        ) {
          await this.loadStudentProfile(
            parentData.children[0],
          );
        } else {
          runInAction(() => {
            this.isLoading = false;
          });
        }
        return;
      }

      // 3. Если нигде не нашли
      toast.error(
        "Документ пользователя не найден в Firestore",
      );
      runInAction(() => {
        this.currentUserProfile = null;
        this.profile = null;
        this.isLoading = false;
      });
    } catch (error) {
      toast.error("Ошибка при получении профиля");
      console.error("Ошибка при получении профиля:", error);
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Вспомогательный метод для загрузки подколлекции предметов конкретного ученика
  private async fetchStudentSubjects(
    studentUid: string,
  ): Promise<Record<string, ISubject>> {
    const subjectsCollRef = collection(
      db,
      "users",
      studentUid,
      "subjects",
    );
    const subjectsSnap = await getDocs(subjectsCollRef);
    const subjectsMap: Record<string, ISubject> = {};

    subjectsSnap.forEach((subjectDoc) => {
      subjectsMap[subjectDoc.id] = {
        id: subjectDoc.id,
        ...subjectDoc.data(),
      } as ISubject;
    });

    return subjectsMap;
  }

  /**
   * Метод для явного переключения/загрузки дневника конкретного ребенка (нужен для UI родителей)
   */
  loadStudentProfile = async (studentUid: string) => {
    try {
      runInAction(() => {
        this.isLoading = true;
      });

      const studentDocRef = doc(db, "users", studentUid);
      const studentDocSnap = await getDoc(studentDocRef);

      if (studentDocSnap.exists()) {
        const studentData =
          studentDocSnap.data() as IStudentProfile;
        const subjectsMap =
          await this.fetchStudentSubjects(studentUid);

        runInAction(() => {
          this.profile = {
            ...studentData,
            subjects: subjectsMap,
          };
          this.isLoading = false;
        });
      } else {
        toast.error("Документ ребенка не найден");
        runInAction(() => {
          this.isLoading = false;
        });
      }
    } catch (error) {
      console.error(
        "Ошибка при загрузке профиля ребенка:",
        error,
      );
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  private sendTelegramNotification = async (
    chatId: string | string[],
    text: string,
  ) => {
    const base = "https://api.telegram.org";
    const BOT_TOKEN = import.meta.env
      ?.VITE_TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
      toast.error(
        "Критическая ошибка: Токен Telegram не найден в .env!",
      );
      return;
    }

    const action = "/bot" + BOT_TOKEN + "/sendMessage";
    const rawChatIds = Array.isArray(chatId)
      ? chatId
      : [chatId];
    const chatIds = rawChatIds
      .filter(Boolean)
      .map((id) => String(id).trim());

    try {
      const requests = chatIds.map(async (trimmedId) => {
        if (!trimmedId) return;

        const url = new URL(base + action);
        url.searchParams.append("chat_id", trimmedId);
        url.searchParams.append("text", text);
        url.searchParams.append("parse_mode", "HTML"); // Оставляем поддержку HTML-тегов для красоты

        return fetch(url.toString(), { mode: "no-cors" });
      });

      await Promise.all(requests);
      toast.success(`Уведомления отправлены в Telegram`);
    } catch (error) {
      console.error(
        "Не удалось отправить сообщения в Telegram:",
        error,
      );
    }
  };

  addMarkAndSave = async (
    studentUid: string,
    subjectId: string,
    termKey: "term_1" | "term_2" | "term_3" | "term_4",
    newMark: number,
  ) => {
    if (
      !this.user ||
      !this.profile ||
      !this.profile.subjects ||
      !this.currentUserProfile
    ) {
      toast.error(
        "Ошибка: Пользователь не авторизован или профиль не загружен.",
      );
      return;
    }

    try {
      runInAction(() => {
        this.isLoading = true;
      });

      // 1. Формируем новые данные
      const currentSubject =
        this.profile.subjects[subjectId];
      const currentTermData = currentSubject?.[termKey] || {
        marks: [],
        finalMark: null,
      };
      const updatedMarks = [
        ...currentTermData.marks,
        newMark,
      ];

      const sum = updatedMarks.reduce(
        (acc, val) => acc + val,
        0,
      );
      const calculatedFinalMark = Math.round(
        sum / updatedMarks.length,
      );

      const subjectDocRef = doc(
        db,
        "users",
        studentUid,
        "subjects",
        subjectId,
      );

      await updateDoc(subjectDocRef, {
        [`${termKey}.marks`]: updatedMarks,
        [`${termKey}.finalMark`]: calculatedFinalMark,
      });

      // 4. Отправка уведомления
      try {
        if (this.profile && this.profile.telegramChatIds) {
          const termNames = {
            term_1: "I",
            term_2: "II",
            term_3: "III",
            term_4: "IV",
          };
          const now = new Date();
          const formattedDateTime = now.toLocaleString(
            "ru-RU",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          );

          const subjectName =
            this.profile.subjects[subjectId]?.name ||
            subjectId;
          const authorName = this.currentUserProfile.name;

          const message =
            `➕ <b>Новая оценка!</b>\n\n` +
            `📚 Предмет: <b>${subjectName}</b>\n` +
            `📅 Четверть: <b>${termNames[termKey]}</b>\n` +
            `💯 Оценка: <b>${newMark}</b>\n\n` +
            `⏰ <i>Добавлено: ${formattedDateTime}</i>\n` +
            `👤 Добавил(а): <b>${authorName}</b>`;

          await this.sendTelegramNotification(
            this.profile.telegramChatIds,
            message,
          );
        }
      } catch (e) {
        console.error("Ошибка при вызове уведомления:", e);
      }

      // 5. Обновляем локальное состояние в MobX
      runInAction(() => {
        if (this.profile?.subjects?.[subjectId]) {
          this.profile.subjects[subjectId][termKey] = {
            marks: updatedMarks,
            finalMark: calculatedFinalMark,
          };
        }
        this.isLoading = false;
      });

      toast.success(
        `Оценка ${newMark} успешно добавлена. Новый итог: ${calculatedFinalMark}`,
        { duration: 3000 },
      );
    } catch (error) {
      toast.error("Ошибка при сохранении");
      console.error("Ошибка при сохранении:", error);
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  deleteMarkAndSave = async (
    studentUid: string,
    subjectId: string,
    termKey: "term_1" | "term_2" | "term_3" | "term_4",
    markIndex: number,
  ) => {
    if (
      !this.user ||
      !this.profile ||
      !this.profile.subjects ||
      !this.currentUserProfile
    ) {
      toast.error(
        "Ошибка: Пользователь не авторизован или профиль не загружен.",
      );
      return;
    }

    try {
      runInAction(() => {
        this.isLoading = true;
      });

      const currentSubject =
        this.profile.subjects[subjectId];
      const currentTermData = currentSubject?.[termKey];
      if (!currentTermData || !currentTermData.marks)
        return;
      // Получаем удаляемую оценку перед фильтрацией
      const deletedMark = currentTermData.marks[markIndex];
      const updatedMarks = currentTermData.marks.filter(
        (_, idx) => idx !== markIndex,
      );
      let calculatedFinalMark: number | null = null;
      if (updatedMarks.length > 0) {
        const sum = updatedMarks.reduce(
          (acc, val) => acc + val,
          0,
        );
        calculatedFinalMark = Math.round(
          sum / updatedMarks.length,
        );
      }
      // Ссылка строго на документ предмета ребенка
      const subjectDocRef = doc(
        db,
        "users",
        studentUid,
        "subjects",
        subjectId,
      );
      await updateDoc(subjectDocRef, {
        [`${termKey}.marks`]: updatedMarks,
        [`${termKey}.finalMark`]: calculatedFinalMark,
      });
      // Синхронизируем локальное состояние MobX
      runInAction(() => {
        if (this.profile?.subjects?.[subjectId]) {
          this.profile.subjects[subjectId][termKey] = {
            marks: updatedMarks,
            finalMark: calculatedFinalMark,
          };
        }
        this.isLoading = false;
      });
      // Отправка уведомления об удалении
      try {
        if (this.profile && this.profile.telegramChatIds) {
          const termNames = {
            term_1: "I",
            term_2: "II",
            term_3: "III",
            term_4: "IV",
          };
          const now = new Date();
          const formattedDateTime = now.toLocaleString(
            "ru-RU",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          );
          const subjectName =
            this.profile.subjects[subjectId]?.name ||
            subjectId;
          const authorName = this.currentUserProfile.name;
          const message =
            `🗑️ <b>Оценка удалена!</b>\n\n` +
            `📚 Предмет: <b>${subjectName}</b>\n` +
            `📅 Четверть: <b>${termNames[termKey]}</b>\n` +
            `❌ Удалена оценка: <b>${deletedMark}</b>\n\n` +
            `⏰ <i>Время удаления: ${formattedDateTime}</i>\n` +
            `👤 Удалил(а): <b>${authorName}</b>`;
          await this.sendTelegramNotification(
            this.profile.telegramChatIds,
            message,
          );
        }
      } catch (e) {
        console.error(
          "Ошибка при вызове уведомления (удаление):",
          e,
        );
      }
      toast.success("Оценка успешно удалена.");
    } catch (error) {
      toast.error("Ошибка при удалении оценки");
      console.error("Ошибка при удалении оценки:", error);
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
  getPrediction(
    currentMarks: number[],
    targetMark: number,
  ): string {
    if (targetMark < 1 || targetMark > 10)
      return "Оценка должна быть от 1 до 10";
    const sum = currentMarks.reduce((a, b) => a + b, 0);
    const count = currentMarks.length;
    if (count === 0) {
      return `Чтобы получить ${targetMark}, достаточно получить одну ${targetMark}.`;
    }
    const currentAverage = sum / count;
    if (Math.round(currentAverage) >= targetMark) {
      return `У тебя уже выходит ${targetMark} или выше! Отличная работа! 🎉`;
    }
    const requiredAverage = targetMark - 0.5;
    if (targetMark <= 10) {
      const denominator10 = 10 - requiredAverage;
      if (denominator10 > 0) {
        const needed10 = Math.ceil(
          (requiredAverage * count - sum) / denominator10,
        );
        if (needed10 > 0 && needed10 <= 15) {
          return `Тебе нужно получить еще ${needed10} шт оценок "10". 🚀`;
        }
      }
    }
    if (targetMark <= 9) {
      const denominator9 = 9 - requiredAverage;
      if (denominator9 > 0) {
        const needed9 = Math.ceil(
          (requiredAverage * count - sum) / denominator9,
        );
        if (needed9 > 0 && needed9 <= 15) {
          return `Тебе нужно получить еще столько оценок "9": ${needed9} шт. 👍`;
        }
      }
    }
    return `К сожалению, поднять балл до ${targetMark} в этой четверти математически почти невозможно. 📊`;
  }
  login = async (email: string, password: string) => {
    try {
      runInAction(() => {
        this.authError = null;
        this.isLoading = true;
      });
      await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
    } catch (error: any) {
      runInAction(() => {
        this.isLoading = false;
        switch (error.code) {
          case "auth/invalid-email":
            this.authError = "Некорректный формат Email";
            break;
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            this.authError = "Неверный email или пароль";
            break;
          case "auth/too-many-requests":
            this.authError =
              "Слишком много попыток. Попробуйте позже";
            break;
          default:
            this.authError = "Произошла ошибка при входе";
        }
      });
    }
  };
  async logout() {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  }
}
export const userStore = new UserStore();

// todo delete code
// import { setDoc, serverTimestamp } from 'firebase/firestore';
//
//
// export const quickCreateUser = async () => {
//     // 1. Прописываем данные нового пользователя
//     const userId = "GapDFcFCLCUHO8Qlv25C0I2FNWj2";
//
//     const userRef = doc(db, 'users', userId);
//
//     try {
//         // 2. Создаем самого пользователя
//         await setDoc(userRef, {
//             uid: userId,
//             name: "Стефания Чульц",
//             email: "artemorsha@mail.ru",
//             class: "10 Б",
//             role: "ученица",
//             createdAt: serverTimestamp()
//         });
//
//         // 3. Сразу же создаем базовые предметы в его подколлекции "subjects"
//         const defaultSubjects = [
//             { id: 'blrlang', name: 'Белорусский язык' },
//             { id: 'blrlit', name: 'Белорусская литература (Литературное чтение)' },
//             { id: 'ruslang', name: 'Русский язык' },
//             { id: 'ruslit', name: 'Русская литература (Литературное чтение)' },
//             { id: 'foreign_lang', name: 'Иностранный язык' }, // Обычно английский, немецкий, немецкий или французский
//
//             { id: 'math', name: 'Математика' },
//
//             { id: 'human_and_world', name: 'Человек и мир' },
//             { id: 'may_radzima', name: 'Мая Радзіма — Беларусь' }, // Специальный блок в курсе "Человек и мир" для 4 класса
//
//             { id: 'art', name: 'Изобразительное искусство' },
//             { id: 'music', name: 'Музыка' },
//             { id: 'labor', name: 'Трудовое обучение' },
//
//             { id: 'physical_edu', name: 'Физическая культура и здоровье' },
//             { id: 'obzh', name: 'Основы безопасности жизнедеятельности (ОБЖ)' }
//         ];
//
//         // Пустая структура четвертей, чтобы потом просто дополнять массивы
//         const emptyTerm = {
//             marks: [],
//             finalMark: null
//         };
//
//         for (const subject of defaultSubjects) {
//             const subjectRef = doc(db, 'users', userId, 'subjects', subject.id);
//
//             await setDoc(subjectRef, {
//                 name: subject.name,
//                 term_1: emptyTerm,
//                 term_2: emptyTerm,
//                 term_3: emptyTerm,
//                 term_4: emptyTerm
//             });
//         }
//
//         console.log('Пользователь и все его предметы успешно созданы в Firestore!');
//     } catch (error) {
//         console.error('Ошибка при создании:', error);
//     }
// };
