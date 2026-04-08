import loader from "@monaco-editor/loader";

const editorContainer = document.getElementById("editor-container") as HTMLElement;
const inputText = document.getElementById("input-area") as HTMLTextAreaElement;
const runButton = document.getElementById("run-btn") as HTMLButtonElement;
const fontChanger = document.getElementById("font-select") as HTMLSelectElement;
const language = document.getElementById("lang-select") as HTMLSelectElement;
const outputArea = document.getElementById("output-area") as HTMLElement;

loader.init().then((monaco) => {
    
     const editor = monaco.editor.create(editorContainer , {
          language : "cpp",
          theme : "vs-dark",
          automaticLayout: true,
          fontSize : 16,
          minmap : {enabled : false},
          wordWrap : "on"
     });

     runButton.addEventListener("click" , async () => {
          const userCode = editor.getValue();
          const inputValue = inputText.value;
          const selectedLanguage = language.value;

          runButton.innerText = "Running...";
          runButton.disabled = true;
          outputArea.innerText = "Compiling...";

          try{
              const response = await fetch("http://localhost:3000/compile" , {
                 method : "POST",
                 headers : {
                    "Content-Type": "application/json",
                 },
                 body :JSON.stringify({
                      language : selectedLanguage,
                      code : userCode,
                      input : inputValue
                 })
              });

              const result = await response.json();

              if(result.status === "success"){
                  outputArea.innerText = result.output;
                  outputArea.style.color = "white";
              }else{
                  outputArea.innerText = result.error;
                  outputArea.style.color = "red"; 
              }
          }
          catch(error){
               console.error("Error communicating with backend:", error);
          }
          finally{
              runButton.innerText = "RUN";
              runButton.disabled = false;
          }
     });

     fontChanger.addEventListener("change" , (event) => {
          const newFontSize = parseInt((event.target as HTMLSelectElement).value);
          editor.updateOptions({fontSize : newFontSize});
     });

     language.addEventListener("change" ,(event) => {
          const newLanguage = (event.target as HTMLSelectElement).value;
          const model = editor.getModel();
          monaco.editor.setModelLanguage(model , newLanguage);
     });
});
