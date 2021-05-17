var vscode = require( 'vscode' );

function activate( context )
{
    var statusBarItem = vscode.window.createStatusBarItem( vscode.StatusBarAlignment.Right, 0 );
    context.subscriptions.push( statusBarItem );
    statusBarItem.command = "open-url.open";

    context.subscriptions.push( vscode.commands.registerCommand( 'open-url.open', function()
    {
        var editor = vscode.window.activeTextEditor;

        if( editor && editor.document )
        {
            var url = vscode.workspace.getConfiguration( 'open-url' ).get( 'url' );
            var selectedText = editor.document.getText( editor.selection );

            var placeholderRegex = new RegExp( "(\\$\\{(.*?)(/.*/)?})", 'g' );

            var canOpen = true;

            url = url.replace( placeholderRegex, function( fullMatch, placeholder, placeholderName, transformation )
            {
                var replacement;

                if( placeholderName === 'TM_SELECTED_TEXT' )
                {
                    replacement = selectedText;
                }
                else
                {
                    vscode.window.showErrorMessage( "Unsupported placeholder: " + placeholderName );
                    canOpen = false;
                }

                if( replacement )
                {
                    if( transformation )
                    {
                        transformation = transformation.replace( /[\/]/g, '' );
                        if( transformation == 'uppercase' )
                        {
                            replacement = replacement.toUpperCase();
                        }
                        else if( transformation === 'downcase' )
                        {
                            replacement = replacement.toLowerCase();
                        }
                        else
                        {
                            vscode.window.showErrorMessage( "Unsupported transformation: " + transformation );
                            canOpen = false;
                        }
                    }
                }

                return replacement;
            } );

            if( canOpen )
            {
                var message = "Opening " + url + "...";

                var notification = vscode.workspace.getConfiguration( 'open-url' ).get( 'notification' );

                if( notification === 'popup' )
                {
                    vscode.window.showInformationMessage( message );
                }
                else if( notification == 'statusBar' )
                {
                    vscode.window.setStatusBarMessage( message, 3000 );
                }

                vscode.env.openExternal( vscode.Uri.parse( url ) );
            }
        }
    } ) );

    context.subscriptions.push( vscode.window.onDidChangeTextEditorSelection( function( e )
    {
        if( e && e.selections.length > 0 )
        {
            var selectedText = e.textEditor.document.getText( e.textEditor.selection ).trim().replace( /(\r\n|\n|\r)/gm, ' ' );
            var regex = vscode.workspace.getConfiguration( 'open-url' ).get( 'regex' );

            if( regex && selectedText.match( regex ) )
            {
                if( selectedText.length > 17 )
                {
                    selectedText = selectedText.substr( 0, 20 ) + "...";
                }
                if( selectedText.length > 0 )
                {
                    statusBarItem.text = "$(book) " + selectedText;
                    statusBarItem.show();
                    return;
                }
            }
        }
        statusBarItem.hide();
    } ) );
}

exports.activate = activate;
exports.deactivate = () => { };
