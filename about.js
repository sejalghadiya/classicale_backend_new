import fs from "fs";

// 1000 words ka dummy content generate karna
const generateText = () => {
  let text = "Artificial Intelligence (AI) is transforming the world rapidly. ";
  while (text.split(" ").length < 1000) {
    text +=
      "AI is revolutionizing industries, enhancing automation, and shaping future technologies. ";
  }
  return text;
};

// ✅ Multiple Articles ke liye JSON Data Array
const jsonData = [
  {
    title: "The Future of AI",
    author: "John Doe",
    date: new Date().toISOString(),
    content: generateText(),
  },
  {
    title: "Machine Learning Trends",
    author: "Jane Smith",
    date: new Date().toISOString(),
    content: generateText(),
  },
  {
    title: "Deep Learning Advancements",
    author: "Alice Johnson",
    date: new Date().toISOString(),
    content: generateText(),
  },
];

// ✅ JSON File Create Karna
fs.writeFileSync("ai_future.json", JSON.stringify(jsonData, null, 2));

console.log("✅ JSON file successfully create ho gaya: ai_future.json");
