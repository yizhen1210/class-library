import { useState, useEffect } from "react";
import {
  seedInitialDataIfNeeded,
  subscribeCategories,
  subscribeStudents,
  subscribeBooks,
  subscribeRecords,
  subscribeHolidays
} from "../services/libraryService";

export function useLibraryData(user) {
  const [categories, setCategories] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [records, setRecords] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let unsubs = [];

    (async () => {
      try {
        await seedInitialDataIfNeeded();

        const unsubCats = subscribeCategories(
          (list) => setCategories(list),
          (err) => console.error("Categories sync error:", err)
        );

        const unsubStudents = subscribeStudents(
          (list) => setStudents(list),
          (err) => console.error("Students sync error:", err)
        );

        const unsubBooks = subscribeBooks(
          (list) => setBooks(list),
          (err) => console.error("Books sync error:", err)
        );

        const unsubRecords = subscribeRecords(
          (list) => {
            setRecords(list);
            setLoading(false);
          },
          (err) => {
            console.error("Records sync error:", err);
            setLoading(false);
          }
        );

        const unsubHolidays = subscribeHolidays(
          (list) => setHolidays(list),
          (err) => console.error("Holidays sync error:", err)
        );

        unsubs = [unsubCats, unsubStudents, unsubBooks, unsubRecords, unsubHolidays];
      } catch (err) {
        console.error("即時資料同步失敗:", err);
        setLoading(false);
      }
    })();

    return () => {
      unsubs.forEach(unsub => unsub && unsub());
    };
  }, [user]);

  return {
    categories,
    students,
    books,
    records,
    holidays,
    loading,
    setStudents
  };
}
