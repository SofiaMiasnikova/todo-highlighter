const vscode = require('vscode');

const COMMENT_TYPES = {
    TODO: {
        regex: /\/\/\s*TODO:?.*/g,
        color: '#ff77dd',
        decorationType: null
    },
    FIXME: {
        regex: /\/\/\s*FIXME:?.*/g,
        color: '#ff9900',
        decorationType: null
    },
    HACK: {
        regex: /\/\/\s*HACK:?.*/g,
        color: '#bb88ff',
        decorationType: null
    }
};

function activate(context) {
    // Регистрируем команду для Cmd+Shift+P
    const disposable = vscode.commands.registerCommand(
        'todo-highlighter.helloWorld',
        () => {
            vscode.window.showInformationMessage('TODO Highlighter работает!');
        }
    );
    context.subscriptions.push(disposable);

    // создаём decoration types
    for (const key in COMMENT_TYPES) {
        COMMENT_TYPES[key].decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: COMMENT_TYPES[key].color, // можно без альфы, чтобы наверняка
            border: `1px solid ${COMMENT_TYPES[key].color}`
        });
    }

    function updateDecorations() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const text = editor.document.getText();

        for (const key in COMMENT_TYPES) {
            const type = COMMENT_TYPES[key];
            const regex = type.regex;
            const ranges = [];

            // важно: сбросить позицию поиска
            regex.lastIndex = 0;

            let match;
            while ((match = regex.exec(text)) !== null) {
                const start = editor.document.positionAt(match.index);
                const end = editor.document.positionAt(match.index + match[0].length);
                ranges.push(new vscode.Range(start, end));
            }

            editor.setDecorations(type.decorationType, ranges);
        }
    }

    // подписки на события
    vscode.window.onDidChangeActiveTextEditor(updateDecorations, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            updateDecorations();
        }
    }, null, context.subscriptions);

    updateDecorations();
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
