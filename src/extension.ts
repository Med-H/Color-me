import * as vscode from 'vscode';
import { TagInfo, buildColors } from './colors';
import { CommentSetting, commentSettingMap } from './commentSetting';

let tagInfos: TagInfo[] = [];

type RequiredDecorator = TagInfo & Required<Pick<TagInfo, 'decChar'>>;

const updateTagInfos = (tagInfo: TagInfo) => {
	if (tagInfo.decChar !== undefined) {
		tagInfo.decChar.decorator.dispose();
	}
	tagInfo.decChar = {
		chars: [],
		decorator: vscode.window.createTextEditorDecorationType({
			color: tagInfo.tagColor,
		})
	};
	return <RequiredDecorator>tagInfo;
};

const buildRegexp = (commentSetting: CommentSetting, tagInfo: TagInfo) => 
	new RegExp(`${commentSetting.startRegExp ?? commentSetting.start}|${commentSetting.endRegExp ?? commentSetting.end}|<(?:/|)${tagInfo.tagName}(?:$|(?:| (?:.*?)[^-?%$])(?<!=)>)`, 'gm');

const buildRange = (document: vscode.TextDocument, startIndex: number, endIndex: number) => {
	const startPos = document.positionAt(startIndex);
	const endPos = document.positionAt(endIndex);
	return new vscode.Range(startPos, endPos);
};

const decorateInner = (tagInfo: TagInfo, editor: vscode.TextEditor, src: string) => {
	
	const newTagInfo = updateTagInfos(tagInfo);

	const document = editor.document;

	const commentSetting: CommentSetting = commentSettingMap[editor.document.languageId] || commentSettingMap.default;
	const regex = buildRegexp(commentSetting, newTagInfo);
	let match: RegExpExecArray | null;
	let inComment = false;

	while (match = regex.exec(src)) {
		const firstMatch = match[0];
		
		if (firstMatch === commentSetting.start) {
			inComment = true;
			continue;
		}
		if (firstMatch === commentSetting.end) {
			inComment = false;
			continue;
		}

		if (inComment === true) {
			continue;
		}
		
		let singleLengths = 0;
		const splitted = match[0].split(/[{}"]/);
		const matchIndex = match.index;

		if (splitted.length > 2) {
			splitted.forEach( (single, index) => {
				if (index % 2 === 0) {
					const range = buildRange(document, matchIndex + singleLengths, matchIndex + singleLengths + single.length);
					newTagInfo.decChar.chars.push(range);
				}
				singleLengths += single.length + 1;
			});
		} else {
			const range = buildRange(document, matchIndex, matchIndex + firstMatch.length);
			newTagInfo.decChar.chars.push(range);
		}
	}
	editor.setDecorations(newTagInfo.decChar.decorator, newTagInfo.decChar.chars);
};

const decorate = (colorMap: Record<string, string>, colorEntries: [string, string][], ) => {
	const editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		return;
	}
	const src = editor.document.getText();
	const matches = src.match(/<(?:\/|)([a-zA-Z][a-zA-Z0-9.-]*)(?:$|(?:| (?:.*?)[^-?%$])(?<!=)>)/gm) ?? [];
	const tagNames = new Set(matches.map((word) => word.replace(/[</>]|(?: .*$)/g, '')));;
	
	tagNames.forEach((tagName) => {
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
	let colorObject = buildColors();
	vscode.window.onDidChangeActiveTextEditor(() => {
		decorate(colorObject.colorMap, colorObject.colorEntries);
	}, null, context.subscriptions);
	vscode.workspace.onDidChangeTextDocument(() => {
		decorate(colorObject.colorMap, colorObject.colorEntries);
	}, null, context.subscriptions);
	vscode.window.onDidChangeActiveColorTheme(() => {
		colorObject = buildColors();
		tagInfos.forEach((tagInfo) => {
			if (tagInfo.decChar?.decorator) {
				vscode.window.activeTextEditor?.setDecorations(tagInfo.decChar?.decorator, []);
				tagInfo.decChar?.decorator.dispose();
			}
		});
		tagInfos = [];
		decorate(colorObject.colorMap, colorObject.colorEntries);
	}, null, context.subscriptions);
	decorate(colorObject.colorMap, colorObject.colorEntries);	
}
export function deactivate() { }
