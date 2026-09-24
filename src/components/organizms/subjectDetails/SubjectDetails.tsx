import {type FC, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { userStore } from '../../../store/UserStore.ts';

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

    // Вызов экшена удаления
    const handleDeleteMark = async (index: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту оценку?')) {
            await deleteMarkAndSave(profile.uid, subjectId, selectedTerm, index);
        }
    };

    return (
        <div style={styles.container}>
            <button onClick={onBack} style={styles.backBtn}>← Назад в дневник</button>
            <h2 style={{ textTransform: 'capitalize', color: '#2d3748' }}>{subject.name}</h2>

            {/* Вкладки четвертей */}
            <div style={styles.tabs}>
                {(['term_1', 'term_2', 'term_3', 'term_4'] as const).map((key) => (
                    <button
                        key={key}
                        onClick={() => { setSelectedTerm(key); setShowMarkSelector(false); }}
                        style={{
                            ...styles.tabBtn,
                            backgroundColor: selectedTerm === key ? '#3182ce' : '#edf2f7',
                            color: selectedTerm === key ? '#fff' : '#4a5568',
                        }}
                    >
                        {key === 'term_1' ? 'I ч.' : key === 'term_2' ? 'II ч.' : key === 'term_3' ? 'III ч.' : 'IV ч.'}
                    </button>
                ))}
            </div>

            <div style={styles.detailsCard}>
                <h3>Текущие оценки:</h3>
                <div style={styles.marksContainer}>
                    {currentTermData?.marks && currentTermData.marks.length > 0 ? (
                        currentTermData.marks.map((m, idx) => (
                            <div key={idx} style={styles.markBadge}>
                                <span>{m}</span>
                                {/* Кнопка удаления теперь доступна всегда */}
                                <button
                                    onClick={() => handleDeleteMark(idx)}
                                    disabled={isLoading}
                                    style={styles.deleteMarkBtn}
                                    title="Удалить оценку"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    ) : (
                        <span style={{ color: '#a0aec0' }}>Оценок пока нет</span>
                    )}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <strong>Итоговая оценка за четверть: </strong>
                    <span style={styles.finalMarkText}>
                        {currentTermData?.finalMark ?? 'не выставлена'}
                    </span>
                </div>

                {/* Блок добавления оценок теперь доступен всем */}
                <div style={{ marginTop: '30px' }}>
                    {!showMarkSelector ? (
                        <button onClick={() => setShowMarkSelector(true)} disabled={isLoading} style={styles.addBtn}>
                            + Добавить оценку
                        </button>
                    ) : (
                        <div>
                            <p style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>Выберите балл:</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button key={num} onClick={() => handleAddMark(num)} style={styles.digitBtn}>
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowMarkSelector(false)} style={styles.cancelBtn}>Отмена</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

const styles = {
    container: { padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' },
    backBtn: { background: 'none', border: 'none', color: '#3182ce', cursor: 'pointer', marginBottom: '15px', padding: 0 },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tabBtn: { padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    detailsCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' },
    marksContainer: { display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' as const },
    finalMarkText: { color: '#2f855a', fontWeight: 'bold' as const, fontSize: '18px' },
    addBtn: { backgroundColor: '#3182ce', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
    digitBtn: { width: '40px', height: '40px', backgroundColor: '#edf2f7', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelBtn: { display: 'block', marginTop: '12px', background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer' },
    markBadge: { display: 'flex', alignItems: 'center', backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '6px 6px 6px 12px', borderRadius: '4px', fontWeight: 'bold' as const, fontSize: '16px', gap: '6px' },
    deleteMarkBtn: { background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '18px', padding: '0 4px', lineHeight: 1, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ':hover': { backgroundColor: '#fed7d7' } }
};
