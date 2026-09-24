import React from 'react';
import { observer } from 'mobx-react-lite';
import { userStore } from '../../../store/UserStore.ts';
import type { ISubject } from '../../../store/UserStore.ts';

interface MainTableProps {
    onSelectSubject: (id: string) => void;
}

export const SubjectsTable: React.FC<MainTableProps> = observer(({ onSelectSubject }) => {
    const { profile, isLoading } = userStore;

    if (isLoading) return <div style={styles.centered}>Загрузка дневника...</div>;
    if (!profile || !profile.subjects) return <div style={styles.centered}>Нет данных</div>;

    const subjectsList = Object.values(profile.subjects);
    const terms: ('term_1' | 'term_2' | 'term_3' | 'term_4')[] = ['term_1', 'term_2', 'term_3', 'term_4'];

    // Вспомогательная функция для расчета годовой оценки на лету
    const calculateYearlyMark = (subject: ISubject): number | string => {
        const finalMarks: number[] = [];

        // Собираем все выставленные четвертные оценки
        terms.forEach((termKey) => {
            const finalMark = subject[termKey]?.finalMark;
            if (finalMark !== undefined && finalMark !== null) {
                finalMarks.push(finalMark);
            }
        });

        // Если нет ни одной четвертной оценки — выводим прочерк
        if (finalMarks.length === 0) return '—';

        // Считаем среднее арифметическое выставленных четвертей
        const sum = finalMarks.reduce((acc, val) => acc + val, 0);
        const average = sum / finalMarks.length;

        // Округляем до ближайшего целого по школьным правилам
        return Math.round(average);
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Электронный дневник: {profile.name} {profile.class} класс</h2>
            <p style={{ color: '#718096', marginBottom: '20px', fontSize: '14px' }}>
                💡 Нажмите на название предмета, чтобы посмотреть текущие оценки или выставить новые.
            </p>

            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.thLeft}>Предмет</th>
                    <th style={styles.th}>I четв.</th>
                    <th style={styles.th}>II четв.</th>
                    <th style={styles.th}>III четв.</th>
                    <th style={styles.th}>IV четв.</th>
                    {/* Новая колонка для годовой оценки */}
                    <th style={styles.thYearly}>Годовая</th>
                </tr>
                </thead>
                <tbody>
                {subjectsList.map((subject: ISubject) => {
                    const yearlyMark = calculateYearlyMark(subject);

                    return (
                        <tr key={subject.id} style={styles.tr}>
                            {/* Кликабельное название предмета */}
                            <td style={styles.tdName} onClick={() => onSelectSubject(subject.id)}>
                                {subject.name}
                            </td>

                            {/* Вывод четвертей */}
                            {terms.map((termKey) => {
                                const finalMark = subject[termKey]?.finalMark;
                                return (
                                    <td key={termKey} style={styles.tdMark}>
                                        {finalMark !== undefined && finalMark !== null ? (
                                            <span style={styles.finalMarkBadge}>{finalMark}</span>
                                        ) : (
                                            <span style={styles.empty}>—</span>
                                        )}
                                    </td>
                                );
                            })}

                            {/* Вывод рассчитанной годовой оценки */}
                            <td style={styles.tdMark}>
                                {typeof yearlyMark === 'number' ? (
                                    <span style={styles.yearlyMarkBadge}>{yearlyMark}</span>
                                ) : (
                                    <span style={styles.empty}>{yearlyMark}</span>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
});

// Обновленные стили с акцентом на годовую колонку
const styles = {
    container: { padding: '24px', maxWidth: '950px', margin: '0 auto', fontFamily: 'sans-serif' },
    title: { color: '#2d3748', marginBottom: '8px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' },
    th: { backgroundColor: '#4a5568', color: '#fff', padding: '12px', fontSize: '14px', textAlign: 'center' as const, width: '12%' },
    thLeft: { backgroundColor: '#4a5568', color: '#fff', padding: '12px', fontSize: '14px', textAlign: 'left' as const, width: '40%' },

    // Стиль для шапки годовой оценки (выделяем синеватым фоном)
    thYearly: { backgroundColor: '#2b6cb0', color: '#fff', padding: '12px', fontSize: '14px', textAlign: 'center' as const, width: '12%', fontWeight: 'bold' as const },

    tr: { borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s', '&:hover': { backgroundColor: '#f7fafc' } },
    tdName: { padding: '16px', color: '#3182ce', fontWeight: 'bold' as const, cursor: 'pointer', textTransform: 'capitalize' as const, '&:hover': { textDecoration: 'underline' } },
    tdMark: { padding: '16px', textAlign: 'center' as const },
    finalMarkBadge: { backgroundColor: '#e6fffa', color: '#2f855a', padding: '4px 10px', borderRadius: '4px', fontWeight: 500, border: '1px solid #b2f5ea', display: 'inline-block', minWidth: '24px' },

    // Яркий бейдж для годовой оценки
    yearlyMarkBadge: { backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' as const, border: '1px solid #bee3f8', display: 'inline-block', minWidth: '32px', fontSize: '15px' },

    empty: { color: '#cbd5e0' },
    centered: { textAlign: 'center' as const, padding: '40px', color: '#718096' }
};
