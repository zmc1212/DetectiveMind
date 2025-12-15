import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CaseData, Difficulty, Message, EvaluationResult, Suspect } from "../types";

// Hardcoded offline scenarios with specific image URLs
const offlineScenarios = [
  {
    "title": "豪门惊梦",
    "difficulty": "普通",
    "introduction": "大雨滂沱的夜晚，富豪李老爷死在自家书房。昨晚10:00因暴雨导致变压器故障，整栋别墅陷入停电状态，直到今早才恢复。书房内有一个昂贵的电子万年历挂钟，显示的时间永远停在了案发当晚10:05。李老爷头部受到钝器重击，现场没有打斗痕迹。",
    "solution": "李大小姐",
    "suspects": [
      {
        "id": "s1",
        "name": "张管家",
        "role": "管家",
        "description": "在李家服务了30年，忠心耿耿，最近却因为儿子赌博欠债而焦头烂额。",
        "avatarStyle": "butler",
        "imageUrl": "https://img.freepik.com/free-photo/portrait-senior-man-wearing-suit_23-2148943825.jpg?auto=format&fit=crop&w=500&q=80",
        "secret": "案发当晚趁停电偷了老爷抽屉里的一块金表去还债，但绝没有杀人。",
        "personality": "沉稳，唯唯诺诺，眼神闪烁，非常维护李家名声。",
        "offlineResponses": [
          { "keywords": ["哪里", "在哪", "位置"], "response": "当时停电了，我在一楼检查备用发电机，那里黑漆漆的，我花了好久时间。" },
          { "keywords": ["关系", "争吵", "矛盾"], "response": "老爷对我有恩，我怎么会和他争吵？我一直把他当亲人看待。" },
          { "keywords": ["钱", "赌", "债"], "response": "这……这是我的私事。但这和老爷的死无关！" },
          { "keywords": ["最后", "见"], "response": "晚饭后给老爷送了一杯热牛奶，那是9点左右。" }
        ]
      },
      {
        "id": "s2",
        "name": "李大小姐",
        "role": "女儿",
        "description": "刚从国外留学回来，和父亲因为遗产继承权和母亲改嫁的问题多次发生激烈争吵。",
        "avatarStyle": "lady",
        "imageUrl": "https://img.freepik.com/free-photo/portrait-young-woman-with-long-hair_23-2148943809.jpg?auto=format&fit=crop&w=500&q=80",
        "secret": "其实在10点停电前就进入书房杀害了父亲，并取出了电子钟的电池，制造了时间假象。",
        "personality": "高傲，情绪激动，容易流泪，看不起下人。",
        "offlineResponses": [
          { "keywords": ["哪里", "在哪"], "response": "我在自己房间里哭！那个老顽固要把家产捐给慈善机构，我气都气饱了。" },
          { "keywords": ["争吵", "矛盾"], "response": "是，我是恨他，他逼走了妈妈，现在又不认我这个女儿。但这不代表我会杀他！" },
          { "keywords": ["10点", "停电"], "response": "停电的时候我吓坏了，一直躲在被子里。" },
          { "keywords": ["书房", "进去"], "response": "我没有去过书房！我甚至不想见到他！" }
        ]
      },
      {
        "id": "s3",
        "name": "王司机",
        "role": "司机",
        "description": "年轻英俊的司机，不仅是司机，还是大小姐的秘密情人。案发当晚行踪诡秘。",
        "avatarStyle": "driver",
        "imageUrl": "https://img.freepik.com/free-photo/portrait-handsome-man-black-shirt_23-2148943799.jpg?auto=format&fit=crop&w=500&q=80",
        "secret": "案发当晚在后花园等大小姐私会，看见大小姐慌张地从书房窗户跑出来，但选择了包庇。",
        "personality": "轻浮，看似不在乎，实则警惕，非常保护大小姐。",
        "offlineResponses": [
          { "keywords": ["哪里", "在哪"], "response": "我在车里睡觉啊，下那么大雨，我也没地方去。" },
          { "keywords": ["关系", "大小姐"], "response": "我只是个司机，和雇主能有什么关系？警官你可别乱说。" },
          { "keywords": ["书房", "看见"], "response": "我什么都没看见。雨太大了，视线模糊。" },
          { "keywords": ["秘密"], "response": "每个人都有秘密，但这不犯法吧？" }
        ]
      }
    ]
  },
  {
    "title": "列车迷影",
    "difficulty": "简单",
    "introduction": "在一列行驶的豪华列车上，一名著名的珠宝商被发现死在自己的包厢里。包厢门是从里面反锁的，窗户也是锁住的。唯一的钥匙在列车长手里，但他有明确的不在场证明。",
    "solution": "魔术师",
    "suspects": [
      {
        "id": "t1",
        "name": "赵魔术师",
        "role": "乘客",
        "description": "著名的魔术师，擅长逃脱术和密室机关。据说由于欠下巨额高利贷，急需珠宝商手中的那颗蓝宝石。",
        "avatarStyle": "magician",
        "imageUrl": "https://img.freepik.com/free-photo/magician-holding-playing-cards_23-2149455348.jpg?w=500",
        "secret": "利用钓鱼线和特殊的机关在门外完成了反锁，偷走了宝石并杀人灭口。",
        "personality": "自信，夸夸其谈，喜欢用反问句。",
        "offlineResponses": [
          { "keywords": ["哪里", "在哪"], "response": "我在餐车为几位美丽的女士表演纸牌魔术，很多人可以作证。" },
          { "keywords": ["锁", "密室"], "response": "密室？哈哈，这世界上没有真正的密室，只有被蒙蔽的双眼。" },
          { "keywords": ["宝石", "钱"], "response": "艺术是无价的，而我，是创造艺术的人。钱对我来说只是数字。" }
        ]
      },
      {
        "id": "t2",
        "name": "孙医生",
        "role": "乘客",
        "description": "死者的私人医生，随身携带大量药物。最近死者似乎打算解雇他。",
        "avatarStyle": "doctor",
        "imageUrl": "https://img.freepik.com/free-photo/doctor-with-stethoscope-hands-hospital-background_1423-1.jpg?w=500",
        "secret": "给死者开的药里有安眠成分，方便了凶手作案，但他并没有杀人。",
        "personality": "紧张，神经质，不停地擦眼镜。",
        "offlineResponses": [
          { "keywords": ["哪里", "在哪"], "response": "我在自己的铺位上看书，这趟旅程太漫长了。" },
          { "keywords": ["药", "解雇"], "response": "那是为了他的健康！他心脏不好，离不开我。" }
        ]
      },
      {
        "id": "t3",
        "name": "周记者",
        "role": "乘客",
        "description": "一直跟踪报道珠宝商丑闻的记者，为了新闻不择手段。",
        "avatarStyle": "journalist",
        "imageUrl": "https://img.freepik.com/free-photo/photographer-taking-pictures_23-2148118029.jpg?w=500",
        "secret": "案发时在通风管道偷拍，拍到了魔术师从包厢出来的模糊背影，想以此勒索。",
        "personality": "犀利，好奇，手里总是拿着相机。",
        "offlineResponses": [
          { "keywords": ["哪里", "在哪"], "response": "我在到处转转，寻找新闻素材。这列车上每个人都很可疑，不是吗？" },
          { "keywords": ["照片", "相机"], "response": "无可奉告。这是我的职业机密。" }
        ]
      }
    ]
  }
];

// Initialize AI only if API Key is present
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to check if we are in offline mode
const isOffline = () => !ai;

const SUSPECT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    role: { type: Type.STRING },
    description: { type: Type.STRING },
    avatarStyle: { type: Type.STRING },
    imageUrl: { type: Type.STRING }, // Support generated image URLs if needed
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
  // If offline or forced fallback, pick from scenarios.json
  if (isOffline()) {
    console.warn("Using Offline Mode for Case Generation");
    // Simple filter by difficulty if available, else random
    const filtered = offlineScenarios.filter(s => s.difficulty === difficulty);
    const pool = filtered.length > 0 ? filtered : offlineScenarios;
    const randomCase = pool[Math.floor(Math.random() * pool.length)];
    // Cast to CaseData to ensure type compatibility
    return randomCase as unknown as CaseData;
  }

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
    const response = await ai!.models.generateContent({
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
    console.error("Failed to generate case, falling back to offline data:", error);
    // Fallback if API fails
    const randomCase = offlineScenarios[Math.floor(Math.random() * offlineScenarios.length)];
    return randomCase as unknown as CaseData;
  }
};

export const investigateCase = async (
  currentCase: CaseData,
  suspect: Suspect,
  history: Message[],
  userQuery: string
): Promise<string> => {
  // Offline Mode Interrogation Logic
  if (isOffline()) {
    console.log("Using Offline Mode for Interrogation");
    
    // 1. Try to match keywords defined in offlineResponses
    if (suspect.offlineResponses) {
      const lowerQuery = userQuery.toLowerCase();
      const matched = suspect.offlineResponses.find(r => 
        r.keywords.some(k => lowerQuery.includes(k.toLowerCase()))
      );
      if (matched) {
        return matched.response;
      }
    }

    // 2. Fallback offline responses based on role/secret
    const defaultResponses = [
      "我没什么好说的。",
      "警官，你是在怀疑我吗？",
      "我不记得了。",
      "这和我无关。",
      `我是${suspect.role}，我怎么会做这种事？`,
      "你能去问别人吗？"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  // Online Mode
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
    const response = await ai!.models.generateContent({
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
  // Offline Mode Evaluation Logic
  if (isOffline()) {
    // Simple heuristic: Does the user solution contain the killer's name (from solution field)?
    // Note: This is a very basic check. 'currentCase.solution' usually contains the name.
    const isCorrect = userSolution.includes(currentCase.solution) || 
                      currentCase.solution.includes(userSolution.split("。")[0]) || // loose match
                      (currentCase.solution.includes("凶手是") && userSolution.includes(currentCase.solution.split("凶手是")[1].substring(0,2)));

    return {
      correct: isCorrect,
      percentage: isCorrect ? 90 : 30,
      feedback: isCorrect 
        ? "（离线模式判定）根据现有证据，你的指认似乎是正确的。真相确实如此。" 
        : "（离线模式判定）证据不足，或指认错误。真凶另有其人。",
    };
  }

  // Online Mode
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
    const response = await ai!.models.generateContent({
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