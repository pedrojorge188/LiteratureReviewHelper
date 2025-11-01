import { useEffect } from "react";
import { removeDuplicates } from "../../utils";
import { ICommonSelectProps } from "./types";

export const CommonSelect = (props: ICommonSelectProps) => {
  const { set, refInput, classList, categories, selectName, placeholder } = props;

  function toggleSelect(selectName: string) {
    const selectElement = document.getElementById("select-" + selectName);
    selectElement?.classList.toggle("active");
  }

  function clearPlaceholder() {
    const placeholderElement = document.getElementById("select-placeholder")!;
    placeholderElement.innerHTML = "";
    placeholderElement.setAttribute("data-value", "0");
  }

  function removeChosenSelect(id: number, title: string, set: Function) {
    const placeholderElement = document.getElementById("select-placeholder")!;
    let placeholderCurrentValue = placeholderElement.getAttribute("data-value")!;
    const elementToRemove = placeholderElement?.querySelector("#chosen-" + id);

    elementToRemove?.classList.add("leaving");
    window.setTimeout(() => {
      elementToRemove?.remove();
    }, 400);

    if (placeholderCurrentValue === id.toString()) {
      window.setTimeout(() => {
        clearPlaceholder();
        set("0");
      }, 400);
    } else {
      /*Placeholder has other elements*/
      placeholderCurrentValue = placeholderCurrentValue.replace(id.toString(), "").replace(/^,/, "").replaceAll(",,", ",").replace(/,$/, "");
      placeholderElement.setAttribute("data-value", placeholderCurrentValue);
      set(placeholderCurrentValue);
    }

    addOption(id, title);
  }

  function setCatValue(id: number, title: string, set: Function) {
    const option = document.getElementById("option-" + id);

    if (!option?.classList.contains("leaving")) {
      option?.classList.add("leaving");
      window.setTimeout(() => {
        option?.classList.remove("leaving");
        option?.remove();
      }, 900);
      set(addDataValue(id));
      addPlaceholderCategory({ id: id, title: title });
    }
  }

  function addOption(id: number, title: string) {
    const divContent = document.querySelector(".select-content");
    const newButton = document.createElement("button");

    newButton.setAttribute("id", `option-${id}`);
    newButton.setAttribute("title", title);
    newButton.setAttribute("type", "button");
    newButton.addEventListener("click", () => setCatValue(id, title, set));
    newButton.classList.add("content");
    newButton.innerHTML = title;

    // populate
    divContent?.appendChild(newButton);
  }

  function addDataValue(id: number) {
    const placeholderElement = document.getElementById("select-placeholder")!;
    let placeholderCurrentValue = placeholderElement.getAttribute("data-value")!;

    if (placeholderCurrentValue === "0") {
      // Clear placeholder if has no previous chosen categories
      placeholderElement.innerHTML = "";
      placeholderElement.setAttribute("data-value", id.toString());
      return id.toString();
    } else {
      let newValue = placeholderCurrentValue + "," + id.toString();
      placeholderElement.setAttribute("data-value", newValue);
      return newValue;
    }
  }

  function addPlaceholderCategory(category: any) {
    const { id, title } = category;
    const chosenElement = document.createElement("div");
    const placeholderElement = document.getElementById("select-placeholder")!;

    chosenElement.classList.add("chosen-content", "entering");
    chosenElement.setAttribute("id", "chosen-" + id);
    chosenElement.setAttribute("value", id.toString());
    chosenElement.innerHTML = title || "";
    chosenElement.addEventListener("click", () => {
      removeChosenSelect(id, title, set);
    });
    window.setTimeout(() => {
      chosenElement.classList.remove("entering");
    }, 700);
    placeholderElement.appendChild(chosenElement);
  }

  function getChosenUnchosenElements() {
    return categories.reduce(
      (result, item) => {
        result[removeDuplicates(refInput.split(",")).indexOf(item.id.toString()) > -1 ? "chosenElements" : "unchosenElements"].push(item);
        return result;
      },
      { chosenElements: [], unchosenElements: [] }
    );
  }

  useEffect(() => {
    // get selected and unselected options
    let { chosenElements, unchosenElements } = getChosenUnchosenElements();

    // populate unselected options
    for (let el of unchosenElements) {
      const { title, id } = el;
      addOption(id, title);
    }

    for (let el of chosenElements) {
      addDataValue(el.id);
      addPlaceholderCategory(el);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const placeholderElement = document.querySelector(".select-label__placeholder");
    if (refInput === "0") placeholderElement?.classList.remove("active");
    else placeholderElement?.classList.add("active");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refInput]);

  return (
    <div id={"select-" + selectName} className={"select select " + classList + " " + selectName}>
      <div
        className="select-top"
        onClick={(e: any) => {
          e.preventDefault();
          if (e.target.classList.contains("select-top") || e.target.classList.contains("select-placeholder") || e.target.classList.contains("fa-chevron-down"))
            toggleSelect(selectName);
        }}
      >
        <div className="select-label__placeholder">{placeholder}</div>
        <div data-value="0" className="select-placeholder" id="select-placeholder"></div>
        <span className="fa-light fa-chevron-down"></span>
      </div>
      <div className="select-content" id="list"></div>
    </div>
  );
};
