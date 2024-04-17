import React, { useState, useEffect } from 'react';
import { ref, query, onValue, runTransaction, orderByChild, equalTo, get, set } from 'firebase/database';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import '@ag-grid-community/styles/ag-theme-alpine.min.css';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { saveToLocalStorage, getFromLocalStorage } from './utils';

// Assuming these imports correctly point to your Firebase configuration
import { database as db1 } from '../firebase.db1.config';
import { database as db2 } from '../firebase.db2.config';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const App = () => {
  const [userData, setUserData] = useState(getFromLocalStorage('data') || {});
  const [rowData, setRowData] = useState([]);
  const [typeOfFood, setTypeOfFood] = useState('');

  useEffect(() => {
    if (!typeOfFood) return;

    const fetchRowData = async () => {
      const fetchDataFromDb = async (db) => {
        const dbQuery = query(ref(db, 'restaurants'), orderByChild('Type of food'), equalTo(typeOfFood));
        const snapshot = await get(dbQuery);
        return snapshot.exists() ? snapshot.val() : {};
      };

      const dataDb1 = await fetchDataFromDb(db1);
      const dataDb2 = await fetchDataFromDb(db2);

      // Combine and transform data from both databases
      const combinedData = [...Object.keys(dataDb1).map(key => ({ ...dataDb1[key], id: key, db: 'db1' })),
                             ...Object.keys(dataDb2).map(key => ({ ...dataDb2[key], id: key, db: 'db2' }))];

      setRowData(combinedData);
    };

    fetchRowData();
  }, [typeOfFood]);

  const onEdit = (rowData, property) => async (e) => {
    const db = rowData.db === 'db1' ? db1 : db2;
    const restaurantRef = ref(db, `restaurants/${rowData.id}`);
    const updateValue = e.target.checked ? 1 : -1;

    // Transaction to update likes, dislikes, and 'Num of score'
    runTransaction(restaurantRef, (currentData) => {
      if (currentData) {
        const scoreData = currentData.Score || {};
        scoreData.Likes = scoreData.Likes || 0;
        scoreData.Dislikes = scoreData.Dislikes || 0;

        if (property === 'like') {
          scoreData.Likes += updateValue;
        } else if (property === 'dislike') {
          scoreData.Dislikes += updateValue;
        }

        scoreData['Num of score'] = scoreData.Likes - scoreData.Dislikes;
        currentData.Score = scoreData;

        return currentData;
      }

      return;
    });

    // Update local storage and userData state
    const newUserdata = { ...userData, [rowData.id]: { ...(userData[rowData.id] || {}), [property]: e.target.checked } };
    saveToLocalStorage('data', newUserdata);
    setUserData(newUserdata);
  };

  const colDefs = [
    { field: 'Name', filter: true },
    { field: 'Type of food', headerName: 'Type of Food', filter: true },
    { field: 'Score.Likes', headerName: 'Total Likes' },
    { field: 'Score.Dislikes', headerName: 'Total Dislikes' },
    { field: 'Score["Num of score"]', headerName: 'Num of Score' },
    // Add other columns as necessary
  ];

  return (
    <div className={window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'} style={{ height: 600, width: '100%' }}>
      <select onChange={(e) => setTypeOfFood(e.target.value)} value={typeOfFood}>
        <option value="">Select Type of Food</option>
        <option value="japanese">Japanese</option>
        <option value="italian">Italian</option>
        <option value="mexican">Mexican</option>
        // Add other options as necessary
      </select>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        domLayout='autoHeight'
      />
    </div>
  );
};

export default App;
