export const decode = (html: string): string => {
  const divElement = document.createElement("div");
  divElement.innerHTML = html;
  return divElement.textContent || "";
};
