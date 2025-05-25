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

export function filterById(employees, idText) {
  const idSet = parseIdInput(idText);
  return employees.filter((emp) => idSet.has(parseInt(emp["Id no."])));
}

export function filterByNameOrFather(employees, nameInput) {
  const lowerName = nameInput.toLowerCase();
  return employees.filter(
    (emp) =>
      emp["Name"]?.toLowerCase().includes(lowerName) ||
      emp["Father Name"]?.toLowerCase().includes(lowerName)
  );
}

export function filterByGender(employees, selectedGenders) {
  const lowerGenders = selectedGenders.map((g) => g.toLowerCase());
  return employees.filter((emp) =>
    lowerGenders.includes(emp["Gender"]?.toLowerCase())
  );
}

export function filterByEducation(employees, selectedEducationLevels) {
  const eduColumns = {
    SSC: "SSC",
    HSC: "HSC",
    UG: "Undergraduate",
    PG: "Postgraduate",
  };

  return employees.filter((emp) =>
    selectedEducationLevels.some((level) => {
      const column = eduColumns[level];
      return emp[column] && emp[column].toString().trim() !== "";
    })
  );
}

export function filterByReference(
  employees,
  selectedReference,
  referenceCol = "Reference"
) {
  return employees.filter((emp) => emp[referenceCol] === selectedReference);
}

export function applyCombinedFilter(
  employees,
  {
    idText,
    nameText,
    selectedGenders = [],
    selectedEducationLevels = [],
    selectedReference,
    referenceCol = "Reference",
  }
) {
  let filtered = [...employees];

  if (idText) {
    filtered = filterById(filtered, idText);
  }

  if (nameText) {
    filtered = filterByNameOrFather(filtered, nameText);
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

  return filtered;
}
