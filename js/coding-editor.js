/**
 * Progressive CodeMirror 6 enhancement for the existing per-question textarea.
 * One source of truth: the original textarea + unchanged localStorage draft keys.
 * All third-party imports are resolved by the coding.html import map.
 */
import {EditorView} from "codemirror";
import {EditorState, Prec, EditorSelection, Compartment} from "@codemirror/state";
import {
  keymap, placeholder, lineNumbers, highlightActiveLineGutter,
  highlightSpecialChars, drawSelection, dropCursor,
  rectangularSelection, crosshairCursor, highlightActiveLine
} from "@codemirror/view";
import {
  indentWithTab, indentMore, indentLess, history, defaultKeymap, historyKeymap
} from "@codemirror/commands";
import {java} from "@codemirror/lang-java";
import {cpp} from "@codemirror/lang-cpp";
import {python} from "@codemirror/lang-python";
import {
  StreamLanguage, foldGutter, indentOnInput, syntaxHighlighting,
  defaultHighlightStyle, bracketMatching, foldKeymap
} from "@codemirror/language";
import {shell} from "@codemirror/legacy-modes/mode/shell";
import {autocompletion, closeCompletion, closeBrackets, closeBracketsKeymap} from "@codemirror/autocomplete";
import {highlightSelectionMatches, searchKeymap} from "@codemirror/search";
import {lintKeymap} from "@codemirror/lint";
import {codingCompletionOptions} from "./coding-completion-data.js?v=20261024-autocomplete-1";

const modes = {java:java(), c:cpp(), python:python(), linux:StreamLanguage.define(shell)};
/**
 * The stock basicSetup includes autocomplete, even if the visible toggle is off.
 * Retain all its editing features except autocomplete, which is isolated in a
 * Compartment below. OFF therefore truly contains no completion plugin.
 */
const editorBaseSetup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, {fallback:true}),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...lintKeymap
  ])
];
const mobileKeys = [
  ["indent", "Tab", "한 단계 들여쓰기"],
  ["outdent", "⇤", "한 단계 내어쓰기"],
  ["left", "←", "커서를 왼쪽으로"],
  ["right", "→", "커서를 오른쪽으로"],
  ["pair", "{ }", "중괄호 입력", "{}"],
  ["pair", "( )", "소괄호 입력", "()"],
  ["pair", "[ ]", "대괄호 입력", "[]"],
  ["text", ":", "콜론 입력", ":"],
  ["text", ";", "세미콜론 입력", ";"],
  ["text", "/", "슬래시 입력", "/"]
];

export function createCodingEditor({textarea, host, language, onChange, autocompleteEnabled = false}) {
  if (!textarea || !host) throw new Error("코드 입력창이 없습니다.");
  let applying = false;
  let selectedLanguage = language;
  let completionEnabled = Boolean(autocompleteEnabled);
  const completionCompartment = new Compartment();

  function completionSource(context) {
    const word = context.matchBefore(/[A-Za-z_][\w.]*/);
    const typed = word?.text || "";
    if (!context.explicit && typed.length < 2) return null;
    const options = codingCompletionOptions(selectedLanguage, typed, context.state.doc.toString(), context.explicit);
    if (!options.length) return null;
    return {from:word?.from ?? context.pos, options, validFor:/^[A-Za-z_][\w.]*$/};
  }
  const completionExtension = () => completionEnabled
    ? autocompletion({override:[completionSource], activateOnTyping:true, maxRenderedOptions:10})
    : [];

  function createState(doc, chosenLanguage, hint) {
    selectedLanguage = chosenLanguage;
    return EditorState.create({
      doc,
      extensions: [
        editorBaseSetup,
        completionCompartment.of(completionExtension()),
        Prec.high(keymap.of([
          indentWithTab,
          // Explicit keyboard escape from Tab indentation to the next control.
          {key:"Ctrl-Enter", run() {
            document.getElementById("coding-hint-button")?.focus();
            return true;
          }}
        ])),
        EditorState.tabSize.of(4),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          "aria-label": "내 답안 작성 코드 편집기. 다음 버튼으로 이동하려면 컨트롤 엔터를 누르세요.",
          "aria-multiline": "true",
          "spellcheck": "false",
          "autocapitalize": "off",
          "autocomplete": "off"
        }),
        modes[chosenLanguage] || modes.java,
        placeholder(hint || "여기에 코드를 입력하세요."),
        EditorView.updateListener.of(update => {
          if (!update.docChanged || applying) return;
          const value = update.state.doc.toString();
          textarea.value = value;
          onChange(value);
        })
      ]
    });
  }
  const editor = new EditorView({
    parent: host,
    state: createState(textarea.value, language, textarea.placeholder)
  });

  const toolbar = document.getElementById("coding-editor-tools");
  if (toolbar) {
    toolbar.replaceChildren();
    for (const [action, label, title, value] of mobileKeys) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "coding-editor-tool";
      button.textContent = label;
      button.title = title;
      button.setAttribute("aria-label", title);
      button.dataset.action = action;
      if (value) button.dataset.value = value;
      // Keep focus/selection in the editor with a physical mouse.
      button.addEventListener("mousedown", event => event.preventDefault());
      toolbar.append(button);
    }
    toolbar.addEventListener("click", event => {
      const button = event.target.closest("button[data-action]");
      if (!button || !toolbar.contains(button)) return;
      const {action, value = ""} = button.dataset;
      if (action === "indent" || action === "outdent") {
        (action === "indent" ? indentMore : indentLess)(editor);
      } else if (action === "left" || action === "right") {
        const position = editor.state.selection.main.head;
        const next = Math.max(0, Math.min(editor.state.doc.length, position + (action === "left" ? -1 : 1)));
        editor.dispatch({selection:EditorSelection.cursor(next), scrollIntoView:true});
      } else {
        const selected = editor.state.selection.main;
        const from = selected.from;
        const to = selected.to;
        const surrounded = editor.state.sliceDoc(from, to);
        const insert = action === "pair"
          ? value[0] + surrounded + value[1]
          : value;
        const cursor = action === "pair" ? from + 1 + surrounded.length : from + insert.length;
        editor.dispatch({changes:{from,to,insert},selection:EditorSelection.cursor(cursor),scrollIntoView:true});
      }
      editor.focus();
    });
  }

  host.hidden = false;
  textarea.hidden = true;
  textarea.classList.add("coding-textarea--hidden");
  if (toolbar) toolbar.hidden = false;
  return {
    setAutocompleteEnabled(enabled) {
      completionEnabled = Boolean(enabled);
      if (!completionEnabled) closeCompletion(editor);
      // Reconfigure only autocomplete: preserve selection, undo, and draft.
      editor.dispatch({effects:completionCompartment.reconfigure(completionExtension())});
    },
    setContent(value, nextLanguage, nextPlaceholder) {
      // New document state resets undo/redo history across different questions.
      applying = true;
      try {
        editor.setState(createState(value, nextLanguage, nextPlaceholder));
      } finally {
        applying = false;
      }
    },
    focus() { editor.focus(); },
    destroy() { editor.destroy(); }
  };
}
