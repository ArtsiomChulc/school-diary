import { useState, useEffect, type FC} from 'react';
import { observer } from 'mobx-react-lite';
import {GradeCalculator} from "../../../screens/gradeCalculator/GradeCalculator.tsx";
import {SubjectDetails} from "../subjectDetails/SubjectDetails.tsx";
import {SubjectsTable} from "../subjectsTable/SubjectsTable.tsx";

interface DashboardProps {
    externalView: 'diary' | 'calculator';
    setExternalView: (view: 'diary' | 'calculator') => void;
}

export const Dashboard: FC<DashboardProps> = observer(({ externalView, setExternalView }) => {
    // Внутреннее состояние для отслеживания выбранного предмета
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    // Внутренний под-экран: 'table' (список) или 'details' (карточка предмета)
    const [subView, setSubView] = useState<'table' | 'details'>('table');

    // Если пользователь переключился на калькулятор через хедер,
    // сбрасываем просмотр конкретного предмета, чтобы при возвращении открылась общая таблица
    useEffect(() => {
        if (externalView === 'calculator') {
            setSelectedSubjectId(null);
            setSubView('table');
        }
    }, [externalView]);

    const handleSelectSubject = (id: string) => {
        setSelectedSubjectId(id);
        setSubView('details');
        setExternalView('diary'); // Гарантируем, что режим 'diary' активен
    };

    const handleBackToTable = () => {
        setSelectedSubjectId(null);
        setSubView('table');
    };

    // 1. Отображаем глобальный калькулятор оценок
    if (externalView === 'calculator') {
        return <GradeCalculator onBack={() => setExternalView('diary')} />;
    }

    // 2. Отображаем детальные оценки по выбранному предмету
    if (subView === 'details' && selectedSubjectId) {
        return (
            <SubjectDetails
                subjectId={selectedSubjectId}
                onBack={handleBackToTable}
            />
        );
    }

    // 3. По умолчанию отображаем главную таблицу предметов
    return <SubjectsTable onSelectSubject={handleSelectSubject} />;
});
