import type { ReactNode } from "satori";

interface OgTemplateOptions {
  title: string;
  category?: string;
  date?: string;
}

interface DefaultOgTemplateOptions {
  title: string;
  description: string;
}

function h(
  type: string,
  props: Record<string, unknown> | null,
  ...children: (ReactNode | string)[]
): ReactNode {
  return {
    type,
    props: {
      ...(props || {}),
      children: children.length === 1 ? children[0] : children,
    },
  } as ReactNode;
}

export function generateOgTemplate({ title, category, date }: OgTemplateOptions): ReactNode {
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
      },
    },
    // 상단 파란 그라데이션 바
    h("div", {
      style: {
        display: "flex",
        width: "100%",
        height: "6px",
        background: "linear-gradient(to right, #3B82F6, #1D4ED8)",
      },
    }),
    // 본문 영역
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "60px 64px 40px",
          justifyContent: "space-between",
        },
      },
      // 상단 컨텐츠
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          },
        },
        // 카테고리 뱃지
        category
          ? h(
              "div",
              { style: { display: "flex" } },
              h(
                "span",
                {
                  style: {
                    display: "flex",
                    backgroundColor: "#DBEAFE",
                    color: "#1E40AF",
                    fontSize: "20px",
                    fontWeight: 700,
                    padding: "6px 16px",
                    borderRadius: "6px",
                  },
                },
                category
              )
            )
          : h("div", { style: { display: "flex" } }),
        // 제목
        h(
          "div",
          {
            style: {
              display: "flex",
              fontSize: "52px",
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.3,
              wordBreak: "keep-all",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          },
          title
        )
      ),
      // 하단 푸터
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          },
        },
        // 구분선
        h("div", {
          style: {
            display: "flex",
            width: "100%",
            height: "1px",
            backgroundColor: "#E5E7EB",
          },
        }),
        // 사이트 + 날짜
        h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "22px",
              color: "#6B7280",
            },
          },
          h("span", { style: { display: "flex" } }, "ywc.life"),
          date ? h("span", { style: { display: "flex" } }, date) : h("span", null)
        )
      )
    )
  );
}

export function generateDefaultOgTemplate({
  title,
  description,
}: DefaultOgTemplateOptions): ReactNode {
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
      },
    },
    // 상단 파란 그라데이션 바
    h("div", {
      style: {
        display: "flex",
        width: "100%",
        height: "6px",
        background: "linear-gradient(to right, #3B82F6, #1D4ED8)",
      },
    }),
    // 본문 영역
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "60px 64px 40px",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
        },
      },
      // 사이트 제목
      h(
        "div",
        {
          style: {
            display: "flex",
            fontSize: "64px",
            fontWeight: 700,
            color: "#111827",
          },
        },
        title
      ),
      // 설명
      h(
        "div",
        {
          style: {
            display: "flex",
            fontSize: "26px",
            color: "#6B7280",
            textAlign: "center",
          },
        },
        description
      )
    )
  );
}
