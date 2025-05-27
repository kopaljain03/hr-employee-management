import React, { useState, useEffect } from "react";
import "./FilterPanel.css";

const FilterPanel = ({ referenceValues, onSearch, clearTrigger }) => {
  const [id, setId] = useState("");
  const [nameOrFather, setNameOrFather] = useState("");
  const [gender, setGender] = useState({
    male: false,
    female: false,
    other: false,
  });
  const [dob, setDob] = useState("");
  const [education, setEducation] = useState({
    ssc: false,
    hsc: false,
    ug: false,
    pg: false,
  });
  const [receivingDate, setReceivingDate] = useState("");
  const [waitingPeriod, setWaitingPeriod] = useState("");
  const [priority, setPriority] = useState("");
  const [age, setAge] = useState("");
  const [anything, setAnything] = useState("");
  const [reference, setReference] = useState("");

  const handleSearchClick = () => {
    // Convert checkbox selections into arrays for consistency
    const selectedGenders = Object.keys(gender).filter((key) => gender[key]);
    const selectedEducation = Object.keys(education).filter(
      (key) => education[key]
    );

    onSearch({
      idText: id,
      nameText: nameOrFather,
      selectedGenders,
      dob,
      selectedEducationLevels: selectedEducation,
      receivingDate,
      waitingPeriod,
      priority,
      age,
      anything,
      selectedReference: reference,
    });
  };
  useEffect(() => {
    setId("");
    setNameOrFather("");
    setGender({ male: false, female: false, other: false });
    setDob("");
    setEducation({ ssc: false, hsc: false, ug: false, pg: false });
    setReceivingDate("");
    setWaitingPeriod("");
    setPriority("");
    setAge("");
    setAnything("");
    setReference("");
  }, [clearTrigger]);

  return (
    <div className="filter-panel">
      <div className="field">
        <label>ID:</label>
        <input value={id} onChange={(e) => setId(e.target.value)} />
      </div>

      <div className="field">
        <label>Name or Father Name:</label>
        <input
          value={nameOrFather}
          onChange={(e) => setNameOrFather(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Gender:</label>
        <div className="checkbox-group">
          {["male", "female", "other"].map((g) => (
            <label key={g}>
              <input
                type="checkbox"
                checked={gender[g]}
                onChange={() =>
                  setGender((prev) => ({ ...prev, [g]: !prev[g] }))
                }
              />
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label>DOB:</label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Education:</label>
        <div className="checkbox-group">
          {["ssc", "hsc", "ug", "pg"].map((edu) => (
            <label key={edu}>
              <input
                type="checkbox"
                checked={education[edu]}
                onChange={() =>
                  setEducation((prev) => ({ ...prev, [edu]: !prev[edu] }))
                }
              />
              {edu.toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Receiving Date:</label>
        <input
          type="date"
          value={receivingDate}
          onChange={(e) => setReceivingDate(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Waiting (days):</label>
        <input
          value={waitingPeriod}
          onChange={(e) => setWaitingPeriod(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Priority:</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Any</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="field">
        <label>Age below:</label>
        <input value={age} onChange={(e) => setAge(e.target.value)} />
      </div>

      <div className="field">
        <label>Anything:</label>
        <input value={anything} onChange={(e) => setAnything(e.target.value)} />
      </div>

      <div className="field">
        <label>References:</label>
        <select
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        >
          <option value="">Any</option>
          {referenceValues.map((ref) => (
            <option key={ref} value={ref}>
              {ref}
            </option>
          ))}
        </select>
      </div>

      <div className="field actions">
        <button className="btn btn-success" onClick={handleSearchClick}>
          Search
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
