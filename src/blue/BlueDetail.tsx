import { makeDetailEdit } from "../detail/DetailEdit";
import edit from "./edit.json";

const { Component, total } = makeDetailEdit(edit, "blue", "#7B95AB");
export const BlueDetail = Component;
export const BLUE_TOTAL = total;
