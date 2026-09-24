import {makeAutoObservable, runInAction} from 'mobx';
import {collection, doc, getDoc, getDocs, updateDoc} from 'firebase/firestore';
import {onAuthStateChanged, signInWithEmailAndPassword, type User as FirebaseUser} from 'firebase/auth';
import {auth, db} from "../../firebase.ts";

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
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data() as UserProfile;

                const subjectsCollRef = collection(db, 'users', uid, 'subjects');
                const subjectsSnap = await getDocs(subjectsCollRef);

                const subjectsMap: Record<string, ISubject> = {};

                subjectsSnap.forEach((subjectDoc) => {
                    subjectsMap[subjectDoc.id] = {
                        id: subjectDoc.id,
                        ...subjectDoc.data()
                    } as ISubject;
                });

                runInAction(() => {
                    this.profile = {
                        ...userData,
                        subjects: subjectsMap
                    };
                    this.isLoading = false;
                });
            } else {
                console.error('Документ пользователя не найден в Firestore');
                runInAction(() => {
                    this.profile = null;
                    this.isLoading = false;
                });
            }
        } catch (error) {
            console.error('Ошибка при получении профиля:', error);
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    addMarkAndSave = async (
        studentUid: string,
        subjectId: string,
        termKey: 'term_1' | 'term_2' | 'term_3' | 'term_4',
        newMark: number
    ) => {
        // Проверяем, авторизован ли пользователь в системе (зарегистрирован)
        if (!this.user || !this.profile || !this.profile.subjects) {
            console.error('Ошибка: Пользователь не авторизован или профиль не загружен.');
            return;
        }

        try {
            runInAction(() => { this.isLoading = true; });

            // 1. Формируем новые данные
            const currentSubject = this.profile.subjects[subjectId];
            const currentTermData = currentSubject?.[termKey] || { marks: [], finalMark: null };
            const updatedMarks = [...currentTermData.marks, newMark];

            // 2. Рассчитываем средний балл
            const sum = updatedMarks.reduce((acc, val) => acc + val, 0);
            const average = sum / updatedMarks.length;
            const calculatedFinalMark = Math.round(average);

            // 3. Отправляем изменения в Firestore подколлекцию subjects
            const subjectDocRef = doc(db, 'users', studentUid, 'subjects', subjectId);

            await updateDoc(subjectDocRef, {
                [`${termKey}.marks`]: updatedMarks,
                [`${termKey}.finalMark`]: calculatedFinalMark
            });

            // 4. Обновляем локальное состояние в MobX
            runInAction(() => {
                if (this.profile && this.profile.subjects && this.profile.subjects[subjectId]) {
                    this.profile.subjects[subjectId][termKey] = {
                        marks: updatedMarks,
                        finalMark: calculatedFinalMark
                    };
                }
                this.isLoading = false;
            });

            console.log(`Оценка ${newMark} успешно добавлена. Новый итог: ${calculatedFinalMark}`);
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            runInAction(() => { this.isLoading = false; });
        }
    }

    deleteMarkAndSave = async (
        studentUid: string,
        subjectId: string,
        termKey: 'term_1' | 'term_2' | 'term_3' | 'term_4',
        markIndex: number
    ) => {
        // Проверяем, авторизован ли пользователь в системе (зарегистрирован)
        if (!this.user || !this.profile || !this.profile.subjects) {
            console.error('Ошибка: Пользователь не авторизован или профиль не загружен.');
            return;
        }

        try {
            runInAction(() => { this.isLoading = true; });

            const currentSubject = this.profile.subjects[subjectId];
            const currentTermData = currentSubject?.[termKey];

            if (!currentTermData || !currentTermData.marks) return;

            // 1. Создаем новый массив, исключая оценку по переданному индексу
            const updatedMarks = currentTermData.marks.filter((_, idx) => idx !== markIndex);

            // 2. Пересчитываем итоговую оценку для нового массива
            let calculatedFinalMark: number | null = null;
            if (updatedMarks.length > 0) {
                const sum = updatedMarks.reduce((acc, val) => acc + val, 0);
                calculatedFinalMark = Math.round(sum / updatedMarks.length);
            }

            // 3. Ссылка на документ предмета в Firestore
            const subjectDocRef = doc(db, 'users', studentUid, 'subjects', subjectId);

            // 4. Обновляем данные в Firestore
            await updateDoc(subjectDocRef, {
                [`${termKey}.marks`]: updatedMarks,
                [`${termKey}.finalMark`]: calculatedFinalMark
            });

            // 5. Синхронизируем локальное состояние MobX для мгновенного рендера в UI
            runInAction(() => {
                if (this.profile && this.profile.subjects && this.profile.subjects[subjectId]) {
                    this.profile.subjects[subjectId][termKey] = {
                        marks: updatedMarks,
                        finalMark: calculatedFinalMark
                    };
                }
                this.isLoading = false;
            });

            console.log(`Оценка успешно удалена. Новый итог: ${calculatedFinalMark ?? 'нет оценок'}`);
        } catch (error) {
            console.error('Ошибка при удалении оценки:', error);
            runInAction(() => { this.isLoading = false; });
        }
    }


    login = async (email: string, password: string) => {
        try {
            runInAction(() => {
                this.authError = null;
                this.isLoading = true;
            });

            await signInWithEmailAndPassword(auth, email, password);

        } catch (error: any) {
            runInAction(() => {
                this.isLoading = false;
                switch (error.code) {
                    case 'auth/invalid-email':
                        this.authError = 'Некорректный формат Email';
                        break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        this.authError = 'Неверный email или пароль';
                        break;
                    case 'auth/too-many-requests':
                        this.authError = 'Слишком много попыток. Попробуйте позже';
                        break;
                    default:
                        this.authError = 'Произошла ошибка при входе';
                }
            });
        }
    }

    async logout() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Ошибка при выходе:', error);
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
