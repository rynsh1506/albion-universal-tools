export const blockInvalidCharFloat = (e: any) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    ".",
  ];
  if (e.ctrlKey || e.metaKey) return;
  if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const blockInvalidCharInt = (e: any) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
  ];
  if (e.ctrlKey || e.metaKey) return;
  if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const cleanFloatString = (val: string) => {
  let cleanVal = val.replace(/[^0-9.]/g, "");
  const dotIndex = cleanVal.indexOf(".");
  if (dotIndex !== -1) {
    const beforeDot = cleanVal.substring(0, dotIndex + 1);
    const afterDot = cleanVal.substring(dotIndex + 1).replace(/\./g, "");
    cleanVal = beforeDot + afterDot;
  }
  if (cleanVal.startsWith(".")) cleanVal = "0" + cleanVal;

  cleanVal = cleanVal.replace(/^0+(?=\d)/, "");
  return cleanVal;
};

export const cleanIntString = (val: string) => {
  return val.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
};

export const handleFloatBlurHelper = (val: string) => {
  if (!val) return "";
  return val.endsWith(".") ? val.slice(0, -1) : val;
};
