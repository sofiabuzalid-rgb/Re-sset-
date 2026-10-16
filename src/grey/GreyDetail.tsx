import { makeDetailEdit } from "../detail/DetailEdit";
import edit from "./edit.json";

const { Component, total } = makeDetailEdit(edit, "grey", "#7B95AB");
export const GreyDetail = Component;
export const GREY_TOTAL = total;
