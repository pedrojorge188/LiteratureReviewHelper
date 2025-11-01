export const removeDuplicates = (arr: [any]) => {
  return arr.filter(function (item, pos) {
    return arr.indexOf(item) === pos;
  });
};
