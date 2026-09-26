import { type FC, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { userStore } from '../../../store/UserStore.ts';
import s from './SubjectDetails.module.css';
import toast from "react-hot-toast";
import {TrashIcon} from "lucide-react";

interface DetailsProps {
    subjectId: string;
    onBack: () => void;
}

export const SubjectDetails: FC<DetailsProps> = observer(({ subjectId, onBack }) => {
    const { profile, addMarkAndSave, deleteMarkAndSave, isLoading } = userStore;
    const [selectedTerm, setSelectedTerm] = useState<'term_1' | 'term_2' | 'term_3' | 'term_4'>('term_1');
    const [showMarkSelector, setShowMarkSelector] = useState(false);

    if (!profile || !profile.subjects) return null;

    const subject = profile.subjects[subjectId];
    if (!subject) return <div>Предмет не найден</div>;

    const currentTermData = subject[selectedTerm];

    const handleAddMark = async (mark: number) => {
        await addMarkAndSave(profile.uid, subjectId, selectedTerm, mark);
        setShowMarkSelector(false);
    };

    const handleDeleteMark = (index: number) => {
        if (!currentTermData || !currentTermData.marks) return;

        const deletedMark = currentTermData.marks[index];

        deleteMarkAndSave(profile.uid, subjectId, selectedTerm, index);

        toast((t) => (
            <span style={{ fontSize: '14px', color: '#2d3748' }}>
            Оценка <b>{deletedMark}</b> удалена.
            <button
                onClick={async () => {
                    await addMarkAndSave(profile.uid, subjectId, selectedTerm, deletedMark);
                    toast.dismiss(t.id);
                    toast.success('Удаление отменено');
                }}
                style={{
                    marginLeft: '12px',
                    backgroundColor: '#fff',
                    border: '1px solid #cbd5e0',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#3182ce',
                    fontWeight: 'bold'
                }}
            >
                Отменить
            </button>
        </span>
        ), {
            duration: 6000,
            icon: '🗑️',
        });
    };

    return (
        <div className={s.container}>
            <button onClick={onBack} className={s.backBtn}>← Назад в дневник</button>
            <h2 className={s.title}>{subject.name}</h2>

            <div className={s.tabs}>
                {(['term_1', 'term_2', 'term_3', 'term_4'] as const).map((key) => (
                    <button
                        key={key}
                        onClick={() => { setSelectedTerm(key); setShowMarkSelector(false); }}
                        className={`${s.tabBtn} ${selectedTerm === key ? s.tabBtnActive : s.tabBtnInactive}`}
                    >
                        {key === 'term_1' ? 'I ч.' : key === 'term_2' ? 'II ч.' : key === 'term_3' ? 'III ч.' : 'IV ч.'}
                    </button>
                ))}
            </div>

            <div className={s.detailsCard}>
                <h3>Текущие оценки:</h3>
                <div className={s.marksContainer}>
                    {currentTermData?.marks && currentTermData.marks.length > 0 ? (
                        currentTermData.marks.map((m, idx) => (
                            <div key={idx} className={s.markBadge}>
                                <span>{m}</span>
                                <button
                                    onClick={() => handleDeleteMark(idx)}
                                    disabled={isLoading}
                                    className={s.deleteMarkBtn}
                                    title="Удалить оценку"
                                >
                                    {<TrashIcon size={18}/>}
                                </button>
                            </div>
                        ))
                    ) : (
                        <span className={s.emptyMarks}>Оценок пока нет</span>
                    )}
                </div>

                <div className={s.finalMarkWrapper}>
                    <strong>Итоговая оценка за четверть: </strong>
                    <span className={s.finalMarkText}>
                        {currentTermData?.finalMark ?? 'не выставлена'}
                    </span>
                </div>

                <div className={s.addMarkSection}>
                    {!showMarkSelector ? (
                        <button onClick={() => setShowMarkSelector(true)} disabled={isLoading} className={s.addBtn}>
                            + Добавить оценку
                        </button>
                    ) : (
                        <div>
                            <p className={s.selectorTitle}>Выберите балл:</p>
                            <div className={s.digitsGrid}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button key={num} onClick={() => handleAddMark(num)} className={s.digitBtn}>
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowMarkSelector(false)} className={s.cancelBtn}>Отмена</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
