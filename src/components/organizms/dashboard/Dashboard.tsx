import {type FC, useState } from 'react';
import {SubjectDetails} from "../subjectDetails/SubjectDetails.tsx";
import {SubjectsTable} from "../subjectsTable/SubjectsTable.tsx";


export const Dashboard: FC = () => {
    const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);

    if (currentSubjectId) {
        return (
            <SubjectDetails
                subjectId={currentSubjectId}
                onBack={() => setCurrentSubjectId(null)}
            />
        );
    }

    return <SubjectsTable onSelectSubject={(id) => setCurrentSubjectId(id)} />;
};
