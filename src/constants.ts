const PREFIX = "!";
const CATEGORIES = [
  "",
  "PC/하드웨어",
  "상품권/쿠폰",
  "게임/SW",
  "노트북/모바일",
  "가전/TV",
  "생활/식품",
  "패션/의류",
  "기타",
] as const;
const HELP_TEXT = ["help", "h", "명령어", "도움말"] as const;
const COLOR = 0xff9726;
const RESPONSE_MESSAGE_MAP = {
  NOTIFICATION: {
    SET: {
      ERROR: "오류로 인해 알림 설정에 실패했습니다.",
      SUCCESS:
        "해당 채널로 알림을 보냅니다.\n기본 알림 카테고리: `PC/하드웨어`, `노트북/모바일`, `가전/TV`\n카테고리 추가/제거 관련 도움말은 `!카테고리 도움말`을 입력하세요",
    },
    DELETE: {
      ERROR: "오류로 인해 알림 설정 해제에 실패했습니다.",
      SUCCESS: "알림 설정을 해제하였습니다.",
    },
    NOT_SET: "알림 설정이 되어있지 않은 채널입니다.",
    ALREADY_SET: "이미 알림 설정된 채널입니다.",
  },
  CATEGORY: {
    HELP: "`!카테고리 추가 [카테고리]` - 카테고리 추가\n`!카테고리 제거 [카테고리]` - 카테고리 제거\n`!카테고리` - 현재 카테고리 확인\n\n사용 가능한 카테고리: `전체`, `PC/하드웨어`, `상품권/쿠폰`, `게임/SW`, `노트북/모바일`, `가전/TV`, `생활/식품`, `패션/의류`, `기타`\n\nex) `!카테고리 추가 PC/하드웨어 기타`",
    CURRENT: (categories: string | undefined) =>
      `**현재 알림 설정된 카테고리**\n${
        categories || "\n설정된 카테고리가 없습니다."
      }\n\n`,
    ADD: {
      SUCCESS: "카테고리를 추가하였습니다.",
      ERROR: "오류로 인해 카테고리 추가에 실패했습니다.",
    },
    DELETE: {
      SUCCESS: "카테고리를 제거하였습니다.",
      ERROR: "오류로 인해 카테고리 제거에 실패했습니다.",
    },
    ALL: { ERROR: "`전체`만 입력해주세요." },
    ERROR: "유효하지 않은 카테고리가 입력되었습니다.",
  },
  HELP: "**명령어**\n`!알림` - 입력한 채널로 알림을 받습니다.\n`!해제` - 입력한 채널로의 알림을 해제합니다.\n`!카테고리` - 현재 알림 설정된 카테고리를 보여줍니다.\n`!카테고리 추가` - 알림 받을 카테고리를 추가합니다.\n`!카테고리 제거` - 알림 설정한 카테고리를 제거합니다.",
} as const;
const COMMANDS = ["알림", "해제", "카테고리"] as const;
const CATEGORY_COMMANDS = ["추가", "제거", "도움말"] as const;

export {
  PREFIX,
  CATEGORIES,
  HELP_TEXT,
  COLOR,
  RESPONSE_MESSAGE_MAP,
  COMMANDS,
  CATEGORY_COMMANDS,
};
