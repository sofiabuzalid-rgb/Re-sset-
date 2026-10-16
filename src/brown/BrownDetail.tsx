import { makeDetailEdit } from "../detail/DetailEdit";
import edit from "./edit.json";

const { Component, total } = makeDetailEdit(edit, "brown", "#B07E7F");
export const BrownDetail = Component;
export const BROWN_TOTAL = total;
