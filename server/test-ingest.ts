import { ingestDocument } from "./src/modules/ai/rag";

async function run() {
  try {
    const id = await ingestDocument("Test amaçlı vektör kaydı.");
    console.log("Vektör DB'ye KUSURSUZ eklendi! ID:", id);
  } catch (e: any) {
    console.error("HATA:", e.message);
  }
}
run();
