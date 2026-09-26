import { observer } from 'mobx-react-lite';
import { userStore } from '../../../store/UserStore.ts';
import type { ISubject } from '../../../store/UserStore.ts';
import type {FC} from "react";
import s from './SubjectsTable.module.css';

interface MainTableProps {
    onSelectSubject: (id: string) => void;
}

export const SubjectsTable: FC<MainTableProps> = observer(({ onSelectSubject }) => {
    const { profile, isLoading } = userStore;

    if (isLoading) return <div className={s.centered}>Загрузка дневника...</div>;
    if (!profile || !profile.subjects) return <div className={s.centered}>Нет данных</div>;

    const subjectsList = Object.values(profile.subjects);
    const terms: ('term_1' | 'term_2' | 'term_3' | 'term_4')[] = ['term_1', 'term_2', 'term_3', 'term_4'];

    const calculateYearlyMark = (subject: ISubject): number | string => {
        const finalMarks: number[] = [];

        terms.forEach((termKey) => {
            const finalMark = subject[termKey]?.finalMark;
            if (finalMark !== undefined && finalMark !== null) {
                finalMarks.push(finalMark);
            }
        });

        if (finalMarks.length === 0) return '—';

        const sum = finalMarks.reduce((acc, val) => acc + val, 0);
        const average = sum / finalMarks.length;

        return Math.round(average);
    };

    return (
        <div className={s.container}>
            <h2 className={s.title}>Электронный дневник: {profile.name} {profile.class} класс</h2>
            <p className={s.description}>
                💡 Нажмите на название предмета, чтобы посмотреть текущие оценки или выставить новые.
            </p>

            <div className={s.tableWrapper}>

                <table className={s.table}>
                    <thead>
                    <tr>
                        <th className={s.thLeft}>Предмет</th>
                        <th className={s.th}>I четв.</th>
                        <th className={s.th}>II четв.</th>
                        <th className={s.th}>III четв.</th>
                        <th className={s.th}>IV четв.</th>
                        <th className={s.thYearly}>Годовая</th>
                    </tr>
                    </thead>
                    <tbody>
                    {subjectsList.map((subject: ISubject) => {
                        const yearlyMark = calculateYearlyMark(subject);

                        return (
                            <tr key={subject.id} className={s.tr}>
                                <td className={s.tdName} onClick={() => onSelectSubject(subject.id)}>
                                    {subject.name}
                                </td>

                                {terms.map((termKey) => {
                                    const finalMark = subject[termKey]?.finalMark;
                                    return (
                                        <td key={termKey} className={s.tdMark}>
                                            {finalMark !== undefined && finalMark !== null ? (
                                                <span className={s.finalMarkBadge}>{finalMark}</span>
                                            ) : (
                                                <span className={s.empty}>—</span>
                                            )}
                                        </td>
                                    );
                                })}

                                <td className={s.tdMark}>
                                    {typeof yearlyMark === 'number' ? (
                                        <span className={s.yearlyMarkBadge}>{yearlyMark}</span>
                                    ) : (
                                        <span className={s.empty}>{yearlyMark}</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
