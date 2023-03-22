import { ItemView, WorkspaceLeaf, Notice, App } from "obsidian";

export const VIEW_TYPE_EXAMPLE = "example-view";


interface BMOSettings {
	apiKey: string;
	max_tokens: number;
	system_role: string;
	temperature: number;
}

export class BMOView extends ItemView {
    private messageEl: HTMLElement;
    private settings: BMOSettings;

    constructor(leaf: WorkspaceLeaf, settings: BMOSettings) {
        super(leaf);
        this.settings = settings;
    }

    getViewType() {
        return VIEW_TYPE_EXAMPLE;
    }

    getDisplayText() {
        return "BMO";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        const bmoContainer = container.createEl("div", {
            attr: {
            id: "bmoContainer",
            }
        });

    bmoContainer.createEl("h1", { 
        text: "BMO",
        attr: {
          id: "bmoHeading"
        }
    });

    bmoContainer.createEl("p", {
        text: "Model: GPT-3.5-Turbo",
        attr: {
            id: "modelName"
          }
    });

    bmoContainer.createEl("div", {
        attr: {
            id: "messageContainer"
        }
    });
    
    const chatbox = bmoContainer.createEl("textarea", {
        attr: {
            id: "chatbox",
            placeholder: "Start typing...",
        }
    });
    
    const chatboxElement = chatbox as HTMLTextAreaElement;
    
    chatboxElement.addEventListener("keyup", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // prevent submission
            const input = chatboxElement.value.trim();
            if (input.length === 0) { // check if input is empty or just whitespace
                return;
            }

            this.BMOchatbot(input);

            // Create a new paragraph element for each message
            const userMessage = document.createElement("p");
            userMessage.innerHTML = input.replace(/\n/g, "<br>"); //save the newlines
            userMessage.style.display = "inline-block";
            
            // Append the new message to the message container
            const messageContainer = document.querySelector("#messageContainer");
            if (messageContainer) {
                messageContainer.appendChild(userMessage);
            }
    
            chatboxElement.value = "";
            setTimeout(() => {
                chatboxElement.style.height = "36px";
                chatboxElement.value = chatboxElement.value.replace(/^[\r\n]+|[\r\n]+$/gm,""); // remove newlines only at beginning or end of input
                chatboxElement.setSelectionRange(0, 0);
            }, 0);
        }
    });
    

    chatboxElement.addEventListener("input", (event) => {
        chatboxElement.style.height = "36px";
        chatboxElement.style.height = `${chatboxElement.scrollHeight}px`;
      });
  }

  async BMOchatbot(input: string) {
    if (!this.settings.apiKey) {
    	new Notice("API key not found. Please add your OpenAI API key in the plugin settings.");
    	return;
    }

    console.log("BMO settings:", this.settings);
    // console.log("system_role:", this.settings.system_role);
    

    try {
    	const maxTokens = parseInt(this.settings.max_tokens);
    	const temperature = parseInt(this.settings.temperature);

    	const response = await fetch('https://api.openai.com/v1/chat/completions', {
    		method: 'POST',
    		headers: {
    			'Content-Type': 'application/json',
    			'Authorization': `Bearer ${this.settings.apiKey}`
    		},
    		body: JSON.stringify({
    			model: 'gpt-3.5-turbo',
    			messages: [
    				{ role: 'system', content: this.settings.system_role },
    				{ role: 'user', content: input }
    			],
    			max_tokens: maxTokens,
    			temperature: temperature,
    		}),
    	});

        const data = await response.json();
        // console.log(data);

        const message = data.choices[0].message.content;
        console.log(message);

        // Append the bmoMessage element to the messageContainer div
        const messageContainerEl = document.getElementById("messageContainer");
        if (messageContainerEl) {
        //   const botMessageEl = document.createElement("div");
        //   botMessageEl.id = "bot";
          const messageEl = document.createElement("p");
          messageEl.style.display = "inline-block";
          messageEl.textContent = message;
        //   botMessageEl.appendChild(messageEl);
          messageContainerEl.appendChild(messageEl);
        }
        
    
        } catch (error) {
        	new Notice('Error occurred while fetching completion: ' + error.message);
        }
}

  async onClose() {
    // Nothing to clean up.
  }

}
