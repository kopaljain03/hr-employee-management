// Utility: Parse comma-separated and ranged ID input like "1,2,4-7"
export function parseIdInput(input) {
  const idSet = new Set();
  input.split(",").forEach((part) => {
    part = part.trim();
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) idSet.add(i);
    } else {
      const id = parseInt(part);
      if (!isNaN(id)) idSet.add(id);
    }
  });
  return idSet;
}
export function filterByStatus(employees, selectedStatus) {
  if (!selectedStatus) return employees; // "All" case
  return employees.filter(
    (emp) => emp["status"]?.toLowerCase() === selectedStatus.toLowerCase()
  );
}

export function filterByAge(employees, maxAge) {
  const today = new Date();

  return employees.filter((emp) => {
    const dobString = emp["Date of"] || emp["dob"];
    console.log("dobString : " + dobString);
    if (!dobString) return false;

    const dob = new Date(dobString);
    if (isNaN(dob)) return false;

    const ageDiff = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    const dayCheck =
      m < 0 || (m === 0 && today.getDate() < dob.getDate()) ? 1 : 0;

    const age = ageDiff - dayCheck;
    return age <= maxAge;
  });
}

export function filterById(employees, idText) {
  const idSet = parseIdInput(idText);
  return employees.filter((emp) => idSet.has(parseInt(emp["applicant_id"])));
}

export function filterByNameOrFather(employees, nameInput) {
  const lowerName = nameInput.toLowerCase();
  return employees.filter(
    (emp) =>
      emp["name"]?.toLowerCase().includes(lowerName) ||
      emp["fathers_name"]?.toLowerCase().includes(lowerName)
  );
}

export function filterByGender(employees, selectedGenders) {
  const lowerGenders = selectedGenders.map((g) => g.toLowerCase());
  return employees.filter((emp) =>
    lowerGenders.includes(emp["gender"]?.toLowerCase())
  );
}

export function filterByEducation(employees, selectedEducationLevels) {
  const eduColumns = {
    ssc: "ssc",
    hsc: "hsc",
    ug: "ug",
    pg: "pg",
  };

  return employees.filter((emp) =>
    selectedEducationLevels.every((level) => {
      const column = eduColumns[level];
      return emp[column] && emp[column].toString().trim() !== "";
    })
  );
}

export function filterByReference(
  employees,
  selectedReference,
  referenceCol = "reference"
) {
  return employees.filter((emp) => emp[referenceCol] === selectedReference);
}
export function filterByDOB(employees, selectedDOB) {
  if (!selectedDOB) return employees;

  // Format selected DOB as YYYY-MM-DD
  const selected = new Date(selectedDOB).toISOString().split("T")[0];

  return employees.filter((emp) => {
    const dobString = emp["Date of"] || emp["dob"];
    if (!dobString) return false;

    const dobDateOnly = new Date(dobString).toISOString().split("T")[0];
    console.log(dobDateOnly, selected);
    return dobDateOnly === selected;
  });
}

export function filterByReceivingDate(employees, selectedDate) {
  const targetDate = new Date(selectedDate);
  if (isNaN(targetDate)) return employees;

  return employees.filter((emp) => {
    const dateStr = emp["Received date"] || emp["received_date"];

    if (!dateStr) return false;

    const receivedDate = new Date(dateStr);
    return receivedDate.toDateString() === targetDate.toDateString();
  });
}
export function filterByAnything(employees, searchText) {
  const lowerSearch = searchText.toLowerCase();

  return employees.filter((emp) =>
    Object.values(emp).some(
      (value) => value && value.toString().toLowerCase().includes(lowerSearch)
    )
  );
}
export function filterByUserName(employees, nameInput) {
  const lowerName = nameInput.toLowerCase();
  return employees.filter((emp) =>
    emp["name"]?.toLowerCase().includes(lowerName)
  );
}

export function filterByFatherName(employees, fatherInput) {
  const lowerFather = fatherInput.toLowerCase();
  return employees.filter((emp) =>
    emp["fathers_name"]?.toLowerCase().includes(lowerFather)
  );
}

export function applyCombinedFilter(
  employees,
  {
    idText,
    username,
    fathername,
    selectedGenders = [],
    selectedEducationLevels = [],
    selectedReference,
    referenceCol = "reference",
    age,
    dob,
    receivingDate,
    anything,
    status,
  }
) {
  let filtered = [...employees];

  if (idText) {
    filtered = filterById(filtered, idText);
  }
  if (username) {
    filtered = filterByUserName(filtered, username);
  }
  if (fathername) {
    filtered = filterByFatherName(filtered, fathername);
  }
  if (selectedGenders.length > 0) {
    filtered = filterByGender(filtered, selectedGenders);
  }

  if (selectedEducationLevels.length > 0) {
    filtered = filterByEducation(filtered, selectedEducationLevels);
  }

  if (selectedReference) {
    filtered = filterByReference(filtered, selectedReference, referenceCol);
  }
  if (age) {
    filtered = filterByAge(filtered, parseInt(age));
  }
  if (dob) {
    filtered = filterByDOB(filtered, dob);
  }

  if (receivingDate) {
    filtered = filterByReceivingDate(filtered, receivingDate);
  }
  if (anything) {
    filtered = filterByAnything(filtered, anything);
  }
  if (status) {
    filtered = filterByStatus(filtered, status);
  }

  return filtered;
}
