import { describe, it, expect } from "vitest";
import { mergeTaskLists, type ChatTask } from "../chat";

describe("mergeTaskLists", () => {
  it("assigns IDs to new tasks", () => {
    const prev: ChatTask[] = [];
    const aiOutput = [{ label: "مراجعة الرياضيات" }];

    const result = mergeTaskLists(prev, aiOutput);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBeDefined();
    expect(result[0].label).toBe("مراجعة الرياضيات");
  });

  it("preserves IDs for existing tasks matched by label", () => {
    const prev: ChatTask[] = [
      { id: "123", label: "مراجعة الرياضيات" }
    ];
    const aiOutput = [{ label: "مراجعة الرياضيات", urgency: "عالي" }];

    const result = mergeTaskLists(prev, aiOutput);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("123"); 
    expect(result[0].urgency).toBe("عالي");
  });

  it("removes tasks not present in AI output", () => {
    const prev: ChatTask[] = [
      { id: "1", label: "مهمة 1" },
      { id: "2", label: "مهمة 2" }
    ];
    const aiOutput = [{ label: "مهمة 1" }];

    const result = mergeTaskLists(prev, aiOutput);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
    expect(result.find(t => t.id === "2")).toBeUndefined();
  });

  it("handles tasks with the same label correctly (multiple identical tasks)", () => {
    const prev: ChatTask[] = [
      { id: "1", label: "قراءة" },
      { id: "2", label: "قراءة" }
    ];
    const aiOutput = [{ label: "قراءة" }]; 

    const result = mergeTaskLists(prev, aiOutput);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1"); 
  });
});
