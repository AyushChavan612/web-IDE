import loader from "@monaco-editor/loader";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import  setupOptimization  from "./optimize.js";
import fixErrors from "./error.js";
import "@xterm/xterm/css/xterm.css";

const editorContainer = document.getElementById("editor-container") as HTMLElement;
const inputText = document.getElementById("input-area") as HTMLTextAreaElement;
const runButton = document.getElementById("run-btn") as HTMLButtonElement;
const fontChanger = document.getElementById("font-select") as HTMLSelectElement;
const language = document.getElementById("lang-select") as HTMLSelectElement;
const terminalContainer = document.getElementById("output-area") as HTMLDivElement;

const terminal = new Terminal({
     theme: {
          background: '#252526',
          foreground: '#ffffff'
     },
     fontFamily: 'Consolas, monospace',
     fontSize: 14,
     convertEol: true,
     scrollback: 50000
});

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

terminal.open(terminalContainer);
fitAddon.fit();
terminal.write("Output will appear here");

loader.init().then((monaco) => {

     const editor = monaco.editor.create(editorContainer, {
          language: "cpp",
          theme: "vs-dark",
          automaticLayout: true,
          fontSize: 16,
          minimap: { enabled: false },
          wordWrap: "on"
     });

     runButton.addEventListener("click", async () => {
          terminal.reset();
          terminal.clear();
          
          const userCode = editor.getValue();
          const inputValue = inputText.value;
          const selectedLanguage = language.value;
          
          if (!userCode.trim()) {
               terminal.write('Please write some code before executing.');
               return;
          }

          runButton.innerText = "Running...";
          runButton.disabled = true;
          
          const compilerApiUrl = import.meta.env.VITE_COMPILER_API_URL as string;
          try {
               const response = await fetch(compilerApiUrl, {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                         language: selectedLanguage,
                         code: userCode,
                         input: inputValue
                    })
               });

               const reader = response.body?.getReader();
               const decoder = new TextDecoder();

               if (!reader) {
                    throw new Error("Failed to read the stream from the server");
               }

               while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                         break;
                    }

                    let chunk = decoder.decode(value, { stream: true });
                    terminal.write(chunk);
               }
          }
          catch (error) {
               console.error("Error communicating with backend:", error);
          }
          finally {
               runButton.innerText = "RUN";
               runButton.disabled = false;
          }
     });

     fontChanger.addEventListener("change", (event) => {
          const newFontSize = parseInt((event.target as HTMLSelectElement).value);
          editor.updateOptions({ fontSize: newFontSize });
     });

     language.addEventListener("change", (event) => {
          const newLanguage = (event.target as HTMLSelectElement).value;
          const model = editor.getModel();
          monaco.editor.setModelLanguage(model, newLanguage);
          if (newLanguage === "java") {
               window.alert("The name of the class containing public static void main must be Main");
          }
     });

     window.addEventListener('resize', () => {
          editor.layout();
          fitAddon.fit();
     });

     setupOptimization(editor, language);
     fixErrors(editor , language , terminalContainer , inputText);
});

