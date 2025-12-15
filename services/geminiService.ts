import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CaseData, Difficulty, Message, EvaluationResult, Suspect } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SUSPECT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    role: { type: Type.STRING },
    description: { type: Type.STRING },
    avatarStyle: { type: Type.STRING },
    secret: { type: Type.STRING },
    personality: { type: Type.STRING },
  },
  required: ["id", "name", "role", "description", "secret", "personality", "avatarStyle"],
};

const CASE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Case title in Chinese" },
    introduction: { type: Type.STRING, description: "Detailed crime scene description in Chinese" },
    solution: { type: Type.STRING, description: "The truth in Chinese" },
    suspects: { 
      type: Type.ARRAY,
      items: SUSPECT_SCHEMA,
      description: "List of 3 suspects"
    },
  },
  required: ["title", "introduction", "solution", "suspects"],
};

export const generateCase = async (difficulty: Difficulty): Promise<CaseData> => {
  const model = "gemini-2.5-flash"; 
  
  const prompt = `
    你是一位顶级的侦探小说家。请为游戏《神探之心》设计一个悬疑案件。
    语言必须是：中文 (Chinese)。
    
    案件要求：
    1. 标题：类似“豪门惊梦”这样的四字或短语标题。
    2. 背景：通常发生在一个封闭或半封闭的环境（如别墅、列车、古堡）。
    3. 死者：通常是富有或有权势的人。
    4. 嫌疑人：必须正好有3位（例如：管家、亲属、合作伙伴/司机）。
    5. 难度：${difficulty}。
    
    请输出JSON格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: CASE_SCHEMA,
        systemInstruction: "你是一个专业的剧本杀编剧。你的故事逻辑严密，人物性格鲜明。",
        temperature: 0.9,
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(response.text);
    return {
      ...data,
      difficulty,
    };
  } catch (error) {
    console.error("Failed to generate case:", error);
    // Fallback Case: 豪门惊梦
    return {
      title: "豪门惊梦",
      introduction: "大雨滂沱的夜晚，富豪李老爷死在自家书房。昨晚10:00因暴雨导致变压器故障，整栋别墅陷入停电状态，直到今早才恢复。书房内有一个昂贵的电子万年历挂钟，显示的时间永远停在了案发当晚。",
      solution: "凶手是李大小姐。她利用停电的时间差制造了不在场证明。她其实在10点前就进入书房杀害了父亲，并调整了电子钟的电池，让其看起来像是停电时停止工作的。",
      difficulty: difficulty,
      suspects: [
        {
          id: "s1",
          name: "张管家",
          role: "管家",
          description: "在李家服务了30年，忠心耿耿，最近却因为赌博欠了债。",
          avatarStyle: "butler",
          secret: "案发当晚偷了老爷的一块金表，但没有杀人。",
          personality: "沉稳，唯唯诺诺，但眼神闪烁。"
        },
        {
          id: "s2",
          name: "李大小姐",
          role: "女儿",
          description: "刚回国，和父亲因为遗产问题争吵过。",
          avatarStyle: "lady",
          secret: "不仅想要遗产，还恨父亲逼走了母亲。",
          personality: "高傲，情绪激动，容易流泪。"
        },
        {
          id: "s3",
          name: "王司机",
          role: "司机",
          description: "不仅是司机，还是大小姐的秘密男友。",
          avatarStyle: "driver",
          secret: "知道大小姐当晚去过书房，但选择包庇。",
          personality: "轻浮，看似不在乎，实则警惕。"
        }
      ]
    };
  }
};

export const investigateCase = async (
  currentCase: CaseData,
  suspect: Suspect,
  history: Message[],
  userQuery: string
): Promise<string> => {
  const model = "gemini-2.5-flash";

  const relevantHistory = history.slice(-8).map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const systemPrompt = `
    你现在正在进行一场角色扮演游戏。
    当前案件：${currentCase.title}
    案件背景：${currentCase.introduction}
    真相（绝对保密）：${currentCase.solution}
    
    你扮演的角色：${suspect.name} (${suspect.role})。
    你的性格：${suspect.personality}。
    你的秘密：${suspect.secret}（只有当被问到相关关键点或证据确凿时才透露一点，不要直接全盘托出）。
    
    玩家是侦探。请以【${suspect.name}】的口吻回答侦探的问题。
    - 坚持你的设定。
    - 如果你是凶手，你要撒谎或误导，但不能逻辑崩坏。
    - 如果你不是凶手，你要洗清嫌疑，但可能因为其他秘密而有所隐瞒。
    - 既然是中文游戏，请用自然的中文口语回答。
    - 回答不要太长，保持对话感。
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...relevantHistory,
        { role: 'user', parts: [{ text: userQuery }] }
      ],
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "(沉默不语)";
  } catch (error) {
    console.error("Investigation error:", error);
    return "（似乎有什么东西干扰了对话……）";
  }
};

export const evaluateSolution = async (
  currentCase: CaseData,
  userSolution: string
): Promise<EvaluationResult> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    案件真相: "${currentCase.solution}"
    玩家的推理: "${userSolution}"
    
    任务:
    1. 判断玩家是否找出了真凶。
    2. 判断玩家对作案手法和动机的推理是否正确。
    3. 给出0-100的评分（80分以上算破案成功）。
    4. 用中文给出简短的评价和反馈。
    
    输出JSON格式。
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      correct: { type: Type.BOOLEAN },
      percentage: { type: Type.NUMBER },
      feedback: { type: Type.STRING },
    },
    required: ["correct", "percentage", "feedback"],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (!response.text) throw new Error("No evaluation response");
    
    const result = JSON.parse(response.text);
    return {
      correct: result.percentage >= 80,
      percentage: result.percentage,
      feedback: result.feedback,
    };
  } catch (error) {
    return {
      correct: false,
      percentage: 0,
      feedback: "法官未能听清你的陈述，请重试。",
    };
  }
};