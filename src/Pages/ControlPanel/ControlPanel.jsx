import React, { useEffect, useState } from "react";
import "../ControlPanel/ControlPanel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const ControlPanel = ({
  urls,
  selectedGroup,
  setSelectedGroup,
  satelliteData,
  isPopupVisible,
  togglePopup,
  watchList = [],
  setWatchList,
  visibleGroups,
  setVisibleGroups,
}) => {
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);

  useEffect(() => {
    if (!initialCheckDone && watchList.length === 0) {
      togglePopup(true);
      setInitialCheckDone(true);
    }
  }, [initialCheckDone, watchList]);

  useEffect(() => {
    // Ensure all groups in the watch list are visible by default
    setVisibleGroups((prevVisibleGroups) => [
      ...new Set([...prevVisibleGroups, ...watchList]),
    ]);
  }, [watchList]);

  // const [watchList, setWatchList] = useState([]);

  const toggleGroupSelection = (key) => {
    setSelectedGroups((prevSelected) =>
      prevSelected.includes(key)
        ? prevSelected.filter((group) => group !== key)
        : [...prevSelected, key]
    );
  };

  const handleAddToWatchList = () => {
    setWatchList((prevWatchList) => [
      ...new Set([...prevWatchList, ...selectedGroups]),
    ]);
    setSelectedGroups([]);
    togglePopup(false);
  };

  const handleVisibilityToggle = (key) => {
    setVisibleGroups((prevVisibleGroups) =>
      prevVisibleGroups.includes(key)
        ? prevVisibleGroups.filter((group) => group !== key)
        : [...prevVisibleGroups, key]
    );
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
                className={`${
                  visibleGroups.includes(group) ? "visible-group" : ""
                }`}
              >
                {urls[group].title}
                <FontAwesomeIcon
                  icon={visibleGroups.includes(group) ? faEye : faEyeSlash}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the onClick for the group
                    handleVisibilityToggle(group);
                  }}
                  className="visibility-icon"
                />
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
