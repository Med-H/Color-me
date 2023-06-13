import * as vscode from 'vscode';
import { colord } from "colord";

export type TagInfo = {
  decChar?: {
		chars: vscode.Range[],
		decorator: vscode.TextEditorDecorationType
	}
  tagName: string
  tagColor: string
};



export const buildColors = () => {
	const isDarkTheme = () => {
		const colorTheme = vscode.window.activeColorTheme;
		if (!colorTheme) {
			return false;
		}
		return (colorTheme.kind === vscode.ColorThemeKind.Dark);
	};

	const isDark = isDarkTheme();

	const buildColor = (color: string) => {
	  const col = colord(color);
	  if (isDark && col.isLight()) {
	  	return color;
	  }
	  return col.desaturate(0.7).darken(0.3).toHex();
	};

	const colorMap: Record<string, string> = {
		area: buildColor("#47ff6d"),
		base: buildColor("#aeff00"),
		blockquote: buildColor("#ffb7ad"),
		q: buildColor("#ffb7ad"),
		caption: buildColor("#6dd"),
		sub: buildColor("#add"),
		summary: buildColor("#fc0"),
		sup: buildColor("#cdf"),
		i: buildColor("#fffe80"),
		ins: buildColor("#ffccf1"),
		kbd: buildColor("#9fc"),
		legend: buildColor("#afe"),
		map: buildColor("#fff000"),
		mark: buildColor("#fcff00"),
		menu: buildColor("#3bf"),
		noscript: buildColor("#ff7979"),
		object: buildColor("#ff7e7e"),
		rb: buildColor("#dac"),
		rp: buildColor("#fdc"),
		rt: buildColor("#afb"),
		ruby: buildColor("#dea"),
		s: buildColor("#bbb3d7"),
		samp: buildColor("#fe3"),
		small: buildColor("#aaf"),
		source: buildColor("#48dfff"),
		strong: buildColor("#fc9"),
		wbr: buildColor("#fcdfb5"),
		abbr: buildColor("#fff600"),
		address: buildColor("#ee6"),
		article: buildColor("#fc0"),
		aside: buildColor("#ffca96"),
		audio: buildColor("#a1ffd0"),
		b: buildColor("#eaf"),
		br: buildColor("#afa"),
		button: buildColor("#fbb"),
		canvas: buildColor("#6cf"),
		cite: buildColor("#ff8888"),
		code: buildColor("#adda04"),
		col: buildColor("#a4d5ff"),
		colgroup: buildColor("#acb5ff"),
		dd: buildColor("#dd9"),
		del: buildColor("#dcc"),
		dfn: buildColor("#bfa"),
		dl: buildColor("#e93"),
		dt: buildColor("#9df"),
		em: buildColor("#ef71ff"),
		fieldset: buildColor("#fce"),
		figcaption: buildColor("#aaf"),
		figure: buildColor("#e6eecc"),
		footer: buildColor("#ffe400"),
		form: buildColor("#00ffc6"),
		svg: buildColor("#6fd"),
		hgroup: buildColor("#fac"),
		hr: buildColor("#fc7"),
		html: buildColor("#cac"),
		iframe: buildColor("#ff80c2"),
		image: buildColor("#48dfff"),
		img: buildColor("#48dfff"),
		input: buildColor("#dcc"),
		label: buildColor("#ff7e00"),
		li: buildColor("#fbb"),
		link: buildColor("rgb(156, 255, 131)"),
		main: buildColor("#42ff00"),
		meta: buildColor("#aff"),
		nav: buildColor("#00ffff"),
		ol: buildColor("#9ac"),
		option: buildColor("#edd"),
		p: buildColor("#ffcc00"),
		pre: buildColor("#ffb304"),
		script: buildColor("rgb(66, 224, 255)"),
		section: buildColor("#ffccdd"),
		select: buildColor("#cff"),
		table: buildColor("#ef9"),
		tbody: buildColor("#fcb"),
		td: buildColor("#ff8"),
		textarea: buildColor("#ed9"),
		tfoot: buildColor("rgb(35, 226, 255)"),
		th: buildColor("#ff99f2"),
		thead: buildColor("#f88"),
		time: buildColor("#9eff6f"),
		title: buildColor("#fcc"),
		tr: buildColor("#aaeec4"),
		ul: buildColor("#ffa"),
		video: buildColor("#efc"),
		span: buildColor("#aaeeff"),
		div: buildColor("rgb(255, 255, 200)"),
		style: buildColor("#ffa200"),
		a: buildColor("rgb(90, 255, 123)"),
		head: buildColor("#dda"),
		header: buildColor("#faa"),
		h1: buildColor("rgb(255, 130, 130)"),
		h2: buildColor("rgb(255, 138, 216)"),
		h3: buildColor("#e7e578"),
		h4: buildColor("#a3ff99"),
		h5: buildColor("rgb(94, 223, 255)"),
		h6: buildColor("rgb(204, 160, 255)"),
		body: buildColor("#a9ffb3"),
	};

	const colorEntries = Object.entries(colorMap);

	return { colorEntries, colorMap};
};
