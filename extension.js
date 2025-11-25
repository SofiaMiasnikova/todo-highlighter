const vscode = require('vscode');

/**
 * Набор поддерживаемых типов специальных комментариев.
 * Для каждого типа определяются:
 *  - регулярное выражение для поиска
 *  - цвет подсветки
 *  - объект украшения (создаётся при активации)
 *
 * @type {Object.<string, {regex: RegExp, color: string, decorationType: vscode.TextEditorDecorationType|null}>}
 */
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

/**
 * Функция активации расширения.
 * Вызывается VS Code при первом запуске или при наступлении событий из activationEvents.
 *
 * Выполняет:
 *  - регистрацию команды
 *  - создание объектов подсветки
 *  - подключение обработчиков событий
 *  - начальный запуск подсветки
 *
 * @param {vscode.ExtensionContext} context — Контекст выполнения расширения.
 */
function activate(context) {

    /**
     * Регистрируем тестовую команду.
     * Она появляется в Command Palette и показывает, что расширение работает.
     */
    const disposable = vscode.commands.registerCommand(
        'todo-highlighter.helloWorld',
        () => vscode.window.showInformationMessage('TODO Highlighter работает!')
    );
    context.subscriptions.push(disposable);

    /**
     * Создаём “decorations” — стили подсветки для каждого типа комментариев.
     */
    for (const key in COMMENT_TYPES) {
        COMMENT_TYPES[key].decorationType =
            vscode.window.createTextEditorDecorationType({
                backgroundColor: COMMENT_TYPES[key].color,
                border: `1px solid ${COMMENT_TYPES[key].color}`
            });
    }

    /**
     * Основная функция обновления подсветки.
     * Находит TODO/FIXME/HACK в документе и выделяет их соответствующими стилями.
     */
    function updateDecorations() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const text = editor.document.getText();

        for (const key in COMMENT_TYPES) {
            const type = COMMENT_TYPES[key];
            const regex = type.regex;
            const ranges = [];

            regex.lastIndex = 0; // обязательно сбрасывать для глобальных regex

            let match;
            while ((match = regex.exec(text)) !== null) {
                const start = editor.document.positionAt(match.index);
                const end = editor.document.positionAt(match.index + match[0].length);
                ranges.push(new vscode.Range(start, end));
            }

            editor.setDecorations(type.decorationType, ranges);
        }
    }

    // Событие: смена активного редактора
    vscode.window.onDidChangeActiveTextEditor(
        updateDecorations,
        null,
        context.subscriptions
    );

    // Событие: изменение текста в документе
    vscode.workspace.onDidChangeTextDocument(
        event => {
            if (
                vscode.window.activeTextEditor &&
                event.document === vscode.window.activeTextEditor.document
            ) {
                updateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    // Первый запуск подсветки
    updateDecorations();
}

/**
 * Функция деактивации расширения.
 * Вызывается при закрытии VS Code или выгрузке расширения.
 */
function deactivate() {}

module.exports = { activate, deactivate };
