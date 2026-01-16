import { useState, useEffect, useCallback } from "react";
import { documentsApi } from "../services/documents";
import { DocumentDto } from "@cortex/shared";

export const useDocuments = () => {
  const [docs, setDocs] = useState<DocumentDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // 1. Fetch
  const refreshList = useCallback(async () => {
    const list = await documentsApi.getAll();
    setDocs(list);
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  // 2. Select
  const selectDocument = async (id: string) => {
    setSelectedId(id);
    const doc = await documentsApi.getOne(id);
    setContent(doc.content);
    setStatus("saved");
  };

  // 3. Create
  const createDocument = async () => {
    const newDoc = await documentsApi.create({
      title: "New Signal",
      content: "# New Signal\nStart writing...",
    });
    await refreshList();
    await selectDocument(newDoc.id);
  };

  // 4. Delete
  const deleteDocument = async (id: string) => {
    await documentsApi.delete(id);
    if (selectedId === id) {
      setSelectedId(null);
      setContent("");
    }
    await refreshList();
  };

  // 5. Autosave Logic
  useEffect(() => {
    if (!selectedId || status === "saved") return;

    const timer = setTimeout(async () => {
      setStatus("saving");
      const titleMatch = content.match(/^# (.*)$/m);
      const title = titleMatch ? titleMatch[1] : "Untitled Note";

      await documentsApi.update(selectedId, { title, content });
      await refreshList();
      setStatus("saved");
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, selectedId, status, refreshList]);

  return {
    docs,
    selectedId,
    content,
    status,
    setContent: (c: string) => {
      setContent(c);
      setStatus("unsaved");
    },
    selectDocument,
    createDocument,
    deleteDocument,
  };
};
