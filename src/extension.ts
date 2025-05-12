import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "hapus-komentar" is now active!');

	const disposable = vscode.commands.registerCommand('hapus-komentar.hapusSemuaKomentar', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('Tidak ada file yang dibuka.');
			return;
		}

		const document = editor.document;
		const fullText = document.getText();

		const cleanedLines = fullText
		.split('\n')
		.map(line => {
			let cleaned = line;

			if (/^\s*(\/\/|#|<!--|{{--.*--}})/.test(line)) return '';

			const containsUrl = line.includes('http://') || line.includes('https://');

			if (/['"].*#.*['"]/.test(line)) {
					cleaned = cleaned
						.replace(/(?<!https:)(?<!http:)\/\/.*$/, '')
						.replace(/<!--.*?-->/g, '')
						.replace(/\{\{--.*?--\}\}/g, '');
					return cleaned.trimEnd();
				}

			if (!containsUrl) {
			cleaned = cleaned
				.replace(/(?<!https:)(?<!http:)\/\/.*$/, '')
					.replace(/\/\/.*(?=[^\n]*$)/, '')
					.replace(/#.*(?=[^\n]*$)/, '')
					.replace(/<!--[\s\S]*?-->/g, '')
					.replace(/\{\{--[\s\S]*?--\}\}/g, '');
			}

			return cleaned.trimEnd();
		});


		let noComments = cleanedLines.join('\n');

		noComments = noComments
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/{{--[\s\S]*?--}}/g, '')
		.replace(/<!--[\s\S]*?-->/g, '');


		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(fullText.length)
		);

		editor.edit(editBuilder => {
			editBuilder.replace(fullRange, noComments);
		}).then(success => {
			if (success) {
				vscode.window.showInformationMessage('Komentar berhasil dihapus.');
			} else {
				vscode.window.showErrorMessage('Gagal menghapus komentar.');
			}
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
