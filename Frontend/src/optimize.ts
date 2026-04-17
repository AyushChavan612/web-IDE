export default async function setupOptimization(editor: any, language: HTMLSelectElement) {

    const optimizeButton = document.getElementById("optimize-btn") as HTMLButtonElement;
    const optimizeModal = document.getElementById("optimize-modal") as HTMLDivElement;
    const optTime = document.getElementById("opt-time") as HTMLSpanElement;
    const optSpace = document.getElementById("opt-space") as HTMLSpanElement;
    const optAnalysis = document.getElementById("opt-explaination") as HTMLSpanElement;
    const optCode = document.getElementById("opt-code") as HTMLElement;
    const applyOptBtn = document.getElementById("apply-opt-btn") as HTMLButtonElement;
    const closeOptBtn = document.getElementById("close-opt-btn") as HTMLButtonElement;
    const errorButton = document.getElementById("error-btn") as HTMLButtonElement; 

    optimizeButton.addEventListener("click", async () => {
        errorButton.disabled = true;
        const userCode = editor.getValue();
        const selectedLanguage = language.value; 

        if (!userCode.trim()) {
            window.alert("There's no code in the editor");
            return;
        }

        optimizeButton.innerText = "OPTIMIZING...";
        optimizeButton.disabled = true;
        
        const optimizeCodeApiUrl = import.meta.env.VITE_OPTIMIZE_CODE_API_URL as string;
        try {
            const response = await fetch(optimizeCodeApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    code: userCode, 
                    language: selectedLanguage 
                })
            });

            if (!response.ok) {
                throw new Error("Optimization engine failed.");
            }

            const data = await response.json(); 

            optTime.innerText = data.timeComplexity;
            optSpace.innerText = data.spaceComplexity;
            optAnalysis.innerText = data.explaination;
            optCode.innerText = data.optimizedCode;

            optimizeModal.style.display = "flex";

        } catch (error) {
            console.error("Optimization Error:", error);
            window.alert("Failed to reach the AI Engine.");
        } finally {
            optimizeButton.innerText = "OPTIMIZE";
            optimizeButton.disabled = false;
            errorButton.disabled = false;
        }
    });

    closeOptBtn.addEventListener("click", () => {
        optimizeModal.style.display = "none";
    });

    applyOptBtn.addEventListener("click", () => {
        editor.setValue(optCode.innerText);
        optimizeModal.style.display = "none";
    });     
}