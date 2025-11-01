import { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

export const SearchBar = (props: any) => {
  const { children } = props;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  const queryString: any[] = [];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = e.currentTarget.elements;
    for (let i = 0; i < formData.length; i++) {
      const id: any = formData[i].getAttribute("id") || "";
      const value = formData[i].getAttribute("value");
      if (id !== null && value !== null && value !== "" && id !== "") {
        if (id == "date") {
          let dateInit: any;
          let dateEnd: any;
          let idf: any = "endDate";
          const arrayList = value?.split(" - ");

          if (value.length > 13) {
            dateInit = arrayList[0].replaceAll("/", "-");
            dateEnd = arrayList[1].replaceAll("/", "-");
          } else {
            dateInit = arrayList[0].replaceAll("/", "-");
            dateEnd = null;
          }
          queryString[id] = dateInit;
          queryString[idf] = dateEnd;
        } else {
          queryString[id] = value;
        }
      }
    }
    setSearchParams({ ...queryString, page: "1" });
  };

  return (
    <div className="search-bar">
      <form className="search-bar__form" onSubmit={handleSubmit}>
        <div className="search-bar__form-container">{children}</div>
      </form>
    </div>
  );
};
