import { embed } from "ai";
import { embeddingModel } from "./src/providers/llm";

async function run() {
  try {
    const { embedding } = await embed({
      model: embeddingModel,
      value: "Test mesajı",
    });
    console.log("BAŞARILI! Vektör Boyutu:", embedding.length);
  } catch (e: any) {
    console.error("HATA:", e.message);
  }
}
run();
