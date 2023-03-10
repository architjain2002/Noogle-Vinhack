// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
var path = require("path");
const request = require("request");
const fetch = require("node-fetch");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
let panel;

function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "doccy" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "doccy.getText",
    function () {
      // The code you place here will be executed every time your command is executed
      const editor = vscode.window.activeTextEditor;

      // let document, filename;
      if (editor) {
        let document = editor.document;
        let filename = path.basename(document.fileName);
        // console.log(filename);
        const documentContent = document.getText();
        // console.log(documentContent);
        for (var i = filename.length; i > 0; i--) {
          if (filename[i] === ".") {
            filename = filename.slice(i + 1, filename.length);
            break;
          }
        }
        vscode.window.showInformationMessage(filename);

        if (filename === "cpp") {
          let reg = /#include\s*[<"]([^>"]+)[>"]/g;
          let match;
          while ((match = reg.exec(documentContent)) !== null) {
            console.log(match[1]);
          }
        } else if (filename == "py") {
          let reg = /(?:import|from)\s([\w.]+)/g;
          let match;
          while ((match = reg.exec(documentContent)) !== null) {
            console.log(match[1]);
          }
        } else if (filename == "java") {
          let reg = /(?:import)\s([\w.]+)/g;
          let match;
          while ((match = reg.exec(documentContent)) !== null) {
            console.log(match[1]);
          }
        }
      }

      // @ts-ignore
      fetch(
        "https://www.googleapis.com/customsearch/v1?key=AIzaSyC6gKMMoXgPkOnnC1TTj6C60aeLxI1v_ys&cx=32c6f4cdb22f343b0&q=tensorflow"
      )
        .then((response) => response.json())
        .then((data) => {
          vscode.window.showInformationMessage(
            `Data received: ${JSON.stringify(data)}`
          );
          console.log(JSON.stringify(data, null, 2));
        })
        .catch((error) => {
          vscode.window.showErrorMessage(`Error: ${error}`);
        });

      let panel = vscode.window.createWebviewPanel(
        "browser", // Identifies the type of the webview. Used internally
        "Browser", // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          enableScripts: true,
        }
      );

      // Navigate to a website
      panel.webview.html = `<html><body>Loading...</body></html>`;

      // Use XMLHttpRequest to fetch the HTML content of the website
      var XMLHttpRequest = require("xhr2");
      let xhr = new XMLHttpRequest();
      xhr.open("GET", "https://www.tensorflow.org", true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          // Update the webview's HTML content
          panel.webview.html = xhr.responseText;
        }
      };
      xhr.send();

      // Handle navigation events
      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "navigate":
              xhr.open("GET", message.url, true);
              xhr.send();
              break;
          }
        },
        null,
        context.subscriptions
      );

      // Display a message box to the user
      // vscode.window.showInformationMessage("Hello World from doccy!");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
