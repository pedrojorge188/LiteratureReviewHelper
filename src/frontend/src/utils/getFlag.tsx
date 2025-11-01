export const getFlag = (countryCode: string) => {
  switch (countryCode.toLowerCase()) {
    case "pt":
      return {
        name: "PT",
        flag: require("../assets/images/flags/flag-pt.svg").default,
      };
    case "en":
      return {
        name: "EN",
        flag: require("../assets/images/flags/flag-en.svg").default,
      };
    case "es":
      return {
        name: "ES",
        flag: require("../assets/images/flags/flag-es.svg").default,
      };
    default:
      return {
        name: "PT",
        flag: require("../assets/images/flags/flag-pt.svg").default,
      };
  }
};
