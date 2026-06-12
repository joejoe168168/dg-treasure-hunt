// ============================================================
// Question bank — Math / English / Chinese / General knowledge
// Three difficulty tiers, calibrated against the HK curriculum:
//   easy   = P1–P2  (15s per question, ×1 score)
//   medium = P3–P4  (12s per question, ×1.5 score)
//   hard   = P5–P6  (10s per question, ×2 score)
// Each question: { cat, q, a: [4 choices], c: correct index }
// ============================================================

export const CATEGORIES = {
  math:    { label: '數學 Math',      cls: 'cat-math' },
  english: { label: 'English',        cls: 'cat-english' },
  chinese: { label: '中文 Chinese',   cls: 'cat-chinese' },
  general: { label: '常識 General',   cls: 'cat-general' },
};

export const DIFFICULTIES = {
  easy:   { label: '初級 Easy',   sub: 'P1–P2', time: 15, mult: 1,   emoji: '🟢' },
  medium: { label: '中級 Medium', sub: 'P3–P4', time: 12, mult: 1.5, emoji: '🟡' },
  hard:   { label: '高級 Hard',   sub: 'P5–P6', time: 10, mult: 2,   emoji: '🔴' },
};

const BANK = {
  // ==========================================================
  // EASY (P1–P2) — real P1–P2 level: 2-digit add/subtract with
  // carrying, early times tables, time, money, shapes
  // ==========================================================
  easy: [
    // ---- math ----
    { cat: 'math', q: '23 + 18 = ?', a: ['39', '41', '43', '31'], c: 1 },
    { cat: 'math', q: '35 − 17 = ?', a: ['18', '22', '12', '28'], c: 0 },
    { cat: 'math', q: '46 + 29 = ?', a: ['65', '74', '75', '85'], c: 2 },
    { cat: 'math', q: '60 − 24 = ?', a: ['44', '36', '46', '34'], c: 1 },
    { cat: 'math', q: '17 + 8 = ?', a: ['24', '25', '26', '23'], c: 1 },
    { cat: 'math', q: '42 − 15 = ?', a: ['27', '37', '23', '33'], c: 0 },
    { cat: 'math', q: '8 × 2 = ?', a: ['14', '16', '18', '12'], c: 1 },
    { cat: 'math', q: '5 × 4 = ?', a: ['9', '15', '20', '25'], c: 2 },
    { cat: 'math', q: '10 × 7 = ?', a: ['17', '70', '77', '107'], c: 1 },
    { cat: 'math', q: '18 ÷ 2 = ?', a: ['6', '8', '9', '16'], c: 2 },
    { cat: 'math', q: '3、6、9、12，下一個數是？', a: ['13', '14', '15', '18'], c: 2 },
    { cat: 'math', q: '5、10、15、20，下一個數是？', a: ['21', '25', '30', '40'], c: 1 },
    { cat: 'math', q: '100 − 45 = ?', a: ['45', '55', '65', '54'], c: 1 },
    { cat: 'math', q: '37 + 37 = ?', a: ['64', '74', '77', '84'], c: 1 },
    { cat: 'math', q: '用 $20 買 $12 的文具，找回多少錢？', a: ['$6', '$8', '$10', '$12'], c: 1 },
    { cat: 'math', q: '1 星期有 7 日，2 星期有多少日？', a: ['9 日', '12 日', '14 日', '17 日'], c: 2 },
    { cat: 'math', q: '半小時等於多少分鐘？', a: ['15 分鐘', '30 分鐘', '45 分鐘', '60 分鐘'], c: 1 },
    { cat: 'math', q: '時針指住 3，分針指住 12，是幾點？', a: ['12 點', '3 點正', '3 點半', '6 點'], c: 1 },
    { cat: 'math', q: '哪一個是雙數？', a: ['7', '9', '14', '21'], c: 2 },
    { cat: 'math', q: '哪一個是單數？', a: ['8', '13', '20', '16'], c: 1 },
    { cat: 'math', q: '一個長方形有多少隻角？', a: ['2', '3', '4', '5'], c: 2 },
    { cat: 'math', q: '一個三角形有多少條邊？', a: ['2', '3', '4', '5'], c: 1 },
    { cat: 'math', q: '比 50 大 10 的數是？', a: ['40', '51', '60', '65'], c: 2 },
    { cat: 'math', q: '9 + 9 + 9 = ?', a: ['18', '27', '28', '36'], c: 1 },
    { cat: 'math', q: '2 個十加 3 個一是多少？', a: ['5', '23', '32', '203'], c: 1 },
    { cat: 'math', q: '一條繩長 30 厘米，剪走 12 厘米，剩多少？', a: ['18 厘米', '22 厘米', '16 厘米', '42 厘米'], c: 0 },
    { cat: 'math', q: '哪一組數由小到大排列？', a: ['31, 13, 3', '13, 3, 31', '3, 13, 31', '31, 3, 13'], c: 2 },
    { cat: 'math', q: '媽媽買了 6 隻蛋，再買 6 隻，共有多少隻？', a: ['10', '12', '14', '16'], c: 1 },
    { cat: 'math', q: '$1 + $2 + $5 = ?', a: ['$7', '$8', '$9', '$10'], c: 1 },
    { cat: 'math', q: '10 減去多少等於 4？', a: ['4', '5', '6', '7'], c: 2 },

    // ---- english ----
    { cat: 'english', q: '"I ___ a student."', a: ['am', 'is', 'are', 'be'], c: 0 },
    { cat: 'english', q: '"She ___ my sister."', a: ['am', 'is', 'are', 'be'], c: 1 },
    { cat: 'english', q: '"They ___ happy."', a: ['am', 'is', 'are', 'be'], c: 2 },
    { cat: 'english', q: 'The plural of "box" is…', a: ['boxs', 'boxes', 'boxies', 'box'], c: 1 },
    { cat: 'english', q: 'The plural of "cat" is…', a: ['cats', 'cates', 'caties', 'cat'], c: 0 },
    { cat: 'english', q: '"This is ___ egg."', a: ['a', 'an', 'two', 'many'], c: 1 },
    { cat: 'english', q: 'The opposite of "big" is…', a: ['tall', 'small', 'fat', 'long'], c: 1 },
    { cat: 'english', q: 'The opposite of "hot" is…', a: ['warm', 'cold', 'wet', 'dry'], c: 1 },
    { cat: 'english', q: 'The opposite of "fast" is…', a: ['quick', 'slow', 'late', 'far'], c: 1 },
    { cat: 'english', q: 'Which day comes after Monday?', a: ['Sunday', 'Tuesday', 'Friday', 'Saturday'], c: 1 },
    { cat: 'english', q: 'The first month of the year is…', a: ['December', 'January', 'February', 'March'], c: 1 },
    { cat: 'english', q: 'We see with our ___.', a: ['ears', 'eyes', 'nose', 'mouth'], c: 1 },
    { cat: 'english', q: 'Which one is a fruit?', a: ['Chair', 'Apple', 'Car', 'Book'], c: 1 },
    { cat: 'english', q: 'Which animal can fly?', a: ['Fish', 'Bird', 'Dog', 'Pig'], c: 1 },
    { cat: 'english', q: 'Which one can swim?', a: ['Fish', 'Cat', 'Bird', 'Hen'], c: 0 },
    { cat: 'english', q: 'Which word rhymes with "cat"?', a: ['cut', 'hat', 'cot', 'kite'], c: 1 },
    { cat: 'english', q: '"___ name is Mary. She is my friend."', a: ['Her', 'His', 'My', 'Him'], c: 0 },
    { cat: 'english', q: 'How many days are there in a week?', a: ['Five', 'Six', 'Seven', 'Eight'], c: 2 },
    { cat: 'english', q: '"I go to school ___ bus."', a: ['on', 'by', 'in', 'at'], c: 1 },
    { cat: 'english', q: 'A baby dog is called a…', a: ['kitten', 'puppy', 'chick', 'cub'], c: 1 },
    { cat: 'english', q: '"Two ___ are on the table."', a: ['book', 'books', 'bookes', 'a book'], c: 1 },
    { cat: 'english', q: 'Which word is a number?', a: ['Nice', 'Nine', 'Name', 'Nose'], c: 1 },
    { cat: 'english', q: 'Strawberries are ___.', a: ['blue', 'red', 'black', 'purple'], c: 1 },
    { cat: 'english', q: '"Open the door, ___."', a: ['sorry', 'please', 'yes', 'bye'], c: 1 },
    { cat: 'english', q: 'Which one do we use at school?', a: ['Pillow', 'Pencil', 'Pan', 'Pyjamas'], c: 1 },
    { cat: 'english', q: '"I wash my ___ before dinner."', a: ['hands', 'shoes', 'bag', 'hair'], c: 0 },
    { cat: 'english', q: '"How ___ are you?" "I am seven."', a: ['old', 'tall', 'many', 'much'], c: 0 },
    { cat: 'english', q: 'Which word means 書?', a: ['Bag', 'Book', 'Ball', 'Bed'], c: 1 },
    { cat: 'english', q: '"___ morning, Miss Chan!"', a: ['Nice', 'Good', 'Well', 'Fine'], c: 1 },
    { cat: 'english', q: '"I have two ___."', a: ['hand', 'hands', 'handes', 'a hand'], c: 1 },

    // ---- chinese ----
    { cat: 'chinese', q: '「大」的相反詞是？', a: ['高', '小', '多', '長'], c: 1 },
    { cat: 'chinese', q: '一（　）狗 — 應填哪個量詞？', a: ['本', '隻', '張', '架'], c: 1 },
    { cat: 'chinese', q: '「日」+「月」合起來是哪個字？', a: ['明', '晶', '昌', '朋'], c: 0 },
    { cat: 'chinese', q: '「上」的相反是？', a: ['左', '下', '中', '前'], c: 1 },
    { cat: 'chinese', q: '哪個字是顏色？', a: ['跑', '紅', '吃', '看'], c: 1 },
    { cat: 'chinese', q: '「爸爸的媽媽」我們叫她？', a: ['姨媽', '祖母', '姑姐', '舅母'], c: 1 },
    { cat: 'chinese', q: '「木」字有多少筆畫？', a: ['3', '4', '5', '6'], c: 1 },
    { cat: 'chinese', q: '一（　）書 — 應填哪個量詞？', a: ['隻', '本', '條', '輛'], c: 1 },
    { cat: 'chinese', q: '一（　）花 — 應填哪個量詞？', a: ['朵', '隻', '架', '間'], c: 0 },
    { cat: 'chinese', q: '「人」字有多少筆畫？', a: ['1', '2', '3', '4'], c: 1 },
    { cat: 'chinese', q: '「白天」的相反是？', a: ['早上', '黑夜', '中午', '下午'], c: 1 },
    { cat: 'chinese', q: '「快」的相反詞是？', a: ['急', '慢', '早', '遲'], c: 1 },
    { cat: 'chinese', q: '一（　）魚 — 應填哪個量詞？', a: ['條', '張', '本', '把'], c: 0 },
    { cat: 'chinese', q: '「出」的相反詞是？', a: ['入', '去', '走', '回'], c: 0 },
    { cat: 'chinese', q: '春、夏、秋、冬，哪個季節最冷？', a: ['春', '夏', '秋', '冬'], c: 3 },
    { cat: 'chinese', q: '「笑」的相反詞是？', a: ['唱', '哭', '叫', '講'], c: 1 },
    { cat: 'chinese', q: '太陽從哪一邊升起？', a: ['東', '南', '西', '北'], c: 0 },
    { cat: 'chinese', q: '「水」字有多少筆畫？', a: ['3', '4', '5', '6'], c: 1 },
    { cat: 'chinese', q: '哪個字和「手」的動作有關？', a: ['看', '拍', '聽', '行'], c: 1 },
    { cat: 'chinese', q: '「高」的相反詞是？', a: ['大', '矮', '長', '肥'], c: 1 },
    { cat: 'chinese', q: '「多」的相反詞是？', a: ['大', '少', '高', '長'], c: 1 },
    { cat: 'chinese', q: '「天」字有多少筆畫？', a: ['3', '4', '5', '6'], c: 1 },
    { cat: 'chinese', q: '「左」的相反是？', a: ['上', '右', '前', '後'], c: 1 },
    { cat: 'chinese', q: '「開」的相反詞是？', a: ['閂', '關', '推', '拉'], c: 1 },
    { cat: 'chinese', q: '一（　）車 — 應填哪個量詞？', a: ['隻', '輛', '本', '條'], c: 1 },
    { cat: 'chinese', q: '「買」的相反詞是？', a: ['賣', '送', '借', '換'], c: 0 },
    { cat: 'chinese', q: '「先」的相反詞是？', a: ['前', '後', '早', '快'], c: 1 },
    { cat: 'chinese', q: '「明」字的部首是？', a: ['日', '月', '門', '木'], c: 0 },
    { cat: 'chinese', q: '「媽」字的部首是？', a: ['馬', '女', '口', '心'], c: 1 },
    { cat: 'chinese', q: '「一閃一閃」通常用來形容？', a: ['星星', '大樹', '石頭', '桌子'], c: 0 },

    // ---- general ----
    { cat: 'general', q: '紅綠燈中哪個顏色代表「停」？', a: ['綠色', '紅色', '黃色', '藍色'], c: 1 },
    { cat: 'general', q: '香港市區的士是什麼顏色？', a: ['黃色', '紅色', '綠色', '藍色'], c: 1 },
    { cat: 'general', q: '過馬路時應該走？', a: ['馬路中間', '斑馬線', '車路', '欄杆'], c: 1 },
    { cat: 'general', q: '香港人搭車購物常用什麼卡？', a: ['圖書卡', '八達通', '生日卡', '貼紙卡'], c: 1 },
    { cat: 'general', q: '一年有多少個月？', a: ['10', '11', '12', '13'], c: 2 },
    { cat: 'general', q: '下雨天出門應該帶什麼？', a: ['風箏', '雨傘', '太陽眼鏡', '滑板'], c: 1 },
    { cat: 'general', q: '天星小輪在哪裡行駛？', a: ['天空', '海上', '馬路', '山上'], c: 1 },
    { cat: 'general', q: '護士通常在哪裡工作？', a: ['學校', '醫院', '機場', '街市'], c: 1 },
    { cat: 'general', q: '哪一個是交通工具？', a: ['枱', '巴士', '書包', '電視'], c: 1 },
    { cat: 'general', q: '晚上抬頭會見到什麼？', a: ['太陽', '月亮', '彩虹', '白雲'], c: 1 },
    { cat: 'general', q: '消防員救火時開什麼車？', a: ['救護車', '消防車', '校巴', '貨車'], c: 1 },
    { cat: 'general', q: '我們用什麼器官聽聲音？', a: ['眼睛', '耳朵', '鼻子', '嘴巴'], c: 1 },
    { cat: 'general', q: '哪種動物的頸最長？', a: ['大象', '長頸鹿', '獅子', '熊貓'], c: 1 },
    { cat: 'general', q: '香港的雙層巴士有多少層？', a: ['1 層', '2 層', '3 層', '4 層'], c: 1 },
    { cat: 'general', q: '尖沙咀有一個著名的高塔叫？', a: ['鐘樓', '燈塔', '水塔', '炮台'], c: 0 },
    { cat: 'general', q: '報告香港天氣的機構叫？', a: ['天文台', '消防局', '郵政局', '水務署'], c: 0 },
    { cat: 'general', q: '維多利亞港隔開九龍和哪裡？', a: ['新界', '香港島', '大嶼山', '澳門'], c: 1 },
    { cat: 'general', q: '落大雨之前，天上多數有很多？', a: ['星星', '烏雲', '彩虹', '風箏'], c: 1 },
    { cat: 'general', q: '在圖書館裡應該？', a: ['大聲唱歌', '保持安靜', '跑來跑去', '吃零食'], c: 1 },
    { cat: 'general', q: '過馬路前應該先？', a: ['閉上眼睛', '望清楚左右', '跑得快些', '玩手機'], c: 1 },
    { cat: 'general', q: '香港的夏天天氣是？', a: ['又熱又濕', '經常落雪', '非常乾凍', '成日結冰'], c: 0 },
    { cat: 'general', q: '中秋節小朋友會玩什麼？', a: ['燈籠', '風箏', '滑梯', '雪人'], c: 0 },
    { cat: 'general', q: '農曆新年常說的祝賀語是？', a: ['節日快樂', '恭喜發財', '中秋快樂', '生日快樂'], c: 1 },
    { cat: 'general', q: '香港小學生返學要穿什麼？', a: ['泳衣', '校服', '睡衣', '戲服'], c: 1 },
    { cat: 'general', q: '12 月 25 日是什麼節日？', a: ['中秋節', '聖誕節', '復活節', '端午節'], c: 1 },
    { cat: 'general', q: '香港的救護車主要是什麼顏色？', a: ['黑色', '白色', '紫色', '啡色'], c: 1 },
    { cat: 'general', q: '緊急求助應該打哪個電話號碼？', a: ['111', '999', '888', '123'], c: 1 },
    { cat: 'general', q: '食飯之前應該先？', a: ['睇電視', '洗手', '瞓覺', '跑步'], c: 1 },
    { cat: 'general', q: '邊個節日會收利是？', a: ['中秋節', '農曆新年', '復活節', '萬聖節'], c: 1 },
    { cat: 'general', q: '中秋節我們會吃什麼？', a: ['湯圓', '月餅', '糭', '年糕'], c: 1 },
  ],

  // ==========================================================
  // MEDIUM (P3–P4) — multi-digit ×÷, fractions intro, perimeter
  // & area, tenses, idioms with stories
  // ==========================================================
  medium: [
    // ---- math ----
    { cat: 'math', q: '小明有 $50，買了 $18 的筆，剩多少錢？', a: ['$28', '$32', '$38', '$42'], c: 1 },
    { cat: 'math', q: '一盒有 12 粒糖，3 盒共有多少粒？', a: ['24', '30', '36', '48'], c: 2 },
    { cat: 'math', q: '45 ÷ 5 = ?', a: ['8', '9', '7', '6'], c: 1 },
    { cat: 'math', q: '2 小時 30 分鐘等於多少分鐘？', a: ['120', '150', '180', '230'], c: 1 },
    { cat: 'math', q: '長方形長 6cm、闊 4cm，周界是？', a: ['10 cm', '20 cm', '24 cm', '12 cm'], c: 1 },
    { cat: 'math', q: '7 × 8 = ?', a: ['54', '56', '63', '48'], c: 1 },
    { cat: 'math', q: '100 − 37 = ?', a: ['53', '63', '73', '67'], c: 1 },
    { cat: 'math', q: '哪個數可以被 3 整除？', a: ['25', '27', '28', '32'], c: 1 },
    { cat: 'math', q: '1 公斤等於多少克？', a: ['10', '100', '1000', '10000'], c: 2 },
    { cat: 'math', q: '2, 4, 8, 16, … 下一個數是？', a: ['18', '24', '32', '20'], c: 2 },
    { cat: 'math', q: '一星期返學 5 日，4 星期返學幾多日？', a: ['9', '16', '20', '24'], c: 2 },
    { cat: 'math', q: '時鐘長針指住 6，即是幾多分鐘？', a: ['6 分', '15 分', '30 分', '45 分'], c: 2 },
    { cat: 'math', q: '304 + 198 = ?', a: ['492', '502', '512', '402'], c: 1 },
    { cat: 'math', q: '600 − 258 = ?', a: ['342', '352', '442', '358'], c: 0 },
    { cat: 'math', q: '12 × 12 = ?', a: ['124', '144', '142', '154'], c: 1 },
    { cat: 'math', q: '96 ÷ 8 = ?', a: ['11', '12', '13', '14'], c: 1 },
    { cat: 'math', q: '18 的一半是多少？', a: ['8', '9', '10', '12'], c: 1 },
    { cat: 'math', q: '20 的 3/4 是多少？', a: ['12', '14', '15', '16'], c: 2 },
    { cat: 'math', q: '長方形長 8cm、闊 5cm，面積是？', a: ['13 cm²', '26 cm²', '40 cm²', '45 cm²'], c: 2 },
    { cat: 'math', q: '一年大約有多少個星期？', a: ['42', '48', '52', '56'], c: 2 },
    { cat: 'math', q: '1.5 小時等於多少分鐘？', a: ['75', '90', '105', '150'], c: 1 },
    { cat: 'math', q: '一個直角是多少度？', a: ['45°', '60°', '90°', '180°'], c: 2 },
    { cat: 'math', q: '1 公里等於多少米？', a: ['10', '100', '1000', '10000'], c: 2 },
    { cat: 'math', q: '5 張 $20 紙幣共值多少？', a: ['$25', '$100', '$120', '$200'], c: 1 },
    { cat: 'math', q: '48 粒糖平均分給 6 人，每人得幾粒？', a: ['6', '7', '8', '9'], c: 2 },
    { cat: 'math', q: '1, 1, 2, 3, 5, 8, … 下一個數是？', a: ['11', '12', '13', '16'], c: 2 },
    { cat: 'math', q: '15 分鐘是一小時的幾分之幾？', a: ['1/2', '1/3', '1/4', '1/5'], c: 2 },
    { cat: 'math', q: '三角形內角和是多少度？', a: ['90°', '180°', '270°', '360°'], c: 1 },
    { cat: 'math', q: '25 + 25 + 25 = ?', a: ['65', '70', '75', '85'], c: 2 },
    { cat: 'math', q: '雙數加雙數，結果一定是？', a: ['單數', '雙數', '質數', '負數'], c: 1 },

    // ---- english ----
    { cat: 'english', q: 'The past tense of "go" is…', a: ['goed', 'went', 'gone', 'going'], c: 1 },
    { cat: 'english', q: '"She ___ to school every day."', a: ['go', 'goes', 'going', 'gone'], c: 1 },
    { cat: 'english', q: 'The plural of "child" is…', a: ['childs', 'childes', 'children', 'childrens'], c: 2 },
    { cat: 'english', q: 'Which word is a verb?', a: ['quickly', 'beautiful', 'jump', 'happiness'], c: 2 },
    { cat: 'english', q: '"The bird is flying ___ the sky."', a: ['in', 'on', 'at', 'under'], c: 0 },
    { cat: 'english', q: 'The opposite of "expensive" is…', a: ['dear', 'cheap', 'rich', 'poor'], c: 1 },
    { cat: 'english', q: '"I ___ my homework yesterday."', a: ['do', 'did', 'done', 'doing'], c: 1 },
    { cat: 'english', q: 'A baby cat is called a…', a: ['puppy', 'cub', 'kitten', 'calf'], c: 2 },
    { cat: 'english', q: 'Which is spelled correctly?', a: ['beutiful', 'beautiful', 'beautifull', 'butiful'], c: 1 },
    { cat: 'english', q: '"He is ___ than me."', a: ['tall', 'taller', 'tallest', 'more tall'], c: 1 },
    { cat: 'english', q: 'Which word rhymes with "cake"?', a: ['cat', 'lake', 'kick', 'cook'], c: 1 },
    { cat: 'english', q: '"We ___ TV last night."', a: ['watch', 'watched', 'watching', 'watches'], c: 1 },
    { cat: 'english', q: '"___ you like ice cream?"', a: ['Is', 'Do', 'Are', 'Am'], c: 1 },
    { cat: 'english', q: 'The opposite of "always" is…', a: ['sometimes', 'never', 'often', 'usually'], c: 1 },
    { cat: 'english', q: 'Which sentence is correct?', a: ['They is playing.', 'They are playing.', 'They am playing.', 'They be playing.'], c: 1 },
    { cat: 'english', q: '"There ___ many books on the shelf."', a: ['is', 'are', 'am', 'be'], c: 1 },
    { cat: 'english', q: 'Which word means "very big"?', a: ['tiny', 'huge', 'thin', 'short'], c: 1 },
    { cat: 'english', q: 'The past tense of "eat" is…', a: ['eated', 'ate', 'eaten', 'eating'], c: 1 },
    { cat: 'english', q: 'The sun rises in the ___.', a: ['west', 'north', 'east', 'south'], c: 2 },
    { cat: 'english', q: 'The past tense of "see" is…', a: ['seed', 'saw', 'seen', 'sawed'], c: 1 },
    { cat: 'english', q: '"How ___ water do you drink every day?"', a: ['many', 'much', 'often', 'long'], c: 1 },
    { cat: 'english', q: 'The opposite of "noisy" is…', a: ['loud', 'quiet', 'busy', 'angry'], c: 1 },
    { cat: 'english', q: '"He plays football ___ Saturdays."', a: ['in', 'at', 'on', 'by'], c: 2 },
    { cat: 'english', q: '"Tom is the ___ boy in our class."', a: ['tall', 'taller', 'tallest', 'most tall'], c: 2 },
    { cat: 'english', q: 'Choose the correct sentence:', a: ['She don\u2019t like milk.', 'She doesn\u2019t like milk.', 'She not like milk.', 'She doesn\u2019t likes milk.'], c: 1 },
    { cat: 'english', q: '"There isn\u2019t ___ time left."', a: ['many', 'much', 'few', 'lots'], c: 1 },
    { cat: 'english', q: 'A chef works in a ___.', a: ['hospital', 'kitchen', 'library', 'bank'], c: 1 },
    { cat: 'english', q: '"My father\u2019s sister is my ___."', a: ['uncle', 'aunt', 'cousin', 'grandma'], c: 1 },
    { cat: 'english', q: '"She sings ___."', a: ['beautiful', 'beautifully', 'beauty', 'beautify'], c: 1 },
    { cat: 'english', q: 'The plural of "leaf" is…', a: ['leafs', 'leaves', 'leafes', 'leave'], c: 1 },

    // ---- chinese ----
    { cat: 'chinese', q: '「亡羊補牢」的意思是？', a: ['事後補救，未為晚也', '羊走失了很可惜', '修理欄柵很重要', '做事粗心大意'], c: 0 },
    { cat: 'chinese', q: '「春眠不覺曉」的下一句是？', a: ['花落知多少', '處處聞啼鳥', '夜來風雨聲', '低頭思故鄉'], c: 1 },
    { cat: 'chinese', q: '哪一個是「高興」的近義詞？', a: ['難過', '愉快', '生氣', '害怕'], c: 1 },
    { cat: 'chinese', q: '「畫蛇添足」是指？', a: ['畫畫很厲害', '多此一舉', '蛇有四隻腳', '做事很快'], c: 1 },
    { cat: 'chinese', q: '「日」字加一筆可以變成哪個字？', a: ['月', '目', '口', '田'], c: 1 },
    { cat: 'chinese', q: '「守株待兔」教訓我們不要？', a: ['勤力工作', '不勞而獲', '愛護動物', '砍伐樹木'], c: 1 },
    { cat: 'chinese', q: '「桃李滿門」形容什麼人？', a: ['農夫', '老師', '醫生', '商人'], c: 1 },
    { cat: 'chinese', q: '哪個成語形容速度很快？', a: ['一日千里', '守口如瓶', '井底之蛙', '對牛彈琴'], c: 0 },
    { cat: 'chinese', q: '「舉頭望明月」的下一句是？', a: ['低頭思故鄉', '疑是地上霜', '床前明月光', '花落知多少'], c: 0 },
    { cat: 'chinese', q: '「三心兩意」的反義詞是？', a: ['粗心大意', '一心一意', '心不在焉', '半途而廢'], c: 1 },
    { cat: 'chinese', q: '「虎頭蛇尾」是指做事？', a: ['有始有終', '有始無終', '快手快腳', '小心翼翼'], c: 1 },
    { cat: 'chinese', q: '哪一個字的部首是「火」？', a: ['河', '燒', '樹', '雪'], c: 1 },
    { cat: 'chinese', q: '「百聞不如一見」的意思是？', a: ['聽一百次更好', '親眼看見最真實', '不要相信別人', '見面要有禮貌'], c: 1 },
    { cat: 'chinese', q: '「雪中送炭」是指？', a: ['在困難時幫助別人', '冬天送禮物', '雪天買炭很貴', '天氣很寒冷'], c: 0 },
    { cat: 'chinese', q: '「光陰似箭」提醒我們要？', a: ['學習射箭', '珍惜時間', '走路要快', '努力儲錢'], c: 1 },
    { cat: 'chinese', q: '一（　）橋 — 應填哪個量詞？', a: ['條', '座', '張', '隻'], c: 1 },
    { cat: 'chinese', q: '「門庭若市」形容？', a: ['門口很小', '人多熱鬧', '市場很遠', '家裡冷清'], c: 1 },
    { cat: 'chinese', q: '「對牛彈琴」的意思是？', a: ['牛喜歡音樂', '白費唇舌', '彈琴好聽', '對動物要好'], c: 1 },
    { cat: 'chinese', q: '「床前明月光」的下一句是？', a: ['疑是地上霜', '低頭思故鄉', '舉頭望明月', '處處聞啼鳥'], c: 0 },
    { cat: 'chinese', q: '「東張西望」的意思是？', a: ['向東走向西走', '四處張望', '東西很多', '迷路了'], c: 1 },
    { cat: 'chinese', q: '「井底之蛙」形容人？', a: ['住在井裏', '見識少', '游水很好', '聲音很大'], c: 1 },
    { cat: 'chinese', q: '「自相矛盾」的意思是？', a: ['武器鋒利', '言行前後不一', '善於辯論', '買賣公平'], c: 1 },
    { cat: 'chinese', q: '「狐假虎威」是指？', a: ['狐狸怕老虎', '借別人威勢欺人', '老虎放假', '動物做朋友'], c: 1 },
    { cat: 'chinese', q: '「人山人海」形容？', a: ['山很高', '海很深', '人非常多', '風景優美'], c: 2 },
    { cat: 'chinese', q: '「一石二鳥」的意思是？', a: ['用石頭掟雀', '一舉兩得', '雀鳥很多', '打獵技術好'], c: 1 },
    { cat: 'chinese', q: '「守口如瓶」形容人？', a: ['口很小', '能保守秘密', '不愛說話', '喜歡喝水'], c: 1 },
    { cat: 'chinese', q: '「太陽公公出來了」運用了哪種修辭？', a: ['比喻', '擬人', '誇張', '對偶'], c: 1 },
    { cat: 'chinese', q: '「白雲像棉花糖」運用了哪種修辭？', a: ['比喻', '擬人', '誇張', '反問'], c: 0 },
    { cat: 'chinese', q: '一（　）剪刀 — 應填哪個量詞？', a: ['把', '張', '條', '架'], c: 0 },
    { cat: 'chinese', q: '「秋高氣爽」形容哪個季節？', a: ['春天', '夏天', '秋天', '冬天'], c: 2 },

    // ---- general ----
    { cat: 'general', q: '尖沙咀鐘樓的前身是什麼建築的一部分？', a: ['消防局', '火車站', '郵政局', '燈塔'], c: 1 },
    { cat: 'general', q: '維多利亞港兩岸是哪兩個地方？', a: ['港島與九龍', '九龍與新界', '港島與離島', '沙田與大埔'], c: 0 },
    { cat: 'general', q: '香港區旗上是什麼花？', a: ['杜鵑花', '洋紫荊', '向日葵', '木棉花'], c: 1 },
    { cat: 'general', q: '水在攝氏多少度會結冰？', a: ['0°C', '10°C', '50°C', '100°C'], c: 0 },
    { cat: 'general', q: '彩虹有多少種顏色？', a: ['5', '6', '7', '8'], c: 2 },
    { cat: 'general', q: '人體最大的器官是？', a: ['心臟', '皮膚', '肺', '腦'], c: 1 },
    { cat: 'general', q: '地球繞太陽一圈需要多久？', a: ['一日', '一個月', '一年', '十年'], c: 2 },
    { cat: 'general', q: '港鐵荃灣綫是什麼顏色？', a: ['藍色', '綠色', '紅色', '紫色'], c: 2 },
    { cat: 'general', q: '熊貓最愛吃什麼？', a: ['竹', '蜜糖', '魚', '蘋果'], c: 0 },
    { cat: 'general', q: '香港島上被稱為「叮叮」的交通工具是？', a: ['巴士', '電車', '的士', '小巴'], c: 1 },
    { cat: 'general', q: '香港太空館位於哪一區？', a: ['中環', '尖沙咀', '旺角', '銅鑼灣'], c: 1 },
    { cat: 'general', q: '香港最高的山是？', a: ['獅子山', '太平山', '大帽山', '鳳凰山'], c: 2 },
    { cat: 'general', q: '植物製造養分主要靠什麼？', a: ['月光', '陽光', '電燈', '火'], c: 1 },
    { cat: 'general', q: '哪一個是香港的離島？', a: ['長洲', '沙田', '觀塘', '元朗'], c: 0 },
    { cat: 'general', q: '指南針指向哪兩個方向？', a: ['東西', '南北', '上下', '左右'], c: 1 },
    { cat: 'general', q: '蝴蝶是由什麼變成的？', a: ['蝌蚪', '毛毛蟲', '螞蟻', '蜜蜂'], c: 1 },
    { cat: 'general', q: '月亮會自己發光嗎？', a: ['會，好似太陽', '不會，反射太陽光', '晚上才發光', '夏天才發光'], c: 1 },
    { cat: 'general', q: '廟街夜市以什麼聞名？', a: ['滑雪場', '大牌檔與攤檔', '游泳池', '溫泉'], c: 1 },
    { cat: 'general', q: '昂坪 360 纜車在哪個島？', a: ['南丫島', '大嶼山', '長洲', '蒲台島'], c: 1 },
    { cat: 'general', q: '香港哪裡可以看大熊貓？', a: ['迪士尼', '海洋公園', '濕地公園', '太空館'], c: 1 },
    { cat: 'general', q: '水蒸發之後會變成？', a: ['冰', '水蒸氣', '雪', '泥'], c: 1 },
    { cat: 'general', q: '電燈泡是誰發明的？', a: ['牛頓', '愛迪生', '愛因斯坦', '貝爾'], c: 1 },
    { cat: 'general', q: '獅子山位於香港哪個部分？', a: ['港島', '九龍', '離島', '西貢'], c: 1 },
    { cat: 'general', q: '人類呼吸需要哪種氣體？', a: ['氮氣', '氧氣', '二氧化碳', '氫氣'], c: 1 },
    { cat: 'general', q: '港鐵觀塘綫是什麼顏色？', a: ['紅色', '綠色', '藍色', '黃色'], c: 1 },
    { cat: 'general', q: '颱風「八號波」懸掛時代表？', a: ['天氣良好', '烈風吹襲', '輕微落雨', '酷熱天氣'], c: 1 },
    { cat: 'general', q: '香港特別行政區成立紀念日是？', a: ['7月1日', '10月1日', '1月1日', '12月25日'], c: 0 },
    { cat: 'general', q: '太陽系有多少個行星？', a: ['7', '8', '9', '10'], c: 1 },
    { cat: 'general', q: '青蛙的幼體叫什麼？', a: ['蝌蚪', '毛蟲', '幼蟲', '魚苗'], c: 0 },
    { cat: 'general', q: '以夜景聞名的香港山頂是？', a: ['獅子山', '太平山頂', '大帽山', '飛鵝山'], c: 1 },
  ],

  // ==========================================================
  // HARD (P5–P6) — percentages, ratio, algebra, speed, volume;
  // passive voice & conditionals; classical allusions
  // ==========================================================
  hard: [
    // ---- math ----
    { cat: 'math', q: '1/2 + 1/4 = ?', a: ['2/6', '3/4', '1/6', '2/4'], c: 1 },
    { cat: 'math', q: '50 的 20% 是多少？', a: ['5', '10', '15', '20'], c: 1 },
    { cat: 'math', q: '3.6 + 2.75 = ?', a: ['5.35', '6.35', '6.45', '5.45'], c: 1 },
    { cat: 'math', q: '2 + 3 × 4 = ?', a: ['20', '14', '24', '12'], c: 1 },
    { cat: 'math', q: '4、6、8 三個數的平均數是？', a: ['5', '6', '7', '8'], c: 1 },
    { cat: 'math', q: '三角形底 10cm、高 6cm，面積是？', a: ['16 cm²', '30 cm²', '60 cm²', '36 cm²'], c: 1 },
    { cat: 'math', q: '4 和 6 的最小公倍數是？', a: ['10', '12', '24', '8'], c: 1 },
    { cat: 'math', q: '0.25 等於幾分之幾？', a: ['1/2', '1/4', '1/5', '2/5'], c: 1 },
    { cat: 'math', q: '一個數的 3 倍加 7 等於 22，這個數是？', a: ['4', '5', '6', '7'], c: 1 },
    { cat: 'math', q: '圓周率 π 大約等於？', a: ['2.14', '3.14', '4.13', '3.41'], c: 1 },
    { cat: 'math', q: '1000 − 387 = ?', a: ['713', '623', '613', '603'], c: 2 },
    { cat: 'math', q: '哪一個是質數？', a: ['15', '21', '17', '27'], c: 2 },
    { cat: 'math', q: '正方形面積 49 cm²，邊長是？', a: ['6 cm', '7 cm', '8 cm', '9 cm'], c: 1 },
    { cat: 'math', q: '3/5 等於百分之幾？', a: ['35%', '60%', '53%', '65%'], c: 1 },
    { cat: 'math', q: '3/4 ÷ 1/2 = ?', a: ['3/8', '1 1/2', '2/3', '1 1/4'], c: 1 },
    { cat: 'math', q: '2.4 × 1.5 = ?', a: ['3.6', '3.9', '2.9', '4.6'], c: 0 },
    { cat: 'math', q: '240 的 15% 是多少？', a: ['24', '30', '36', '45'], c: 2 },
    { cat: 'math', q: '行 90 公里用了 1.5 小時，平均時速是？', a: ['45 km/h', '60 km/h', '75 km/h', '135 km/h'], c: 1 },
    { cat: 'math', q: '男女比例是 2:3，男生有 12 人，女生有多少人？', a: ['8', '15', '18', '24'], c: 2 },
    { cat: 'math', q: '36 和 48 的最大公因數是？', a: ['6', '8', '12', '16'], c: 2 },
    { cat: 'math', q: '半徑 7cm 的圓，圓周大約是？(π≈22/7)', a: ['22 cm', '44 cm', '154 cm', '49 cm'], c: 1 },
    { cat: 'math', q: '5x − 8 = 27，x = ?', a: ['5', '6', '7', '8'], c: 2 },
    { cat: 'math', q: '正方體邊長 4cm，體積是？', a: ['16 cm³', '48 cm³', '64 cm³', '96 cm³'], c: 2 },
    { cat: 'math', q: '連續 5 個雙數的和是 60，中間那個數是？', a: ['10', '12', '14', '16'], c: 1 },
    { cat: 'math', q: '原價 $250 的裙打八折，售價是？', a: ['$180', '$200', '$220', '$230'], c: 1 },
    { cat: 'math', q: '7.2 ÷ 0.9 = ?', a: ['0.8', '8', '80', '7.9'], c: 1 },
    { cat: 'math', q: '三角形兩隻角是 65° 和 48°，第三隻角是？', a: ['57°', '67°', '77°', '113°'], c: 1 },
    { cat: 'math', q: '甲數是乙數的 3 倍，兩數之和是 48，乙數是？', a: ['12', '16', '24', '36'], c: 0 },
    { cat: 'math', q: '√81 = ?', a: ['8', '9', '18', '40.5'], c: 1 },
    { cat: 'math', q: '長方體共有多少條棱？', a: ['8', '10', '12', '16'], c: 2 },

    // ---- english ----
    { cat: 'english', q: 'The past participle of "write" is…', a: ['wrote', 'written', 'writed', 'writing'], c: 1 },
    { cat: 'english', q: '"If it rains, we ___ stay home."', a: ['will', 'would', 'did', 'were'], c: 0 },
    { cat: 'english', q: 'A synonym of "important" is…', a: ['useless', 'essential', 'simple', 'common'], c: 1 },
    { cat: 'english', q: '"English ___ all over the world."', a: ['speaks', 'is spoken', 'is speaking', 'spoke'], c: 1 },
    { cat: 'english', q: 'Which idiom means "very easy"?', a: ['raining cats and dogs', 'a piece of cake', 'under the weather', 'break a leg'], c: 1 },
    { cat: 'english', q: 'The opposite of "ancient" is…', a: ['old', 'modern', 'antique', 'aged'], c: 1 },
    { cat: 'english', q: '"Neither Tom ___ Mary likes durian."', a: ['or', 'nor', 'and', 'but'], c: 1 },
    { cat: 'english', q: 'Which word is an adverb?', a: ['quick', 'quickly', 'quickness', 'quicken'], c: 1 },
    { cat: 'english', q: '"She has lived here ___ 2010."', a: ['for', 'since', 'from', 'at'], c: 1 },
    { cat: 'english', q: '"I look forward to ___ you."', a: ['see', 'seeing', 'saw', 'seen'], c: 1 },
    { cat: 'english', q: 'Which word means "happening once a year"?', a: ['daily', 'annual', 'monthly', 'weekly'], c: 1 },
    { cat: 'english', q: '"He asked me where ___."', a: ['do I live', 'I lived', 'am I living', 'do I lived'], c: 1 },
    { cat: 'english', q: 'The antonym of "generous" is…', a: ['kind', 'stingy', 'wealthy', 'giving'], c: 1 },
    { cat: 'english', q: '"Raining cats and dogs" means…', a: ['pets falling', 'raining heavily', 'sunny weather', 'a light shower'], c: 1 },
    { cat: 'english', q: '"The match was called off" means it was…', a: ['won', 'cancelled', 'started', 'shortened'], c: 1 },
    { cat: 'english', q: '"___ of the students has a dictionary."', a: ['All', 'Each', 'Both', 'Many'], c: 1 },
    { cat: 'english', q: 'Which is spelled correctly?', a: ['recieve', 'receive', 'receeve', 'riceive'], c: 1 },
    { cat: 'english', q: '"By the time we arrived, the show ___."', a: ['starts', 'had started', 'is starting', 'start'], c: 1 },
    { cat: 'english', q: 'She said she ___ tired.', a: ['is', 'was', 'are', 'be'], c: 1 },
    { cat: 'english', q: '"Despite ___ hard, he failed the test."', a: ['work', 'worked', 'working', 'works'], c: 2 },
    { cat: 'english', q: '"Give up" means…', a: ['to lift', 'to quit', 'to donate', 'to climb'], c: 1 },
    { cat: 'english', q: '"The book, ___ I read last week, was great."', a: ['who', 'which', 'where', 'whom'], c: 1 },
    { cat: 'english', q: 'A synonym of "enormous" is…', a: ['tiny', 'gigantic', 'narrow', 'average'], c: 1 },
    { cat: 'english', q: '"I wish I ___ taller."', a: ['am', 'is', 'were', 'be'], c: 2 },
    { cat: 'english', q: 'The prefix "im-" in "impossible" means…', a: ['very', 'not', 'again', 'before'], c: 1 },
    { cat: 'english', q: 'A group of lions is called a…', a: ['herd', 'pride', 'flock', 'pack'], c: 1 },
    { cat: 'english', q: '"He is allergic ___ peanuts."', a: ['of', 'to', 'with', 'at'], c: 1 },
    { cat: 'english', q: 'The antonym of "transparent" is…', a: ['clear', 'opaque', 'bright', 'thin'], c: 1 },
    { cat: 'english', q: '"Not only ___ smart, but she is also kind."', a: ['she is', 'is she', 'she be', 'was she'], c: 1 },
    { cat: 'english', q: '"Once in a blue moon" means…', a: ['every night', 'very rarely', 'once a month', 'when sad'], c: 1 },

    // ---- chinese ----
    { cat: 'chinese', q: '「塞翁失馬」的下一句是？', a: ['焉知非福', '必有後福', '不足為奇', '後悔莫及'], c: 0 },
    { cat: 'chinese', q: '「臥薪嘗膽」與哪位歷史人物有關？', a: ['劉備', '勾踐', '項羽', '韓信'], c: 1 },
    { cat: 'chinese', q: '「鞠躬盡瘁，死而後已」說的是哪位人物？', a: ['關羽', '諸葛亮', '曹操', '張飛'], c: 1 },
    { cat: 'chinese', q: '「莫等閒，白了少年頭」的下一句是？', a: ['空悲切', '誰人知', '歲月流', '志未酬'], c: 0 },
    { cat: 'chinese', q: '「青出於藍」比喻？', a: ['顏色漂亮', '學生勝過老師', '天空很藍', '染布的方法'], c: 1 },
    { cat: 'chinese', q: '「四面楚歌」與哪位人物有關？', a: ['劉邦', '項羽', '秦始皇', '孔子'], c: 1 },
    { cat: 'chinese', q: '「破釜沉舟」比喻？', a: ['煮飯技巧', '下定決心', '坐船旅行', '節省糧食'], c: 1 },
    { cat: 'chinese', q: '「諱疾忌醫」是指？', a: ['怕看醫生', '隱瞞缺點不肯改正', '生病要求醫', '醫術高明'], c: 1 },
    { cat: 'chinese', q: '「不入虎穴」的下一句是？', a: ['焉得虎子', '必有大難', '不見老虎', '便是英雄'], c: 0 },
    { cat: 'chinese', q: '「醉翁之意不在酒」比喻？', a: ['喝醉了', '別有目的', '酒不好喝', '愛喝酒的人'], c: 1 },
    { cat: 'chinese', q: '「紙上談兵」與哪位人物有關？', a: ['趙括', '岳飛', '孫武', '白起'], c: 0 },
    { cat: 'chinese', q: '「三顧草廬」是誰拜訪誰？', a: ['曹操拜訪司馬懿', '劉備拜訪諸葛亮', '孫權拜訪周瑜', '關羽拜訪張飛'], c: 1 },
    { cat: 'chinese', q: '「欲窮千里目」的下一句是？', a: ['更上一層樓', '黃河入海流', '白日依山盡', '不畏浮雲遮'], c: 0 },
    { cat: 'chinese', q: '「揠苗助長」的教訓是？', a: ['種田要勤力', '急於求成反而壞事', '幼苗要多澆水', '農作物要施肥'], c: 1 },
    { cat: 'chinese', q: '「杯弓蛇影」形容人？', a: ['眼力很好', '疑神疑鬼', '怕喝酒', '愛喝茶'], c: 1 },
    { cat: 'chinese', q: '「聞雞起舞」比喻？', a: ['雞叫得早', '勤奮自強', '愛跳舞', '養雞致富'], c: 1 },
    { cat: 'chinese', q: '「時間就是金錢」運用了哪種修辭手法？', a: ['擬人', '比喻', '誇張', '反問'], c: 1 },
    { cat: 'chinese', q: '「畫龍點睛」的意思是？', a: ['畫畫要仔細', '在關鍵處加上精彩一筆', '龍是神獸', '點眼睛最難畫'], c: 1 },
    { cat: 'chinese', q: '「水滴石穿」比喻？', a: ['水的力量大', '有恆心終能成事', '石頭很軟弱', '下雨的災害'], c: 1 },
    { cat: 'chinese', q: '《出師表》的作者是？', a: ['曹操', '諸葛亮', '司馬遷', '杜甫'], c: 1 },
    { cat: 'chinese', q: '《靜夜思》的作者是？', a: ['杜甫', '李白', '王維', '白居易'], c: 1 },
    { cat: 'chinese', q: '「先天下之憂而憂」出自哪位文人？', a: ['范仲淹', '蘇軾', '歐陽修', '王安石'], c: 0 },
    { cat: 'chinese', q: '「三人行，必有我師焉」出自？', a: ['《孟子》', '《論語》', '《大學》', '《中庸》'], c: 1 },
    { cat: 'chinese', q: '「歲寒三友」是指？', a: ['梅蘭菊', '松竹梅', '桃李杏', '蘭竹菊'], c: 1 },
    { cat: 'chinese', q: '「文房四寶」是指？', a: ['琴棋書畫', '筆墨紙硯', '詩詞歌賦', '梅蘭竹菊'], c: 1 },
    { cat: 'chinese', q: '「入木三分」原本形容什麼？', a: ['雕刻技術', '書法筆力', '武功高強', '釘子很長'], c: 1 },
    { cat: 'chinese', q: '「胸有成竹」的意思是？', a: ['胸口痛', '事前已有充分把握', '喜歡竹樹', '身材高大'], c: 1 },
    { cat: 'chinese', q: '「鶴立雞群」形容？', a: ['動物相處', '才能出眾', '雞場風光', '身材瘦削'], c: 1 },
    { cat: 'chinese', q: '「負荊請罪」是誰向誰請罪？', a: ['廉頗向藺相如', '張飛向關羽', '項羽向劉邦', '韓信向蕭何'], c: 0 },
    { cat: 'chinese', q: '「春風又綠江南岸」的下一句是？', a: ['明月何時照我還', '萬紫千紅總是春', '二月春風似剪刀', '春來江水綠如藍'], c: 0 },

    // ---- general ----
    { cat: 'general', q: '香港在哪一年回歸中國？', a: ['1995', '1997', '1999', '2000'], c: 1 },
    { cat: 'general', q: '太陽系中最大的行星是？', a: ['地球', '土星', '木星', '火星'], c: 2 },
    { cat: 'general', q: '尖沙咀「1881」古蹟的前身是？', a: ['水警總部', '天文台', '郵政總局', '消防局'], c: 0 },
    { cat: 'general', q: '半島酒店位於哪條道路？', a: ['彌敦道', '梳士巴利道', '廣東道', '漆咸道'], c: 1 },
    { cat: 'general', q: '世界最高的山峰是？', a: ['富士山', '珠穆朗瑪峰', '玉山', '崑崙山'], c: 1 },
    { cat: 'general', q: '成年人體有大約多少塊骨頭？', a: ['106', '206', '306', '406'], c: 1 },
    { cat: 'general', q: '香港國際機場位於哪個島？', a: ['長洲', '赤鱲角', '南丫島', '坪洲'], c: 1 },
    { cat: 'general', q: '水的沸點是攝氏多少度？', a: ['90°C', '100°C', '110°C', '120°C'], c: 1 },
    { cat: 'general', q: '空氣中含量最多的氣體是？', a: ['氧氣', '氮氣', '二氧化碳', '氫氣'], c: 1 },
    { cat: 'general', q: '青馬大橋連接哪兩個地方？', a: ['青衣和馬灣', '青山和馬鞍山', '九龍和港島', '屯門和元朗'], c: 0 },
    { cat: 'general', q: '香港共分為多少個行政分區？', a: ['12', '15', '18', '21'], c: 2 },
    { cat: 'general', q: '九龍清真寺位於彌敦道與哪條街交界附近？', a: ['海防道', '北京道', '佐敦道', '柯士甸道'], c: 0 },
    { cat: 'general', q: '維多利亞港的名字源自？', a: ['英國維多利亞女王', '一位船長', '一座山', '一種花'], c: 0 },
    { cat: 'general', q: '尖沙咀星光大道紀念哪個行業的名人？', a: ['音樂', '電影', '體育', '科學'], c: 1 },
    { cat: 'general', q: '彩虹的形成是因為光的什麼現象？', a: ['反射', '折射與色散', '直線傳播', '吸收'], c: 1 },
    { cat: 'general', q: '重慶大廈由多少座 17 層大樓組成？', a: ['3', '4', '5', '6'], c: 2 },
    { cat: 'general', q: '光在真空中的速度大約是每秒？', a: ['3 萬公里', '30 萬公里', '300 萬公里', '3000 公里'], c: 1 },
    { cat: 'general', q: '香港第一條過海隧道是？', a: ['東區海底隧道', '紅磡海底隧道', '西區海底隧道', '獅子山隧道'], c: 1 },
    { cat: 'general', q: 'DNA 主要儲存在細胞的哪個部分？', a: ['細胞膜', '細胞核', '細胞質', '細胞壁'], c: 1 },
    { cat: 'general', q: '世界上最大的海洋是？', a: ['大西洋', '太平洋', '印度洋', '北冰洋'], c: 1 },
    { cat: 'general', q: '聲音在哪種介質中傳播最快？', a: ['空氣', '水', '固體', '真空'], c: 2 },
    { cat: 'general', q: '「光年」是量度什麼的單位？', a: ['時間', '距離', '速度', '亮度'], c: 1 },
    { cat: 'general', q: '世界最長的河流是？', a: ['長江', '尼羅河', '亞馬遜河', '黃河'], c: 1 },
    { cat: 'general', q: '人的心臟共有多少個腔室？', a: ['2 個', '3 個', '4 個', '5 個'], c: 2 },
    { cat: 'general', q: '植物進行光合作用時吸入哪種氣體？', a: ['氧氣', '二氧化碳', '氮氣', '氫氣'], c: 1 },
    { cat: 'general', q: '電壓的單位是？', a: ['安培', '伏特', '瓦特', '歐姆'], c: 1 },
    { cat: 'general', q: '香港最大的島嶼是？', a: ['香港島', '大嶼山', '南丫島', '長洲'], c: 1 },
    { cat: 'general', q: '澳洲的首都是？', a: ['悉尼', '墨爾本', '坎培拉', '布里斯班'], c: 2 },
    { cat: 'general', q: '哪種血型被稱為「萬能捐血者」？', a: ['A 型', 'B 型', 'AB 型', 'O 型'], c: 3 },
    { cat: 'general', q: '香港第一條鐵路是？', a: ['港島綫', '九廣鐵路', '荃灣綫', '輕鐵'], c: 1 },
  ],
};

// ------------------------------------------------------------
// Procedural math — endless variety, difficulty-aware
// ------------------------------------------------------------
function randInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

function buildChoices(ans, spread) {
  const opts = new Set([ans]);
  while (opts.size < 4) {
    const delta = randInt(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    if (ans + delta >= 0 && ans + delta !== ans) opts.add(ans + delta);
  }
  const a = shuffle([...opts]);
  return { a: a.map(String), c: a.indexOf(ans) };
}

function makeMathQuestion(diff) {
  let q, ans, spread;
  if (diff === 'easy') {
    // P1–P2: 2-digit add/subtract with carrying, ×2/×5/×10, missing number
    const kind = randInt(0, 3);
    if (kind === 0) { const a = randInt(15, 58), b = randInt(13, 39); q = `${a} + ${b} = ?`; ans = a + b; }
    else if (kind === 1) { const a = randInt(40, 99), b = randInt(12, a - 10); q = `${a} − ${b} = ?`; ans = a - b; }
    else if (kind === 2) { const m = [2, 5, 10][randInt(0, 2)], b = randInt(2, 9); q = `${m} × ${b} = ?`; ans = m * b; }
    else { const a = randInt(3, 9), s = randInt(a + 2, 20); q = `□ + ${a} = ${s}，□ 是多少？`; ans = s - a; }
    spread = 4;
  } else if (diff === 'medium') {
    // P3–P4: 3-digit ops, full times tables, division, fraction of n
    const kind = randInt(0, 4);
    if (kind === 0) { const a = randInt(125, 689), b = randInt(110, 290); q = `${a} + ${b} = ?`; ans = a + b; spread = 20; }
    else if (kind === 1) { const a = randInt(300, 900), b = randInt(110, 290); q = `${a} − ${b} = ?`; ans = a - b; spread = 20; }
    else if (kind === 2) { const a = randInt(3, 12), b = randInt(3, 12); q = `${a} × ${b} = ?`; ans = a * b; spread = 8; }
    else if (kind === 3) { const b = randInt(3, 12), r = randInt(4, 12); q = `${b * r} ÷ ${b} = ?`; ans = r; spread = 4; }
    else { const d = [2, 3, 4, 5][randInt(0, 3)], r = randInt(3, 12); q = `${d * r} 的 1/${d} 是多少？`; ans = r; spread = 4; }
  } else {
    // P5–P6: order of ops, 2-digit ×, %, decimals, simple equations
    const kind = randInt(0, 4);
    if (kind === 0) { const a = randInt(3, 9), b = randInt(3, 9), cc = randInt(2, 9); q = `(${a} + ${b}) × ${cc} = ?`; ans = (a + b) * cc; spread = 12; }
    else if (kind === 1) { const a = randInt(13, 38), b = randInt(12, 29); q = `${a} × ${b} = ?`; ans = a * b; spread = 25; }
    else if (kind === 2) { const p = [10, 20, 25, 30, 40, 50, 75][randInt(0, 6)], n = randInt(2, 24) * 20; q = `${n} 的 ${p}% 是多少？`; ans = n * p / 100; spread = Math.max(5, ans / 3 | 0); }
    else if (kind === 3) { const x = randInt(4, 15), m = randInt(2, 9), b = randInt(2, 30); q = `${m}x + ${b} = ${m * x + b}，x = ?`; ans = x; spread = 4; }
    else { const a = randInt(2, 9), b = randInt(2, 9); q = `${a}.${randInt(1, 9)} + ${b}.${randInt(1, 9)} = ?`; const parts = q.match(/(\d+\.\d+) \+ (\d+\.\d+)/); ans = Math.round((parseFloat(parts[1]) + parseFloat(parts[2])) * 10) / 10; spread = 3;
      const opts = new Set([ans]);
      while (opts.size < 4) { const d = (randInt(1, 14) / 10) * (Math.random() < 0.5 ? -1 : 1); const v = Math.round((ans + d) * 10) / 10; if (v > 0 && v !== ans) opts.add(v); }
      const arr = shuffle([...opts]);
      return { cat: 'math', q, a: arr.map(String), c: arr.indexOf(ans) };
    }
  }
  return { cat: 'math', q, ...buildChoices(ans, spread) };
}

// ------------------------------------------------------------
// Pick `n` questions with mixed categories, no repeats per game.
// ------------------------------------------------------------
const usedIds = new Set();

export function pickQuestions(n = 3, diff = 'easy') {
  const bank = BANK[diff] || BANK.easy;
  const cats = shuffle(Object.keys(CATEGORIES).slice());
  const picked = [];
  for (let i = 0; i < n; i++) {
    const cat = cats[i % cats.length];
    if (cat === 'math' && Math.random() < 0.35) {
      picked.push(makeMathQuestion(diff));
      continue;
    }
    const pool = bank
      .map((qq, idx) => ({ ...qq, _id: diff + idx }))
      .filter(qq => qq.cat === cat && !usedIds.has(qq._id));
    if (pool.length === 0) {
      picked.push(makeMathQuestion(diff));
      continue;
    }
    const choice = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(choice._id);
    // shuffle answer order so the correct slot varies
    const order = shuffle([0, 1, 2, 3]);
    picked.push({
      cat: choice.cat,
      q: choice.q,
      a: order.map(k => choice.a[k]),
      c: order.indexOf(choice.c),
    });
  }
  return picked;
}

export function resetQuestionPool() { usedIds.clear(); }

export function bankSize(diff) { return BANK[diff].length; }
