import React, { useState } from "react";
import "../ControlPanel/ControlPanel.css";

const ControlPanel = ({
  urls,
  selectedGroup,
  setSelectedGroup,
  satelliteData,
  isPopupVisible,
  togglePopup,
}) => {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [watchList, setWatchList] = useState([]);

  const toggleGroupSelection = (key) => {
    setSelectedGroups((prevSelected) =>
      prevSelected.includes(key)
        ? prevSelected.filter((group) => group !== key)
        : [...prevSelected, key]
    );
  };

  const handleAddToWatchList = () => {
    setWatchList((prevWatchList) => [...prevWatchList, ...selectedGroups]);
    setSelectedGroups([]);
    togglePopup();
  };

  return (
    <div className="ControlPanel">
      <div>Stellar Track</div>
      {/* Square button with "+" */}
      <button className="add-button" onClick={togglePopup}>
        +
      </button>

      {/* Popup for selecting a group */}
      {isPopupVisible && (
        <div className="popup">
          <div className="popup-content">
            <div onClick={togglePopup} className="close-popup">
              x
            </div>
            <h3>Select a Group</h3>
            {Object.keys(urls).map((key) => (
              <button
                key={key}
                onClick={() => toggleGroupSelection(key)}
                className={selectedGroups.includes(key) ? "selected" : ""}
              >
                {urls[key].title}
              </button>
            ))}

            <button
              className="add-to-watch-list"
              onClick={handleAddToWatchList}
            >
              ADD TO WATCH LIST
            </button>
          </div>
        </div>
      )}

      {watchList.length > 0 && (
        <div className="watch-list">
          <h3>Watch List</h3>
          <ul>
            {watchList.map((group, index) => (
              <li
                key={index}
                onClick={() => setSelectedGroup(group)}
                // style={{ color: `${selectedGroup === group ? "red" : ""}` }}
                className={selectedGroup === group ? "controlSelected" : ""}
              >
                {urls[group].title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* {selectedGroup && (
        <div className="selected-group-title">
          <h3>{urls[selectedGroup].title}</h3>
        </div>
      )} */}
    </div>
  );
};

export default ControlPanel;
