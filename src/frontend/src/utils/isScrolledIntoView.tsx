export const isScrolledIntoView = (el: any, visibleHeight: number) => {
  var rect = el.getBoundingClientRect();
  var elemTop = rect.top;
  var elemBottom = rect.bottom;

  var isVisible = elemTop - elemBottom + elemTop <= -visibleHeight;
  return isVisible;
};
