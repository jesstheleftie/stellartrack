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
  categories = {},
}) => {
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!initialCheckDone && watchList.length === 0) {
      togglePopup(true);
      setInitialCheckDone(true);
    }
  }, [initialCheckDone, watchList]);

  // const [watchList, setWatchList] = useState([]);

  const toggleGroupSelection = (key) => {
    setSelectedGroups((prevSelected) =>
      prevSelected.includes(key)
        ? prevSelected.filter((group) => group !== key)
        : [...prevSelected, key]
    );
  };

  const handleAddToWatchList = () => {
    const newGroups = selectedGroups.filter(
      (group) => !watchList.includes(group)
    );

    setWatchList((prevWatchList) => [
      ...new Set([...prevWatchList, ...selectedGroups]),
    ]);
    setVisibleGroups((prevVisibleGroups) => [
      ...new Set([...prevVisibleGroups, ...newGroups]),
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
  const handleCategoryClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };
  const isButtonDisabled = selectedGroups.length === 0; // Disable button if no items are selected
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
            <div className="popup-content-inner">
              {Object.keys(urls).map((categoryKey) => {
                const categoryTitle =
                  categories[categoryKey] || "Unknown Category";
                const categoryData = urls[categoryKey] || {};

                return (
                  <div key={categoryKey}>
                    <button
                      className="category-button"
                      onClick={() => handleCategoryClick(categoryKey)}
                    >
                      {categoryTitle}
                    </button>
                    {expandedCategory === categoryKey && (
                      <div className="category-content">
                        {Object.keys(categoryData).map((key) => {
                          const group = categoryData[key] || {};
                          return (
                            <button
                              key={key}
                              onClick={() => toggleGroupSelection(key)}
                              className={
                                selectedGroups.includes(key) ? "selected" : ""
                              }
                            >
                              {group.title || "No Title"}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              className="add-to-watch-list"
              onClick={handleAddToWatchList}
              disabled={isButtonDisabled}
            >
              Add To Watch List
            </button>
          </div>
        </div>
      )}

      {watchList.length > 0 && (
        <div className="watch-list">
          <h3>Watch List</h3>
          <ul>
            {watchList.map((group, index) => {
              const groupData =
                Object.values(urls)
                  .flatMap((category) => Object.entries(category))
                  .find(([key, data]) => key === group)?.[1] || {};
              return (
                <li
                  key={index}
                  onClick={() => setSelectedGroup(group)}
                  className={`${
                    visibleGroups.includes(group) ? "visible-group" : ""
                  }`}
                >
                  {groupData.title || "No Title"}
                  <FontAwesomeIcon
                    icon={visibleGroups.includes(group) ? faEye : faEyeSlash}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisibilityToggle(group);
                    }}
                    className="visibility-icon"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
