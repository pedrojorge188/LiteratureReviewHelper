import { JSX } from "react";

export type IRoute = {
  [property: string]: IRoutePath;
};

export interface IRoutePath {
  path: string;
  element: JSX.Element;
}

export type IRoutePathLang = {
  [property: string]: string;
};
