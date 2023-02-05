const PREFIX = process.env.NODE_ENV === "development" ? "/" : "!";
const HELP_TEXT = ["help", "h", "명령어", "도움말"] as const;
const COMMANDS = ["알림", "해제", "카테고리"] as const;
const CATEGORY_COMMANDS = ["추가", "제거", "도움말"] as const;

export { PREFIX, HELP_TEXT, COMMANDS, CATEGORY_COMMANDS };
