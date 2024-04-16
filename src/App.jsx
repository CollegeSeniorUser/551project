import { useState, useEffect } from "react";
import {
  ref,
  query,
  onValue,
  runTransaction,
  orderByChild,
  equalTo,
} from "firebase/database";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import "@ag-grid-community/styles/ag-theme-alpine.min.css";

import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { saveToLocalStorage, getFromLocalStorage } from "./utils";

// The configuration files for the two different databases
import { database as db1 } from "../firebase.db1.config";
import { database as db2 } from "../firebase.db2.config";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const isDarkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
  // Row Data: The data to be displayed.
  const [userData, setUserData] = useState(getFromLocalStorage("data") || {});
  const [rowData, setRowData] = useState([]);
  const [typeOfFood, setTypeOfFood] = useState();

  // const myQuery = query(ref(database, "restaurants"));

  const handlePickTypeOfFood = (e) => {
    setTypeOfFood(e.target.value);
  };

  // Whenever we detect a change in the type of food, we query both databases
  // Then we "tranform" the data to a format that the grid can understand
  // Before displaying it
  useEffect(() => {
    if (!typeOfFood) return;
    const dbOneQuery = query(
      ref(db1, "restaurants"),
      orderByChild("Type of food"),
      equalTo(typeOfFood)
    );

    const dbTwoQuery = query(
      ref(db2, "restaurants"),
      orderByChild("Type of food"),
      equalTo(typeOfFood)
    );

    setRowData([]);
    onValue(dbOneQuery, (snapshot) => {
      const data = [];

      snapshot.forEach((child) => {
        data.push({ ...child.val(), id: child.key });
      });

      setRowData((prev) => [
        ...prev,
        // eslint-disable-next-line no-unused-vars
        ...Object.entries(data).map(([id, value]) => ({
          id: value.id,
          ...value,
          db: "db1",
          userData: userData[value.id],
        })),
      ]);
    });

    onValue(dbTwoQuery, (snapshot) => {
      const data = [];

      snapshot.forEach((child) => {
        data.push({ ...child.val(), id: child.key });
      });

      setRowData((prev) => [
        ...prev,
        // eslint-disable-next-line no-unused-vars
        ...Object.entries(data).map(([id, value]) => ({
          id: value.id,
          ...value,
          db: "db2",
          userData: userData[value.id],
        })),
      ]);
    });
  }, [userData, typeOfFood]);

  // This function is called whenever a user clicks on a checkbox
  // It updates the data in the database and in the local storage
  // It also updates the state of the userData (Which is really just a helper along with the local storage)
  const onEdit = (rowData, property) => (e) => {
    // Update realtime DB

    const db = rowData.db === "db1" ? db1 : db2;
    if (property === "like") {
      const likesRef = ref(db, `restaurants/${rowData.id}/Score/Likes`);

      runTransaction(likesRef, (currentLikes) => {
        // if currentLikes has never been set, currentLikes will be `null`.
        return (currentLikes || 0) + (e.target.checked ? 1 : -1);
      });

      console.log("id", "like-" + rowData.id);
      if (e.target.checked && rowData.userData?.dislike) {
        const likesRef = ref(db, `restaurants/${rowData.id}/Score/Dislikes`);

        runTransaction(likesRef, (currentDislikes) => {
          // if currentLikes has never been set, currentLikes will be `null`.
          return (currentDislikes || 0) - 1;
        });
      }
    }

    if (property === "dislike") {
      const likesRef = ref(db, `restaurants/${rowData.id}/Score/Dislikes`);

      runTransaction(likesRef, (currentDisikes) => {
        // if currentLikes has never been set, currentLikes will be `null`.
        return (currentDisikes || 0) + (e.target.checked ? 1 : -1);
      });

      if (e.target.checked && rowData.userData?.like) {
        const likesRef = ref(db, `restaurants/${rowData.id}/Score/Likes`);

        runTransaction(likesRef, (currentLikes) => {
          // if currentLikes has never been set, currentLikes will be `null`.
          return (currentLikes || 0) - 1;
        });
      }
    }

    saveToLocalStorage("data", {
      [rowData.id]: { [property]: e.target.checked },
    });

    setUserData((prev) => ({
      ...prev,
      [rowData.id]: { [property]: e.target.checked },
    }));
  };

  // Column Definitions: Defines & controls grid columns.
  const [colDefs] = useState([
    { field: "Location", filter: true },
    { field: "Name", filter: true },
    { field: "Type of food", headerName: "Type of Food", filter: true },

    { field: "Score.Likes", headerName: "Total number of likes" },
    {
      field: "like",
      cellRenderer: (params) => (
        <div className="checkbox-parent">
          <label className="checkbox-container">
            <input
              id={"like-" + params.data.id}
              onChange={onEdit(params.data, "like")}
              className="custom-checkbox"
              defaultChecked={params.data.userData?.like}
              type="checkbox"
            />
            <span className="checkmark" />
          </label>
        </div>
      ),
    },

    { field: "Score.Dislikes", headerName: "Total number of dislikes" },
    {
      field: "dislike",
      cellRenderer: (params) => (
        <div className="checkbox-parent">
          <label className="checkbox-container">
            <input
              id={"dislike-" + params.data.id}
              onChange={onEdit(params.data, "dislike")}
              className="custom-checkbox red"
              defaultChecked={params.data.userData?.dislike}
              type="checkbox"
            />
            <span className="checkmark" />
          </label>
        </div>
      ),
    },
    {
      field: "Rating",
      cellRenderer: ({ data }) => {
        const totalVotes = data.Score.Likes + data.Score.Dislikes;

        if (totalVotes === 0) {
          return 0; // Default value when there are no votes
        }

        const rating = (data.Score.Likes / totalVotes) * 5;
        return <b>{rating.toFixed(2)}</b>;
      },
    },
    { field: "Score.Likes", headerName: "Total number of likes" },

    {
      field: "NumScore",
      cellRenderer: ({ data }) => {
        const totalVotes = data.Score.Likes + data.Score.Dislikes;

        return <b>{totalVotes}</b>;
      },
    },

  ]);

  // Container: Defines the grid's theme & dimensions.
  return (
    <div
      className={isDarkMode ? "ag-theme-quartz-dark" : "ag-theme-quartz"}
      style={{ width: "100%", height: "100%" }}
    >
      <select
        name="typeoffood"
        id="typeoffood"
        onChange={handlePickTypeOfFood}
        value={typeOfFood}>
        <option value=""></option>
        <option value="british">British</option>
        <option value="french">French</option>
        <option value="korean">Korean</option>
        <option value="spanish">Spanish</option>
        <option value="other">Other</option>
      </select>


      <AgGridReact
        rowData={
          // Sorting the data by Name
          rowData.sort((a, b) => {
            if (a.Name < b.Name) {
              return -1;
            }
            if (a.Name > b.Name) {
              return 1;
            }
            return 0;
          })
        }
        columnDefs={colDefs}
      />
    </div>
  );
}

export default App;
