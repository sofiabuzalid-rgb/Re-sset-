import { makeDetailEdit } from "../detail/DetailEdit";
import edit from "./edit.json";

const { Component, total } = makeDetailEdit(edit, "pink", "#B07E7F");
export const PinkDetail = Component;
export const PINK_TOTAL = total;
