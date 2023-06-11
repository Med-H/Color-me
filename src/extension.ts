import * as vscode from 'vscode';
import { TagInfo, colorMap, colorEntries } from './colors';
import { CommentSetting, commentSettingMap } from './commentSetting';

let tagInfos: TagInfo[] = [];

const decorateInner = (tagInfo: TagInfo, editor: vscode.TextEditor, src: string) => {
	const commentSetting: CommentSetting = commentSettingMap[editor.document.languageId] || commentSettingMap.default;

	if (tagInfo.decChar !== undefined) {
		tagInfo.decChar.decorator.dispose();
	}
	const regex = new RegExp(`${commentSetting.startRegExp ?? commentSetting.start}|${commentSetting.endRegExp ?? commentSetting.end}|<(?:/|)${tagInfo.tagName}(?:$|(?:| (?:.*?)[^-?%$])(?<!=)>)`, 'gm');
	let match: RegExpExecArray | null;
	let inComment = false;
	tagInfo.decChar = {
		chars: [],
		decorator: vscode.window.createTextEditorDecorationType({
			color: tagInfo.tagColor,
		})
	};
	while (match = regex.exec(src)) {
		const splitted = match[0].split(/[{}"]/);
		if (match[0] === commentSetting.start) {
			inComment = true;
			continue;
		}
		if (match[0] === commentSetting.end) {
			inComment = false;
			continue;
		}
		if (inComment === true) {
			continue;
		}
		let singleLengths = 0;
		if (splitted.length > 2) {
			splitted.forEach(function (single, i) {
				if (i % 2 === 0 && match !== null && tagInfo.decChar !== undefined) {
					const startPos = editor.document.positionAt(match.index + singleLengths);
					const endPos = editor.document.positionAt(match.index + singleLengths + single.length);
					const range = new vscode.Range(startPos, endPos);
					tagInfo.decChar.chars.push(range);
				}
				singleLengths += single.length + 1;
			});
		} else {
			const startPos = editor.document.positionAt(match.index);
			const endPos = editor.document.positionAt(match.index + match[0].length);
			const range = new vscode.Range(startPos, endPos);
			tagInfo.decChar.chars.push(range);
		}
	}
	editor.setDecorations(tagInfo.decChar.decorator, tagInfo.decChar.chars);
};

const decorate = () => {
	const editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		return;
	}
	const src = editor.document.getText();
	const matches = src.match(/<(?:\/|)([a-zA-Z][a-zA-Z0-9.-]*)(?:$|(?:| (?:.*?)[^-?%$])(?<!=)>)/gm) ?? [];
	const tagNameLikeWords = matches.map((word) => word.replace(/[</>]|(?: .*$)/g, ''));
	const uniqueTagNames = [...new Set(tagNameLikeWords)];
	uniqueTagNames.forEach((tagName) => {
		if (tagInfos.map(({ tagName }) => tagName).includes(tagName)) {
			return;
		}
		const tagColor = colorMap[tagName] || colorEntries[tagName.length + (tagName.match(/[aiueo]/g)?.length ?? 0)][1];
		tagInfos.push({
			decChar: undefined,
			tagName,
			tagColor,
		});
	});
	tagInfos.forEach(function (tagInfo) {
		decorateInner(tagInfo, editor, src);
	});
};

export function activate(context: vscode.ExtensionContext) {
	vscode.window.onDidChangeActiveTextEditor(editor => {
		decorate();
	}, null, context.subscriptions);
	vscode.workspace.onDidChangeTextDocument(event => {
		decorate();
	}, null, context.subscriptions);
	decorate();
}
export function deactivate() { }
