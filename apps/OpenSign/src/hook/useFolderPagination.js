import { useEffect, useRef, useState } from "react";
import Parse from "parse";

const PAGE_SIZE = 100;
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function useFolderPagination(folderCls, isOpen) {
  const [folderList, setFolderList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);
  const page = useRef({
    folderPtr: undefined,
    skip: 0,
    hasMore: true,
    loading: false,
    searchTerm: ""
  });

  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, [folderCls, isOpen]);

  const fetchFolder = async (folderPtr, append = false, searchTerm = "") => {
    if (append && (page.current.loading || !page.current.hasMore)) return;

    const id = ++requestId.current;
    if (!append) {
      page.current = {
        folderPtr,
        skip: 0,
        hasMore: true,
        loading: false,
        searchTerm
      };
      setFolderList([]);
    }
    const skip = page.current.skip;
    page.current.loading = true;
    setIsLoader(true);
    setError(false);
    try {
      const query = new Parse.Query(folderCls);
      if (folderPtr) {
        query.equalTo("Folder", folderPtr);
      } else {
        query.doesNotExist("Folder");
      }
      query.notEqualTo("IsArchive", true);
      query.equalTo("CreatedBy", Parse.User.current());
      if (page.current.searchTerm) {
        query.matches("Name", escapeRegex(page.current.searchTerm), "i");
      }
      query.descending("Type", "createdAt", "objectId");
      query.limit(PAGE_SIZE);
      query.skip(skip);
      const results = await query.find();
      if (id !== requestId.current) return;

      const folders = results.map((folder) => folder.toJSON());
      setFolderList((previous) => {
        if (!append) return folders;
        const ids = new Set(previous.map((folder) => folder.objectId));
        return [
          ...previous,
          ...folders.filter((folder) => !ids.has(folder.objectId))
        ];
      });
      page.current.skip = skip + results.length;
      page.current.hasMore = results.length === PAGE_SIZE;
    } catch (error) {
      if (id !== requestId.current) return;
      console.error("Error fetching folders", error);
      setError(true);
    } finally {
      if (id === requestId.current) {
        page.current.loading = false;
        setIsLoader(false);
      }
    }
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight <= 1) {
      fetchFolder(page.current.folderPtr, true);
    }
  };

  return {
    folderList,
    setFolderList,
    isLoader,
    error,
    fetchFolder,
    handleScroll
  };
}
