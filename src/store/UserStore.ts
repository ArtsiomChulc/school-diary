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

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  class?: string;
  createdAt: Date;
  subjects?: Record<string, ISubject>;
  telegramChatIds: string;
}

class UserStore {
  user: FirebaseUser | null = null;
  profile: UserProfile | null = null;
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
          this.profile = null;
          this.isLoading = false;
        });
      }
    });
  }

  private async fetchUserProfile(uid: string) {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserProfile;

        const subjectsCollRef = collection(
          db,
          "users",
          uid,
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

        runInAction(() => {
          this.profile = {
            ...userData,
            subjects: subjectsMap,
          };
          this.isLoading = false;
        });
      } else {
        toast.error(
          "Документ пользователя не найден в Firestore",
        );
        console.error(
          "Документ пользователя не найден в Firestore",
        );
        runInAction(() => {
          this.profile = null;
          this.isLoading = false;
        });
      }
    } catch (error) {
      toast.error("Ошибка при получении профиля");
      console.error("Ошибка при получении профиля:", error);
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  private sendTelegramNotification = async (
    chatId: string | string[],
    text: string,
  ) => {
    const base = "https://api.telegram.org";
    const BOT_TOKEN = import.meta.env
      ?.VITE_TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
      toast.error(
        "Критическая ошибка: Токен Telegram бота не найден в переменных .env!",
      );
      console.error(
        "Критическая ошибка: Токен Telegram бота не найден в переменных .env!",
      );
      return;
    }

    const action = `/bot${BOT_TOKEN}/sendMessage`;
    const cleanText = text.replace(/<\/?[^>]+(>|\$)/g, "");

    // 1. Превращаем в массив
    const rawChatIds = Array.isArray(chatId)
      ? chatId
      : [chatId];

    // 2. ЗАЩИТА: Фильтруем массив, оставляя только существующие строки/числа
    const chatIds = rawChatIds
      .filter(Boolean)
      .map((id) => String(id).trim());

    try {
      // Формируем массив промисов только для валидных ID
      const requests = chatIds.map(async (trimmedId) => {
        if (!trimmedId) return; // доп. подстраховка

        const url = new URL(base + action);
        url.searchParams.append("chat_id", trimmedId);
        url.searchParams.append("text", cleanText);

        return fetch(url.toString(), { mode: "no-cors" });
      });

      // Ждем завершения всех запросов параллельно
      await Promise.all(requests);
      toast.success(
        `Уведомления успешно отправлены в Telegram`,
      );
    } catch (error) {
      toast.error(
        "Не удалось отправить сообщения в Telegram",
      );
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
    // Проверяем, авторизован ли пользователь в системе (зарегистрирован)
    if (
      !this.user ||
      !this.profile ||
      !this.profile.subjects
    ) {
      toast.error(
        "Ошибка: Пользователь не авторизован или профиль не загружен.",
        { duration: 3500 },
      );
      console.error(
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

      // 2. Рассчитываем средний балл
      const sum = updatedMarks.reduce(
        (acc, val) => acc + val,
        0,
      );
      const average = sum / updatedMarks.length;
      const calculatedFinalMark = Math.round(average);

      // 3. Отправляем изменения в Firestore подколлекцию subjects
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

          const message =
            `➕ <b>Новая оценка!</b>\n\n` +
            `📚 Предмет: <b>${subjectName}</b>\n` +
            `📅 Четверть: <b>${termNames[termKey]}</b>\n` +
            `💯 Оценка: <b>${newMark}</b>\n\n` +
            `⏰ <i>Добавлено: ${formattedDateTime}</i>` +
            `👤 Добавил: <b>${this.profile.name}</b>`;

          await this.sendTelegramNotification(
            this.profile.telegramChatIds,
            message,
          );
        }
      } catch (e) {
        console.error("Ошибка при вызове уведомления:", e);
      }

      // 4. Обновляем локальное состояние в MobX
      runInAction(() => {
        if (
          this.profile &&
          this.profile.subjects &&
          this.profile.subjects[subjectId]
        ) {
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
      !this.profile.subjects
    ) {
      toast.error(
        "Ошибка: Пользователь не авторизован или профиль не загружен.",
      );
      console.error(
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

      // Получаем удаляемую оценку перед фильтрацией массива, чтобы указать её в уведомлении
      const deletedMark = currentTermData.marks[markIndex];

      // 1. Создаем новый массив, исключая оценку по переданному индексу
      const updatedMarks = currentTermData.marks.filter(
        (_, idx) => idx !== markIndex,
      );

      // 2. Пересчитываем итоговую оценку для нового массива
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

      // 3. Ссылка на документ предмета в Firestore
      const subjectDocRef = doc(
        db,
        "users",
        studentUid,
        "subjects",
        subjectId,
      );

      // 4. Обновляем данные в Firestore
      await updateDoc(subjectDocRef, {
        [`${termKey}.marks`]: updatedMarks,
        [`${termKey}.finalMark`]: calculatedFinalMark,
      });

      // 5. Синхронизируем локальное состояние MobX для мгновенного рендера в UI
      runInAction(() => {
        if (
          this.profile &&
          this.profile.subjects &&
          this.profile.subjects[subjectId]
        ) {
          this.profile.subjects[subjectId][termKey] = {
            marks: updatedMarks,
            finalMark: calculatedFinalMark,
          };
        }
        this.isLoading = false;
      });

      // 6. Отправка уведомления об удалении оценки в Telegram
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

          const message =
            `🗑️ <b>Оценка удалена!</b>\n\n` +
            `📚 Предмет: <b>${subjectName}</b>\n` +
            `📅 Четверть: <b>${termNames[termKey]}</b>\n` +
            `❌ Удалена оценка: <b>${deletedMark}</b>\n\n` +
            `⏰ <i>Время удаления: ${formattedDateTime}</i>` +
            `👤 Удалил: <b>${this.profile.name}</b>`;

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

  /**
   * Возвращает прогноз: сколько и каких оценок нужно получить до желаемого балла
   * @param currentMarks Массив текущих оценок четверти
   * @param targetMark Желаемая итоговая оценка (например, 8)
   */
  getPrediction(
    currentMarks: number[],
    targetMark: number,
  ): string {
    if (targetMark < 1 || targetMark > 10)
      return "Оценка должна быть от 1 до 10";

    const sum = currentMarks.reduce((a, b) => a + b, 0);
    const count = currentMarks.length;

    // Если оценок еще нет, достаточно получить одну желаемую оценку
    if (count === 0) {
      return `Чтобы получить ${targetMark}, достаточно получить одну ${targetMark}.`;
    }

    // Проверяем текущий средний балл с округлением Math.round
    const currentAverage = sum / count;
    if (Math.round(currentAverage) >= targetMark) {
      return `У тебя уже выходит ${targetMark} или выше! Отличная работа! 🎉`;
    }

    // Минимальный средний балл, который при округлении даст targetMark (например, для 8 это 7.5)
    const requiredAverage = targetMark - 0.5;

    // Алгоритм подбора: ищем сколько нужно 10-ок или 9-ок
    // Формула: (ТекущаяСумма + N * Балл) / (ТекущееКоличество + N) >= requiredAverage
    // Отсюда: N >= (requiredAverage * ТекущееКоличество - ТекущаяСумма) / (Балл - requiredAverage)

    // Сначала пробуем идеальный вариант — получать только 10-ки
    if (targetMark <= 10) {
      const denominator10 = 10 - requiredAverage;
      if (denominator10 > 0) {
        const needed10 = Math.ceil(
          (requiredAverage * count - sum) / denominator10,
        );
        if (needed10 > 0 && needed10 <= 15) {
          // Ограничим разумным количеством
          return `Тебе нужно получить еще ${needed10} шт оценок "10". 🚀`;
        }
      }
    }

    // Если 10-ки не подходят или желаемый балл ниже, пробуем подбор других высоких оценок (например, 9)
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

export const userStore = new UserStore();
