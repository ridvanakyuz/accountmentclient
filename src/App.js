import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    axios
      .get("https://accountmentserver.netlify.app/accounts")
      .then((response) => {
        setAccounts(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 150 }}>Yükleniyor...</div>
    );
  if (error)
    return (
      <div style={{ textAlign: "center", marginTop: 150 }}>
        {"Bilinmeyen bir hata oluştu."}
      </div>
    );

  // Grouping logic by hierarchical codes
  const groupByCode = (data, length) => {
    const grouped = {};
    data.forEach((account) => {
      const groupKey = account.hesap_kodu.slice(0, length);
      if (!grouped[groupKey]) {
        grouped[groupKey] = { borc: 0, alacak: 0, children: [] };
      }
      grouped[groupKey].borc += parseFloat(account.borc || 0);
      grouped[groupKey].alacak += parseFloat(account.alacak || 0);
      grouped[groupKey].children.push(account);
    });

    // Sorting groups by hesap_kodu in ascending order
    const sortedGrouped = Object.keys(grouped)
      .sort() // Sort by the group key (hesap_kodu) in ascending order
      .reduce((sortedObj, key) => {
        sortedObj[key] = grouped[key];
        return sortedObj;
      }, {});

    // Sorting children by hesap_kodu in ascending order
    Object.keys(sortedGrouped).forEach((key) => {
      sortedGrouped[key].children.sort((a, b) =>
        a.hesap_kodu.localeCompare(b.hesap_kodu)
      );
    });

    return sortedGrouped;
  };

  const renderRows = (group, length) => {
    return Object.keys(group).map((key) => (
      <React.Fragment key={key}>
        <tr>
          <td
            style={{ cursor: "pointer" }}
            onClick={() =>
              setExpanded((prev) => ({
                ...prev,
                [key + length]: !prev[key + length],
              }))
            }
          >
            {expanded[key + length] ? "-" : "+"}
          </td>
          <td>{key}</td>
          <td>{group[key].borc.toFixed(2)}</td>
          <td>{group[key].alacak.toFixed(2)}</td>
        </tr>
        {expanded[key + length] &&
          group[key].children.map((child) => (
            <tr key={child.hesap_kodu}>
              <td></td>
              <td>{child.hesap_kodu}</td>
              <td>{child.borc}</td>
              <td>{child.alacak}</td>
            </tr>
          ))}
      </React.Fragment>
    ));
  };

  const first3Group = groupByCode(accounts, 3);
  const first5Group = groupByCode(accounts, 6);
  const first8Group = groupByCode(accounts, 9);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Hesap Raporu</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap", // Ensures the children wrap to the next line on small screens
        }}
      >

        <div>
          <h2>İlk Üç Kırılım</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th></th>
                <th>Hesap Kodu</th>
                <th>Toplam Borç</th>
                <th>Toplam Alacak</th>
              </tr>
            </thead>
            <tbody>{renderRows(first3Group, 3)}</tbody>
          </table>
        </div>

        <div>
          <h2>İlk Beş Kırılım</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th></th>
                <th>Hesap Kodu</th>
                <th>Toplam Borç</th>
                <th>Toplam Alacak</th>
              </tr>
            </thead>
            <tbody>{renderRows(first5Group, 5)}</tbody>
          </table>
        </div>
        <div>
          <h2>İlk Sekiz Kırılım</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th></th>
                <th>Hesap Kodu</th>
                <th>Toplam Borç</th>
                <th>Toplam Alacak</th>
              </tr>
            </thead>
            <tbody>{renderRows(first8Group, 8)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
