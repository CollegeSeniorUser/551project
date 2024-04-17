// Import statement corrections
import { useState, useEffect } from "react";
import {
  ref,
  query,
  onValue,
  runTransaction,
  orderByChild,
  equalTo,
  get,
  set,
} from "firebase/database";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import "@ag-grid-community/styles/ag-theme-alpine.min.css";

import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { saveToLocalStorage, getFromLocalStorage } from "./utils";

import { database as db1 } from "../firebase.db1.config";
import { database as db2 } from "../firebase.db2.config";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
  const [userData, setUserData] = useState(getFromLocalStorage("data") || {});
  const [rowData, setRowData] = useState([]);
  const [typeOfFood, setTypeOfFood] = useState("");

  const handlePickTypeOfFood = (e) => {
    setTypeOfFood(e.target.value);
  };

  useEffect(() => {
    if (!typeOfFood) return;

    const fetchData = async (db, type) => {
      const dbQuery = query(ref(db, "restaurants"), orderByChild("Type of food"), equalTo(type));
      const snapshot = await get(dbQuery);
      const data = [];

      snapshot.forEach((child) => {
        const val = child.val();
        data.push({
          ...val,
          id: child.key,
          db: db === db1 ? "db1" : "db2",
          userData: userData[child.key] || {},
        });
      });

      return data;
    };

    Promise.all([fetchData(db1, typeOfFood), fetchData(db2, typeOfFood)]).then((results) => {
      const combinedData = results.flat();
      setRowData(combinedData);
    });

  }, [typeOfFood, userData]);

  const onEdit = async (rowData, property) => {
    const db = rowData.db === "db1" ? db1 : db2;
    const propertyToUpdate = property === "like" ? "Likes" : "Dislikes";
    const oppositeProperty = property === "like" ? "Dislikes" : "Likes";

    // Run transaction to update likes/dislikes
    const propertyRef = ref(db, `restaurants/${rowData.id}/Score/${propertyToUpdate}`);
    await runTransaction(propertyRef, (current) => (current || 0) + 1);

    // If the opposite property was previously selected, decrement it.
    if (rowData.userData[property === "like" ? "dislike" : "like"]) {
      const oppositeRef = ref(db, `restaurants/${rowData.id}/Score/${oppositeProperty}`);
      await runTransaction(oppositeRef, (current) => (current || 0) - 1);
    }

    // Update "Num of score" directly based on the new likes/dislikes
    const likesRef = ref(db, `restaurants/${rowData.id}/Score/Likes`);
    const dislikesRef = ref(db, `restaurants/${rowData.id}/Score/Dislikes`);
    const [likesSnap, dislikesSnap] = await Promise.all([get(likesRef), get(dislikesRef)]);
    const likes = likesSnap.val() || 0;
    const dislikes = dislikesSnap.val() || 0;
    const numScoreRef = ref(db, `restaurants/${rowData.id}/Score/Num of score`);
    set(numScoreRef, likes - dislikes);

    // Update local storage and state to reflect the change
    const updatedUserData = {
      ...userData,
      [rowData.id]: { ...(userData[rowData.id] || {}), [property]: true },
    };
    saveToLocalStorage("data", updatedUserData);
    setUserData(updatedUserData);
  };

  // Column Definitions and other components remain unchanged

