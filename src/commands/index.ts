import { category } from "./category";
import { deleteNotify, setNotify } from "./notification";

const commandMap = {
  알림: setNotify,
  해제: deleteNotify,
  카테고리: category,
} as const;

export default commandMap;
