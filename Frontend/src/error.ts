export default function fixErrors (
    editor : any , 
    language : HTMLSelectElement ,
    terminal: HTMLDivElement ,
    inputArea : HTMLTextAreaElement) : void {
     
    const errorButton = document.getElementById("error-btn") as HTMLButtonElement;
    const errorModel = document.getElementById("fixErrorModel") as HTMLDivElement;
    const applyOptBtn = document.getElementById("apply-opt-btn") as HTMLButtonElement;
    const closeOptBtn = document.getElementById("close-opt-btn") as HTMLButtonElement;
    const analysisArea = document.getElementById("explaination") as HTMLSpanElement;
    const codeBlock = document.getElementById("opt-code") as HTMLElement;
    const optimizeButton = document.getElementById("optimize-btn") as HTMLButtonElement;

    errorButton.addEventListener("click" , async () => {
        optimizeButton.disabled = true;
        const userCode = editor.getValue();
        const selectedLanguage = language.value; 
        const error = terminal.innerText;
        const input = inputArea.value;

        if (!userCode.trim()) {
            window.alert("There's no code in the editor");
            return;
        }

        errorButton.innerText = "Fixing...";
        errorButton.disabled = true;
        
        const fixErrorsApiUrl = import.meta.env.VITE_FIXERRORS_API_URL as string;
        try {
            const response = await fetch(fixErrorsApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    code: userCode, 
                    error : error,
                    language: selectedLanguage ,
                    input : input
                })
            });

            if (!response.ok) {
                throw new Error("FixError engine failed.");
            }

            const data = await response.json(); 

            analysisArea.innerText = data.explaination;
            codeBlock.innerText = data.fixedCode;

            errorModel.style.display = "flex";

        }
        catch (error) {
            console.error("FixErrorModel Error:", error);
            window.alert("Failed to reach the AI Engine.");
        } finally {
            errorButton.innerText = "Fix Errors";
            errorButton.disabled = false;
            optimizeButton.disabled = false;
        }
    });

    closeOptBtn.addEventListener("click", () => {
        errorModel.style.display = "none";
    });

    applyOptBtn.addEventListener("click", () => {
        editor.setValue(codeBlock.innerText);
        errorModel.style.display = "none";
    });  
}