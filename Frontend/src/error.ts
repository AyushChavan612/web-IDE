async function safeJsonParse(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) throw new Error("Server returned an empty response.");
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Server error: ${text.substring(0, 200)}`);
    }
}

export default function fixErrors (
    editor : any , 
    language : HTMLSelectElement ,
    terminal: HTMLDivElement ,
    inputArea : HTMLTextAreaElement) : void {
     
    const errorButton = document.getElementById("error-btn") as HTMLButtonElement;
    const errorModal = document.getElementById("fixErrorModal") as HTMLDivElement;
    const applyErrorBtn = document.getElementById("apply-error-btn") as HTMLButtonElement;
    const closeErrorBtn = document.getElementById("close-error-btn") as HTMLButtonElement;
    const analysisArea = document.getElementById("error-explanation") as HTMLSpanElement;
    const codeBlock = document.getElementById("error-code") as HTMLElement;
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

            const data = await safeJsonParse(response);

            if (!response.ok) {
                throw new Error(data.error || "Unknown backend error occurred.");
            }

            analysisArea.innerText = data.explaination;
            codeBlock.innerText = data.fixedCode;

            errorModal.style.display = "flex";

        }
        catch (error: any) {
            console.error("FixErrorModel Error:", error);
            window.alert(error.message);
        } finally {
            errorButton.innerText = "Fix Errors";
            errorButton.disabled = false;
            optimizeButton.disabled = false;
        }
    });

    closeErrorBtn.addEventListener("click", () => {
        errorModal.style.display = "none";
    });

    applyErrorBtn.addEventListener("click", () => {
        editor.setValue(codeBlock.innerText);
        errorModal.style.display = "none";
    });  
}