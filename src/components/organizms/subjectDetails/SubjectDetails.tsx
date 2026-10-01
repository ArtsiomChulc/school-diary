import { type FC, useState } from "react";
import { observer } from "mobx-react-lite";
import { userStore } from "../../../store/UserStore.ts";
import toast from "react-hot-toast";
import { TrashIcon } from "lucide-react";
import { Text } from "../../atoms/text/Text.tsx";
import { Button } from "../../atoms/button/Button.tsx";
import s from "./SubjectDetails.module.css";

interface DetailsProps {
  subjectId: string;
  onBack: () => void;
}

export const SubjectDetails: FC<DetailsProps> = observer(
  ({ subjectId, onBack }) => {
    const {
      profile,
      addMarkAndSave,
      deleteMarkAndSave,
      isLoading,
    } = userStore;
    const [selectedTerm, setSelectedTerm] = useState<
      "term_1" | "term_2" | "term_3" | "term_4"
    >("term_1");
    const [showMarkSelector, setShowMarkSelector] =
      useState(false);

    if (!profile || !profile.subjects) return null;

    const subject = profile.subjects[subjectId];
    if (!subject) return <div>Предмет не найден</div>;

    const currentTermData = subject[selectedTerm];

    const handleAddMark = async (mark: number) => {
      await addMarkAndSave(
        profile.uid,
        subjectId,
        selectedTerm,
        mark,
      );
      setShowMarkSelector(false);
    };

    const handleDeleteMark = (index: number) => {
      if (!currentTermData || !currentTermData.marks)
        return;

      const deletedMark = currentTermData.marks[index];

      deleteMarkAndSave(
        profile.uid,
        subjectId,
        selectedTerm,
        index,
      );

      toast(
        (t) => (
          <Text color={"var(--text-main)"}>
            Оценка <b>{deletedMark}</b> удалена.
            <Button
              onClick={async () => {
                await addMarkAndSave(
                  profile.uid,
                  subjectId,
                  selectedTerm,
                  deletedMark,
                );
                toast.dismiss(t.id);
                toast.success("Удаление отменено");
              }}
              style={{
                marginLeft: "12px",
                backgroundColor: "#fff",
                border: "1px solid #cbd5e0",
                padding: "2px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                color: "#3182ce",
                fontWeight: "bold",
              }}
            >
              Отменить
            </Button>
          </Text>
        ),
        {
          duration: 6000,
          icon: "🗑️",
        },
      );
    };

    return (
      <div className={s.container}>
        <Button onClick={onBack} className={s.backBtn}>
          ← Назад в дневник
        </Button>
        <Text
          as={"h2"}
          color={"var(--text-main)"}
          style={{
            textTransform: "capitalize",
            paddingBottom: "16px",
          }}
        >
          {subject.name}
        </Text>

        <div className={s.tabs}>
          {(
            [
              "term_1",
              "term_2",
              "term_3",
              "term_4",
            ] as const
          ).map((key) => (
            <Button
              key={key}
              onClick={() => {
                setSelectedTerm(key);
                setShowMarkSelector(false);
              }}
              className={`${s.tabBtn} ${selectedTerm === key ? s.tabBtnActive : s.tabBtnInactive}`}
            >
              {key === "term_1"
                ? "I ч."
                : key === "term_2"
                  ? "II ч."
                  : key === "term_3"
                    ? "III ч."
                    : "IV ч."}
            </Button>
          ))}
        </div>

        <div className={s.detailsCard}>
          <Text as={"h3"} color={"var(--text-main)"}>
            Текущие оценки:
          </Text>
          <div className={s.marksContainer}>
            {currentTermData?.marks &&
            currentTermData.marks.length > 0 ? (
              currentTermData.marks.map((mark, idx) => (
                <div key={idx} className={s.markBadge}>
                  <Text as={"span"} size={"md"}>
                    {mark}
                  </Text>
                  <Button
                    onClick={() => handleDeleteMark(idx)}
                    disabled={isLoading}
                    className={s.deleteMarkBtn}
                    title="Удалить оценку"
                  >
                    {<TrashIcon size={18} />}
                  </Button>
                </div>
              ))
            ) : (
              <Text
                className={s.emptyMarks}
                as={"span"}
                color={"var(--text-secondary)"}
              >
                Оценок пока нет
              </Text>
            )}
          </div>

          <div className={s.finalMarkWrapper}>
            <Text as={"strong"}>
              Итоговая оценка за четверть:{" "}
            </Text>
            <Text
              as={"span"}
              color={"var(--bg-button-form)"}
              size={"lg"}
              weight={600}
            >
              {currentTermData?.finalMark ??
                "не выставлена"}
            </Text>
          </div>

          <div className={s.addMarkSection}>
            {!showMarkSelector ? (
              <Button
                onClick={() => setShowMarkSelector(true)}
                disabled={isLoading}
                className={s.addBtn}
              >
                + Добавить оценку
              </Button>
            ) : (
              <>
                <Text
                  as={"p"}
                  weight={500}
                  style={{ marginBottom: "8px" }}
                >
                  Выберите балл:
                </Text>
                <div className={s.digitsGrid}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                    (num) => (
                      <Button
                        key={num}
                        onClick={() => handleAddMark(num)}
                        className={s.digitBtn}
                      >
                        {num}
                      </Button>
                    ),
                  )}
                </div>
                <Button
                  onClick={() => setShowMarkSelector(false)}
                  className={s.cancelBtn}
                >
                  Отмена
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);
