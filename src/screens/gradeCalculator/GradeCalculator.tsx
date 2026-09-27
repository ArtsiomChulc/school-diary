import {type FC, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {userStore} from "../../store/UserStore.ts";
import s from './GradeCalculator.module.css';

interface CalculatorProps {
    onBack: () => void;
}

export const GradeCalculator: FC<CalculatorProps> = observer(({ onBack }) => {
    const { profile } = userStore;

    // Храним желаемые оценки для каждого предмета отдельно в виде объекта { math: 8, blrlang: 9 }
    const [targets, setTargets] = useState<Record<string, number>>({});
    const [selectedTerm, setSelectedTerm] = useState<'term_1' | 'term_2' | 'term_3' | 'term_4'>('term_1');

    if (!profile || !profile.subjects) return null;

    const subjectsList = Object.values(profile.subjects);

    const handleTargetChange = (subjectId: string, value: number) => {
        setTargets((prev) => ({ ...prev, [subjectId]: value }));
    };

    return (
        <div className={s.container}>
            <button onClick={onBack} className={s.backBtn}>← Назад в дневник</button>
            <h2 className={s.title}>🔮 Магический калькулятор оценок</h2>
            <p className={s.subtitle}>Узнай, сколько точных оценок нужно получить, чтобы исправить балл за четверть</p>

            {/* Выбор четверти для прогноза */}
            <div className={s.tabs}>
                {(['term_1', 'term_2', 'term_3', 'term_4'] as const).map((key) => (
                    <button
                        key={key}
                        onClick={() => setSelectedTerm(key)}
                        className={`${s.tabBtn} ${selectedTerm === key ? s.tabBtnActive : s.tabBtnInactive}`}
                    >
                        {key === 'term_1' ? 'I ч.' : key === 'term_2' ? 'II ч.' : key === 'term_3' ? 'III ч.' : 'IV ч.'}
                    </button>
                ))}
            </div>

            {/* Список предметов для расчета */}
            <div className={s.grid}>
                {subjectsList.map((subject) => {
                    const currentMarks = subject[selectedTerm]?.marks || [];
                    const currentTarget = targets[subject.id] || 8; // По умолчанию предлагаем "8"

                    return (
                        <div key={subject.id} className={s.card}>
                            <h3 className={s.subjectName}>{subject.name}</h3>

                            <div className={s.row}>
                                <span>Текущие оценки: </span>
                                <span className={s.currentMarks}>
                                    {currentMarks.length > 0 ? `(${currentMarks.join(', ')})` : 'нет оценок'}
                                </span>
                            </div>

                            <div className={s.inputRow}>
                                <label htmlFor={`select-${subject.id}`}>Хочу получить:</label>
                                <select
                                    id={`select-${subject.id}`}
                                    value={currentTarget}
                                    onChange={(e) => handleTargetChange(subject.id, Number(e.target.value))}
                                    className={s.selectInput}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={s.predictionBox}>
                                {userStore.getPrediction(currentMarks, currentTarget)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
