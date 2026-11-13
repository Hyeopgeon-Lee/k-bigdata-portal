/**
 * Progressive syntax highlighting for published code answers.
 * Reuses the same Lezer grammars as the learner's CodeMirror editor.
 * Answer text is always inserted using textContent (never raw HTML).
 */
import {javaLanguage} from "@codemirror/lang-java";
import {cppLanguage} from "@codemirror/lang-cpp";
import {pythonLanguage} from "@codemirror/lang-python";
import {classHighlighter, highlightTree} from "@lezer/highlight";

const grammars = {
  java: javaLanguage,
  c: cppLanguage,
  python: pythonLanguage
};

export function renderHighlightedAnswer(codeElement, source, language) {
  const text = String(source ?? "");
  const grammar = grammars[language];
  if (!codeElement || !grammar || text.length > 50000) {
    if (codeElement) codeElement.textContent = text;
    return;
  }
  try {
    const fragment = document.createDocumentFragment();
    let last = 0;
    const appendPlain = (start, end) => {
      if (end > start) fragment.append(document.createTextNode(text.slice(start, end)));
    };
    highlightTree(grammar.parser.parse(text), classHighlighter, (from, to, classes) => {
      if (from < last || to > text.length) return;
      appendPlain(last, from);
      const token = document.createElement("span");
      token.className = classes.split(/\s+/).filter(name => /^tok-[a-zA-Z0-9-]+$/.test(name)).join(" ");
      token.textContent = text.slice(from, to);
      fragment.append(token);
      last = to;
    });
    appendPlain(last, text.length);
    codeElement.replaceChildren(fragment);
  } catch (error) {
    console.warn("정답 코드 문법 강조를 적용하지 못했습니다.", error);
    codeElement.textContent = text;
  }
}
